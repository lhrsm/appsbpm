// Webhook público: sistema interno envia dados aqui via POST.
// URL: /functions/v1/webhook-ingest/<slug>
// Header: X-Webhook-Token: <secret_token>
// Body: array de registros ou objeto único
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Método não permitido" }, 405);

  const url = new URL(req.url);
  const slug = url.pathname.split("/").filter(Boolean).pop();
  if (!slug) return json({ error: "Slug ausente" }, 400);

  const token = req.headers.get("x-webhook-token");
  if (!token) return json({ error: "Token ausente" }, 401);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  const { data: endpoint } = await admin
    .from("webhook_endpoints").select("*")
    .eq("slug", slug).eq("ativo", true).maybeSingle();
  if (!endpoint) return json({ error: "Endpoint não encontrado" }, 404);
  if (endpoint.secret_token !== token) return json({ error: "Token inválido" }, 401);

  let body: unknown;
  try { body = await req.json(); } catch { return json({ error: "JSON inválido" }, 400); }
  const rows = Array.isArray(body) ? body : [body];

  const { error, count } = await admin
    .from(endpoint.entidade)
    .upsert(rows as Record<string, unknown>[], { count: "exact" });

  if (error) return json({ error: error.message }, 500);

  await admin.from("webhook_endpoints").update({
    ultima_chamada: new Date().toISOString(),
    total_chamadas: endpoint.total_chamadas + 1,
  }).eq("id", endpoint.id);

  return json({ ok: true, recebidos: rows.length, aplicados: count ?? rows.length });
});

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
