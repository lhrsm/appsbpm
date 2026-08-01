/** Níveis de elevação. Usam a cor do foreground para funcionar em dark mode. */
export const shadow = {
  xs: "0 1px 2px 0 hsl(var(--foreground) / 0.04)",
  sm: "0 1px 3px 0 hsl(var(--foreground) / 0.07), 0 1px 2px -1px hsl(var(--foreground) / 0.05)",
  md: "0 4px 10px -2px hsl(var(--foreground) / 0.08), 0 2px 4px -2px hsl(var(--foreground) / 0.05)",
  lg: "0 10px 24px -6px hsl(var(--foreground) / 0.12), 0 4px 8px -4px hsl(var(--foreground) / 0.06)",
  xl: "0 20px 40px -12px hsl(var(--foreground) / 0.18)",
  floating: "0 24px 60px -16px hsl(var(--primary) / 0.28)",
} as const;

export type ShadowToken = keyof typeof shadow;

/** Classes utilitárias registradas em `design-system/styles/tokens.css`. */
export const shadowClass: Record<ShadowToken, string> = {
  xs: "ds-shadow-xs",
  sm: "ds-shadow-sm",
  md: "ds-shadow-md",
  lg: "ds-shadow-lg",
  xl: "ds-shadow-xl",
  floating: "ds-shadow-floating",
};
