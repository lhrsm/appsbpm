import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';

const optionalStr = (max: number) => z.string().max(max).optional().or(z.literal(''));

const BodySchema = z.object({
  titular: z.object({
    nome: z.string().min(1).max(200),
    matricula: z.string().min(1).max(50),
    email: optionalStr(200),
    telefone: optionalStr(30),
  }),
  dependente: z.object({
    id: optionalStr(60),
    nome: z.string().min(1).max(200),
    cpf: optionalStr(20),
    parentesco: optionalStr(80),
  }),
  motivo: z.string().min(3).max(1000),
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
    const { titular, dependente, motivo } = parsed.data;

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    let emailEnviado = false;
    let emailErro: string | null = null;

    if (RESEND_API_KEY) {
      const html = `
        <h2>Solicitação de Exclusão de Dependente</h2>
        <p><em>Status: <strong>Pendente de aprovação</strong></em></p>

        <h3>Titular (Solicitante)</h3>
        <ul>
          <li><strong>Nome:</strong> ${titular.nome}</li>
          <li><strong>Matrícula:</strong> ${titular.matricula}</li>
          <li><strong>E-mail:</strong> ${titular.email || '-'}</li>
          <li><strong>Telefone:</strong> ${titular.telefone || '-'}</li>
        </ul>

        <h3>Dependente a ser excluído</h3>
        <ul>
          <li><strong>Nome:</strong> ${dependente.nome}</li>
          <li><strong>CPF:</strong> ${dependente.cpf || '-'}</li>
          <li><strong>Parentesco:</strong> ${dependente.parentesco || '-'}</li>
          <li><strong>ID interno:</strong> ${dependente.id || '-'}</li>
        </ul>

        <h3>Motivo informado</h3>
        <p>${motivo.replace(/\n/g, '<br/>')}</p>

        <p style="font-size:11px;color:#666">A exclusão só será efetivada após aprovação do setor responsável.</p>
      `;

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'SBPM Portal do Associado <onboarding@resend.dev>',
          to: [DESTINO],
          reply_to: titular.email || undefined,
          subject: `Solicitação de EXCLUSÃO de dependente — ${dependente.nome} (Matr. ${titular.matricula})`,
          html,
        }),
      });

      if (resendRes.ok) emailEnviado = true;
      else emailErro = await resendRes.text();
    } else {
      emailErro = 'RESEND_API_KEY não configurada';
    }

    return new Response(
      JSON.stringify({ ok: true, email_enviado: emailEnviado, email_erro: emailErro }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return new Response(
      JSON.stringify({ error: 'Erro inesperado', details: msg }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
