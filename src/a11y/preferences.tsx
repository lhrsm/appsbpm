import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

/**
 * Preferências de acessibilidade do portal (Fase 13 — WCAG 2.2 AA).
 *
 * As preferências são opcionais, persistentes e complementares às preferências
 * do sistema operacional (`prefers-reduced-motion`, `prefers-contrast`,
 * `forced-colors`), que continuam sendo respeitadas mesmo sem configuração.
 */
export interface A11yPreferences {
  /** Escala de fonte aplicada ao documento (1 = 100%). */
  fontScale: number;
  /** Alto contraste institucional. */
  contrast: boolean;
  /** Reduz transições e animações. */
  reduceMotion: boolean;
  /** Destaque reforçado do indicador de foco. */
  focusHighlight: boolean;
  /** Sublinha todos os links de conteúdo. */
  underlineLinks: boolean;
  /** Densidade confortável (mais espaçamento vertical). */
  comfortable: boolean;
  /** Tradutor de Libras (VLibras). */
  vlibras: boolean;
}

export const A11Y_DEFAULTS: A11yPreferences = {
  fontScale: 1,
  contrast: false,
  reduceMotion: false,
  focusHighlight: false,
  underlineLinks: false,
  comfortable: false,
  vlibras: false,
};

const STORAGE_KEY = "sbpm.a11y.v2";
const LEGACY_KEY = "sbpm.a11y.v1";

function readStored(): A11yPreferences {
  if (typeof window === "undefined") return A11Y_DEFAULTS;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY) ?? window.localStorage.getItem(LEGACY_KEY);
    if (!raw) return A11Y_DEFAULTS;
    return { ...A11Y_DEFAULTS, ...JSON.parse(raw) } as A11yPreferences;
  } catch {
    return A11Y_DEFAULTS;
  }
}

/** Aplica as preferências no elemento raiz do documento. */
export function applyA11yPreferences(p: A11yPreferences) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  // Escala relativa: nunca fixa px, para não quebrar zoom nem reflow.
  root.style.fontSize = p.fontScale === 1 ? "" : `${Math.round(p.fontScale * 100)}%`;
  root.classList.toggle("a11y-contrast", p.contrast);
  root.classList.toggle("a11y-reduce-motion", p.reduceMotion);
  root.classList.toggle("a11y-focus-highlight", p.focusHighlight);
  root.classList.toggle("a11y-underline-links", p.underlineLinks);
  root.classList.toggle("a11y-comfortable", p.comfortable);
}

/** Aplica as preferências salvas antes da hidratação (evita "flash"). */
export function bootstrapA11yPreferences() {
  applyA11yPreferences(readStored());
}

interface A11yContextValue {
  prefs: A11yPreferences;
  setPref: <K extends keyof A11yPreferences>(key: K, value: A11yPreferences[K]) => void;
  reset: () => void;
  /** Anuncia uma mensagem em região `aria-live` global. */
  announce: (message: string, assertive?: boolean) => void;
}

const A11yContext = createContext<A11yContextValue | null>(null);

/** Acessa e altera as preferências de acessibilidade. */
export function useA11y(): A11yContextValue {
  const ctx = useContext(A11yContext);
  if (!ctx) {
    return {
      prefs: A11Y_DEFAULTS,
      setPref: () => {},
      reset: () => {},
      announce: () => {},
    };
  }
  return ctx;
}

function loadVLibras() {
  // VLibras removido para evitar botões flutuantes indesejados conforme refinamento final.
  return;
}

function unloadVLibras() {
  document.querySelectorAll("[vw]").forEach((el) => el.remove());
  document.getElementById("vlibras-script")?.remove();
}

/**
 * Provedor global das preferências de acessibilidade + região `aria-live`
 * única da aplicação (evita múltiplas regiões concorrentes).
 */
export function A11yProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<A11yPreferences>(readStored);
  const [politeMsg, setPoliteMsg] = useState("");
  const [assertiveMsg, setAssertiveMsg] = useState("");

  useEffect(() => {
    applyA11yPreferences(prefs);
    if (prefs.vlibras) loadVLibras();
    else unloadVLibras();
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
    } catch {
      /* preferência apenas local */
    }
  }, [prefs]);

  const setPref = useCallback<A11yContextValue["setPref"]>((key, value) => {
    setPrefs((prev) => ({ ...prev, [key]: value }));
  }, []);

  const reset = useCallback(() => {
    unloadVLibras();
    setPrefs(A11Y_DEFAULTS);
    try {
      window.localStorage.removeItem(STORAGE_KEY);
      window.localStorage.removeItem(LEGACY_KEY);
    } catch {
      /* preferência apenas local */
    }
  }, []);

  const announce = useCallback((message: string, assertive = false) => {
    const set = assertive ? setAssertiveMsg : setPoliteMsg;
    // Limpa antes para garantir novo anúncio de mensagens repetidas.
    set("");
    window.setTimeout(() => set(message), 60);
  }, []);

  const value = useMemo(() => ({ prefs, setPref, reset, announce }), [prefs, setPref, reset, announce]);

  return (
    <A11yContext.Provider value={value}>
      {children}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {politeMsg}
      </div>
      <div role="alert" aria-live="assertive" aria-atomic="true" className="sr-only">
        {assertiveMsg}
      </div>
    </A11yContext.Provider>
  );
}
