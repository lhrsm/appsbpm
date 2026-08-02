import { cn } from "@/lib/utils";
import { icons } from "@/design-system/icons";
import { SelectField } from "@/portal/forms/selects";

export interface PortalPaginationProps {
  page: number;
  pageSize: number;
  /** Total de registros conhecido (backend ou lista local). */
  total: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  className?: string;
}

const sizeOptionsDefault = [10, 20, 50];

/**
 * Paginação institucional. No mobile mostra apenas anterior/próxima e a página atual.
 *
 * @example <PortalPagination page={view.page} pageSize={view.pageSize} total={total} onPageChange={view.setPage} />
 */
export function PortalPagination({
  page,
  pageSize,
  total,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = sizeOptionsDefault,
  className,
}: PortalPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (total === 0) return null;

  const first = (page - 1) * pageSize + 1;
  const last = Math.min(page * pageSize, total);

  const go = (next: number) => onPageChange(Math.min(Math.max(next, 1), totalPages));

  return (
    <nav
      aria-label="Paginação dos resultados"
      className={cn("flex flex-wrap items-center justify-between gap-3 pt-1", className)}
    >
      <p className="text-xs text-muted-foreground" aria-live="polite">
        Exibindo <span className="font-semibold text-foreground">{first}</span>–
        <span className="font-semibold text-foreground">{last}</span> de{" "}
        <span className="font-semibold text-foreground">{total}</span>
      </p>

      <div className="flex items-center gap-2">
        {onPageSizeChange && (
          <label className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
            <span>Por página</span>
            <SelectField
              aria-label="Registros por página"
              className="h-9 w-20"
              value={String(pageSize)}
              options={pageSizeOptions.map((n) => ({ value: String(n), label: String(n) }))}
              placeholder={String(pageSize)}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
            />
          </label>
        )}

        <button
          type="button"
          aria-label="Página anterior"
          disabled={page <= 1}
          onClick={() => go(page - 1)}
          className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-input text-foreground transition-colors hover:bg-muted disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <icons.anterior className="h-4 w-4" aria-hidden />
        </button>
        <p className="min-w-[6rem] text-center text-sm" aria-live="polite">
          Página <span className="font-semibold">{page}</span> de {totalPages}
        </p>
        <button
          type="button"
          aria-label="Próxima página"
          disabled={page >= totalPages}
          onClick={() => go(page + 1)}
          className="flex h-11 w-11 items-center justify-center rounded-[12px] border border-input text-foreground transition-colors hover:bg-muted disabled:opacity-40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <icons.proximo className="h-4 w-4" aria-hidden />
        </button>
      </div>
    </nav>
  );
}

/** Contador textual de resultados ("24 resultados encontrados"). */
export function ResultsCounter({ total, filtered, className }: { total: number; filtered?: boolean; className?: string }) {
  const text =
    total === 0 ? "Nenhum resultado" : total === 1 ? "1 resultado" : `${total} resultados`;
  return (
    <p className={cn("text-xs text-muted-foreground", className)} role="status" aria-live="polite">
      {filtered && total > 0 ? `${text} ${total === 1 ? "encontrado" : "encontrados"}` : text}
    </p>
  );
}
