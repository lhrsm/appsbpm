/**
 * Tipos centrais das listagens do Portal (Fase 6).
 * Nenhuma página deve criar definição própria de coluna/ordenação/paginação.
 */
import type { ReactNode } from "react";

export type ColumnAlign = "left" | "right" | "center";

/** Prioridade da coluna em telas pequenas. */
export type MobilePriority = "primary" | "secondary" | "hidden";

export type Density = "compact" | "regular" | "comfortable";

export interface DataColumn<T> {
  id: string;
  header: ReactNode;
  /** Valor bruto — usado em ordenação, busca e exportação. */
  accessor?: (row: T) => string | number | Date | null | undefined;
  /** Renderização da célula. Sem `cell`, usa `accessor`. */
  cell?: (row: T) => ReactNode;
  sortable?: boolean;
  filterable?: boolean;
  hideable?: boolean;
  mobilePriority?: MobilePriority;
  width?: string;
  minWidth?: string;
  align?: ColumnAlign;
  /** Coluna com dado pessoal — respeita mascaramento e nunca vai bruta para exportação. */
  sensitive?: boolean;
  /** Chave de permissão exigida para renderizar/exportar. */
  permission?: string;
  exportable?: boolean;
  printVisible?: boolean;
}

export type SortDirection = "asc" | "desc";

export interface SortState {
  columnId: string;
  direction: SortDirection;
}

export interface PaginationState {
  page: number;
  pageSize: number;
  /** Total de registros (backend). Ausente = paginação local. */
  total?: number;
}

/** Conjunto de permissões do usuário. */
export type PermissionSet = string[] | ((permission: string) => boolean) | undefined;

export function hasPermission(permissions: PermissionSet, permission?: string): boolean {
  if (!permission) return true;
  if (!permissions) return true;
  if (typeof permissions === "function") return permissions(permission);
  return permissions.includes(permission);
}

/** Colunas visíveis considerando permissões e ocultações do usuário. */
export function visibleColumns<T>(
  columns: DataColumn<T>[],
  permissions?: PermissionSet,
  hidden: string[] = [],
): DataColumn<T>[] {
  return columns.filter((c) => hasPermission(permissions, c.permission) && !hidden.includes(c.id));
}

/** Valor textual de uma célula (ordenação/busca/exportação). */
export function columnValue<T>(column: DataColumn<T>, row: T): string | number | Date | null | undefined {
  return column.accessor ? column.accessor(row) : undefined;
}
