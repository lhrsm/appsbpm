import { createContext, useContext, useId, type ReactNode } from "react";
import { cn } from "@/design-system/utilities";
import { icons } from "@/design-system/icons";
import { Tooltip } from "@/design-system/components/Overlay";

export interface FormFieldContextValue {
  id: string;
  describedBy?: string;
  invalid: boolean;
  disabled?: boolean;
  readOnly?: boolean;
  required?: boolean;
}

const FormFieldContext = createContext<FormFieldContextValue | null>(null);

/** Acessa a estrutura do campo (id, aria-describedby, estado). */
export function useFormField() {
  return useContext(FormFieldContext);
}

export interface FormFieldProps {
  id?: string;
  name?: string;
  label: ReactNode;
  required?: boolean;
  helperText?: ReactNode;
  error?: ReactNode;
  success?: ReactNode;
  tooltip?: ReactNode;
  disabled?: boolean;
  readOnly?: boolean;
  loading?: boolean;
  /** Contador opcional exibido no rodapé do campo (ex.: 120/500). */
  counter?: ReactNode;
  className?: string;
  children: ReactNode | ((field: FormFieldContextValue) => ReactNode);
}

/**
 * Estrutura base de campo: label + controle + helper/erro/sucesso.
 * Todo campo do portal externo deve ser envolvido por ele.
 *
 * @example
 * <FormField label="E-mail" required error={erro} helperText="Usaremos para enviar o código.">
 *   {(f) => <EmailInput {...f} value={email} onValueChange={setEmail} />}
 * </FormField>
 */
export function FormField({
  id,
  name,
  label,
  required,
  helperText,
  error,
  success,
  tooltip,
  disabled,
  readOnly,
  loading,
  counter,
  className,
  children,
}: FormFieldProps) {
  const generated = useId();
  const fieldId = id ?? name ?? generated;
  const helperId = `${fieldId}-helper`;
  const errorId = `${fieldId}-error`;
  const invalid = Boolean(error);
  const describedBy = [error ? errorId : null, helperText || success ? helperId : null].filter(Boolean).join(" ") || undefined;

  const ctx: FormFieldContextValue = { id: fieldId, describedBy, invalid, disabled, readOnly, required };
  const Help = icons.ajuda;
  const Spinner = icons.carregando;

  return (
    <FormFieldContext.Provider value={ctx}>
      <div className={cn("space-y-1.5", className)}>
        <div className="flex items-center gap-1.5">
          <label htmlFor={fieldId} className="text-sm font-medium text-foreground">
            {label}
            {required && (
              <span className="ml-0.5 text-destructive" aria-hidden>
                *
              </span>
            )}
            {required && <span className="sr-only"> (obrigatório)</span>}
          </label>
          {tooltip && (
            <Tooltip content={tooltip}>
              <button type="button" aria-label="Ajuda sobre este campo" className="text-muted-foreground hover:text-foreground">
                <Help className="size-4" aria-hidden />
              </button>
            </Tooltip>
          )}
          {loading && <Spinner className="size-3.5 animate-spin text-muted-foreground" aria-hidden />}
        </div>

        {typeof children === "function" ? children(ctx) : <div>{children}</div>}

        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            {error ? (
              <p id={errorId} role="alert" className="text-xs font-medium text-destructive">
                {error}
              </p>
            ) : success ? (
              <p id={helperId} className="text-xs font-medium text-[hsl(var(--success))]">
                {success}
              </p>
            ) : helperText ? (
              <p id={helperId} className="text-xs text-muted-foreground">
                {helperText}
              </p>
            ) : null}
          </div>
          {counter && <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{counter}</span>}
        </div>
      </div>
    </FormFieldContext.Provider>
  );
}

/** Props que os controles recebem do `FormField`. */
export function fieldAria(field?: FormFieldContextValue | null) {
  if (!field) return {};
  return {
    id: field.id,
    "aria-describedby": field.describedBy,
    "aria-invalid": field.invalid || undefined,
    "aria-required": field.required || undefined,
    disabled: field.disabled,
    readOnly: field.readOnly,
  };
}
