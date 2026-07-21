import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { z } from 'npm:zod@3.23.8';

const BodySchema = z.object({
  indicador: z.object({
    nome: z.string().min(1).max(200),
    email: z.string().email().max(200).optional().or(z.literal('')),
    telefone: z.string().max(30).optional().or(z.literal('')),
    matricula: z.string().min(1).max(50),
  }),
  parceiro: z.object({
    nome: z.string().min(1).max(200),
    email: z.string().email().max(200).optional().or(z.literal('')),
    telefone: z.string().min(8).max(30),
    estado: z.string().min(2).max(2),
    cidade: z.string().min(1).max(120),
    redes_sociais: z.string().max(1000).optional().or(z.literal('')),
  }),
});

const DESTINO = 'contato@sbpmbahia.com.br';

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
    const { indicador, parceiro } = parsed.data;

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    if (!RESEND_API_KEY) {
      return new Response(
        JSON.stringify({ error: 'Serviço de e-mail não configurado' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    const html = `
      <h2>Nova Indicação de Parceiro</h2>
      <h3>Indicador (Associado)</h3>
      <ul>
        <li><strong>Nome:</strong> ${indicador.nome}</li>
        <li><strong>Matrícula:</strong> ${indicador.matricula}</li>
        <li><strong>E-mail:</strong> ${indicador.email || '-'}</li>
        <li><strong>Telefone:</strong> ${indicador.telefone || '-'}</li>
      </ul>
      <h3>Parceiro Indicado</h3>
      <ul>
        <li><strong>Nome:</strong> ${parceiro.nome}</li>
        <li><strong>E-mail:</strong> ${parceiro.email || '-'}</li>
        <li><strong>Telefone:</strong> ${parceiro.telefone}</li>
        <li><strong>Cidade/UF:</strong> ${parceiro.cidade} / ${parceiro.estado}</li>
        <li><strong>Redes sociais:</strong> ${(parceiro.redes_sociais || '-').replace(/\n/g, '<br/>')}</li>
      </ul>
    `;

    const resendRes = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'SBPM Indicação de Parceiros <onboarding@resend.dev>',
        to: [DESTINO],
        reply_to: indicador.email || undefined,
        subject: `Nova Indicação de Parceiro — ${parceiro.nome} (por ${indicador.nome})`,
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
