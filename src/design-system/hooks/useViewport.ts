import { useEffect, useState } from "react";
import { mediaQuery } from "../tokens/breakpoints";

/**
 * Informações do viewport para adaptações finas (teclado virtual, PWA, safe areas).
 * Complementa `useBreakpoint`, que trata apenas de faixas de largura.
 */
export function useViewport() {
  const [state, setState] = useState(() => ({
    width: typeof window !== "undefined" ? window.innerWidth : 1280,
    height: typeof window !== "undefined" ? window.innerHeight : 800,
    /** Altura útil (descontando teclado virtual quando disponível). */
    visualHeight: typeof window !== "undefined" ? window.visualViewport?.height ?? window.innerHeight : 800,
    keyboardOpen: false,
    standalone: typeof window !== "undefined" ? window.matchMedia(mediaQuery.pwa).matches : false,
  }));

  useEffect(() => {
    const vv = window.visualViewport;

    const update = () => {
      const visualHeight = vv?.height ?? window.innerHeight;
      setState({
        width: window.innerWidth,
        height: window.innerHeight,
        visualHeight,
        // Teclado virtual: viewport visual encolhe mais de 20% da janela.
        keyboardOpen: window.innerHeight - visualHeight > window.innerHeight * 0.2,
        standalone:
          window.matchMedia(mediaQuery.pwa).matches ||
          (window.navigator as unknown as { standalone?: boolean }).standalone === true,
      });
    };

    update();
    window.addEventListener("resize", update);
    window.addEventListener("orientationchange", update);
    vv?.addEventListener("resize", update);
    return () => {
      window.removeEventListener("resize", update);
      window.removeEventListener("orientationchange", update);
      vv?.removeEventListener("resize", update);
    };
  }, []);

  return state;
}
