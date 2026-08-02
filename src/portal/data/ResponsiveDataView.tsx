import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useBreakpoint } from "@/design-system/hooks/useBreakpoint";
import { PortalEmptyState, type PortalEmptyStateProps } from "@/portal/ui/PortalEmptyState";
import { SectionErrorState } from "@/portal/ui/errorStates";
import { MobileRecordCard, MobileRecordCardSkeleton, type MobileRecordCardProps } from "./MobileRecordCard";
import { PortalDataTable, type PortalDataTableProps } from "./PortalDataTable";
import { RowActions, type RecordAction } from "./RowActions";
import { hasPermission } from "./types";

export interface ResponsiveDataViewProps<T> extends PortalDataTableProps<T> {
  /** Mapeia um registro para o card exibido no mobile. */
  toCard: (row: T) => Omit<MobileRecordCardProps, "action" | "menu">;
  /** Força um modo específico (padrão: tabela ≥ md, cards abaixo). */
  mode?: "auto" | "table" | "cards";
}

/**
 * Alterna automaticamente entre tabela (desktop) e cards (mobile),
 * preservando ações, permissões e os estados de carregamento/erro/vazio.
 *
 * @example
 * <ResponsiveDataView caption="Solicitações" columns={colunas} data={itens} rowKey={(r) => r.id} toCard={(r) => ({ title: r.assunto, status: r.status })} />
 */
export function ResponsiveDataView<T>(props: ResponsiveDataViewProps<T>) {
  const { toCard, mode = "auto", ...tableProps } = props;
  const { isMobile } = useBreakpoint();
  const showTable = mode === "table" || (mode === "auto" && !isMobile);

  if (showTable) return <PortalDataTable {...tableProps} />;

  const {
    data,
    rowKey,
    loading,
    error,
    onRetry,
    empty,
    rowActions,
    permissions,
    onRowClick,
    caption,
    className,
  } = tableProps;

  if (loading) return <MobileRecordCardSkeleton items={4} />;
  if (error)
    return <SectionErrorState title="Não foi possível carregar os registros." description={error} onRetry={onRetry} />;
  if (!data.length)
    return (
      <div className="rounded-[16px] border bg-card">
        <PortalEmptyState {...(empty ?? { title: "Nenhum registro encontrado" })} />
      </div>
    );

  const allowed = (rowActions ?? []).filter((a) => hasPermission(permissions, a.permission));

  return (
    <section aria-label={caption} className={cn("space-y-3", className)}>
      {data.map((row) => {
        const card = toCard(row);
        return (
          <MobileRecordCard
            key={rowKey(row)}
            {...card}
            onClick={onRowClick ? () => onRowClick(row) : card.onClick}
            action={
              allowed.length ? (
                <RowActions row={row} actions={allowed} permissions={permissions} recordLabel={String(card.title)} />
              ) : undefined
            }
          />
        );
      })}
    </section>
  );
}

export interface DataViewSectionProps {
  title?: string;
  description?: ReactNode;
  toolbar?: ReactNode;
  pagination?: ReactNode;
  children: ReactNode;
  className?: string;
}

/** Casca padrão de uma listagem: cabeçalho, barra de ferramentas, conteúdo e paginação. */
export function DataViewSection({ title, description, toolbar, pagination, children, className }: DataViewSectionProps) {
  return (
    <section className={cn("space-y-4", className)}>
      {(title || description) && (
        <header className="space-y-1">
          {title && <h2 className="text-lg font-semibold text-foreground">{title}</h2>}
          {description && <p className="text-sm text-muted-foreground">{description}</p>}
        </header>
      )}
      {toolbar}
      {children}
      {pagination}
    </section>
  );
}

export type { RecordAction };
