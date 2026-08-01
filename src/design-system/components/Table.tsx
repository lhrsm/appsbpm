import type { ReactNode } from "react";
import { cn } from "../utilities";
import { icons } from "../icons";
import { Button, IconButton } from "./Button";
import { EmptyState } from "./EmptyState";
import { SkeletonTable } from "./Skeleton";
import { Chip } from "./Badge";

export interface Column<T> {
  /** Chave única da coluna. */
  id: string;
  header: ReactNode;
  /** Conteúdo da célula. */
  cell: (row: T) => ReactNode;
  /** Oculta a coluna no mobile. */
  hideOnMobile?: boolean;
  align?: "left" | "right" | "center";
}

export interface TableProps<T> {
  columns: Column<T>[];
  rows: T[];
  /** Chave única de cada linha. */
  rowKey: (row: T) => string;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  emptyAction?: ReactNode;
  onRowClick?: (row: T) => void;
  /** Legenda acessível da tabela. */
  caption?: string;
  className?: string;
}

/**
 * Tabela institucional com estados de carregamento e vazio embutidos.
 *
 * @example
 * <Table rowKey={(r) => r.id} columns={colunas} rows={dados} caption="Associados" />
 *
 * Uso não recomendado: layouts de página — use `Grid`.
 */
export function Table<T>({
  columns,
  rows,
  rowKey,
  loading,
  emptyTitle = "Nenhum registro encontrado",
  emptyDescription,
  emptyAction,
  onRowClick,
  caption,
  className,
}: TableProps<T>) {
  if (loading) return <SkeletonTable rows={5} columns={columns.length} />;
  if (!rows.length)
    return (
      <div className="rounded-xl border bg-card">
        <EmptyState icon={icons.vazio} title={emptyTitle} description={emptyDescription} action={emptyAction} />
      </div>
    );

  return (
    <div className={cn("w-full overflow-x-auto rounded-xl border bg-card", className)}>
      <table className="w-full caption-bottom text-sm">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-muted/50">
          <tr>
            {columns.map((col) => (
              <th
                key={col.id}
                scope="col"
                className={cn(
                  "px-4 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground",
                  col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left",
                  col.hideOnMobile && "hidden md:table-cell",
                )}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr
              key={rowKey(row)}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              tabIndex={onRowClick ? 0 : undefined}
              onKeyDown={
                onRowClick
                  ? (e) => {
                      if (e.key === "Enter") onRowClick(row);
                    }
                  : undefined
              }
              className={cn(
                "border-t transition-colors",
                onRowClick && "cursor-pointer hover:bg-muted/50 focus-visible:outline-none focus-visible:bg-muted",
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.id}
                  className={cn(
                    "px-4 py-3 align-middle",
                    col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left",
                    col.hideOnMobile && "hidden md:table-cell",
                  )}
                >
                  {col.cell(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  className?: string;
}

/**
 * Paginação compacta e acessível.
 * @example <Pagination page={1} totalPages={8} onPageChange={setPage} />
 */
export function Pagination({ page, totalPages, onPageChange, className }: PaginationProps) {
  if (totalPages <= 1) return null;
  return (
    <nav aria-label="Paginação" className={cn("flex items-center justify-between gap-3", className)}>
      <IconButton
        icon={icons.anterior}
        label="Página anterior"
        variant="secondary"
        disabled={page <= 1}
        onClick={() => onPageChange(page - 1)}
      />
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Página <span className="font-semibold text-foreground">{page}</span> de {totalPages}
      </p>
      <IconButton
        icon={icons.proximo}
        label="Próxima página"
        variant="secondary"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      />
    </nav>
  );
}

export interface FilterOption {
  id: string;
  label: string;
}

export interface FilterBarProps {
  options: FilterOption[];
  /** Ids selecionados. */
  selected: string[];
  onToggle: (id: string) => void;
  onClear?: () => void;
  /** Conteúdo extra à direita (ex.: campo de busca). */
  children?: ReactNode;
  className?: string;
}

/**
 * Barra de filtros por chips.
 * @example <FilterBar options={categorias} selected={ativos} onToggle={alternar} onClear={limpar} />
 */
export function FilterBar({ options, selected, onToggle, onClear, children, className }: FilterBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)} role="group" aria-label="Filtros">
      {options.map((opt) => (
        <Chip key={opt.id} selected={selected.includes(opt.id)} onSelect={() => onToggle(opt.id)}>
          {opt.label}
        </Chip>
      ))}
      {onClear && selected.length > 0 && (
        <Button variant="ghost" size="sm" leftIcon={icons.fechar} onClick={onClear}>
          Limpar
        </Button>
      )}
      {children}
    </div>
  );
}
