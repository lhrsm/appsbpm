import { useEffect, useState } from "react";
import { WifiOff, Wifi, RefreshCw } from "lucide-react";

/**
 * Aviso global de conectividade (Fase 11).
 * Respeita safe areas e não cobre o conteúdo — empurra a página.
 */
export default function OfflineBanner() {
  const [online, setOnline] = useState(typeof navigator !== "undefined" ? navigator.onLine : true);
  const [justReconnected, setJustReconnected] = useState(false);

  useEffect(() => {
    const goOnline = () => {
      setOnline(true);
      setJustReconnected(true);
      window.setTimeout(() => setJustReconnected(false), 4000);
    };
    const goOffline = () => setOnline(false);
    window.addEventListener("online", goOnline);
    window.addEventListener("offline", goOffline);
    return () => {
      window.removeEventListener("online", goOnline);
      window.removeEventListener("offline", goOffline);
    };
  }, []);

  if (online && !justReconnected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={`sticky top-0 z-[100] w-full px-4 py-2 text-center text-sm font-medium shadow-md safe-pt ${
        online ? "bg-sbpm-green text-white" : "bg-destructive text-destructive-foreground"
      }`}
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center justify-center gap-2 sm:flex-row">
        {online ? <Wifi className="h-4 w-4 shrink-0" aria-hidden /> : <WifiOff className="h-4 w-4 shrink-0" aria-hidden />}
        <span className="break-anywhere">
          {online
            ? "Conexão restabelecida. Você pode tentar novamente."
            : "Você está sem conexão. Apenas conteúdos já carregados ficam disponíveis; envios serão bloqueados."}
        </span>
        {online && (
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="inline-flex min-h-9 items-center gap-1 rounded-md bg-white/20 px-3 text-xs font-semibold hover:bg-white/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            Atualizar
          </button>
        )}
      </div>
    </div>
  );
}
