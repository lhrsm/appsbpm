import { useEffect, useState, type ReactNode } from "react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Text } from "@/design-system/components/Text";
import { Button } from "@/design-system/components/Button";
import { icons, type LucideIcon } from "@/design-system/icons";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export type AlertTone = "info" | "success" | "warning" | "danger" | "neutral";

const toneStyles: Record<AlertTone, { wrapper: string; icon: string; fallback: LucideIcon }> = {
  info: {
    wrapper: "border-[hsl(var(--info)/0.35)] bg-[hsl(var(--info)/0.08)]",
    icon: "text-[hsl(var(--info))]",
    fallback: icons.info,
  },
  success: {
    wrapper: "border-[hsl(var(--success)/0.35)] bg-[hsl(var(--success)/0.08)]",
    icon: "text-[hsl(var(--success))]",
    fallback: icons.sucesso,
  },
  warning: { wrapper: "border-warning/40 bg-warning/10", icon: "text-warning", fallback: icons.alerta },
  danger: {
    wrapper: "border-destructive/35 bg-destructive/[0.07]",
    icon: "text-destructive",
    fallback: icons.erro,
  },
  neutral: { wrapper: "border-border bg-muted/50", icon: "text-muted-foreground", fallback: icons.info },
};

export interface PortalAlertProps {
  tone?: AlertTone;
  title?: ReactNode;
  children?: ReactNode;
  icon?: LucideIcon;
  action?: ReactNode;
  /** Permite fechar o aviso. */
  dismissible?: boolean;
  onDismiss?: () => void;
  className?: string;
}

/**
 * Alerta contextual do portal. Sempre com ícone + texto — nunca só cor.
 *
 * @example <PortalAlert tone="warning" title="Atualize seus dados">Seu telefone está desatualizado.</PortalAlert>
 */
export function PortalAlert({
  tone = "info",
  title,
  children,
  icon,
  action,
  dismissible,
  onDismiss,
  className,
}: PortalAlertProps) {
  const [open, setOpen] = useState(true);
  const style = toneStyles[tone];
  const Icon = icon ?? style.fallback;
  const Close = icons.fechar;

  if (!open) return null;

  return (
    <div
      role={tone === "danger" ? "alert" : "status"}
      aria-live={tone === "danger" ? "assertive" : "polite"}
      className={cn("flex gap-3 rounded-[14px] border p-4", style.wrapper, className)}
    >
      <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", style.icon)} aria-hidden />
      <div className="min-w-0 flex-1 space-y-1">
        {title && (
          <Text variant="small" as="p" className="font-semibold">
            {title}
          </Text>
        )}
        {children && (
          <Text variant="caption" as="div">
            {children}
          </Text>
        )}
        {action && <div className="flex flex-wrap gap-2 pt-2">{action}</div>}
      </div>
      {dismissible && (
        <button
          type="button"
          aria-label="Fechar aviso"
          onClick={() => {
            setOpen(false);
            onDismiss?.();
          }}
          className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-background/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Close className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  );
}

/** Aviso global fixo (manutenção, instabilidade, comunicado institucional). */
export function PortalGlobalNotice({
  message,
  tone = "warning",
  action,
  className,
}: {
  message: ReactNode;
  tone?: AlertTone;
  action?: ReactNode;
  className?: string;
}) {
  const style = toneStyles[tone];
  const Icon = style.fallback;
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex items-center justify-center gap-2 border-b px-4 py-2 text-sm", style.wrapper, className)}
    >
      <Icon className={cn("h-4 w-4 shrink-0", style.icon)} aria-hidden />
      <span className="min-w-0">{message}</span>
      {action}
    </div>
  );
}

/** Mensagem inline de campo/seção (validação, orientação). */
export function InlineFeedback({
  tone = "danger",
  children,
  id,
  className,
}: {
  tone?: AlertTone;
  children: ReactNode;
  id?: string;
  className?: string;
}) {
  const style = toneStyles[tone];
  const Icon = style.fallback;
  return (
    <p
      id={id}
      role={tone === "danger" ? "alert" : undefined}
      className={cn("flex items-start gap-1.5 text-xs", style.icon, className)}
    >
      <Icon className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
      <span className="text-foreground/80">{children}</span>
    </p>
  );
}

/** Toasts padronizados do portal (linguagem institucional, sem termos técnicos). */
export const portalToast = {
  success: (message: string, description?: string) => toast.success(message, { description }),
  error: (message = "Não foi possível concluir a ação.", description = "Tente novamente em instantes.") =>
    toast.error(message, { description }),
  info: (message: string, description?: string) => toast(message, { description }),
  warning: (message: string, description?: string) => toast.warning(message, { description }),
  /** Confirmação de envio com protocolo. */
  protocol: (protocolo: string) =>
    toast.success("Solicitação enviada", { description: `Protocolo ${protocolo}. Acompanhe em Solicitações.` }),
};

export interface ConfirmationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Ação destrutiva: usa tom vermelho. */
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void | Promise<void>;
}

/**
 * Diálogo de confirmação institucional para ações relevantes ou irreversíveis.
 * @example <ConfirmationDialog open={open} onOpenChange={setOpen} title="Excluir dependente?" destructive onConfirm={excluir} />
 */
export function ConfirmationDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  destructive,
  loading,
  onConfirm,
}: ConfirmationDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>{cancelLabel}</AlertDialogCancel>
          <AlertDialogAction
            disabled={loading}
            onClick={(event) => {
              event.preventDefault();
              void onConfirm();
            }}
            className={destructive ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : undefined}
          >
            {confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export interface ProcessingStateProps {
  label?: string;
  /** Progresso 0–100 quando conhecido. */
  value?: number;
  className?: string;
}

/** Estado de processamento com feedback textual acessível. */
export function ProcessingState({ label = "Processando...", value, className }: ProcessingStateProps) {
  const Spinner = icons.atualizar;
  const [announce, setAnnounce] = useState(label);
  useEffect(() => setAnnounce(label), [label]);

  return (
    <div role="status" aria-live="polite" className={cn("flex items-center gap-2 text-sm text-muted-foreground", className)}>
      <Spinner className="h-4 w-4 animate-spin motion-reduce:animate-none" aria-hidden />
      <span>{announce}</span>
      {typeof value === "number" && <span className="font-semibold text-foreground">{Math.round(value)}%</span>}
    </div>
  );
}

/** Botão de ação com feedback de carregamento padronizado. */
export function AsyncActionButton({
  loading,
  children,
  ...props
}: React.ComponentProps<typeof Button> & { loading?: boolean }) {
  return (
    <Button {...props} loading={loading}>
      {children}
    </Button>
  );
}
