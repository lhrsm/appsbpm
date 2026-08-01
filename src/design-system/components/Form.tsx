import type { ReactNode } from "react";
import { cn } from "../utilities";

export interface FieldProps {
  /** Rótulo visível do campo. */
  label?: ReactNode;
  /** `id` do controle associado (obrigatório para a11y quando há label). */
  htmlFor?: string;
  required?: boolean;
  /** Texto de apoio exibido abaixo do controle. */
  hint?: ReactNode;
  /** Mensagem de erro — substitui o hint e marca o campo como inválido. */
  error?: ReactNode;
  /** Mensagem de sucesso. */
  success?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Rótulo padronizado. @example <Label htmlFor="cpf">CPF</Label> */
export function Label({
  children,
  htmlFor,
  required,
  className,
}: {
  children: ReactNode;
  htmlFor?: string;
  required?: boolean;
  className?: string;
}) {
  return (
    <label htmlFor={htmlFor} className={cn("text-sm font-medium text-foreground", className)}>
      {children}
      {required && (
        <span className="ml-0.5 text-destructive" aria-hidden>
          *
        </span>
      )}
    </label>
  );
}

/** Texto auxiliar. @example <Hint>Somente números.</Hint> */
export function Hint({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <p id={id} className="text-xs text-muted-foreground">
      {children}
    </p>
  );
}

/** Mensagem de erro acessível (`role="alert"`). */
export function ErrorMessage({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <p id={id} role="alert" className="text-xs font-medium text-destructive">
      {children}
    </p>
  );
}

/** Mensagem de validação positiva. */
export function SuccessMessage({ children, id }: { children: ReactNode; id?: string }) {
  return (
    <p id={id} className="text-xs font-medium text-[hsl(var(--success))]">
      {children}
    </p>
  );
}

/** Separador de seções de formulário. @example <Divider label="Endereço" /> */
export function Divider({ label, className }: { label?: ReactNode; className?: string }) {
  if (!label) return <hr className={cn("border-border", className)} />;
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <hr className="flex-1 border-border" />
      <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{label}</span>
      <hr className="flex-1 border-border" />
    </div>
  );
}

/**
 * Wrapper de campo de formulário: label + controle + hint/erro.
 *
 * @example
 * <Field label="E-mail" htmlFor="email" required error={erro}>
 *   <EmailInput id="email" />
 * </Field>
 *
 * Uso recomendado: todo campo de formulário do portal.
 */
export function Field({ label, htmlFor, required, hint, error, success, children, className }: FieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label htmlFor={htmlFor} required={required}>
          {label}
        </Label>
      )}
      {children}
      {error ? (
        <ErrorMessage id={htmlFor ? `${htmlFor}-error` : undefined}>{error}</ErrorMessage>
      ) : success ? (
        <SuccessMessage>{success}</SuccessMessage>
      ) : hint ? (
        <Hint id={htmlFor ? `${htmlFor}-hint` : undefined}>{hint}</Hint>
      ) : null}
    </div>
  );
}
