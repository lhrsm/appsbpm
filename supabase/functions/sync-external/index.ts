// Sincroniza dados de uma fonte externa (sync_sources) para a tabela alvo.
// Recebe { source_id } no body. Requer usuário autenticado com papel admin.
import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return json({ error: "Não autenticado" }, 401);
    }

    const userClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } },
    );
    const { data: claims, error: claimsErr } = await userClient.auth.getClaims(
      authHeader.replace("Bearer ", ""),
    );
    if (claimsErr || !claims?.claims) return json({ error: "Token inválido" }, 401);
    const userId = claims.claims.sub;

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );
    const { data: role } = await admin
      .from("user_roles").select("role").eq("user_id", userId).eq("role", "admin").maybeSingle();
    if (!role) return json({ error: "Acesso negado" }, 403);

    const { source_id } = await req.json();
    if (!source_id) return json({ error: "source_id é obrigatório" }, 400);

    const { data: source, error: sErr } = await admin
      .from("sync_sources").select("*").eq("id", source_id).maybeSingle();
    if (sErr || !source) return json({ error: "Fonte não encontrada" }, 404);
    if (!source.ativo) return json({ error: "Fonte inativa" }, 400);

    const log = await admin.from("sync_logs").insert({
      source_id, status: "sucesso", registros_processados: 0,
    }).select().single();
    const logId = log.data?.id;

    // Monta requisição
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(source.headers_extras as Record<string, string> ?? {}),
    };
    if (source.auth_tipo === "bearer" && source.auth_token) {
      headers[source.auth_header_name || "Authorization"] = `Bearer ${source.auth_token}`;
    } else if (source.auth_tipo === "apikey" && source.auth_token) {
      headers[source.auth_header_name || "X-API-Key"] = source.auth_token;
    } else if (source.auth_tipo === "basic" && source.auth_token) {
      headers["Authorization"] = `Basic ${btoa(source.auth_token)}`;
    }

    const fetchOpts: RequestInit = { method: source.metodo, headers };
    if (source.metodo === "POST" && source.body_template) {
      fetchOpts.body = JSON.stringify(source.body_template);
    }

    const resp = await fetch(source.url, fetchOpts);
    if (!resp.ok) {
      const errText = await resp.text();
      await admin.from("sync_logs").update({
        status: "erro",
        mensagem: `HTTP ${resp.status}: ${errText.slice(0, 500)}`,
        finalizado_em: new Date().toISOString(),
      }).eq("id", logId);
      return json({ error: `Falha ao buscar dados externos (${resp.status})`, detalhe: errText }, 502);
    }

    let payload: unknown = await resp.json();
    if (source.response_path) {
      for (const key of source.response_path.split(".")) {
        payload = (payload as Record<string, unknown>)?.[key];
      }
    }
    const rows = Array.isArray(payload) ? payload : [payload];

    // Aplica mapeamento (destino: origem)
    const mapping = source.mapeamento as Record<string, string>;
    const mapped = rows.filter(Boolean).map((row) => {
      const out: Record<string, unknown> = {};
      for (const [dest, orig] of Object.entries(mapping)) {
        out[dest] = getPath(row as Record<string, unknown>, orig);
      }
      return out;
    });

    // Upsert
    const { error: upErr, count } = await admin
      .from(source.entidade)
      .upsert(mapped, { onConflict: source.campo_chave, count: "exact" });

    if (upErr) {
      await admin.from("sync_logs").update({
        status: "erro", mensagem: upErr.message,
        registros_processados: mapped.length,
        finalizado_em: new Date().toISOString(),
      }).eq("id", logId);
      return json({ error: upErr.message }, 500);
    }

    await admin.from("sync_logs").update({
      status: "sucesso",
      registros_processados: mapped.length,
      registros_inseridos: count ?? mapped.length,
      finalizado_em: new Date().toISOString(),
    }).eq("id", logId);
    await admin.from("sync_sources").update({
      ultima_sincronizacao: new Date().toISOString(),
    }).eq("id", source_id);

    return json({ ok: true, processados: mapped.length });
  } catch (e) {
    return json({ error: (e as Error).message }, 500);
  }
});

function getPath(obj: Record<string, unknown>, path: string): unknown {
  return path.split(".").reduce<unknown>((acc, k) => (acc as Record<string, unknown> | null)?.[k], obj);
}
function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
