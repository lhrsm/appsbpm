import { cn } from "@/lib/utils";
import { SelectField } from "@/portal/forms/selects";
import type { SortState } from "./types";

export interface SortOption {
  /** `columnId:asc` ou `columnId:desc`. */
  value: string;
  label: string;
}

export interface DataSortProps {
  options: SortOption[];
  value?: SortState;
  onChange: (sort?: SortState) => void;
  className?: string;
}

export function serializeSort(sort?: SortState) {
  return sort ? `${sort.columnId}:${sort.direction}` : "";
}

export function parseSort(value: string): SortState | undefined {
  if (!value) return undefined;
  const [columnId, direction] = value.split(":");
  return columnId ? { columnId, direction: direction === "desc" ? "desc" : "asc" } : undefined;
}

/**
 * Seletor de ordenação (usado no mobile e como alternativa ao clique no cabeçalho).
 *
 * @example <DataSort options={[{ value: "data:desc", label: "Mais recentes" }]} value={view.sort} onChange={view.setSort} />
 */
export function DataSort({ options, value, onChange, className }: DataSortProps) {
  return (
    <label className={cn("block space-y-1 text-sm", className)}>
      <span className="sr-only">Ordenar por</span>
      <SelectField
        aria-label="Ordenar resultados"
        value={serializeSort(value)}
        placeholder="Ordenar por"
        options={options}
        onChange={(e) => onChange(parseSort(e.target.value))}
      />
    </label>
  );
}
