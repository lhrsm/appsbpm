import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

async function buildKnowledgeBase(): Promise<string> {
  const admin = createClient(SUPABASE_URL, SERVICE_ROLE);
  const [{ data: faqs }, { data: eventos }, { data: clinicas }] = await Promise.all([
    admin.from('faq_items').select('categoria,pergunta,resposta').eq('publicado', true).order('categoria').limit(80),
    admin.from('eventos').select('titulo,descricao,data_inicio,local').eq('ativo', true).gte('data_inicio', new Date().toISOString()).order('data_inicio').limit(20),
    admin.from('clinicas_parceiros').select('nome,categoria,cidade,estado,telefone,whatsapp').eq('ativo', true).limit(60),
  ]);

  const faqTxt = (faqs ?? []).map((f: any) => `- [${f.categoria}] ${f.pergunta}\n  R: ${f.resposta}`).join('\n');
  const evtTxt = (eventos ?? []).map((e: any) => `- ${e.titulo} — ${new Date(e.data_inicio).toLocaleString('pt-BR')} — ${e.local ?? ''}`).join('\n');
  const cliTxt = (clinicas ?? []).map((c: any) => `- ${c.nome} (${c.categoria ?? 'parceiro'}) — ${c.cidade ?? ''}/${c.estado ?? ''} — ${c.telefone ?? c.whatsapp ?? ''}`).join('\n');

  return `## FAQ\n${faqTxt || '(vazio)'}\n\n## Próximos eventos\n${evtTxt || '(nenhum)'}\n\n## Clínicas e parceiros\n${cliTxt || '(nenhum)'}`;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  try {
    const { messages } = await req.json();
    if (!Array.isArray(messages)) {
      return new Response(JSON.stringify({ error: 'messages must be an array' }), {
        status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const knowledge = await buildKnowledgeBase();
    const system = `Você é o assistente virtual da SBPM (Sociedade Beneficente da Polícia Militar da Bahia). Responda de forma cordial, objetiva e em português do Brasil. Use SOMENTE as informações abaixo para responder perguntas sobre FAQ, eventos e rede credenciada. Se a pergunta fugir do escopo (dados pessoais do associado, autorizações específicas, valores exatos), oriente o usuário a abrir uma solicitação no portal ou ligar para os canais de atendimento (Previdência 71 98549-6972, Assistência à Saúde 71 98794-3414). Nunca invente valores ou prazos.\n\n${knowledge}`;

    const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'system', content: system }, ...messages],
        stream: true,
      }),
    });

    if (!resp.ok) {
      const errText = await resp.text();
      console.error('Gateway error:', resp.status, errText);
      const status = resp.status === 429 ? 429 : resp.status === 402 ? 402 : 500;
      return new Response(JSON.stringify({ error: 'ai_gateway_error', status: resp.status, details: errText }), {
        status, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(resp.body, {
      headers: { ...corsHeaders, 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache' },
    });
  } catch (e) {
    console.error('chat-assistant error:', e);
    return new Response(JSON.stringify({ error: String(e) }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
