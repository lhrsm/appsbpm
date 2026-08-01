import { createElement, forwardRef, type HTMLAttributes } from "react";
import { cn } from "../utilities";
import { typography, typographyElement, type TypographyVariant } from "../tokens/typography";

export interface TextProps extends HTMLAttributes<HTMLElement> {
  /** Variante da escala tipográfica institucional. */
  variant?: TypographyVariant;
  /** Sobrescreve o elemento HTML renderizado (mantendo o estilo da variante). */
  as?: string;
}

/**
 * Texto institucional.
 *
 * @example <Text variant="h2">Painel do associado</Text>
 * @example <Text variant="caption" as="p">Atualizado agora</Text>
 *
 * Uso recomendado: todo texto de página/seção.
 * Uso não recomendado: aplicar `text-[13px]` manualmente em vez de usar variantes.
 */
export const Text = forwardRef<HTMLElement, TextProps>(function Text(
  { variant = "body", as, className, ...props },
  ref,
) {
  const element = as ?? typographyElement[variant];
  return createElement(element, {
    ref,
    className: cn(typography[variant], className),
    ...props,
  });
});
