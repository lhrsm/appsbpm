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
      const token = await requestFcmToken();
      if (!token) {
        toast.error("Permissão negada ou token indisponível.");
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
