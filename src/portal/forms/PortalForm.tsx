import { createContext, useCallback, useContext, useMemo, useRef, useState, type FormEvent, type ReactNode } from "react";
import { cn } from "@/design-system/utilities";
import { icons } from "@/design-system/icons";
import { PortalButton } from "./buttons";
import { validationMessages } from "./validation";

export type SubmitState = "idle" | "submitting" | "success" | "error";

export interface FormErrorItem {
  /** id do campo (`FormField.id`) para foco. */
  field: string;
  message: string;
}

interface PortalFormContextValue {
  submitting: boolean;
  state: SubmitState;
}

const PortalFormContext = createContext<PortalFormContextValue>({ submitting: false, state: "idle" });
export const usePortalForm = () => useContext(PortalFormContext);

export interface PortalFormProps {
  onSubmit: () => void | Promise<void>;
  children: ReactNode;
  /** Ações do rodapé; se omitido, use `PortalFormActions` dentro de `children`. */
  actions?: ReactNode;
  errors?: FormErrorItem[];
  variant?: "compact" | "regular";
  columns?: 1 | 2;
  /** Título opcional acima do formulário. */
  title?: ReactNode;
  description?: ReactNode;
  className?: string;
  "aria-label"?: string;
}

/**
 * Formulário padronizado do portal: espaçamento, resumo de erros, foco no
 * primeiro erro, loading e prevenção de envio duplicado.
 *
 * @example
 * <PortalForm onSubmit={salvar} errors={erros} actions={<PortalFormActions submitLabel="Salvar" />}>
 *   ...campos
 * </PortalForm>
 */
export function PortalForm({
  onSubmit,
  children,
  actions,
  errors = [],
  variant = "regular",
  columns = 1,
  title,
  description,
  className,
  ...aria
}: PortalFormProps) {
  const [state, setState] = useState<SubmitState>("idle");
  const lock = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = useCallback(
    async (e: FormEvent) => {
      e.preventDefault();
      if (lock.current) return; // impede envio duplicado (duplo clique / Enter repetido)
      lock.current = true;
      setState("submitting");
      try {
        await onSubmit();
        setState("success");
      } catch {
        setState("error");
      } finally {
        lock.current = false;
      }
    },
    [onSubmit],
  );

  const ctx = useMemo(() => ({ submitting: state === "submitting", state }), [state]);

  return (
    <PortalFormContext.Provider value={ctx}>
      <form
        ref={formRef}
        noValidate
        onSubmit={handleSubmit}
        className={cn("w-full", variant === "compact" ? "space-y-4" : "space-y-6", className)}
        {...aria}
      >
        {(title || description) && (
          <header className="space-y-1">
            {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
            {description && <p className="text-sm text-muted-foreground">{description}</p>}
          </header>
        )}

        {errors.length > 0 && <FormErrorSummary errors={errors} />}

        <div className={cn(columns === 2 ? "grid gap-4 sm:grid-cols-2" : variant === "compact" ? "space-y-4" : "space-y-5")}>{children}</div>

        {actions && <div className="flex flex-col-reverse gap-3 border-t border-border pt-4 sm:flex-row sm:justify-end">{actions}</div>}
      </form>
    </PortalFormContext.Provider>
  );
}

export interface PortalFormActionsProps {
  submitLabel?: string;
  loadingText?: string;
  cancelLabel?: string;
  onCancel?: () => void;
  disabled?: boolean;
  danger?: boolean;
  extra?: ReactNode;
}

/** Rodapé de ações: primário à direita no desktop, largura total no mobile. */
export function PortalFormActions({
  submitLabel = "Salvar",
  loadingText = "Salvando...",
  cancelLabel = "Cancelar",
  onCancel,
  disabled,
  danger,
  extra,
}: PortalFormActionsProps) {
  const { submitting } = usePortalForm();
  return (
    <>
      {extra}
      {onCancel && (
        <PortalButton variant="ghost" onClick={onCancel} disabled={submitting} className="w-full sm:w-auto">
          {cancelLabel}
        </PortalButton>
      )}
      <PortalButton
        type="submit"
        variant={danger ? "danger" : "primary"}
        loading={submitting}
        loadingText={loadingText}
        disabled={disabled}
        className="w-full sm:w-auto"
      >
        {submitLabel}
      </PortalButton>
    </>
  );
}

/**
 * Resumo de erros para formulários longos. Não substitui os erros inline.
 * @example <FormErrorSummary errors={[{ field: "cpf", message: "Informe um CPF válido." }]} />
 */
export function FormErrorSummary({ errors }: { errors: FormErrorItem[] }) {
  const ref = useRef<HTMLDivElement>(null);
  const Alerta = icons.alerta;
  if (!errors.length) return null;
  return (
    <div
      ref={ref}
      tabIndex={-1}
      role="alert"
      aria-live="assertive"
      className="rounded-lg border border-destructive/40 bg-destructive/5 p-4"
    >
      <p className="flex items-center gap-2 text-sm font-semibold text-destructive">
        <Alerta className="size-4" aria-hidden />
        {errors.length === 1 ? "Revise 1 campo antes de continuar." : `Revise ${errors.length} campos antes de continuar.`}
      </p>
      <ul className="mt-2 space-y-1 pl-6">
        {errors.map((e) => (
          <li key={e.field}>
            <button
              type="button"
              className="text-left text-xs text-destructive underline underline-offset-2"
              onClick={() => document.getElementById(e.field)?.focus()}
            >
              {e.message}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Foca o primeiro campo com erro (chame após validar). */
export function focusFirstError(errors: FormErrorItem[]) {
  const first = errors[0];
  if (!first) return;
  const el = document.getElementById(first.field);
  el?.focus();
  el?.scrollIntoView({ block: "center", behavior: "smooth" });
}

export interface SaveStatusProps {
  state: SubmitState;
  dirty?: boolean;
  className?: string;
}

/**
 * Indicador de salvamento: salvando / salvo / falha / alterações não salvas.
 * Nunca exibe sucesso antes da resposta do backend.
 */
export function SaveStatus({ state, dirty, className }: SaveStatusProps) {
  const map = {
    submitting: { icon: icons.carregando, text: "Salvando...", tone: "text-muted-foreground", spin: true },
    success: { icon: icons.sucesso, text: "Alterações salvas.", tone: "text-[hsl(var(--success))]", spin: false },
    error: { icon: icons.erro, text: validationMessages.falhaEnvio, tone: "text-destructive", spin: false },
    idle: dirty
      ? { icon: icons.alerta, text: "Existem alterações não salvas.", tone: "text-muted-foreground", spin: false }
      : null,
  } as const;

  const current = map[state];
  if (!current) return null;
  const Icon = current.icon;
  return (
    <p className={cn("flex items-center gap-1.5 text-xs font-medium", current.tone, className)} role="status" aria-live="polite">
      <Icon className={cn("size-3.5", current.spin && "animate-spin")} aria-hidden />
      {current.text}
    </p>
  );
}
