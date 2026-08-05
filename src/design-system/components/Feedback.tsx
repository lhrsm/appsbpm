import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { toast as sonnerToast } from "sonner";
import { cn } from "../utilities";
import { icons, type LucideIcon } from "../icons";

const alertVariants = cva("flex gap-3 rounded-xl border p-4 text-sm shadow-sm", {
  variants: {
    tone: {
      info: "border-[var(--notice-info-border)] bg-[var(--notice-info-bg)] text-[#1e3a8a] border-l-4",
      success: "border-[var(--notice-success-border)] bg-[var(--notice-success-bg)] text-[#14532d] border-l-4",
      warning: "border-[var(--notice-warning-border)] bg-[var(--notice-warning-bg)] text-[#78350f] border-l-4",
      danger: "border-[var(--notice-error-border)] bg-[var(--notice-error-bg)] text-[#7f1d1d] border-l-4",
      neutral: "border-[rgba(100,116,139,0.22)] bg-[rgba(248,250,252,0.90)] text-[#475569]",
    },
  },
  defaultVariants: { tone: "info" },
});

const alertIcon: Record<string, LucideIcon> = {
  info: icons.info,
  success: icons.sucesso,
  warning: icons.alerta,
  danger: icons.erro,
  neutral: icons.info,
};

export interface AlertProps extends VariantProps<typeof alertVariants> {
  title?: ReactNode;
  children?: ReactNode;
  icon?: LucideIcon;
  action?: ReactNode;
  className?: string;
}

/**
 * Aviso contextual dentro da página.
 * @example <Alert tone="warning" title="Verifique o spam">O código pode demorar 1 minuto.</Alert>
 *
 * Uso não recomendado: feedback de ação pontual — use `toast`.
 */
export function Alert({ tone = "info", title, children, icon, action, className }: AlertProps) {
  const Icon = icon ?? alertIcon[tone ?? "info"];
  return (
    <div role={tone === "danger" ? "alert" : "status"} className={cn(alertVariants({ tone }), className)}>
      <Icon
        className={cn(
          "h-5 w-5 shrink-0",
          tone === "danger" && "text-destructive",
          tone === "success" && "text-[hsl(var(--success))]",
          tone === "info" && "text-[hsl(var(--info))]",
          tone === "warning" && "text-warning",
        )}
        aria-hidden
      />
      <div className="min-w-0 flex-1 space-y-1">
        {title && <p className="font-semibold leading-snug">{title}</p>}
        {children && <div className="text-muted-foreground">{children}</div>}
        {action && <div className="pt-1">{action}</div>}
      </div>
    </div>
  );
}

/**
 * Notificações efêmeras padronizadas (wrapper sobre Sonner).
 * @example toast.success("Dados salvos");
 */
export const toast = {
  success: (message: string, description?: string) => sonnerToast.success(message, { description }),
  error: (message: string, description?: string) => sonnerToast.error(message, { description }),
  warning: (message: string, description?: string) => sonnerToast.warning(message, { description }),
  info: (message: string, description?: string) => sonnerToast.info(message, { description }),
  loading: (message: string) => sonnerToast.loading(message),
  dismiss: (id?: string | number) => sonnerToast.dismiss(id),
};

export interface LoadingProps {
  label?: string;
  /** Ocupa toda a altura disponível e centraliza. */
  fullscreen?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

/**
 * Indicador de carregamento acessível.
 * @example <Loading label="Carregando informes" />
 */
export function Loading({ label = "Carregando...", fullscreen, size = "md", className }: LoadingProps) {
  const Spinner = icons.carregando;
  const dim = size === "sm" ? "h-4 w-4" : size === "lg" ? "h-8 w-8" : "h-6 w-6";
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex items-center justify-center gap-2 text-muted-foreground",
        fullscreen ? "min-h-[50vh]" : "py-6",
        className,
      )}
    >
      <Spinner className={cn(dim, "animate-spin text-primary")} aria-hidden />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export interface ProgressProps {
  /** Percentual 0–100. */
  value: number;
  label?: string;
  /** Exibe o percentual ao lado do rótulo. */
  showValue?: boolean;
  tone?: "primary" | "success" | "warning" | "danger";
  className?: string;
}

/**
 * Barra de progresso (também usada para limites em %).
 * @example <Progress value={72} label="Limite disponível" showValue />
 */
export function Progress({ value, label, showValue, tone = "primary", className }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, Math.round(value)));
  const bar =
    tone === "success"
      ? "bg-[hsl(var(--success))]"
      : tone === "warning"
        ? "bg-warning"
        : tone === "danger"
          ? "bg-destructive"
          : "bg-primary";
  return (
    <div className={cn("space-y-1.5", className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between text-xs">
          {label && <span className="text-muted-foreground">{label}</span>}
          {showValue && <span className="font-semibold">{pct}%</span>}
        </div>
      )}
      <div
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label ?? "Progresso"}
        className="h-2 w-full overflow-hidden rounded-full bg-muted"
      >
        <div className={cn("h-full rounded-full transition-all duration-300", bar)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
