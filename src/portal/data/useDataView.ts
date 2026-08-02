import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useDebouncedValue } from "@/design-system/hooks/useDebouncedValue";
import { columnValue, type DataColumn, type SortState } from "./types";

export type FilterValues = Record<string, string | undefined>;

export interface UseDataViewOptions {
  /** Sincroniza busca, página, filtros e ordenação na URL (nunca dados sensíveis). */
  syncUrl?: boolean;
  /** Prefixo dos parâmetros na URL, para duas listagens na mesma rota. */
  urlPrefix?: string;
  initialSearch?: string;
  initialFilters?: FilterValues;
  initialSort?: SortState;
  pageSize?: number;
  debounceMs?: number;
}

export interface DataViewState {
  search: string;
  /** Busca com debounce — use esta para consultar backend/filtrar. */
  debouncedSearch: string;
  setSearch: (value: string) => void;
  searching: boolean;
  filters: FilterValues;
  setFilter: (id: string, value?: string) => void;
  setFilters: (values: FilterValues) => void;
  clearFilters: () => void;
  activeFilterCount: number;
  sort?: SortState;
  setSort: (sort?: SortState) => void;
  toggleSort: (columnId: string) => void;
  page: number;
  setPage: (page: number) => void;
  pageSize: number;
  setPageSize: (size: number) => void;
  /** Reinicia tudo (troca de perfil/contexto). */
  reset: () => void;
}

const clean = (values: FilterValues): FilterValues =>
  Object.fromEntries(Object.entries(values).filter(([, v]) => v !== undefined && v !== "" && v !== "todos"));

/**
 * Estado unificado de busca, filtros, ordenação e paginação de uma listagem.
 *
 * @example const view = useDataView({ syncUrl: true, pageSize: 10 });
 */
export function useDataView(options: UseDataViewOptions = {}): DataViewState {
  const {
    syncUrl = false,
    urlPrefix = "",
    initialSearch = "",
    initialFilters = {},
    initialSort,
    pageSize: initialPageSize = 10,
    debounceMs = 350,
  } = options;

  const key = useCallback((name: string) => `${urlPrefix}${name}`, [urlPrefix]);
  const [params, setParams] = useSearchParams();

  const [search, setSearchState] = useState(() => (syncUrl ? params.get(key("q")) ?? initialSearch : initialSearch));
  const [filters, setFiltersState] = useState<FilterValues>(() => clean(initialFilters));
  const [sort, setSort] = useState<SortState | undefined>(initialSort);
  const [page, setPage] = useState(() => Number(syncUrl ? params.get(key("page")) ?? 1 : 1) || 1);
  const [pageSize, setPageSizeState] = useState(initialPageSize);

  const debouncedSearch = useDebouncedValue(search, debounceMs);
  const searching = search !== debouncedSearch;

  // Hidrata filtros/ordenação da URL apenas na montagem.
  const hydrated = useRef(false);
  useEffect(() => {
    if (!syncUrl || hydrated.current) return;
    hydrated.current = true;
    const urlFilters: FilterValues = {};
    params.forEach((value, name) => {
      if (!name.startsWith(`${urlPrefix}f_`)) return;
      urlFilters[name.replace(`${urlPrefix}f_`, "")] = value;
    });
    if (Object.keys(urlFilters).length) setFiltersState((prev) => clean({ ...prev, ...urlFilters }));
    const sortParam = params.get(key("sort"));
    if (sortParam) {
      const [columnId, direction] = sortParam.split(":");
      if (columnId) setSort({ columnId, direction: direction === "desc" ? "desc" : "asc" });
    }
  }, [syncUrl, params, urlPrefix, key]);

  useEffect(() => {
    if (!syncUrl || !hydrated.current) return;
    const next = new URLSearchParams(params);
    const setOrDelete = (name: string, value?: string) => {
      if (value) next.set(name, value);
      else next.delete(name);
    };
    setOrDelete(key("q"), debouncedSearch || undefined);
    setOrDelete(key("page"), page > 1 ? String(page) : undefined);
    setOrDelete(key("sort"), sort ? `${sort.columnId}:${sort.direction}` : undefined);
    Array.from(next.keys())
      .filter((n) => n.startsWith(`${urlPrefix}f_`))
      .forEach((n) => next.delete(n));
    Object.entries(filters).forEach(([id, value]) => value && next.set(`${urlPrefix}f_${id}`, value));
    if (next.toString() !== params.toString()) setParams(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [syncUrl, debouncedSearch, page, sort, filters]);

  const setSearch = useCallback((value: string) => {
    setSearchState(value);
    setPage(1);
  }, []);

  const setFilter = useCallback((id: string, value?: string) => {
    setFiltersState((prev) => clean({ ...prev, [id]: value }));
    setPage(1);
  }, []);

  const setFilters = useCallback((values: FilterValues) => {
    setFiltersState(clean(values));
    setPage(1);
  }, []);

  const clearFilters = useCallback(() => {
    setFiltersState({});
    setPage(1);
  }, []);

  const toggleSort = useCallback((columnId: string) => {
    setSort((prev) => {
      if (prev?.columnId !== columnId) return { columnId, direction: "asc" };
      if (prev.direction === "asc") return { columnId, direction: "desc" };
      return undefined;
    });
    setPage(1);
  }, []);

  const setPageSize = useCallback((size: number) => {
    setPageSizeState(size);
    setPage(1);
  }, []);

  const reset = useCallback(() => {
    setSearchState("");
    setFiltersState({});
    setSort(initialSort);
    setPage(1);
    setPageSizeState(initialPageSize);
  }, [initialSort, initialPageSize]);

  const activeFilterCount = useMemo(() => Object.keys(filters).length, [filters]);

  return {
    search,
    debouncedSearch,
    setSearch,
    searching,
    filters,
    setFilter,
    setFilters,
    clearFilters,
    activeFilterCount,
    sort,
    setSort,
    toggleSort,
    page,
    setPage,
    pageSize,
    setPageSize,
    reset,
  };
}

const normalize = (value: unknown) =>
  String(value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

/** Busca local em campos autorizados. */
export function searchRows<T>(rows: T[], term: string, fields: (row: T) => unknown[]): T[] {
  const q = normalize(term).trim();
  if (!q) return rows;
  return rows.filter((row) => fields(row).some((value) => normalize(value).includes(q)));
}

/** Ordenação local baseada nos accessors das colunas. */
export function sortRows<T>(rows: T[], sort: SortState | undefined, columns: DataColumn<T>[]): T[] {
  if (!sort) return rows;
  const column = columns.find((c) => c.id === sort.columnId);
  if (!column?.accessor) return rows;
  const factor = sort.direction === "asc" ? 1 : -1;
  return [...rows].sort((a, b) => {
    const va = columnValue(column, a);
    const vb = columnValue(column, b);
    if (va == null) return 1;
    if (vb == null) return -1;
    if (va instanceof Date || vb instanceof Date) {
      return (new Date(va as Date).getTime() - new Date(vb as Date).getTime()) * factor;
    }
    if (typeof va === "number" && typeof vb === "number") return (va - vb) * factor;
    return String(va).localeCompare(String(vb), "pt-BR", { sensitivity: "base" }) * factor;
  });
}

/** Paginação local. */
export function paginateRows<T>(rows: T[], page: number, pageSize: number): T[] {
  const start = (page - 1) * pageSize;
  return rows.slice(start, start + pageSize);
}
