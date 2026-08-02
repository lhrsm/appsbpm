import { Fragment, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { icons } from "@/design-system/icons";
import { Checkbox } from "@/components/ui/checkbox";
import { TableSkeleton } from "@/portal/ui/skeletons";
import { SectionErrorState } from "@/portal/ui/errorStates";
import { PortalEmptyState, type PortalEmptyStateProps } from "@/portal/ui/PortalEmptyState";
import {
  hasPermission,
  visibleColumns,
  type DataColumn,
  type Density,
  type PermissionSet,
  type SortState,
} from "./types";
import { RowActions, type RecordAction } from "./RowActions";

const densityClass: Record<Density, string> = {
  compact: "px-3 py-2",
  regular: "px-4 py-3",
  comfortable: "px-4 py-4",
};

export interface PortalDataTableProps<T> {
  columns: DataColumn<T>[];
  data: T[];
  rowKey: (row: T) => string;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  empty?: PortalEmptyStateProps;
  sorting?: { value?: SortState; onToggle: (columnId: string) => void };
  selection?: {
    selected: string[];
    onChange: (selected: string[]) => void;
    /** Rótulo acessível ("Selecionar notificação X"). */
    label?: (row: T) => string;
  };
  rowActions?: RecordAction<T>[];
  permissions?: PermissionSet;
  hiddenColumns?: string[];
  density?: Density;
  stickyHeader?: boolean;
  caption: string;
  /** Exibe a caption visualmente (padrão: apenas para leitores de tela). */
  showCaption?: boolean;
  onRowClick?: (row: T) => void;
  /** Conteúdo expansível por registro. */
  expandable?: { render: (row: T) => ReactNode; label?: string };
  className?: string;
}

/**
 * Tabela semântica padrão do portal externo.
 * Renderiza loading, erro e estado vazio internamente — a página não precisa duplicar.
 *
 * @example
 * <PortalDataTable caption="Solicitações" columns={colunas} data={itens} rowKey={(r) => r.id} sorting={{ value: view.sort, onToggle: view.toggleSort }} />
 *
 * Uso não recomendado: no mobile — use `ResponsiveDataView`.
 */
export function PortalDataTable<T>({
  columns,
  data,
  rowKey,
  loading,
  error,
  onRetry,
  empty,
  sorting,
  selection,
  rowActions,
  permissions,
  hiddenColumns = [],
  density = "regular",
  stickyHeader,
  caption,
  showCaption,
  onRowClick,
  expandable,
  className,
}: PortalDataTableProps<T>) {
  const [expanded, setExpanded] = useState<string[]>([]);
  const cols = visibleColumns(columns, permissions, hiddenColumns);
  const allowedActions = (rowActions ?? []).filter((a) => hasPermission(permissions, a.permission));

  if (loading) return <TableSkeleton rows={5} columns={cols.length || 4} />;
  if (error)
    return <SectionErrorState title="Não foi possível carregar os registros." description={error} onRetry={onRetry} />;
  if (!data.length)
    return (
      <div className="rounded-[16px] border bg-card">
        <PortalEmptyState {...(empty ?? { title: "Nenhum registro encontrado" })} />
      </div>
    );

  const pageKeys = data.map(rowKey);
  const allSelected = selection ? pageKeys.every((k) => selection.selected.includes(k)) : false;
  const cell = densityClass[density];

  const toggleRow = (key: string) => {
    if (!selection) return;
    selection.onChange(
      selection.selected.includes(key)
        ? selection.selected.filter((k) => k !== key)
        : [...selection.selected, key],
    );
  };

  return (
    <div className={cn("w-full overflow-x-auto rounded-[16px] border bg-card", className)}>
      <table className="w-full caption-bottom text-sm" aria-busy={loading || undefined}>
        <caption className={showCaption ? "px-4 py-3 text-left text-sm text-muted-foreground" : "sr-only"}>
          {caption}
        </caption>
        <thead className={cn("bg-muted/50", stickyHeader && "sticky top-0 z-10")}>
          <tr>
            {selection && (
              <th scope="col" className={cn(cell, "w-10")}>
                <Checkbox
                  checked={allSelected}
                  aria-label="Selecionar todos os registros da página"
                  onCheckedChange={(checked) =>
                    selection.onChange(
                      checked
                        ? Array.from(new Set([...selection.selected, ...pageKeys]))
                        : selection.selected.filter((k) => !pageKeys.includes(k)),
                    )
                  }
                />
              </th>
            )}
            {expandable && <th scope="col" className={cn(cell, "w-10")}><span className="sr-only">Detalhes</span></th>}
            {cols.map((col) => {
              const active = sorting?.value?.columnId === col.id;
              const ariaSort = !col.sortable
                ? undefined
                : active
                  ? sorting?.value?.direction === "asc"
                    ? "ascending"
                    : "descending"
                  : "none";
              return (
                <th
                  key={col.id}
                  scope="col"
                  aria-sort={ariaSort}
                  style={{ width: col.width, minWidth: col.minWidth }}
                  className={cn(
                    cell,
                    "text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                    col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left",
                    col.mobilePriority === "hidden" && "hidden lg:table-cell",
                    col.mobilePriority === "secondary" && "hidden md:table-cell",
                  )}
                >
                  {col.sortable && sorting ? (
                    <button
                      type="button"
                      onClick={() => sorting.onToggle(col.id)}
                      className="inline-flex items-center gap-1 rounded transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    >
                      {col.header}
                      {active ? (
                        sorting.value?.direction === "asc" ? (
                          <icons.recolher className="h-3.5 w-3.5" aria-hidden />
                        ) : (
                          <icons.expandir className="h-3.5 w-3.5" aria-hidden />
                        )
                      ) : (
                        <icons.expandir className="h-3.5 w-3.5 opacity-30" aria-hidden />
                      )}
                    </button>
                  ) : (
                    col.header
                  )}
                </th>
              );
            })}
            {allowedActions.length > 0 && (
              <th scope="col" className={cn(cell, "text-right text-xs font-semibold uppercase tracking-wide text-muted-foreground")}>
                Ações
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row) => {
            const key = rowKey(row);
            const isExpanded = expanded.includes(key);
            return (
              <Fragment key={key}>
                <tr
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                  tabIndex={onRowClick ? 0 : undefined}
                  onKeyDown={
                    onRowClick
                      ? (e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            onRowClick(row);
                          }
                        }
                      : undefined
                  }
                  className={cn(
                    "border-t transition-colors",
                    onRowClick && "cursor-pointer hover:bg-muted/40 focus-visible:bg-muted focus-visible:outline-none",
                  )}
                >
                  {selection && (
                    <td className={cell} onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selection.selected.includes(key)}
                        aria-label={selection.label?.(row) ?? "Selecionar registro"}
                        onCheckedChange={() => toggleRow(key)}
                      />
                    </td>
                  )}
                  {expandable && (
                    <td className={cell} onClick={(e) => e.stopPropagation()}>
                      <button
                        type="button"
                        aria-expanded={isExpanded}
                        aria-label={isExpanded ? "Ocultar detalhes" : expandable.label ?? "Ver detalhes"}
                        onClick={() =>
                          setExpanded((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]))
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-[10px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      >
                        {isExpanded ? <icons.recolher className="h-4 w-4" aria-hidden /> : <icons.expandir className="h-4 w-4" aria-hidden />}
                      </button>
                    </td>
                  )}
                  {cols.map((col) => (
                    <td
                      key={col.id}
                      className={cn(
                        cell,
                        "align-middle",
                        col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left",
                        col.mobilePriority === "hidden" && "hidden lg:table-cell",
                        col.mobilePriority === "secondary" && "hidden md:table-cell",
                      )}
                    >
                      {col.cell ? col.cell(row) : String(col.accessor?.(row) ?? "—")}
                    </td>
                  ))}
                  {allowedActions.length > 0 && (
                    <td className={cn(cell, "text-right")} onClick={(e) => e.stopPropagation()}>
                      <RowActions row={row} actions={allowedActions} permissions={permissions} />
                    </td>
                  )}
                </tr>
                {expandable && isExpanded && (
                  <tr className="border-t bg-muted/20">
                    <td colSpan={cols.length + 1 + (selection ? 1 : 0) + (allowedActions.length ? 1 : 0)} className="px-4 py-4">
                      {expandable.render(row)}
                    </td>
                  </tr>
                )}
              </Fragment>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
