import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';

const BodySchema = z.object({
  associado: z.object({
    nome: z.string().min(1).max(200),
    matricula: z.string().min(1).max(50),
    email: z.string().email().max(200).optional().or(z.literal('')),
    telefone: z.string().max(30).optional().or(z.literal('')),
  }),
  beneficiarios: z
    .array(
      z.object({
        nome: z.string().min(1).max(200),
        percentual: z.number().min(0.01).max(100),
        parentesco: z.string().max(80).optional().or(z.literal('')),
        cpf: z.string().max(20).optional().or(z.literal('')),
      }),
    )
    .min(1)
    .max(20),
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
    const { associado, beneficiarios } = parsed.data;

    const soma = beneficiarios.reduce((s, b) => s + b.percentual, 0);
    if (Math.round(soma * 100) / 100 !== 100) {
      return new Response(
        JSON.stringify({ error: 'A soma dos percentuais deve ser exatamente 100%.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    // Persistir solicitação (best-effort)
    try {
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      if (supabaseUrl && serviceKey) {
        const admin = createClient(supabaseUrl, serviceKey);
        await admin.from('peculio_solicitacoes').insert({
          associado_nome: associado.nome,
          associado_matricula: associado.matricula,
          associado_email: associado.email || null,
          associado_telefone: associado.telefone || null,
          beneficiarios,
          status: 'pendente',
        });
      }
    } catch (e) {
      console.error('Falha ao persistir solicitação de pecúlio:', e);
    }

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Serviço de e-mail não configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const linhas = beneficiarios
      .map(
        (b, i) => `
        <tr>
          <td style="padding:6px;border:1px solid #ddd">${i + 1}</td>
          <td style="padding:6px;border:1px solid #ddd">${b.nome}</td>
          <td style="padding:6px;border:1px solid #ddd">${b.parentesco || '-'}</td>
          <td style="padding:6px;border:1px solid #ddd">${b.cpf || '-'}</td>
          <td style="padding:6px;border:1px solid #ddd;text-align:right">${b.percentual.toFixed(2)}%</td>
        </tr>`,
      )
      .join('');

    const html = `
      <h2>Indicação de Beneficiários — Pecúlio</h2>
      <h3>Associado</h3>
      <ul>
        <li><strong>Nome:</strong> ${associado.nome}</li>
        <li><strong>Matrícula:</strong> ${associado.matricula}</li>
        <li><strong>E-mail:</strong> ${associado.email || '-'}</li>
        <li><strong>Telefone:</strong> ${associado.telefone || '-'}</li>
      </ul>
      <h3>Beneficiários</h3>
      <table style="border-collapse:collapse;width:100%;font-family:Arial,sans-serif;font-size:14px">
        <thead>
          <tr style="background:#f2f2f2">
            <th style="padding:6px;border:1px solid #ddd">#</th>
            <th style="padding:6px;border:1px solid #ddd">Nome</th>
            <th style="padding:6px;border:1px solid #ddd">Parentesco</th>
            <th style="padding:6px;border:1px solid #ddd">CPF</th>
            <th style="padding:6px;border:1px solid #ddd">Percentual</th>
          </tr>
        </thead>
        <tbody>${linhas}</tbody>
        <tfoot>
          <tr><td colspan="4" style="padding:6px;border:1px solid #ddd;text-align:right"><strong>Total</strong></td>
              <td style="padding:6px;border:1px solid #ddd;text-align:right"><strong>${soma.toFixed(2)}%</strong></td></tr>
        </tfoot>
      </table>
    `;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'SBPM Pecúlio <onboarding@resend.dev>',
        to: [DESTINO],
        reply_to: associado.email || undefined,
        subject: `Indicação de Beneficiários (Pecúlio) — ${associado.nome} — Mat. ${associado.matricula}`,
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
