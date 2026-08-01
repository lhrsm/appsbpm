import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';

const FROM = Deno.env.get('EMAIL_FROM') || 'Portal da SBPM <naoresponda@notify.sbpmbahia.com.br>';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

const Body = z.object({
  fullName: z.string().trim().min(5).max(160),
  cpf: z.string().trim().min(11).max(14),
  registration: z.string().trim().max(30).optional().nullable(),
  rankId: z.string().uuid().optional().nullable(),
  rankOther: z.string().trim().max(80).optional().nullable(),
  functionalStatus: z.enum(['ativo', 'inativo']),
  email: z.string().trim().email().max(255),
  phone: z.string().trim().min(10).max(20),
  consent: z.literal(true),
  termsVersion: z.string().max(20).optional(),
  privacyVersion: z.string().max(20).optional(),
});

function cpfValido(cpf: string) {
  const c = cpf.replace(/\D/g, '');
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  const calc = (base: string, factor: number) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) sum += parseInt(base[i], 10) * (factor - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  return calc(c.slice(0, 9), 10) === +c[9] && calc(c.slice(0, 10), 11) === +c[10];
}

async function enviarEmail(to: string, nome: string, protocolo: string) {
  const key = Deno.env.get('RESEND_API_KEY');
  const assunto = 'Recebemos seu pré-cadastro para associação à SBPM';
  const html = `
    <div style="font-family:Arial,sans-serif;padding:24px;color:#1f2937">
      <h2 style="color:#065f46">SBPM — Pré-cadastro recebido</h2>
      <p>Olá, ${nome}.</p>
      <p>Recebemos seu pré-cadastro e registramos seu interesse em se associar à SBPM.</p>
      <p>Para dar continuidade ao processo, será necessário fornecer outras informações e documentos
      para que a instituição possa encaminhar a solicitação à SAEB.</p>
      <p>O setor responsável entrará em contato pelo telefone ou e-mail informado para orientar sobre
      as próximas etapas.</p>
      <p><strong>Número do protocolo:</strong> ${protocolo}</p>
      <p>Atenciosamente,<br/>SBPM</p>
    </div>`;
  if (!key || (Deno.env.get('EMAIL_PROVIDER') || '').toLowerCase() === 'mock') {
    console.log(`[pre-cadastro] e-mail simulado (${protocolo})`);
    return;
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: FROM, to: [to], subject: assunto, html }),
  });
  if (!res.ok) console.error(`[pre-cadastro] falha no envio de e-mail: ${res.status}`);
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const parsed = Body.safeParse(await req.json());
    if (!parsed.success) {
      return json({ success: false, message: 'Confira os dados informados e tente novamente.' }, 400);
    }
    const d = parsed.data;
    const cpf = d.cpf.replace(/\D/g, '');
    if (!cpfValido(cpf)) return json({ success: false, message: 'CPF inválido.' }, 400);

    const phone = d.phone.replace(/\D/g, '');
    if (phone.length < 10 || phone.length > 11 || +phone.slice(0, 2) < 11) {
      return json({ success: false, message: 'Telefone inválido. Informe DDD e número.' }, 400);
    }

    const admin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
      { auth: { persistSession: false } },
    );

    const { data: existente } = await admin
      .from('association_pre_registrations')
      .select('protocol')
      .eq('cpf_reference', cpf)
      .is('deleted_at', null)
      .not('status', 'in', '("cancelado","rejeitado","concluido")')
      .maybeSingle();

    if (existente) {
      // Não revela se o CPF pertence a um associado — apenas devolve o mesmo protocolo.
      return json({ success: true, protocol: existente.protocol, duplicado: true });
    }

    const { data, error } = await admin
      .from('association_pre_registrations')
      .insert({
        full_name: d.fullName.trim(),
        cpf_reference: cpf,
        registration_number: d.registration?.trim().replace(/\s+/g, '') || null,
        rank_id: d.rankId || null,
        rank_other: d.rankOther?.trim() || null,
        functional_status: d.functionalStatus,
        email: d.email.trim().toLowerCase(),
        phone,
        whatsapp_phone: phone,
        consent_accepted: true,
        terms_version: d.termsVersion ?? null,
        privacy_version: d.privacyVersion ?? null,
      })
      .select('protocol')
      .single();

    if (error || !data) {
      console.error('[pre-cadastro] falha ao gravar solicitação:', error?.message);
      return json({ success: false, message: 'Não foi possível registrar o pré-cadastro agora.' }, 500);
    }

    await enviarEmail(d.email.trim().toLowerCase(), d.fullName.trim().split(' ')[0], data.protocol);

    await admin.from('notificacoes').insert({
      titulo: 'Nova solicitação de pré-cadastro para associação',
      mensagem: `${d.fullName.trim()} — situação ${d.functionalStatus} — protocolo ${data.protocol}`,
      tipo: 'info',
    }).then(({ error: e }) => {
      if (e) console.log('[pre-cadastro] notificação interna não registrada:', e.message);
    });

    return json({ success: true, protocol: data.protocol });
  } catch (e) {
    console.error('[pre-cadastro] erro inesperado:', (e as Error).message);
    return json({ success: false, message: 'Serviço temporariamente indisponível.' }, 500);
  }
});
