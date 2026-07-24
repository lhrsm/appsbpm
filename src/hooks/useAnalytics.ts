import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

/**
 * Rastreia pageviews e eventos custom no portal.
 * Persiste em public.analytics_events (apenas admin lê).
 */
export function usePageviewTracker(associadoId?: string | null) {
  const { pathname } = useLocation();
  useEffect(() => {
    if (!pathname) return;
    // não rastrear rotas internas do OAuth/admin sensíveis
    if (pathname.startsWith("/.lovable") || pathname.startsWith("/admin")) return;
    supabase.from("analytics_events").insert({
      event: "pageview",
      path: pathname,
      associado_id: associadoId ?? null,
      user_agent: navigator.userAgent.slice(0, 240),
    }).then(() => {}, () => {});
  }, [pathname, associadoId]);
}

export async function trackEvent(event: string, meta?: Record<string, unknown>, associadoId?: string | null) {
  try {
    await supabase.from("analytics_events").insert({
      event,
      path: window.location.pathname,
      associado_id: associadoId ?? null,
      meta: (meta ?? null) as any,
      user_agent: navigator.userAgent.slice(0, 240),
    });
  } catch {
    /* silent */
  }
}
