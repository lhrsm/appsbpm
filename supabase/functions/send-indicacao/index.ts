import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';

const BodySchema = z.object({
  associado_matricula: z.string().min(1).max(50),
  associado_nome: z.string().min(1).max(200),
  associado_email: z.string().email().max(200).optional().or(z.literal('')),
  indicado_nome: z.string().min(1).max(200),
  indicado_cpf: z.string().max(20).optional().or(z.literal('')),
  indicado_telefone: z.string().min(8).max(30),
  indicado_email: z.string().email().max(200).optional().or(z.literal('')),
  indicado_cidade: z.string().max(120).optional().or(z.literal('')),
  observacoes: z.string().max(2000).optional().or(z.literal('')),
});

const DESTINO = 'contato@sbpmbahia.com.br';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const parsed = BodySchema.safeParse(await req.json());
    if (!parsed.success) {
      return new Response(
        JSON.stringify({ error: 'Dados inválidos', details: parsed.error.flatten().fieldErrors }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }
    const data = parsed.data;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    const { data: inserted, error: insertError } = await supabase
      .from('indicacoes_premiadas')
      .insert({
        associado_matricula: data.associado_matricula,
        associado_nome: data.associado_nome,
        associado_email: data.associado_email || null,
        indicado_nome: data.indicado_nome,
        indicado_cpf: data.indicado_cpf || null,
        indicado_telefone: data.indicado_telefone,
        indicado_email: data.indicado_email || null,
        indicado_cidade: data.indicado_cidade || null,
        observacoes: data.observacoes || null,
      })
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao salvar indicação:', insertError);
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar indicação', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Best-effort: enviar email via Resend se a chave estiver configurada
    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    let emailEnviado = false;
    let emailErro: string | null = null;

    if (RESEND_API_KEY) {
      const html = `
        <h2>Nova Indicação - Associação Premiada</h2>
        <h3>Associado indicador</h3>
        <ul>
          <li><strong>Matrícula:</strong> ${data.associado_matricula}</li>
          <li><strong>Nome:</strong> ${data.associado_nome}</li>
          <li><strong>Email:</strong> ${data.associado_email || '-'}</li>
        </ul>
        <h3>Pessoa indicada</h3>
        <ul>
          <li><strong>Nome:</strong> ${data.indicado_nome}</li>
          <li><strong>CPF:</strong> ${data.indicado_cpf || '-'}</li>
          <li><strong>Telefone:</strong> ${data.indicado_telefone}</li>
          <li><strong>Email:</strong> ${data.indicado_email || '-'}</li>
          <li><strong>Cidade:</strong> ${data.indicado_cidade || '-'}</li>
        </ul>
        <h3>Observações</h3>
        <p>${(data.observacoes || '-').replace(/\n/g, '<br/>')}</p>
      `;

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'SBPM Associação Premiada <onboarding@resend.dev>',
          to: [DESTINO],
          reply_to: data.associado_email || undefined,
          subject: `Nova Indicação - ${data.indicado_nome} (por ${data.associado_nome})`,
          html,
        }),
      });

      if (resendRes.ok) {
        emailEnviado = true;
        await supabase
          .from('indicacoes_premiadas')
          .update({ email_enviado: true })
          .eq('id', inserted.id);
      } else {
        emailErro = await resendRes.text();
        console.error('Falha ao enviar email:', resendRes.status, emailErro);
      }
    } else {
      emailErro = 'RESEND_API_KEY não configurada';
      console.warn(emailErro);
    }

    return new Response(
      JSON.stringify({ ok: true, id: inserted.id, email_enviado: emailEnviado, email_erro: emailErro }),
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
