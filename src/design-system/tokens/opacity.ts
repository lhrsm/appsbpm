/** Escala de opacidade institucional. */
export const opacity = {
  0: 0,
  subtle: 0.04,
  faint: 0.08,
  soft: 0.12,
  muted: 0.32,
  disabled: 0.5,
  strong: 0.72,
  nearOpaque: 0.88,
  full: 1,
} as const;

export type OpacityToken = keyof typeof opacity;
