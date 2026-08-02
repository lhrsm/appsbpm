/** Breakpoints institucionais (mobile-first) — Fase 1 / Fase 11. */
export const breakpoints = {
  /** Mobile pequeno: até 359px */
  mobileSmall: 0,
  /** Mobile: 360–479px */
  mobile: 360,
  /** Mobile grande: 480–639px */
  mobileLarge: 480,
  /** Tablet retrato: 640–1023px */
  tablet: 640,
  /** Tablet paisagem / notebook pequeno: 1024–1279px */
  laptop: 1024,
  /** Desktop: 1280–1919px */
  desktop: 1280,
  /** Desktop grande: 1920–2559px */
  desktopLarge: 1920,
  /** Ultrawide: 2560px+ */
  ultrawide: 2560,
} as const;

export type Breakpoint = keyof typeof breakpoints;

/** Media queries prontas. */
export const mediaQuery = {
  mobileSmall: "(max-width: 359px)",
  mobile: "(max-width: 639px)",
  tablet: "(min-width: 640px)",
  laptop: "(min-width: 1024px)",
  desktop: "(min-width: 1280px)",
  desktopLarge: "(min-width: 1920px)",
  ultrawide: "(min-width: 2560px)",
  /** Proporção próxima de 21:9 */
  cinematic: "(min-aspect-ratio: 2/1) and (min-width: 1920px)",
  landscape: "(orientation: landscape)",
  /** Landscape em telas baixas (mobile deitado) */
  landscapeShort: "(orientation: landscape) and (max-height: 500px)",
  /** App instalado como PWA (standalone). */
  pwa: "(display-mode: standalone)",
  reducedMotion: "(prefers-reduced-motion: reduce)",
} as const;

/** Largura máxima do container por faixa. */
export const containerMaxWidth = {
  mobile: "100%",
  tablet: "100%",
  laptop: "1400px",
  desktop: "1600px",
  ultrawide: "1800px",
} as const;

/** Largura máxima confortável de leitura (70–85 caracteres). */
export const readableMaxWidth = "72ch";
