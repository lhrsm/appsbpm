import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import { icons } from "@/design-system/icons";
import { Chip } from "@/design-system/components/Badge";
import { PortalButton } from "@/portal/forms/buttons";
import { SelectField } from "@/portal/forms/selects";
import { PortalDrawer } from "@/portal/forms/overlays";
import type { FilterValues } from "./useDataView";

export interface DataFilterOption {
  value: string;
  label: string;
}

export interface DataFilterDefinition {
  id: string;
  label: string;
  options: DataFilterOption[];
  /** Rótulo da opção neutra. */
  allLabel?: string;
}

function LabeledFilterSelect({
  filter,
  value,
  onChange,
  className,
}: {
  filter: DataFilterDefinition;
  value: string;
  onChange: (value?: string) => void;
  className?: string;
}) {
  return (
    <label className={cn("block space-y-1 text-sm", className)}>
      <span className="font-medium">{filter.label}</span>
      <SelectField
        value={value}
        placeholder={filter.allLabel ?? "Todos"}
        options={filter.options}
        onChange={(e) => onChange(e.target.value || undefined)}
      />
    </label>
  );
}

export interface DataFiltersProps {
  filters: DataFilterDefinition[];
  values: FilterValues;
  onChange: (id: string, value?: string) => void;
  onClear?: () => void;
  className?: string;
}

/**
 * Conjunto de filtros de uma listagem (desktop: inline; mobile: use `MobileFiltersDrawer`).
 * Não exiba filtros que não afetem os resultados.
 */
export function DataFilters({ filters, values, onChange, onClear, className }: DataFiltersProps) {
  if (!filters.length) return null;
  const hasActive = filters.some((f) => values[f.id]);
  return (
    <div className={cn("flex flex-wrap items-end gap-3", className)} role="group" aria-label="Filtros">
      {filters.map((filter) => (
        <LabeledFilterSelect
          key={filter.id}
          filter={filter}
          value={values[filter.id] ?? ""}
          onChange={(value) => onChange(filter.id, value)}
          className="min-w-[10rem]"
        />
      ))}
      {hasActive && onClear && (
        <PortalButton variant="ghost" size="small" iconLeft={icons.fechar} onClick={onClear}>
          Limpar filtros
        </PortalButton>
      )}
    </div>
  );
}

export interface ActiveFilterChipsProps {
  filters: DataFilterDefinition[];
  values: FilterValues;
  onRemove: (id: string) => void;
  onClearAll?: () => void;
  className?: string;
}

/** Chips dos filtros aplicados, removíveis individualmente. */
export function ActiveFilterChips({ filters, values, onRemove, onClearAll, className }: ActiveFilterChipsProps) {
  const active = useMemo(
    () =>
      filters
        .map((filter) => {
          const value = values[filter.id];
          if (!value) return null;
          const option = filter.options.find((o) => o.value === value);
          return { id: filter.id, label: `${filter.label}: ${option?.label ?? value}` };
        })
        .filter(Boolean) as { id: string; label: string }[],
    [filters, values],
  );

  if (!active.length) return null;

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)} aria-label="Filtros aplicados">
      {active.map((chip) => (
        <Chip key={chip.id} selected onRemove={() => onRemove(chip.id)}>
          {chip.label}
        </Chip>
      ))}
      {onClearAll && (
        <button
          type="button"
          onClick={onClearAll}
          className="text-xs font-semibold text-primary underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          Limpar todos
        </button>
      )}
    </div>
  );
}

export interface MobileFiltersDrawerProps extends DataFiltersProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  activeCount: number;
}

