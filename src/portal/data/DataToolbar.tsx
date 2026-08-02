import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { icons } from "@/design-system/icons";
import { PortalButton } from "@/portal/forms/buttons";
import { DataSearch } from "./DataSearch";
import { DataSort, type SortOption } from "./DataSort";
import { ActiveFilterChips, DataFilters, MobileFiltersDrawer, type DataFilterDefinition } from "./DataFilters";
import { ResultsCounter } from "./PortalPagination";
import type { SortState } from "./types";
import type { FilterValues } from "./useDataView";

export interface DataToolbarProps {
  search?: {
    value: string;
    onChange: (value: string) => void;
    placeholder: string;
    loading?: boolean;
  };
  filters?: DataFilterDefinition[];
  filterValues?: FilterValues;
  onFilterChange?: (id: string, value?: string) => void;
  onClearFilters?: () => void;
  sortOptions?: SortOption[];
  sort?: SortState;
  onSortChange?: (sort?: SortState) => void;
  /** Total de resultados exibido no contador. */
  total?: number;
  onRefresh?: () => void;
  refreshing?: boolean;
  lastUpdated?: string;
  /** Ações extras (ex.: `DataExportMenu`, alternar visualização). */
  actions?: ReactNode;
  className?: string;
}

/**
 * Barra de ferramentas das listagens: busca, filtros, ordenação, contador e ações.
 * No mobile a busca ocupa a largura total e os filtros abrem em drawer.
 */
export function DataToolbar({
  search,
  filters = [],
  filterValues = {},
  onFilterChange,
  onClearFilters,
  sortOptions,
  sort,
  onSortChange,
  total,
  onRefresh,
  refreshing,
  lastUpdated,
  actions,
  className,
}: DataToolbarProps) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const activeCount = Object.keys(filterValues).filter((k) => filterValues[k]).length;

  return (
    <div className={cn("space-y-3 print:hidden", className)}>
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        {search && (
          <DataSearch
            value={search.value}
            onChange={search.onChange}
            placeholder={search.placeholder}
            loading={search.loading}
            className="md:max-w-sm"
          />
        )}

        <div className="flex flex-wrap items-center gap-2 md:ml-auto">
          {filters.length > 0 && onFilterChange && (
            <PortalButton
              variant="outline"
              size="small"
              iconLeft={icons.filtrar}
              className="md:hidden"
              onClick={() => setDrawerOpen(true)}
            >
              Filtros{activeCount ? ` (${activeCount})` : ""}
            </PortalButton>
          )}

          {sortOptions && onSortChange && (
            <DataSort options={sortOptions} value={sort} onChange={onSortChange} className="w-full sm:w-52" />
          )}

          {onRefresh && (
            <PortalButton
              variant="ghost"
              size="small"
              iconLeft={icons.atualizar}
              loading={refreshing}
              loadingText="Atualizando..."
              onClick={onRefresh}
            >
              Atualizar
            </PortalButton>
          )}

          {actions}
        </div>
      </div>

      {filters.length > 0 && onFilterChange && (
        <DataFilters
          className="hidden md:flex"
          filters={filters}
          values={filterValues}
          onChange={onFilterChange}
          onClear={onClearFilters}
        />
      )}

      <ActiveFilterChips
        filters={filters}
        values={filterValues}
        onRemove={(id) => onFilterChange?.(id, undefined)}
        onClearAll={onClearFilters}
      />

      <div className="flex flex-wrap items-center justify-between gap-2">
        {typeof total === "number" && <ResultsCounter total={total} filtered={activeCount > 0 || !!search?.value} />}
        {lastUpdated && <p className="text-xs text-muted-foreground">Atualizado em {lastUpdated}</p>}
      </div>

      {filters.length > 0 && onFilterChange && (
        <MobileFiltersDrawer
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          filters={filters}
          values={filterValues}
          onChange={onFilterChange}
          onClear={onClearFilters}
          activeCount={activeCount}
        />
      )}
    </div>
  );
}
