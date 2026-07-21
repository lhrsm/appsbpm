import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';

const BodySchema = z.object({
  titular: z.object({
    nome: z.string().min(1).max(200),
    matricula: z.string().min(1).max(50),
    email: z.string().email().max(200).optional().or(z.literal('')),
    telefone: z.string().max(30).optional().or(z.literal('')),
  }),
  dependente: z.object({
    nome: z.string().min(1).max(200),
    cpf: z.string().max(20).optional().or(z.literal('')),
    data_nascimento: z.string().max(20).optional().or(z.literal('')),
    parentesco: z.string().min(1).max(80),
    sexo: z.string().max(20).optional().or(z.literal('')),
    telefone: z.string().max(30).optional().or(z.literal('')),
    email: z.string().email().max(200).optional().or(z.literal('')),
    observacoes: z.string().max(1000).optional().or(z.literal('')),
  }),
});

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
    const { titular, dependente } = parsed.data;

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    let emailEnviado = false;
    let emailErro: string | null = null;

    if (RESEND_API_KEY) {
      const html = `
        <h2>Nova Solicitação de Inclusão de Dependente</h2>
        <p><em>Status: <strong>Pendente de análise</strong></em></p>

        <h3>Titular (Solicitante)</h3>
        <ul>
          <li><strong>Nome:</strong> ${titular.nome}</li>
          <li><strong>Matrícula:</strong> ${titular.matricula}</li>
          <li><strong>E-mail:</strong> ${titular.email || '-'}</li>
          <li><strong>Telefone:</strong> ${titular.telefone || '-'}</li>
        </ul>

        <h3>Dependente a ser incluído</h3>
        <ul>
          <li><strong>Nome:</strong> ${dependente.nome}</li>
          <li><strong>CPF:</strong> ${dependente.cpf || '-'}</li>
          <li><strong>Data de Nascimento:</strong> ${dependente.data_nascimento || '-'}</li>
          <li><strong>Parentesco:</strong> ${dependente.parentesco}</li>
          <li><strong>Sexo:</strong> ${dependente.sexo || '-'}</li>
          <li><strong>Telefone:</strong> ${dependente.telefone || '-'}</li>
          <li><strong>E-mail:</strong> ${dependente.email || '-'}</li>
        </ul>

        <h3>Observações</h3>
        <p>${(dependente.observacoes || '-').replace(/\n/g, '<br/>')}</p>
      `;

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'SBPM Portal do Associado <onboarding@resend.dev>',
          to: [DESTINO],
          reply_to: titular.email || undefined,
          subject: `Solicitação de inclusão de dependente — ${dependente.nome} (Matr. ${titular.matricula})`,
          html,
        }),
      });

      if (resendRes.ok) {
        emailEnviado = true;
      } else {
        emailErro = await resendRes.text();
        console.error('Falha email:', resendRes.status, emailErro);
      }
    } else {
      emailErro = 'RESEND_API_KEY não configurada';
    }

    return new Response(
      JSON.stringify({ ok: true, email_enviado: emailEnviado, email_erro: emailErro }),
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
