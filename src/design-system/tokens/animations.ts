/**
 * Microinterações institucionais.
 * Discretas por princípio: nada acima de 320ms, nada com bounce exagerado.
 * Respeitam `html.a11y-reduce-motion` (ver src/index.css).
 */
export const duration = {
  instant: 80,
  fast: 150,
  normal: 220,
  slow: 320,
} as const;

export const easing = {
  standard: "cubic-bezier(0.4, 0, 0.2, 1)",
  decelerate: "cubic-bezier(0, 0, 0.2, 1)",
  accelerate: "cubic-bezier(0.4, 0, 1, 1)",
} as const;

/** Classes de animação disponíveis (tailwind.config + tokens.css). */
export const animation = {
  fadeIn: "animate-fade-in",
  scaleIn: "ds-animate-scale-in",
  slideInRight: "ds-animate-slide-in-right",
  slideInUp: "ds-animate-slide-in-up",
  accordionDown: "animate-accordion-down",
  accordionUp: "animate-accordion-up",
  pulse: "animate-pulse",
  spin: "animate-spin",
} as const;

/** Microinterações de interação direta. */
export const interaction = {
  hover: "transition-colors duration-200",
  hoverLift: "transition-all duration-200 hover:-translate-y-0.5",
  press: "active:scale-[0.98] transition-transform duration-75",
  focus: "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
} as const;
