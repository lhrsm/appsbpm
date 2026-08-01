/** Breakpoints institucionais (mobile-first). */
export const breakpoints = {
  mobile: 0,
  tablet: 640,
  laptop: 1024,
  desktop: 1280,
  ultrawide: 1600,
} as const;

export type Breakpoint = keyof typeof breakpoints;

/** Media queries prontas. */
export const mediaQuery = {
  mobile: "(max-width: 639px)",
  tablet: "(min-width: 640px)",
  laptop: "(min-width: 1024px)",
  desktop: "(min-width: 1280px)",
  ultrawide: "(min-width: 1600px)",
  /** App instalado como PWA (standalone). */
  pwa: "(display-mode: standalone)",
} as const;

/** Largura máxima do container por faixa. */
export const containerMaxWidth = {
  mobile: "100%",
  tablet: "100%",
  laptop: "1400px",
  desktop: "1600px",
  ultrawide: "1600px",
} as const;
