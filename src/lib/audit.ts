import { supabase } from "@/integrations/supabase/client";

export async function logAudit(action: string, entity: string, entity_id?: string | null, details?: any) {
  try {
    const { data: sess } = await supabase.auth.getSession();
    const user = sess.session?.user;
    await supabase.from("audit_logs").insert({
      user_id: user?.id ?? null,
      user_email: user?.email ?? null,
      action,
      entity,
      entity_id: entity_id ? String(entity_id) : null,
      details: details ?? null,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    });
  } catch (e) {
    console.warn("audit log failed", e);
  }
}
