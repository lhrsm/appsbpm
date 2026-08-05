import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { icons } from "@/design-system/icons";
import { getNavigationSections, type PortalProfile } from "../navigation";

export interface PortalGlobalSearchProps {
  profile: PortalProfile;
  permissions?: string[];
  variant?: "bar" | "icon";
}

/**
 * Busca global do portal externo.
 * Só apresenta recursos autorizados ao perfil atual (nunca "Limite disponível").
 */
export default function PortalGlobalSearch({ profile, permissions, variant = "bar" }: PortalGlobalSearchProps) {
  const [open, setOpen] = useState(false);
  const [term, setTerm] = useState("");
  const [debounced, setDebounced] = useState("");
  const navigate = useNavigate();
  const Search = icons.buscar;

  const sections = useMemo(() => getNavigationSections({ profile, permissions }), [profile, permissions]);

  useEffect(() => {
    const t = setTimeout(() => setDebounced(term), 180);
    return () => clearTimeout(t);
  }, [term]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === "k" || e.key === "K") && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  const go = (route: string) => {
    setOpen(false);
    navigate(route);
  };

  return (
    <>
      {variant === "bar" ? (
        <button
          id="busca-portal"
          type="button"
          onClick={() => setOpen(true)}
          className="hidden lg:flex h-10 w-full max-w-md items-center gap-2 rounded-lg border border-primary-foreground/20 bg-primary-foreground/10 px-3 text-sm text-primary-foreground/90 transition hover:bg-primary-foreground/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-foreground/60"
          aria-label="Pesquisar serviços, documentos e ajuda"
        >
          <Search className="h-4 w-4 shrink-0 opacity-80" aria-hidden />
          <span className="flex-1 truncate text-left opacity-80">Pesquisar serviços, documentos e ajuda</span>
          <kbd className="rounded border border-primary-foreground/30 px-1.5 py-0.5 font-mono text-[10px] opacity-70">
            Ctrl K
          </kbd>
        </button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          id="busca-portal-mobile"
          onClick={() => setOpen(true)}
          className="h-11 w-11 text-inherit hover:bg-accent lg:hidden"
          aria-label="Pesquisar serviços, documentos e ajuda"
        >
          <Search className="h-5 w-5" aria-hidden />
        </Button>
      )}

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput
          aria-label="Pesquisar serviços, documentos e ajuda"
          placeholder="Pesquisar serviços, documentos e ajuda"
          value={term}
          onValueChange={setTerm}
        />
        <CommandList>
          {term !== debounced && <div role="status" className="px-4 py-3 text-sm text-muted-foreground">Buscando…</div>}
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          {sections.map((section, idx) => (
            <div key={section.id}>
              {idx > 0 && <CommandSeparator />}
              <CommandGroup heading={section.section}>
                {section.items.map((item) => {
                  const Icon = item.icon;
                  return (
                    <CommandItem
                      key={item.id}
                      value={`${item.label} ${(item.keywords ?? []).join(" ")}`}
                      onSelect={() => go(item.route)}
                    >
                      <Icon className="mr-2 h-4 w-4 text-muted-foreground" aria-hidden />
                      {item.label}
                    </CommandItem>
                  );
                })}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
