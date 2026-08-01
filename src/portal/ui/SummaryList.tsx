import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Text } from "@/design-system/components/Text";
import { Badge } from "@/design-system/components/Badge";
import { icons, type LucideIcon } from "@/design-system/icons";
import { getStatus, type StatusKey } from "./status";
import { PortalEmptyState } from "./PortalEmptyState";
import { ListSkeleton } from "./skeletons";
import { SectionErrorState } from "./errorStates";

export interface SummaryListItem {
  id: string;
  title: string;
  description?: ReactNode;
  /** Texto auxiliar à direita (data, protocolo, tipo). */
  meta?: ReactNode;
  status?: StatusKey | string;
  icon?: LucideIcon;
  /** Destino da navegação; o item inteiro vira link. */
  to?: string;
  onClick?: () => void;
  /** Ação inline (baixar, reenviar). */
  action?: ReactNode;
}

export interface SummaryListProps {
  items: SummaryListItem[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  /** Máximo exibido; o restante fica sob "ver todos". */
  maxItems?: number;
  /** Rota da listagem completa. */
  viewAllRoute?: string;
  viewAllLabel?: string;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyIcon?: LucideIcon;
  emptyAction?: ReactNode;
  className?: string;
}

/**
 * Lista resumida reutilizável (documentos, solicitações, eventos, notificações).
 *
 * @example
 * <SummaryList items={docs} maxItems={5} viewAllRoute="/meus-documentos" />
 *
 * Uso não recomendado: dados cronológicos com etapas — use `PortalTimeline`.
 */
export function SummaryList({
  items,
  loading,
  error,
  onRetry,
  maxItems,
  viewAllRoute,
  viewAllLabel = "Ver todos",
  emptyTitle = "Nenhum registro",
  emptyDescription,
  emptyIcon,
  emptyAction,
  className,
}: SummaryListProps) {
  if (loading) return <ListSkeleton items={maxItems ?? 3} />;
  if (error) return <SectionErrorState description={error} onRetry={onRetry} fullPageRoute={viewAllRoute} compact />;
  if (!items.length) {
    return (
      <PortalEmptyState
        icon={emptyIcon}
        title={emptyTitle}
        description={emptyDescription}
        action={emptyAction}
        size="compact"
      />
    );
  }

  const visible = maxItems ? items.slice(0, maxItems) : items;

  return (
    <div className={cn("space-y-2", className)}>
      <ul className="space-y-2">
        {visible.map((item) => {
          const info = item.status ? getStatus(item.status) : null;
          const Icon = item.icon ?? info?.icon ?? icons.documento;

          const row = (
            <span className="flex min-h-[44px] w-full items-center gap-3 text-left">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground"
                aria-hidden
              >
                <Icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <Text variant="small" as="span" className="block truncate font-medium">
                  {item.title}
                </Text>
                {item.description && (
                  <Text variant="caption" as="span" className="block truncate">
                    {item.description}
                  </Text>
                )}
              </span>
              {item.meta && (
                <Text variant="caption" as="span" className="hidden shrink-0 sm:block">
                  {item.meta}
                </Text>
              )}
              {info && (
                <Badge tone={info.tone} icon={info.icon} className="shrink-0">
                  {info.label}
                </Badge>
              )}
            </span>
          );

          const shell =
            "flex items-center gap-2 rounded-[14px] border border-border bg-card px-3 py-2 transition-colors hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 motion-reduce:transition-none";

          return (
            <li key={item.id}>
              {item.to ? (
                <Link to={item.to} className={shell}>
                  {row}
                  <icons.proximo className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                </Link>
              ) : item.onClick ? (
                <button type="button" onClick={item.onClick} className={cn(shell, "w-full")}>
                  {row}
                </button>
              ) : (
                <div className={cn(shell, "hover:bg-transparent")}>
                  {row}
                  {item.action}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {viewAllRoute && maxItems && items.length > maxItems && (
        <Link
          to={viewAllRoute}
          className="inline-flex items-center gap-1 text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          {viewAllLabel} ({items.length})
          <icons.proximo className="h-4 w-4" aria-hidden />
        </Link>
      )}
    </div>
  );
}
