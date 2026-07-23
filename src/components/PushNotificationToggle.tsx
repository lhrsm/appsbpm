import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Bell, BellOff, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { requestFcmToken } from "@/lib/firebase";
import { supabase } from "@/integrations/supabase/client";

interface Props {
  associadoId?: string | null;
  dependenteId?: string | null;
}

export function PushNotificationToggle({ associadoId, dependenteId }: Props) {
  const [loading, setLoading] = useState(false);
  const [enabled, setEnabled] = useState(
    typeof Notification !== "undefined" && Notification.permission === "granted"
  );

  const handleEnable = async () => {
    setLoading(true);
    try {
      if (!("Notification" in window) || !("serviceWorker" in navigator)) {
        toast.error("Seu navegador não suporta notificações push.");
        return;
      }
      if (!window.isSecureContext) {
        toast.error("Ative as notificações no site publicado (HTTPS).");
        return;
      }
      if (window.top !== window.self) {
        toast.warning("Abra o app em uma aba própria (fora do preview) para ativar as notificações.");
        return;
      }
      const { token, reason } = await requestFcmToken();
      if (!token) {
        const msgs: Record<string, string> = {
          "unsupported": "Navegador sem suporte a push (tente Chrome/Edge/Firefox).",
          "missing-vapid": "Configuração de push indisponível. Contate o suporte.",
          "permission-denied": "Permissão de notificações negada. Habilite nas configurações do navegador para este site.",
          "no-token": "Não foi possível gerar o token. Verifique o bloqueio de notificações do site.",
        };
        toast.error(msgs[reason ?? ""] ?? `Falha ao ativar: ${reason ?? "erro desconhecido"}`);
        return;
      }
      const { error } = await supabase.from("push_tokens").upsert(
        {
          token,
          associado_id: associadoId ?? null,
          dependente_id: dependenteId ?? null,
          user_agent: navigator.userAgent,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "token" }
      );
      if (error) throw error;
      setEnabled(true);
      toast.success("Notificações ativadas neste dispositivo!");
    } catch (e: any) {
      console.error(e);
      toast.error("Não foi possível ativar as notificações.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      onClick={handleEnable}
      disabled={loading || enabled}
      variant={enabled ? "secondary" : "default"}
      className="gap-2"
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : enabled ? (
        <Bell className="h-4 w-4" />
      ) : (
        <BellOff className="h-4 w-4" />
      )}
      {enabled ? "Notificações ativadas" : "Ativar notificações"}
    </Button>
  );
}
