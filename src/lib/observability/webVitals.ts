import { logger } from "./logger";

/**
 * Coleta de Core Web Vitals sem dependências externas (Fase 12).
 * Métricas agregadas e anônimas: nenhuma informação pessoal é registrada.
 */

export interface VitalSample {
  name: "FCP" | "LCP" | "INP" | "CLS" | "TTFB" | "LONG_TASK";
  value: number;
  rating: "bom" | "atencao" | "ruim";
}

const THRESHOLDS: Record<VitalSample["name"], [number, number]> = {
  FCP: [1800, 3000],
  LCP: [2500, 4000],
  INP: [200, 500],
  CLS: [0.1, 0.25],
  TTFB: [800, 1800],
  LONG_TASK: [200, 500],
};

const samples: VitalSample[] = [];

function record(name: VitalSample["name"], value: number) {
  const [good, poor] = THRESHOLDS[name];
  const rating: VitalSample["rating"] = value <= good ? "bom" : value <= poor ? "atencao" : "ruim";
  const sample = { name, value: Math.round(value * 1000) / 1000, rating };
  samples.push(sample);
  if (rating !== "bom") {
    logger.warn("web-vitals", {
      result: "ok",
      metadata_safe: { ...sample, connection: connectionInfo() },
    });
  }
}

function connectionInfo() {
  const nav = navigator as Navigator & {
    connection?: { effectiveType?: string; saveData?: boolean; downlink?: number };
    deviceMemory?: number;
  };
  return {
    effectiveType: nav.connection?.effectiveType,
    saveData: nav.connection?.saveData,
    deviceMemory: nav.deviceMemory,
    standalone: window.matchMedia?.("(display-mode: standalone)").matches,
  };
}

const observe = (type: string, cb: (list: PerformanceObserverEntryList) => void, extra: PerformanceObserverInit = {}) => {
  try {
    const po = new PerformanceObserver(cb);
    po.observe({ type, buffered: true, ...extra } as PerformanceObserverInit);
    return po;
  } catch {
    return null;
  }
};

/** Inicia a coleta. Idempotente. */
let started = false;
export function initWebVitals(): void {
  if (started || typeof window === "undefined" || typeof PerformanceObserver === "undefined") return;
  started = true;

  observe("paint", (list) => {
    list.getEntries().forEach((e) => {
      if (e.name === "first-contentful-paint") record("FCP", e.startTime);
    });
  });

  observe("largest-contentful-paint", (list) => {
    const entries = list.getEntries();
    const last = entries[entries.length - 1];
    if (last) record("LCP", last.startTime);
  });

  let cls = 0;
  observe("layout-shift", (list) => {
    list.getEntries().forEach((entry) => {
      const e = entry as PerformanceEntry & { value: number; hadRecentInput: boolean };
      if (!e.hadRecentInput) cls += e.value;
    });
  });

  observe("event", (list) => {
    list.getEntries().forEach((entry) => {
      const e = entry as PerformanceEntry & { duration: number; interactionId?: number };
      if (e.interactionId && e.duration > 0) record("INP", e.duration);
    });
  }, { durationThreshold: 40 } as PerformanceObserverInit);

  observe("longtask", (list) => {
    list.getEntries().forEach((e) => {
      if (e.duration > THRESHOLDS.LONG_TASK[0]) record("LONG_TASK", e.duration);
    });
  });

  const nav = performance.getEntriesByType("navigation")[0] as PerformanceNavigationTiming | undefined;
  if (nav) record("TTFB", nav.responseStart);

  addEventListener(
    "visibilitychange",
    () => {
      if (document.visibilityState === "hidden") record("CLS", cls);
    },
    { once: true },
  );
}

/** Amostras coletadas na sessão atual (diagnóstico técnico). */
export const getVitals = (): VitalSample[] => [...samples];
