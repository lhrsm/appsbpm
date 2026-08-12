import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { useNotificacoes } from "@/hooks/useNotificacoes";
import { icons } from "@/design-system/icons";
import { cn } from "@/lib/utils";

type Filtro = "todas" | "nao-lidas";

function ListaNotificacoes({ onNavigate }: { onNavigate?: () => void }) {
  const { items, loading, marcarLida, marcarTodasLidas, naoLidas } = useNotificacoes();
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const navigate = useNavigate();
  const Vazio = icons.vazio;

  const lista = filtro === "nao-lidas" ? items.filter((n) => !n.lida) : items;

  return (
    <div className="flex max-h-[70vh] flex-col">
      <div className="flex items-center gap-2 border-b p-3">
        <div className="flex gap-1" role="group" aria-label="Filtrar notificações">
          {(["todas", "nao-lidas"] as Filtro[]).map((f) => (
            <Button
              key={f}
              size="sm"
              variant={filtro === f ? "secondary" : "ghost"}
              onClick={() => setFiltro(f)}
              aria-pressed={filtro === f}
            >
              {f === "todas" ? "Todas" : "Não lidas"}
            </Button>
          ))}
        </div>
        <Button
          size="sm"
          variant="ghost"
          className="ml-auto"
          onClick={marcarTodasLidas}
          disabled={naoLidas === 0}
        >
          Marcar todas
        </Button>
      </div>

      <div className="overflow-y-auto p-2">
        {loading && lista.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">Carregando notificações…</p>
        )}
        {!loading && lista.length === 0 && (
          <div className="flex flex-col items-center gap-2 p-6 text-center">
            <Vazio className="h-8 w-8 text-muted-foreground" aria-hidden />
            <p className="text-sm text-muted-foreground">Nenhuma notificação por aqui.</p>
          </div>
        )}
        <ul className="space-y-1">
          {lista.map((n) => (
            <li key={n.id}>
              <button
                type="button"
                className={cn(
                  "w-full rounded-lg p-3 text-left transition hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  !n.lida && "bg-primary/5"
                )}
                onClick={() => {
                  if (!n.lida) marcarLida(n.id);
                  onNavigate?.();
                  navigate(n.url ?? "/dashboard/notificacoes");
                }}
              >
                <span className="flex items-center gap-2">
                  {!n.lida && <span className="h-2 w-2 shrink-0 rounded-full bg-primary" aria-hidden />}
                  <span className="truncate text-sm font-medium text-foreground">{n.titulo}</span>
                </span>
                <span className="mt-1 line-clamp-2 block text-xs text-muted-foreground">{n.corpo}</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          className="w-full"
          onClick={() => {
            onNavigate?.();
            navigate("/dashboard/notificacoes");
          }}
        >
          Ver todas as notificações
        </Button>
      </div>
    </div>
  );
}

/** Central de notificações: popover no desktop, drawer no mobile. */
export default function PortalNotificationCenter() {
  const { naoLidas } = useNotificacoes();
  const isMobile = useIsMobile();
  const [open, setOpen] = useState(false);
  const Bell = icons.notificacao;

  const trigger = (
    <Button
      variant="ghost"
      size="icon"
      className={cn(
        "relative transition-all duration-[160ms] ease hover:-translate-y-[1px]",
        "flex items-center justify-center rounded-full",
        "h-11 w-11 2xl:h-[46px] 2xl:w-[46px]",
        "bg-[rgba(255,255,255,0.90)] backdrop-blur-[10px] border border-[rgba(255,255,255,0.60)] shadow-[0_6px_18px_rgba(15,23,42,0.16)]",
        "hover:bg-[rgba(255,255,255,0.98)] hover:shadow-[0_8px_22px_rgba(15,23,42,0.20)]",
        "text-[#172033] hover:text-[#168a49]"
      )}
      aria-label={naoLidas > 0 ? `Notificações, ${naoLidas} não lidas` : "Notificações"}
      aria-expanded={open}
    >
      <Bell className="h-5 2xl:h-[20px] w-5 2xl:w-[20px]" aria-hidden />
      {naoLidas > 0 && (
        <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#dc2626] px-1 text-[10px] font-bold text-white shadow-sm">
          {naoLidas > 99 ? "99+" : naoLidas}
        </span>
      )}
    </Button>
  );

  if (isMobile) {
    return (
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>{trigger}</SheetTrigger>
        <SheetContent side="right" className="w-full max-w-sm p-0">
          <SheetHeader className="border-b p-4">
            <SheetTitle>Notificações</SheetTitle>
          </SheetHeader>
          <ListaNotificacoes onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <p className="border-b p-3 text-sm font-semibold">Notificações</p>
        <ListaNotificacoes onNavigate={() => setOpen(false)} />
      </PopoverContent>
    </Popover>
  );
}
