/**
 * Paleta institucional SBPM.
 *
 * Todos os valores são expressos como HSL crus (`H S% L%`) para poderem ser
 * usados tanto em `hsl(var(--token))` quanto diretamente em CSS-in-JS.
 *
 * REGRA: componentes NUNCA devem escrever cores literais (`text-white`,
 * `bg-[#0a0]`). Devem usar as classes semânticas do Tailwind (que apontam para
 * as variáveis definidas em `src/index.css` e `src/design-system/styles/tokens.css`).
 */

export type ColorState =
  | "background"
  | "text"
  | "border"
  | "hover"
  | "pressed"
  | "disabled"
  | "selected";

export type ColorSet = Record<ColorState, string>;

/** Escala primária — verde institucional SBPM. */
export const green = {
  main: "145 63% 32%",
  dark: "145 68% 22%",
  medium: "145 55% 42%",
  light: "145 45% 90%",
} as const;

/** Escala neutra. */
export const gray = {
  50: "210 20% 98%",
  100: "210 20% 96%",
  200: "220 15% 91%",
  300: "220 15% 84%",
  400: "220 12% 66%",
  500: "220 10% 50%",
  600: "220 12% 40%",
  700: "220 15% 30%",
  800: "220 18% 20%",
  900: "220 20% 12%",
} as const;

export const base = {
  white: "0 0% 100%",
  black: "0 0% 0%",
} as const;

/** Cores de feedback. */
export const feedback = {
  success: "145 63% 32%",
  error: "0 75% 50%",
  warning: "45 95% 50%",
  info: "210 85% 45%",
} as const;

/** Cores de contexto (módulos institucionais). */
export const modules = {
  lgpd: "265 65% 52%",
  financeiro: "210 85% 45%",
  saude: "0 75% 50%",
  previdencia: "145 63% 32%",
  patrimonio: "28 85% 48%",
  rh: "190 70% 40%",
} as const;

/**
 * Monta o conjunto de estados de uma cor a partir do seu HSL base.
 * Usa alpha/luminosidade relativas para manter contraste WCAG AA.
 */
export function buildColorSet(hsl: string, onDark = false): ColorSet {
  return {
    background: `hsl(${hsl})`,
    text: onDark ? `hsl(${base.white})` : `hsl(${hsl})`,
    border: `hsl(${hsl} / 0.35)`,
    hover: `hsl(${hsl} / 0.88)`,
    pressed: `hsl(${hsl} / 0.76)`,
    disabled: `hsl(${hsl} / 0.38)`,
    selected: `hsl(${hsl} / 0.12)`,
  };
}

/** Tokens semânticos mapeados para as CSS vars já existentes no tema. */
export const semantic = {
  background: "var(--background)",
  foreground: "var(--foreground)",
  card: "var(--card)",
  cardForeground: "var(--card-foreground)",
  primary: "var(--primary)",
  primaryForeground: "var(--primary-foreground)",
  secondary: "var(--secondary)",
  muted: "var(--muted)",
  mutedForeground: "var(--muted-foreground)",
  accent: "var(--accent)",
  destructive: "var(--destructive)",
  warning: "var(--warning)",
  border: "var(--border)",
  ring: "var(--ring)",
} as const;

export const colors = { green, gray, base, feedback, modules, semantic } as const;

export type ModuleName = keyof typeof modules;
export type FeedbackName = keyof typeof feedback;
