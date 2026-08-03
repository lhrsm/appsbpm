import type { ReactNode } from "react";

export interface MaskedValueProps {
  /** Texto exibido visualmente (ex.: ***456). */
  visual: ReactNode;
  /** Texto lido por leitores de tela (ex.: "Matrícula final 456"). */
  accessible: string;
  className?: string;
}

/**
 * Exibe um valor mascarado sem que o leitor de tela anuncie
 * "asterisco asterisco asterisco" (WCAG 1.3.1 / 3.1.5).
 *
 * @example <MaskedValue visual="***456" accessible="Matrícula final 456" />
 */
export default function MaskedValue({ visual, accessible, className }: MaskedValueProps) {
  return (
    <span className={className}>
      <span aria-hidden="true">{visual}</span>
      <span className="sr-only">{accessible}</span>
    </span>
  );
}
