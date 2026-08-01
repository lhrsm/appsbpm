/**
 * Escala de espaçamento institucional (base 4px).
 * Uso: `spacing[16]` → "1rem". Em Tailwind, equivale a `p-4`, `gap-4` etc.
 */
export const spacing = {
  0: "0rem",
  4: "0.25rem",
  8: "0.5rem",
  12: "0.75rem",
  16: "1rem",
  20: "1.25rem",
  24: "1.5rem",
  32: "2rem",
  40: "2.5rem",
  48: "3rem",
  56: "3.5rem",
  64: "4rem",
  80: "5rem",
  96: "6rem",
} as const;

export type SpacingToken = keyof typeof spacing;

/** Equivalência direta com utilitários Tailwind (evita valores mágicos). */
export const spacingClass: Record<SpacingToken, string> = {
  0: "0",
  4: "1",
  8: "2",
  12: "3",
  16: "4",
  20: "5",
  24: "6",
  32: "8",
  40: "10",
  48: "12",
  56: "14",
  64: "16",
  80: "20",
  96: "24",
};