/** Filtros em drawer no mobile — aplicação explícita via "Aplicar". */
export function MobileFiltersDrawer({
  open,
  onOpenChange,
  filters,
  values,
  onChange,
  onClear,
  activeCount,
}: MobileFiltersDrawerProps) {
  const [draft, setDraft] = useState<FilterValues>(values);

  return (
    <PortalDrawer
      open={open}
      onOpenChange={(next) => {
        if (next) setDraft(values);
        onOpenChange(next);
      }}
      title="Filtros"
      description={activeCount ? `${activeCount} filtro(s) aplicado(s)` : "Nenhum filtro aplicado"}
      footer={
        <div className="flex w-full gap-2">
          <PortalButton
            variant="outline"
            fullWidth
            onClick={() => {
              setDraft({});
              onClear?.();
              onOpenChange(false);
            }}
          >
            Limpar
          </PortalButton>
          <PortalButton
            fullWidth
            onClick={() => {
              filters.forEach((f) => onChange(f.id, draft[f.id]));
              onOpenChange(false);
            }}
          >
            Aplicar
          </PortalButton>
        </div>
      }
    >
      <div className="space-y-4">
        {filters.map((filter) => (
          <LabeledFilterSelect
            key={filter.id}
            filter={filter}
            value={draft[filter.id] ?? ""}
            onChange={(value) => setDraft((prev) => ({ ...prev, [filter.id]: value }))}
          />
        ))}
      </div>
    </PortalDrawer>
  );
}

export type DateRangePreset = "hoje" | "7d" | "30d" | "mes" | "ano" | "personalizado";

export interface DateRangeValue {
  start?: string;
  end?: string;
  preset?: DateRangePreset;
}

const presets: { id: DateRangePreset; label: string }[] = [
  { id: "hoje", label: "Hoje" },
  { id: "7d", label: "Últimos 7 dias" },
  { id: "30d", label: "Últimos 30 dias" },
  { id: "mes", label: "Este mês" },
  { id: "ano", label: "Este ano" },
  { id: "personalizado", label: "Personalizado" },
];

const iso = (date: Date) => date.toISOString().slice(0, 10);

/** Converte um preset em intervalo de datas (local). */
export function resolvePreset(preset: DateRangePreset): DateRangeValue {
  const now = new Date();
  const end = iso(now);
  switch (preset) {
    case "hoje":
      return { preset, start: end, end };
    case "7d":
      return { preset, start: iso(new Date(now.getTime() - 6 * 864e5)), end };
    case "30d":
      return { preset, start: iso(new Date(now.getTime() - 29 * 864e5)), end };
    case "mes":
      return { preset, start: iso(new Date(now.getFullYear(), now.getMonth(), 1)), end };
    case "ano":
      return { preset, start: iso(new Date(now.getFullYear(), 0, 1)), end };
    default:
      return { preset };
  }
}

export interface DateRangeFilterProps {
  value: DateRangeValue;
  onChange: (value: DateRangeValue) => void;
  /** Impede seleção de datas futuras. */
  disableFuture?: boolean;
  className?: string;
}

/** Filtro de período com atalhos e validação de intervalo. */
export function DateRangeFilter({ value, onChange, disableFuture = true, className }: DateRangeFilterProps) {
  const today = iso(new Date());
  const invalid = Boolean(value.start && value.end && value.start > value.end);

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex flex-wrap gap-2" role="group" aria-label="Período">
        {presets.map((p) => (
          <Chip
            key={p.id}
            selected={value.preset === p.id}
            onSelect={() => onChange(p.id === "personalizado" ? { ...value, preset: p.id } : resolvePreset(p.id))}
          >
            {p.label}
          </Chip>
        ))}
      </div>
      {value.preset === "personalizado" && (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-sm">
            <span className="font-medium">Data inicial</span>
            <input
              type="date"
              value={value.start ?? ""}
              max={disableFuture ? today : undefined}
              onChange={(e) => onChange({ ...value, start: e.target.value || undefined })}
              className="h-11 w-full rounded-[12px] border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="font-medium">Data final</span>
            <input
              type="date"
              value={value.end ?? ""}
              max={disableFuture ? today : undefined}
              onChange={(e) => onChange({ ...value, end: e.target.value || undefined })}
              className="h-11 w-full rounded-[12px] border border-input bg-background px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
        </div>
      )}
      {invalid && (
        <p role="alert" className="text-xs font-medium text-destructive">
          A data inicial deve ser anterior ou igual à data final.
        </p>
      )}
    </div>
  );
}
