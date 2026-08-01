import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Text } from "@/design-system/components/Text";
import { Badge } from "@/design-system/components/Badge";
import { icons, type LucideIcon } from "@/design-system/icons";
import { getStatus, type StatusKey } from "./status";
import { PortalEmptyState } from "./PortalEmptyState";
import { TimelineSkeleton } from "./skeletons";
import { SectionErrorState } from "./errorStates";

export interface TimelineItem {
  id: string;
  /** Data ISO ou já formatada. */
  date: string;
  title: string;
  description?: ReactNode;
  status?: StatusKey | string;
  icon?: LucideIcon;
  /** Marca o passo atual do processo. */
  current?: boolean;
  /** Passo ainda não alcançado. */
  upcoming?: boolean;
  action?: ReactNode;
}

export interface PortalTimelineProps {
  items: TimelineItem[];
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  /** Quantidade exibida antes de "ver mais". */
  visibleCount?: number;
  onShowMore?: () => void;
  emptyTitle?: string;
  emptyDescription?: string;
  className?: string;
}

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Histórico vertical de eventos (solicitações, atualizações cadastrais, acessos).
 *
 * @example
 * <PortalTimeline items={[{ id: "1", date: iso, title: "Solicitação enviada", status: "concluido" }]} />
 *
 * Uso não recomendado: listas simples sem cronologia — use `SummaryList`.
 */
export function PortalTimeline({
  items,
  loading,
  error,
  onRetry,
  visibleCount,
  onShowMore,
  emptyTitle = "Sem movimentações",
  emptyDescription = "Ainda não há movimentações registradas.",
  className,
}: PortalTimelineProps) {
  if (loading) return <TimelineSkeleton />;
  if (error) return <SectionErrorState description={error} onRetry={onRetry} compact />;
  if (!items.length) {
    return <PortalEmptyState icon={icons.horario} title={emptyTitle} description={emptyDescription} size="compact" />;
  }

  const visible = visibleCount ? items.slice(0, visibleCount) : items;

  return (
    <div className={className}>
      <ol className="relative space-y-5 border-l border-border pl-6">
        {visible.map((item) => {
          const info = item.status ? getStatus(item.status) : null;
          const Icon = item.icon ?? info?.icon ?? icons.horario;
          return (
            <li key={item.id} className="relative" aria-current={item.current ? "step" : undefined}>
              <span
                className={cn(
                  "absolute -left-[31px] flex h-[22px] w-[22px] items-center justify-center rounded-full border bg-card",
                  item.current ? "border-primary text-primary" : "border-border text-muted-foreground",
                  item.upcoming && "opacity-60",
                )}
                aria-hidden
              >
                <Icon className="h-3 w-3" />
              </span>
              <div className={cn("min-w-0 space-y-1", item.upcoming && "opacity-70")}>
                <Text variant="caption" as="p">
                  {formatDate(item.date)}
                </Text>
                <div className="flex flex-wrap items-center gap-2">
                  <Text variant="small" as="p" className="font-semibold">
                    {item.title}
                  </Text>
                  {info && (
                    <Badge tone={info.tone} icon={info.icon}>
                      {info.label}
                    </Badge>
                  )}
                </div>
                {item.description && (
                  <Text variant="caption" as="p">
                    {item.description}
                  </Text>
                )}
                {item.action && <div className="pt-1">{item.action}</div>}
              </div>
            </li>
          );
        })}
      </ol>
      {visibleCount && items.length > visibleCount && onShowMore && (
        <div className="pt-3">
          <button
            type="button"
            onClick={onShowMore}
            className="text-sm font-medium text-primary underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            Ver mais ({items.length - visibleCount})
          </button>
        </div>
      )}
    </div>
  );
}
