import { useEffect, useState } from "react";
import { PWA_UPDATE_EVENT, aplicarAtualizacaoPWA } from "@/pwa/registerSW";
import { emFluxoCritico } from "@/pwa/criticalFlow";
import { Button } from "@/design-system/components/Button";

/**
 * Aviso de nova versão do Portal.
 * Nunca recarrega sozinho e não aparece durante fluxos críticos.
 */
export default function PWAUpdatePrompt() {
  const [disponivel, setDisponivel] = useState(false);
  const [aplicando, setAplicando] = useState(false);

  useEffect(() => {
    const onUpdate = () => setDisponivel(true);
    window.addEventListener(PWA_UPDATE_EVENT, onUpdate);
    return () => window.removeEventListener(PWA_UPDATE_EVENT, onUpdate);
  }, []);

  if (!disponivel || emFluxoCritico()) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-3 bottom-[calc(env(safe-area-inset-bottom)+5rem)] z-50 mx-auto max-w-md rounded-2xl border border-green-600/20 bg-white/95 backdrop-blur-md p-4 shadow-xl sm:bottom-6"
    >
      <p className="text-sm font-bold text-slate-900">Uma nova versão do Portal está disponível.</p>
      <p className="mt-1 text-xs text-slate-600">
        A atualização é aplicada ao recarregar. Conclua o que estiver preenchendo antes de continuar.
      </p>
      <div className="mt-3 flex gap-2">
        <Button
          size="sm"
          disabled={aplicando}
          onClick={async () => {
            setAplicando(true);
            try {
              const ok = await aplicarAtualizacaoPWA();
              if (!ok) {
                setAplicando(false);
                // Força recarregamento se o método PWA falhar mas o usuário clicou
                window.location.reload();
              }
            } catch (err) {
              console.error("Erro ao atualizar PWA:", err);
              window.location.reload();
            }
          }}
        >
          Atualizar agora
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setDisponivel(false)}>
          Depois
        </Button>
      </div>
    </div>
  );
}
