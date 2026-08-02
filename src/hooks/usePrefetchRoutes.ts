import { useEffect } from "react";

type Loader = () => Promise<unknown>;

const carregados = new Set<Loader>();

/** Respeita economia de dados, rede lenta e dispositivos modestos. */
export function podePrefetch(): boolean {
  if (typeof navigator === "undefined") return false;
  const nav = navigator as Navigator & {
    connection?: { effectiveType?: string; saveData?: boolean };
    deviceMemory?: number;
  };
  if (nav.connection?.saveData) return false;
  const tipo = nav.connection?.effectiveType;
  if (tipo && ["slow-2g", "2g", "3g"].includes(tipo)) return false;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory < 2) return false;
  return true;
}

/**
 * Prefetch controlado de rotas prováveis, em tempo ocioso.
 * Nunca busca documentos, PDFs ou conteúdo sem permissão — apenas o chunk da rota.
 */
export function usePrefetchRoutes(loaders: Loader[], enabled = true) {
  useEffect(() => {
    if (!enabled || !podePrefetch()) return;
    const pendentes = loaders.filter((l) => !carregados.has(l));
    if (!pendentes.length) return;

    const executar = () => {
      pendentes.forEach((loader) => {
        carregados.add(loader);
        void loader().catch(() => carregados.delete(loader));
      });
    };

    const ric = (window as Window & { requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number })
      .requestIdleCallback;
    if (ric) {
      const id = ric(executar, { timeout: 3000 });
      return () => (window as unknown as { cancelIdleCallback?: (id: number) => void }).cancelIdleCallback?.(id);
    }
    const timer = setTimeout(executar, 1200);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled]);
}
