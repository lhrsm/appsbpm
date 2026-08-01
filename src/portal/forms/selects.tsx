import { forwardRef, useMemo, useState, type SelectHTMLAttributes } from "react";
import { cn } from "@/design-system/utilities";
import { icons } from "@/design-system/icons";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { portalInputBase } from "./inputs";
import { PortalButton } from "./buttons";

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  /** Agrupamento opcional. */
  group?: string;
  description?: string;
}

export interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "children"> {
  options: SelectOption[];
  placeholder?: string;
  loading?: boolean;
  /** Acrescenta a opção "Outro". */
  allowOther?: boolean;
  otherLabel?: string;
}

/**
 * Select nativo estilizado — acessível por padrão e leve no mobile.
 * Use `SearchableSelect` apenas para listas longas.
 *
 * @example <FormField label="Estado">{(f) => <SelectField {...f} options={estados} />}</FormField>
 */
export const SelectField = forwardRef<HTMLSelectElement, SelectFieldProps>(function SelectField(
  { options, placeholder = "Selecione", loading, allowOther, otherLabel = "Outro", className, ...props },
  ref,
) {
  const groups = useMemo(() => {
    const map = new Map<string, SelectOption[]>();
    for (const opt of options) {
      const key = opt.group ?? "";
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(opt);
    }
    return Array.from(map.entries());
  }, [options]);

  const Chevron = icons.expandir;
  const Spinner = icons.carregando;

  return (
    <div className="relative">
      <select
        ref={ref}
        className={cn(portalInputBase, "appearance-none pr-10", props["aria-invalid"] && "border-destructive", className)}
        disabled={props.disabled || loading}
        {...props}
      >
        <option value="">{loading ? "Carregando..." : placeholder}</option>
        {groups.map(([group, items]) =>
          group ? (
            <optgroup key={group} label={group}>
              {items.map((o) => (
                <option key={o.value} value={o.value} disabled={o.disabled}>
                  {o.label}
                </option>
              ))}
            </optgroup>
          ) : (
            items.map((o) => (
              <option key={o.value} value={o.value} disabled={o.disabled}>
                {o.label}
              </option>
            ))
          ),
        )}
        {allowOther && <option value="__outro__">{otherLabel}</option>}
      </select>
      {loading ? (
        <Spinner className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden />
      ) : (
        <Chevron className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      )}
    </div>
  );
});

export interface SearchableSelectProps {
  id?: string;
  options: SelectOption[];
  value?: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  loading?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  /** Busca remota: dispara com debounce ao digitar. */
  onSearch?: (term: string) => void;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  className?: string;
}

/**
 * Combobox pesquisável. Use somente em listas longas (clínicas, parceiros,
 * cidades, categorias). Para listas curtas use `SelectField`.
 */
export function SearchableSelect({
  id,
  options,
  value,
  onValueChange,
  placeholder = "Selecione",
  searchPlaceholder = "Buscar...",
  emptyText = "Nenhum resultado encontrado.",
  loading,
  disabled,
  clearable = true,
  onSearch,
  className,
  ...aria
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.value === value);
  const Chevron = icons.expandir;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          disabled={disabled || loading}
          className={cn(portalInputBase, "items-center justify-between text-left", !selected && "text-muted-foreground", className)}
          {...aria}
        >
          <span className="truncate">{loading ? "Carregando..." : selected?.label || placeholder}</span>
          <Chevron className="ml-2 size-4 shrink-0 opacity-60" aria-hidden />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0" align="start">
        <Command shouldFilter={!onSearch}>
          <CommandInput placeholder={searchPlaceholder} onValueChange={onSearch} />
          <CommandList>
            <CommandEmpty>{emptyText}</CommandEmpty>
            <CommandGroup>
              {options.map((o) => (
                <CommandItem
                  key={o.value}
                  value={o.label}
                  disabled={o.disabled}
                  onSelect={() => {
                    onValueChange(o.value);
                    setOpen(false);
                  }}
                >
                  <span className="flex-1">
                    {o.label}
                    {o.description && <span className="block text-xs text-muted-foreground">{o.description}</span>}
                  </span>
                  {o.value === value && <icons.confirmar className="size-4 text-primary" aria-hidden />}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
        {clearable && value && (
          <div className="border-t p-2">
            <PortalButton
              variant="ghost"
              size="small"
              fullWidth
              onClick={() => {
                onValueChange("");
                setOpen(false);
              }}
            >
              Limpar seleção
            </PortalButton>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
