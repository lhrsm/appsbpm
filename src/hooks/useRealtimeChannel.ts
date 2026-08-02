import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/observability/logger";

type PostgresEvent = "INSERT" | "UPDATE" | "DELETE" | "*";

export interface RealtimeOptions<T extends Record<string, unknown>> {
  /** Nome único do canal — inclua o id do usuário para não duplicar assinaturas. */
  channel: string;
  table: string;
  schema?: string;
  event?: PostgresEvent;
  /** Filtro obrigatório do lado do servidor (ex.: `associado_id=eq.<id>`). */
  filter: string;
  enabled?: boolean;
  onEvent: (payload: { eventType: string; new: T | null; old: T | null }) => void;
}

/** Canais ativos por nome — evita listeners duplicados no mesmo dispositivo. */
const activeChannels = new Map<string, ReturnType<typeof supabase.channel>>();

/** Encerra todos os canais (logout, troca de usuário). */
export function closeAllRealtime() {
  activeChannels.forEach((channel) => void supabase.removeChannel(channel));
  activeChannels.clear();
}

/**
 * Assinatura Realtime segura: filtrada por registro, única por nome,
 * com cleanup no unmount, no logout e na troca de usuário.
 */
export function useRealtimeChannel<T extends Record<string, unknown>>({
  channel,
  table,
  schema = "public",
  event = "*",
  filter,
  enabled = true,
  onEvent,
}: RealtimeOptions<T>) {
  const handler = useRef(onEvent);
  handler.current = onEvent;

  useEffect(() => {
    if (!enabled || !filter) return;

    activeChannels.get(channel)?.unsubscribe();
    const ch = supabase
      .channel(channel)
      .on(
        // @ts-expect-error tipagem genérica do supabase-js para postgres_changes
        "postgres_changes",
        { event, schema, table, filter },
        (payload: { eventType: string; new: T | null; old: T | null }) => {
          handler.current(payload);
        },
      )
      .subscribe((status) => {
        if (status === "CHANNEL_ERROR" || status === "TIMED_OUT") {
          logger.warn("realtime.status", { result: "error", metadata_safe: { channel, status } });
        }
      });

    activeChannels.set(channel, ch);
    return () => {
      activeChannels.delete(channel);
      void supabase.removeChannel(ch);
    };
  }, [channel, table, schema, event, filter, enabled]);
}
