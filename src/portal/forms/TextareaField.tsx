import { forwardRef, useState, type TextareaHTMLAttributes } from "react";
import { cn } from "@/design-system/utilities";
import { portalInputBase } from "./inputs";

export interface TextareaFieldProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Cresce com o conteúdo até `maxRows`. */
  autoResize?: boolean;
  maxRows?: number;
  success?: boolean;
}

/**
 * Área de texto padronizada (observações, justificativas, solicitações).
 * Sempre defina `maxLength` — o crescimento nunca é ilimitado.
 *
 * @example
 * <FormField label="Observações" counter={`${obs.length}/500`}>
 *   {(f) => <TextareaField {...f} maxLength={500} value={obs} onChange={(e) => setObs(e.target.value)} />}
 * </FormField>
 */
export const TextareaField = forwardRef<HTMLTextAreaElement, TextareaFieldProps>(function TextareaField(
  { autoResize, maxRows = 10, success, className, rows = 4, onChange, ...props },
  ref,
) {
  const [height, setHeight] = useState<number | undefined>(undefined);
  const invalid = props["aria-invalid"];
  return (
    <textarea
      ref={ref}
      rows={rows}
      style={autoResize && height ? { height } : undefined}
      onChange={(e) => {
        if (autoResize) {
          const el = e.currentTarget;
          const lineHeight = 22;
          el.style.height = "auto";
          setHeight(Math.min(el.scrollHeight, maxRows * lineHeight));
        }
        onChange?.(e);
      }}
      className={cn(
        portalInputBase,
        "min-h-24 resize-y py-2 leading-relaxed",
        autoResize && "resize-none",
        invalid && "border-destructive focus-visible:ring-destructive",
        success && !invalid && "border-[hsl(var(--success))]",
        className,
      )}
      {...props}
    />
  );
});
