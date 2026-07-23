import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';

const BodySchema = z.object({
  tipo: z.enum(['exclusao', 'portabilidade', 'revogacao', 'correcao']),
  descricao: z.string().max(2000).optional().or(z.literal('')),
  solicitante: z.object({
    nome: z.string().min(1).max(200),
    email: z.string().email().max(200).optional().or(z.literal('')),
    documento: z.string().max(30).optional().or(z.literal('')),
    matricula: z.string().max(50).optional().or(z.literal('')),
    telefone: z.string().max(30).optional().or(z.literal('')),
  }),
  associado_id: z.string().uuid().optional().or(z.literal('')),
  dependente_id: z.string().uuid().optional().or(z.literal('')),
});

const DESTINO = 'previdencia@sbpmbahia.com.br';

const TIPO_LABEL: Record<string, string> = {
  exclusao: 'Exclusão de dados',
  portabilidade: 'Portabilidade de dados',
  revogacao: 'Revogação de consentimento',
  correcao: 'Correção de dados',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Dados inválidos', details: parsed.error.flatten() }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    const { tipo, descricao, solicitante, associado_id, dependente_id } = parsed.data;
    const ip = req.headers.get('x-forwarded-for') || req.headers.get('cf-connecting-ip') || null;

    // Persistir solicitação
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (supabaseUrl && serviceKey) {
        const admin = createClient(supabaseUrl, serviceKey);
        await admin.from('solicitacoes_privacidade').insert({
          associado_id: associado_id || null,
          dependente_id: dependente_id || null,
          tipo,
          descricao: descricao || null,
          solicitante_nome: solicitante.nome,
          solicitante_email: solicitante.email || null,
          solicitante_documento: solicitante.documento || null,
          ip,
          status: 'pendente',
        });
      }
    } catch (e) {
      console.error('Falha ao persistir solicitação de privacidade:', e);
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ ok: true, warning: 'E-mail não enviado (serviço não configurado). Solicitação registrada.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const html = `
      <h2>Solicitação LGPD — ${TIPO_LABEL[tipo]}</h2>
      <h3>Solicitante</h3>
      <ul>
        <li><strong>Nome:</strong> ${solicitante.nome}</li>
        <li><strong>Matrícula:</strong> ${solicitante.matricula || '-'}</li>
        <li><strong>CPF:</strong> ${solicitante.documento || '-'}</li>
        <li><strong>E-mail:</strong> ${solicitante.email || '-'}</li>
        <li><strong>Telefone:</strong> ${solicitante.telefone || '-'}</li>
      </ul>
      <h3>Descrição</h3>
      <p style="white-space:pre-wrap">${(descricao || '(sem descrição)').replace(/[<>&]/g, (c) => ({'<':'&lt;','>':'&gt;','&':'amp;'} as any)[c])}</p>
      <p style="color:#666;font-size:12px">Registrada em ${new Date().toISOString()} — IP ${ip || 'n/d'}</p>
    `;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'SBPM Privacidade <onboarding@resend.dev>',
        to: [DESTINO],
        reply_to: solicitante.email || undefined,
        subject: `[LGPD] ${TIPO_LABEL[tipo]} — ${solicitante.nome}`,
        html,
      }),
    });

    if (!resendRes.ok) {
      const details = await resendRes.text();
      console.error('Falha email:', resendRes.status, details);
      return new Response(
        JSON.stringify({ ok: true, warning: 'Solicitação registrada, mas o e-mail falhou.' }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    return new Response(
      JSON.stringify({ ok: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('Erro inesperado:', msg);
    return new Response(
      JSON.stringify({ error: 'Erro inesperado', details: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
