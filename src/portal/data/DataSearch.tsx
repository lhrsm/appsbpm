import { useEffect, useId, useRef } from "react";
import { cn } from "@/lib/utils";
import { icons } from "@/design-system/icons";

export interface DataSearchProps {
  value: string;
  onChange: (value: string) => void;
  /** Placeholder específico do contexto — nunca "Pesquisar...". */
  placeholder: string;
  /** Rótulo acessível (sr-only quando não houver label visível). */
  label?: string;
  loading?: boolean;
  autoFocusOnMount?: boolean;
  className?: string;
  /** Dispara ao pressionar Enter (busca imediata opcional). */
  onSubmit?: (value: string) => void;
}

/**
 * Campo de busca padronizado das listagens.
 * O debounce fica em `useDataView` — não consulte o backend a cada tecla.
 *
 * @example <DataSearch value={view.search} onChange={view.setSearch} placeholder="Pesquisar por protocolo ou assunto" loading={view.searching} />
 */
export function DataSearch({
  value,
  onChange,
  placeholder,
  label = "Pesquisar",
  loading,
  autoFocusOnMount,
  className,
  onSubmit,
}: DataSearchProps) {
  const id = useId();
  const ref = useRef<HTMLInputElement>(null);
  const Icon = loading ? icons.carregando : icons.buscar;

  useEffect(() => {
    if (autoFocusOnMount) ref.current?.focus();
  }, [autoFocusOnMount]);

  return (
    <div className={cn("relative w-full", className)}>
      <label htmlFor={id} className="sr-only">
        {label}
      </label>
      <Icon
        aria-hidden
        className={cn(
          "pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
          loading && "animate-spin",
        )}
      />
      <input
        id={id}
        ref={ref}
        type="search"
        role="searchbox"
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && onSubmit) onSubmit(value);
        }}
        className="h-11 w-full rounded-[12px] border border-input bg-background pl-9 pr-9 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:ring-2 focus-visible:ring-ring"
      />
      {value && (
        <button
          type="button"
          aria-label="Limpar pesquisa"
          onClick={() => {
            onChange("");
            ref.current?.focus();
          }}
          className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <icons.fechar className="h-4 w-4" aria-hidden />
        </button>
      )}
    </div>
  );
}
