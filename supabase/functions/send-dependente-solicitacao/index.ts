import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';
import { z } from 'npm:zod@3.23.8';

const optionalStr = (max: number) => z.string().max(max).optional().or(z.literal(''));

const DependenteSchema = z.object({
  nome: z.string().min(1).max(200),
  cpf: optionalStr(20),
  data_nascimento: optionalStr(20),
  parentesco: z.string().min(1).max(80),
  sexo: optionalStr(20),
  telefone: optionalStr(30),
  email: optionalStr(200),
  observacoes: optionalStr(1000),
  anexos: z.array(z.string()).max(20).optional(),
});

const BodySchema = z.object({
  titular: z.object({
    nome: z.string().min(1).max(200),
    matricula: z.string().min(1).max(50),
    email: optionalStr(200),
    telefone: optionalStr(30),
  }),
  // aceita `dependente` (legado, um único) ou `dependentes` (array)
  dependente: DependenteSchema.optional(),
  dependentes: z.array(DependenteSchema).min(1).max(20).optional(),
}).refine((d) => d.dependente || (d.dependentes && d.dependentes.length > 0), {
  message: 'Informe pelo menos um dependente',
});

const DESTINO_BUCKET = 'dependentes-anexos';
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
    const { titular } = parsed.data;
    const dependentes = parsed.data.dependentes ?? (parsed.data.dependente ? [parsed.data.dependente] : []);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
    );

    // Gerar signed URLs para os anexos de cada dependente
    const dependentesComLinks = await Promise.all(dependentes.map(async (dep) => {
      const anexos = dep.anexos || [];
      const links: { path: string; url: string }[] = [];
      for (const p of anexos) {
        const { data } = await supabase.storage.from(DESTINO_BUCKET).createSignedUrl(p, 60 * 60 * 24 * 7);
        links.push({ path: p, url: data?.signedUrl || '' });
      }
      return { dep, links };
    }));

    const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');
    let emailEnviado = false;
    let emailErro: string | null = null;

    if (RESEND_API_KEY) {
      const blocosDependentes = dependentesComLinks.map(({ dep, links }, idx) => {
        const listaLinks = links.length
          ? `<ul>${links.map((a) => `<li><a href="${a.url}">${a.path.split('/').pop()}</a></li>`).join('')}</ul>`
          : '<p>Nenhum anexo enviado.</p>';
        return `
          <h3>Dependente ${idx + 1}: ${dep.nome}</h3>
          <ul>
            <li><strong>Nome:</strong> ${dep.nome}</li>
            <li><strong>CPF:</strong> ${dep.cpf || '-'}</li>
            <li><strong>Data de Nascimento:</strong> ${dep.data_nascimento || '-'}</li>
            <li><strong>Parentesco:</strong> ${dep.parentesco}</li>
            <li><strong>Sexo:</strong> ${dep.sexo || '-'}</li>
            <li><strong>Telefone:</strong> ${dep.telefone || '-'}</li>
            <li><strong>E-mail:</strong> ${dep.email || '-'}</li>
          </ul>
          <p><strong>Observações:</strong><br/>${(dep.observacoes || '-').replace(/\n/g, '<br/>')}</p>
          <p><strong>Documentos anexados (${links.length}):</strong></p>
          ${listaLinks}
          <hr/>
        `;
      }).join('');

      const html = `
        <h2>Nova Solicitação de Inclusão de Dependente(s)</h2>
        <p><em>Status: <strong>Pendente de análise</strong></em></p>

        <h3>Titular (Solicitante)</h3>
        <ul>
          <li><strong>Nome:</strong> ${titular.nome}</li>
          <li><strong>Matrícula:</strong> ${titular.matricula}</li>
          <li><strong>E-mail:</strong> ${titular.email || '-'}</li>
          <li><strong>Telefone:</strong> ${titular.telefone || '-'}</li>
        </ul>

        <h3>Dependentes solicitados (${dependentesComLinks.length})</h3>
        ${blocosDependentes}
        <p style="font-size:11px;color:#666">Os links dos anexos são válidos por 7 dias.</p>
      `;

      const nomes = dependentesComLinks.map(({ dep }) => dep.nome).join(', ');
      const resendRes = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${RESEND_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'SBPM Portal do Associado <onboarding@resend.dev>',
          to: [DESTINO],
          reply_to: titular.email || undefined,
          subject: `Solicitação de inclusão de dependente(s) — ${nomes} (Matr. ${titular.matricula})`,
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
      JSON.stringify({ ok: true, email_enviado: emailEnviado, email_erro: emailErro, total: dependentesComLinks.length }),
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
