import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';

const IndicadorSchema = z.object({
  nome: z.string().min(1).max(200),
  email: z.string().email().max(200).optional().or(z.literal('')),
  matricula: z.string().min(1).max(50),
  telefone: z.string().max(30).optional().or(z.literal('')),
});

const IndicadoSchema = z.object({
  nome: z.string().min(1).max(200),
  email: z.string().email().max(200).optional().or(z.literal('')),
  matricula: z.string().max(50).optional().or(z.literal('')),
  telefone: z.string().min(8).max(30),
  cep: z.string().max(15).optional().or(z.literal('')),
  cidade: z.string().max(120).optional().or(z.literal('')),
  estado: z.string().max(2).optional().or(z.literal('')),
  endereco: z.string().max(200).optional().or(z.literal('')),
  anexos: z.array(z.string()).max(20).optional(),
});

const DependenteSchema = z.object({
  nome: z.string().min(1).max(200),
  cpf: z.string().max(20).optional().or(z.literal('')),
  parentesco: z.string().min(1).max(80),
  anexos: z.array(z.string()).max(20).optional(),
});

const BodySchema = z.object({
  indicador: IndicadorSchema,
  indicado: IndicadoSchema,
  dependentes: z.array(DependenteSchema).max(20).optional(),
  observacoes: z.string().max(2000).optional().or(z.literal('')),
});

const DESTINO = 'contato@sbpmbahia.com.br';
const BUCKET = 'indicacoes-anexos';

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
    const { indicador, indicado, dependentes = [], observacoes = '' } = parsed.data;

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Persist a summarized record
    const resumoDependentes = dependentes.map((d) => ({
      nome: d.nome, cpf: d.cpf, parentesco: d.parentesco, anexos: d.anexos || [],
    }));

    const { data: inserted, error: insertError } = await supabase
      .from('indicacoes_premiadas')
      .insert({
        associado_matricula: indicador.matricula,
        associado_nome: indicador.nome,
        associado_email: indicador.email || null,
        indicado_nome: indicado.nome,
        indicado_cpf: null,
        indicado_telefone: indicado.telefone,
        indicado_email: indicado.email || null,
        indicado_cidade: [indicado.cidade, indicado.estado].filter(Boolean).join(' / '),
        observacoes: JSON.stringify({
          indicador,
          indicado,
          dependentes: resumoDependentes,
          observacoes,
        }),
      })
      .select()
      .single();

    if (insertError) {
      console.error('Erro ao salvar:', insertError);
      return new Response(
        JSON.stringify({ error: 'Erro ao salvar indicação', details: insertError.message }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
      );
    }

    // Signed URLs (7 dias) para os anexos
    const signAll = async (paths: string[]) => {
      const out: { path: string; url: string }[] = [];
      for (const p of paths) {
        const { data } = await supabase.storage.from(BUCKET).createSignedUrl(p, 60 * 60 * 24 * 7);
        out.push({ path: p, url: data?.signedUrl || '' });
      }
      return out;
    };

    const indicadoLinks = await signAll(indicado.anexos || []);
    const depsLinks = await Promise.all(
      dependentes.map(async (d) => ({ nome: d.nome, links: await signAll(d.anexos || []) })),
    );

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    let emailEnviado = false;
    let emailErro: string | null = null;

    if (RESEND_API_KEY) {
      const listaLinks = (arr: { path: string; url: string }[]) =>
        arr.length
          ? `<ul>${arr.map((a) => `<li><a href="${a.url}">${a.path.split('/').pop()}</a></li>`).join('')}</ul>`
          : '<p>—</p>';

      const html = `
        <h2>Nova Indicação — Associação Premiada</h2>

        <h3>Indicador</h3>
        <ul>
          <li><strong>Nome:</strong> ${indicador.nome}</li>
          <li><strong>Matrícula:</strong> ${indicador.matricula}</li>
          <li><strong>E-mail:</strong> ${indicador.email || '-'}</li>
          <li><strong>Telefone:</strong> ${indicador.telefone || '-'}</li>
        </ul>

        <h3>Indicado</h3>
        <ul>
          <li><strong>Nome:</strong> ${indicado.nome}</li>
          <li><strong>Matrícula:</strong> ${indicado.matricula || '-'}</li>
          <li><strong>E-mail:</strong> ${indicado.email || '-'}</li>
          <li><strong>Telefone:</strong> ${indicado.telefone}</li>
          <li><strong>CEP:</strong> ${indicado.cep || '-'}</li>
          <li><strong>Endereço:</strong> ${indicado.endereco || '-'}</li>
          <li><strong>Cidade/UF:</strong> ${[indicado.cidade, indicado.estado].filter(Boolean).join(' / ') || '-'}</li>
        </ul>
        <h4>Anexos do indicado</h4>
        ${listaLinks(indicadoLinks)}

        <h3>Dependentes (${dependentes.length})</h3>
        ${dependentes.length ? dependentes.map((d, i) => `
          <div style="border-left:3px solid #16a34a;padding-left:8px;margin-bottom:12px">
            <p><strong>Dependente ${i + 1}:</strong> ${d.nome}</p>
            <ul>
              <li><strong>CPF:</strong> ${d.cpf || '-'}</li>
              <li><strong>Parentesco:</strong> ${d.parentesco}</li>
            </ul>
            <p><em>Documentos:</em></p>
            ${listaLinks(depsLinks[i]?.links || [])}
          </div>
        `).join('') : '<p>Sem dependentes.</p>'}

        <h3>Observações</h3>
        <p>${(observacoes || '-').replace(/\n/g, '<br/>')}</p>
      `;

      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'SBPM Associação Premiada <onboarding@resend.dev>',
          to: [DESTINO],
          reply_to: indicador.email || undefined,
          subject: `Nova Indicação — ${indicado.nome} (por ${indicador.nome})`,
          html,
        }),
      });

      if (resendRes.ok) {
        emailEnviado = true;
        await supabase.from('indicacoes_premiadas').update({ email_enviado: true }).eq('id', inserted.id);
      } else {
        emailErro = await resendRes.text();
        console.error('Falha email:', resendRes.status, emailErro);
      }
    } else {
      emailErro = 'RESEND_API_KEY não configurada';
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
