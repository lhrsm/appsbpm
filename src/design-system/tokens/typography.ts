/**
 * Escala tipográfica institucional.
 * Cada variante já traz classes Tailwind prontas para uso em componentes.
 */

export const fontWeight = {
  light: 300,
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const lineHeight = {
  tight: "1.15",
  snug: "1.3",
  normal: "1.5",
  relaxed: "1.65",
} as const;

export const letterSpacing = {
  tighter: "-0.02em",
  tight: "-0.01em",
  normal: "0em",
  wide: "0.02em",
  wider: "0.08em",
} as const;

export type TypographyVariant =
  | "display"
  | "h1"
  | "h2"
  | "h3"
  | "h4"
  | "h5"
  | "h6"
  | "bodyLarge"
  | "body"
  | "small"
  | "caption"
  | "overline";

/** Classes Tailwind canônicas por variante. */
export const typography: Record<TypographyVariant, string> = {
  display: "text-4xl md:text-5xl font-bold leading-tight tracking-tight",
  h1: "text-3xl md:text-4xl font-bold leading-tight tracking-tight",
  h2: "text-2xl md:text-3xl font-bold leading-snug tracking-tight",
  h3: "text-xl md:text-2xl font-semibold leading-snug",
  h4: "text-lg md:text-xl font-semibold leading-snug",
  h5: "text-base md:text-lg font-semibold leading-normal",
  h6: "text-sm md:text-base font-semibold leading-normal",
  bodyLarge: "text-base md:text-lg font-normal leading-relaxed",
  body: "text-sm md:text-base font-normal leading-normal",
  small: "text-sm font-normal leading-normal",
  caption: "text-xs font-normal leading-normal text-muted-foreground",
  overline: "text-[10px] font-semibold uppercase tracking-wider text-muted-foreground",
};

/** Elemento HTML padrão de cada variante (mantém semântica e a11y). */
export const typographyElement: Record<TypographyVariant, string> = {
  display: "h1",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  h4: "h4",
  h5: "h5",
  h6: "h6",
  bodyLarge: "p",
  body: "p",
  small: "p",
  caption: "span",
  overline: "span",
};
