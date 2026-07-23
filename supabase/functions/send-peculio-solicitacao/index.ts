import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';

const BodySchema = z.object({
  titular: z.object({
    nome: z.string().min(1).max(200),
    matricula: z.string().min(1).max(50),
    cpf: z.string().max(20).optional().or(z.literal('')),
    data_falecimento: z.string().min(1).max(20),
  }),
  solicitante: z.object({
    nome: z.string().min(1).max(200),
    cpf: z.string().max(20).optional().or(z.literal('')),
    parentesco: z.string().max(80).optional().or(z.literal('')),
    email: z.string().email().max(200).optional().or(z.literal('')),
    telefone: z.string().max(30).optional().or(z.literal('')),
    endereco: z.string().max(500).optional().or(z.literal('')),
  }),
  banco: z.object({
    banco: z.string().max(120).optional().or(z.literal('')),
    agencia: z.string().max(30).optional().or(z.literal('')),
    conta: z.string().max(40).optional().or(z.literal('')),
    tipo_conta: z.string().max(30).optional().or(z.literal('')),
    pix: z.string().max(140).optional().or(z.literal('')),
  }).optional(),
  observacoes: z.string().max(2000).optional().or(z.literal('')),
  anexos: z.array(z.string()).max(20).optional(),
});

const ANEXOS_BUCKET = 'dependentes-anexos';

const DESTINO = 'previdencia@sbpmbahia.com.br';

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
    const { titular, solicitante, banco, observacoes } = parsed.data;

    // Persistência best-effort na tabela existente
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (supabaseUrl && serviceKey) {
        const admin = createClient(supabaseUrl, serviceKey);
        await admin.from('peculio_solicitacoes').insert({
          associado_nome: titular.nome,
          associado_matricula: titular.matricula,
          associado_email: solicitante.email || null,
          associado_telefone: solicitante.telefone || null,
          beneficiarios: [{ solicitante, banco: banco || null, observacoes: observacoes || null, data_falecimento: titular.data_falecimento }],
          status: 'pagamento_pendente',
          observacoes: `Solicitação de pagamento do pecúlio — falecimento em ${titular.data_falecimento}`,
        });
      }
    } catch (e) {
      console.error('Falha ao persistir solicitação de pagamento de pecúlio:', e);
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Serviço de e-mail não configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const b = banco || {} as Record<string, string>;
    const html = `
      <h2>Solicitação de Pagamento do Pecúlio</h2>
      <h3>Associado Titular (falecido)</h3>
      <ul>
        <li><strong>Nome:</strong> ${titular.nome}</li>
        <li><strong>Matrícula:</strong> ${titular.matricula}</li>
        <li><strong>CPF:</strong> ${titular.cpf || '-'}</li>
        <li><strong>Data do falecimento:</strong> ${titular.data_falecimento}</li>
      </ul>
      <h3>Solicitante / Beneficiário</h3>
      <ul>
        <li><strong>Nome:</strong> ${solicitante.nome}</li>
        <li><strong>CPF:</strong> ${solicitante.cpf || '-'}</li>
        <li><strong>Parentesco:</strong> ${solicitante.parentesco || '-'}</li>
        <li><strong>E-mail:</strong> ${solicitante.email || '-'}</li>
        <li><strong>Telefone:</strong> ${solicitante.telefone || '-'}</li>
        <li><strong>Endereço:</strong> ${solicitante.endereco || '-'}</li>
      </ul>
      <h3>Dados bancários para pagamento</h3>
      <ul>
        <li><strong>Banco:</strong> ${b.banco || '-'}</li>
        <li><strong>Agência:</strong> ${b.agencia || '-'}</li>
        <li><strong>Conta:</strong> ${b.conta || '-'}</li>
        <li><strong>Tipo:</strong> ${b.tipo_conta || '-'}</li>
        <li><strong>PIX:</strong> ${b.pix || '-'}</li>
      </ul>
      <h3>Observações</h3>
      <p>${(observacoes || '-').replace(/\n/g, '<br>')}</p>
      <hr>
      <p style="font-size:12px;color:#666">
        Documentos exigidos (Certidão de Óbito, RG/CPF do beneficiário, comprovante de residência,
        comprovante de conta bancária) devem ser entregues fisicamente ou enviados via WhatsApp da
        Previdência (71) 98549-6972.
      </p>
    `;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'SBPM Pecúlio <onboarding@resend.dev>',
        to: [DESTINO],
        reply_to: solicitante.email || undefined,
        subject: `Solicitação de pagamento (Pecúlio) — ${titular.nome} — Mat. ${titular.matricula}`,
        html,
      }),
    });

    if (!resendRes.ok) {
      const details = await resendRes.text();
      console.error('Falha email:', resendRes.status, details);
      return new Response(
        JSON.stringify({ error: 'Falha ao enviar e-mail', details }),
        { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
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
