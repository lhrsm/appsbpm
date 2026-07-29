import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization") ?? "";
    if (!authHeader.startsWith("Bearer ")) return json({ error: "Não autenticado" }, 401);

    const url = Deno.env.get("SUPABASE_URL")!;
    const anon = Deno.env.get("SUPABASE_ANON_KEY")!;
    const service = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    // Cliente com o token do chamador — usado apenas para identificar/autorizar
    const caller = createClient(url, anon, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: userErr } = await caller.auth.getUser();
    if (userErr || !userData.user) return json({ error: "Não autenticado" }, 401);

    const { data: podeGerenciar } = await caller.rpc("pode_gerenciar_usuarios", {
      _user_id: userData.user.id,
    });
    if (!podeGerenciar) return json({ error: "Sem permissão para gerenciar usuários" }, 403);

    const body = await req.json().catch(() => ({}));
    const email = String(body?.email ?? "").trim().toLowerCase();
    const nome = String(body?.nome ?? "").trim();
    const redirectTo = String(body?.redirectTo ?? "");

    if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email.length > 255) {
      return json({ error: "E-mail inválido" }, 400);
    }
    if (nome.length > 120) return json({ error: "Nome muito longo" }, 400);

    const admin = createClient(url, service, { auth: { persistSession: false } });

    // Já existe conta com este e-mail?
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 1000 });
    const existente = list?.users?.find((u) => (u.email ?? "").toLowerCase() === email);
    if (existente) return json({ user_id: existente.id, convidado: false });

    const { data: convite, error: inviteErr } = await admin.auth.admin.inviteUserByEmail(email, {
      data: { name: nome || undefined },
      redirectTo: redirectTo || undefined,
    });
    if (inviteErr || !convite?.user) {
      console.error("Falha ao convidar usuário", inviteErr?.message);
      return json({ error: "Não foi possível enviar o convite" }, 400);
    }

    return json({ user_id: convite.user.id, convidado: true });
  } catch (e) {
    console.error("admin-usuarios erro", e instanceof Error ? e.message : e);
    return json({ error: "Erro interno" }, 500);
  }
});
