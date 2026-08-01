import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Text } from "@/design-system/components/Text";
import { Button } from "@/design-system/components/Button";
import { Skeleton } from "@/design-system/components/Skeleton";
import { EmptyState } from "@/design-system/components/EmptyState";
import { Alert } from "@/design-system/components/Feedback";
import { icons, type LucideIcon } from "@/design-system/icons";
import type { SyncStatus } from "../types";

export interface DashboardSectionProps {
  title: string;
  description?: string;
  /** Peso visual: 1 (destaque), 2 (padrão), 3 (secundário). */
  level?: 1 | 2 | 3;
  action?: ReactNode;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  /** Rota para a página completa, oferecida quando a seção falha. */
  fullPageRoute?: string;
  skeleton?: ReactNode;
  children: ReactNode;
  className?: string;
  id?: string;
}

/** Bloco padrão da home, com título, ação, carregamento e erro isolado. */
export function DashboardSection({
  title,
  description,
  level = 2,
  action,
  loading,
  error,
  onRetry,
  fullPageRoute,
  skeleton,
  children,
  className,
  id,
}: DashboardSectionProps) {
  return (
    <section
      id={id}
      aria-busy={loading || undefined}
      aria-labelledby={`${title.replace(/\s+/g, "-").toLowerCase()}-titulo`}
      className={cn("space-y-3", className)}
    >
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="min-w-0">
          <Text
            id={`${title.replace(/\s+/g, "-").toLowerCase()}-titulo`}
            variant={level === 1 ? "h4" : level === 2 ? "h5" : "h6"}
            as="h2"
          >
            {title}
          </Text>
          {description && <Text variant="caption">{description}</Text>}
        </div>
        {action}
      </div>

      {loading ? (
        skeleton ?? <Skeleton className="h-28 w-full rounded-xl" />
      ) : error ? (
        <div aria-live="polite">
          <Alert tone="warning" title="Não foi possível carregar esta informação.">
            <div className="mt-2 flex flex-wrap gap-2">
              {onRetry && (
                <Button size="sm" variant="secondary" leftIcon={icons.atualizar} onClick={onRetry}>
                  Tentar novamente
                </Button>
              )}
              {fullPageRoute && (
                <Button size="sm" variant="ghost" asChild>
                  <Link to={fullPageRoute}>Acessar página completa</Link>
                </Button>
              )}
              <Button size="sm" variant="ghost" asChild>
                <a href="https://wa.me/5571985496972" target="_blank" rel="noopener noreferrer">
                  Falar com suporte
                </a>
              </Button>
            </div>
          </Alert>
        </div>
      ) : (
        children
      )}
    </section>
  );
}

export interface DashboardEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  actionLabel?: string;
  actionRoute?: string;
  onAction?: () => void;
  compact?: boolean;
}

/** Estado vazio padronizado da home. */
export function DashboardEmptyState({
  icon,
  title,
  description,
  actionLabel,
  actionRoute,
  onAction,
  compact = true,
}: DashboardEmptyStateProps) {
  const action = actionLabel ? (
    actionRoute ? (
      <Button size="sm" variant="secondary" asChild>
        <Link to={actionRoute}>{actionLabel}</Link>
      </Button>
    ) : (
      <Button size="sm" variant="secondary" onClick={onAction}>
        {actionLabel}
      </Button>
    )
  ) : undefined;

  return (
    <div className="rounded-xl border bg-card">
      <EmptyState icon={icon} title={title} description={description} action={action} compact={compact} />
    </div>
  );
}

const syncLabel: Record<SyncStatus, { text: string; className: string }> = {
  atualizado: { text: "Atualizado", className: "text-muted-foreground" },
  aguardando: { text: "Aguardando sincronização", className: "text-warning-foreground" },
  processando: { text: "Em processamento", className: "text-muted-foreground" },
  divergencia: { text: "Com divergência", className: "text-destructive" },
  indisponivel: { text: "Origem indisponível", className: "text-destructive" },
  demonstracao: { text: "Ambiente de demonstração — dados fictícios.", className: "text-warning-foreground" },
};

/** Carimbo de atualização/origem dos dados. */
export function DashboardLastUpdated({ date, status = "atualizado" }: { date?: string | null; status?: SyncStatus }) {
  const info = syncLabel[status];
  const formatted = date
    ? new Date(date).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" })
    : null;

  return (
    <p className={cn("flex items-center gap-1.5 text-xs", info.className)}>
      <icons.horario className="h-3.5 w-3.5" aria-hidden />
      {status === "demonstracao" || !formatted ? info.text : `Dados atualizados em ${formatted} · ${info.text}`}
    </p>
  );
}

/** Skeleton em grade, usado por indicadores, ações e serviços. */
export function DashboardGridSkeleton({ items = 4, height = "h-28" }: { items?: number; height?: string }) {
  return (
    <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: items }).map((_, i) => (
        <Skeleton key={i} className={cn("w-full rounded-xl", height)} />
      ))}
    </div>
  );
}

/** Skeleton de lista (pendências, solicitações, pessoas). */
export function DashboardListSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: items }).map((_, i) => (
        <Skeleton key={i} className="h-16 w-full rounded-xl" />
      ))}
    </div>
  );
}

/** Skeleton do hero. */
export function DashboardHeroSkeleton() {
  return <Skeleton className="h-36 w-full rounded-2xl md:h-40" />;
}
