/** Raios de borda institucionais (base `--radius`, 0.75rem). */
export const radius = {
  xs: "0.25rem",
  sm: "0.375rem",
  md: "0.5rem",
  lg: "0.75rem",
  xl: "1rem",
  "2xl": "1.5rem",
  full: "9999px",
} as const;

export type RadiusToken = keyof typeof radius;

/** Classes Tailwind equivalentes. */
export const radiusClass: Record<RadiusToken, string> = {
  xs: "rounded-[0.25rem]",
  sm: "rounded-sm",
  md: "rounded-md",
  lg: "rounded-lg",
  xl: "rounded-xl",
  "2xl": "rounded-2xl",
  full: "rounded-full",
};
