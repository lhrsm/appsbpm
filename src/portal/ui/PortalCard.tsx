import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Text } from "@/design-system/components/Text";
import { Badge } from "@/design-system/components/Badge";
import { Skeleton } from "@/design-system/components/Skeleton";
import { icons, type LucideIcon } from "@/design-system/icons";
import { getStatus, type StatusKey } from "./status";
import { PortalEmptyState } from "./PortalEmptyState";
import { SectionErrorState } from "./errorStates";

export const portalCardVariants = cva(
  "relative rounded-[18px] border transition-shadow duration-200 motion-reduce:transition-none",
  {
    variants: {
      variant: {
        default: "bg-white/94 dark:bg-slate-800/92 border-slate-400/28 dark:border-slate-400/18 text-gray-800 dark:text-slate-50 shadow-sm dark:shadow-lg",

        highlighted: "border-primary/40 ds-shadow-md",
        informational: "border-[hsl(var(--info)/0.35)] bg-[hsl(var(--info)/0.06)]",
        success: "border-[hsl(var(--success)/0.35)] bg-[hsl(var(--success)/0.06)]",
        warning: "border-warning/40 bg-warning/10",
        danger: "border-destructive/35 bg-destructive/[0.06]",
        neutral: "border-border bg-muted/40",
        transparent: "border-transparent bg-transparent",
      },
      density: {
        compact: "p-4",
        regular: "p-5",
        spacious: "p-6",
      },
      interactive: {
        true: "cursor-pointer hover:ds-shadow-md hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        false: "",
      },
      selected: {
        true: "border-primary ring-1 ring-primary/40",
        false: "",
      },
      disabled: {
        true: "pointer-events-none opacity-60",
        false: "",
      },
    },
    defaultVariants: { variant: "default", density: "regular", interactive: false, selected: false, disabled: false },
  },
);

export interface PortalCardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof portalCardVariants> {
  title?: ReactNode;
  subtitle?: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  /** Selo livre no cabeçalho. */
  badge?: ReactNode;
  /** Status canônico (mapa central). Renderiza badge com ícone + texto. */
  status?: StatusKey | string;
  /** Ação principal (botão/link) exibida no rodapé. */
  action?: ReactNode;
  /** Ação secundária exibida ao lado da principal. */
  secondaryAction?: ReactNode;
  footer?: ReactNode;
  loading?: boolean;
  /** Mensagem de erro da seção; substitui o conteúdo. */
  error?: string | null;
  onRetry?: () => void;
  fullPageRoute?: string;
  /** Estado vazio; substitui o conteúdo. */
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  /** Nome acessível quando o card não tem título textual. */
  ariaLabel?: string;
  /** Skeleton customizado exibido durante o carregamento. */
  skeleton?: ReactNode;
  children?: ReactNode;
}

/**
 * Card base do portal externo (Fase 4).
 *
 * Todos os cards do Portal do Associado e do Dependente devem derivar deste
 * componente — nenhuma página deve recriar `div.rounded-xl.border.bg-card`.
 *
 * @example
 * <PortalCard title="Solicitações" icon={icons.solicitacao} status="em_andamento">
 *   ...
 * </PortalCard>
 *
 * Uso não recomendado: transformar o card inteiro em botão quando há botões
 * internos — nesse caso use `action`/`secondaryAction` e mantenha `interactive={false}`.
 */
export const PortalCard = forwardRef<HTMLDivElement, PortalCardProps>(function PortalCard(
  {
    title,
    subtitle,
    description,
    icon: Icon,
    badge,
    status,
    action,
    secondaryAction,
    footer,
    loading,
    error,
    onRetry,
    fullPageRoute,
    empty,
    emptyTitle = "Nada por aqui",
    emptyDescription,
    emptyAction,
    ariaLabel,
    skeleton,
    variant,
    density,
    interactive,
    selected,
    disabled,
    className,
    children,
    ...props
  },
  ref,
) {
  const statusInfo = status ? getStatus(status) : null;
  const StatusIcon = statusInfo?.icon;
  const hasHeader = Boolean(title || subtitle || Icon || badge || statusInfo);
  const hasFooterActions = Boolean(action || secondaryAction || footer);

  return (
    <div
      ref={ref}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      aria-disabled={disabled || undefined}
      className={cn(portalCardVariants({ variant, density, interactive, selected, disabled }), className)}
      {...props}
    >
      {hasHeader && (
        <header className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-start gap-3">
            {Icon && (
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10"
                aria-hidden
              >
                <Icon className="h-5 w-5 text-primary" />
              </span>
            )}
            <div className="min-w-0">
              {title && (
                <Text variant="h6" as="h3" className="truncate">
                  {title}
                </Text>
              )}
              {subtitle && <Text variant="caption">{subtitle}</Text>}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {badge}
            {statusInfo && (
              <Badge tone={statusInfo.tone} icon={StatusIcon}>
                {statusInfo.label}
              </Badge>
            )}
          </div>
        </header>
      )}

      {description && (
        <Text variant="small" className={cn("text-muted-foreground", hasHeader && "mt-2")}>
          {description}
        </Text>
      )}

      <div className={cn(hasHeader || description ? "mt-4" : "")}>
        {loading ? (
          skeleton ?? (
            <div className="space-y-2" aria-hidden>
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          )
        ) : error ? (
          <SectionErrorState description={error} onRetry={onRetry} fullPageRoute={fullPageRoute} compact />
        ) : empty ? (
          <PortalEmptyState
            icon={icons.vazio}
            title={emptyTitle}
            description={emptyDescription}
            action={emptyAction}
            size="compact"
          />
        ) : (
          children
        )}
      </div>

      {hasFooterActions && !loading && !error && (
        <footer className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">
          {action}
          {secondaryAction}
          {footer}
        </footer>
      )}
    </div>
  );
});
