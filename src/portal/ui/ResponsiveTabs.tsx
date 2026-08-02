import { useId, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export interface ResponsiveTabItem {
  id: string;
  label: string;
  /** Rótulo curto opcional para telas estreitas. */
  shortLabel?: string;
  content: ReactNode;
  disabled?: boolean;
}

export interface ResponsiveTabsProps {
  items: ResponsiveTabItem[];
  value: string;
  onValueChange: (value: string) => void;
  "aria-label": string;
  /** No mobile, usa um seletor em vez de abas roláveis (bom para >4 abas). */
  mobileVariant?: "scroll" | "select";
  className?: string;
}

/**
 * Abas institucionais responsivas (Fase 11).
 *
 * Desktop/tablet: abas horizontais com rolagem local — nunca provocam
 * overflow horizontal da página. Mobile: abas roláveis ou seletor.
 */
export function ResponsiveTabs({
  items,
  value,
  onValueChange,
  mobileVariant = "scroll",
  className,
  ...rest
}: ResponsiveTabsProps) {
  const uid = useId();
  const ativo = items.find((i) => i.id === value) ?? items[0];
  const tabId = (id: string) => `${uid}-tab-${id}`;
  const panelId = (id: string) => `${uid}-panel-${id}`;

  const moverFoco = (dir: 1 | -1) => {
    const habilitados = items.filter((i) => !i.disabled);
    const atual = habilitados.findIndex((i) => i.id === value);
    const proximo = habilitados[(atual + dir + habilitados.length) % habilitados.length];
    if (proximo) {
      onValueChange(proximo.id);
      document.getElementById(tabId(proximo.id))?.focus();
    }
  };

  return (
    <div className={cn("w-full min-w-0", className)}>
      {mobileVariant === "select" && (
        <div className="md:hidden">
          <Select value={ativo?.id} onValueChange={onValueChange}>
            <SelectTrigger className="min-h-11 w-full" aria-label={rest["aria-label"]}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {items.map((i) => (
                <SelectItem key={i.id} value={i.id} disabled={i.disabled}>
                  {i.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div
        role="tablist"
        aria-label={rest["aria-label"]}
        onKeyDown={(e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            moverFoco(1);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            moverFoco(-1);
          }
        }}
        className={cn(
          "scroll-x -mx-1 flex gap-1 border-b border-border px-1",
          mobileVariant === "select" && "hidden md:flex",
        )}
      >
        {items.map((item) => {
          const selecionado = item.id === ativo?.id;
          return (
            <button
              key={item.id}
              id={tabId(item.id)}
              role="tab"
              type="button"
              disabled={item.disabled}
              aria-selected={selecionado}
              aria-controls={panelId(item.id)}
              tabIndex={selecionado ? 0 : -1}
              onClick={() => onValueChange(item.id)}
              className={cn(
                "min-h-11 whitespace-nowrap rounded-t-md px-3 py-2 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                selecionado
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground",
                item.disabled && "cursor-not-allowed opacity-50",
              )}
            >
              <span className="sm:hidden">{item.shortLabel ?? item.label}</span>
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          );
        })}
      </div>

      {items.map((item) => (
        <div
          key={item.id}
          id={panelId(item.id)}
          role="tabpanel"
          aria-labelledby={tabId(item.id)}
          hidden={item.id !== ativo?.id}
          tabIndex={0}
          className="min-w-0 pt-4 focus-visible:outline-none"
        >
          {item.id === ativo?.id && item.content}
        </div>
      ))}
    </div>
  );
}

export default ResponsiveTabs;
