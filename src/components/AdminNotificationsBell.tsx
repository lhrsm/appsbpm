import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Bell } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Item = {
  key: string;
  label: string;
  count: number;
  href: string;
  tone: string;
};

export default function AdminNotificationsBell() {
  const [items, setItems] = useState<Item[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const hoje = new Date().toISOString().slice(0, 10);
    const limite15d = new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString();

    const [sol, priv, privVenc, mens, pec] = await Promise.all([
      supabase.from("solicitacoes").select("id", { count: "exact", head: true }).in("status", ["aberto", "em_andamento"]),
      supabase.from("solicitacoes_privacidade").select("id", { count: "exact", head: true }).eq("status", "pendente"),
      supabase.from("solicitacoes_privacidade").select("id", { count: "exact", head: true }).eq("status", "pendente").lt("created_at", limite15d),
      supabase.from("mensalidades").select("id", { count: "exact", head: true }).eq("status", "pendente").lt("vencimento", hoje),
      supabase.from("peculio_solicitacoes").select("id", { count: "exact", head: true }).eq("status", "pendente"),
    ]);

    setItems([
      { key: "sol", label: "Chamados abertos", count: sol.count ?? 0, href: "/admin/solicitacoes", tone: "text-primary" },
      { key: "priv", label: "LGPD pendentes", count: priv.count ?? 0, href: "/admin/privacidade", tone: "text-blue-600" },
      { key: "privVenc", label: "LGPD com SLA vencido", count: privVenc.count ?? 0, href: "/admin/privacidade", tone: "text-destructive" },
      { key: "mens", label: "Mensalidades vencidas", count: mens.count ?? 0, href: "/admin/financeiro", tone: "text-amber-600" },
      { key: "pec", label: "Pecúlio a aprovar", count: pec.count ?? 0, href: "/admin/peculio", tone: "text-purple-600" },
    ]);
  };

  useEffect(() => {
    load();
    const iv = setInterval(load, 60_000);
    return () => clearInterval(iv);
  }, []);

  const total = items.reduce((s, i) => s + i.count, 0);
  const urgentes = items.filter((i) => i.count > 0);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          aria-label={`Notificações (${total})`}
          className="relative h-9 w-9 rounded-md hover:bg-muted flex items-center justify-center transition"
        >
          <Bell className="h-4 w-4" />
          {total > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-destructive text-destructive-foreground text-[10px] font-bold flex items-center justify-center">
              {total > 99 ? "99+" : total}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-80 p-0">
        <div className="p-3 border-b flex items-center justify-between">
          <div>
            <p className="font-semibold text-sm">Ações pendentes</p>
            <p className="text-xs text-muted-foreground">
              {total === 0 ? "Nenhuma pendência" : `${total} itens exigem atenção`}
            </p>
          </div>
          <Badge variant={total > 0 ? "destructive" : "secondary"}>{total}</Badge>
        </div>
        <div className="max-h-80 overflow-y-auto">
          {urgentes.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Tudo em dia ✨</p>
          ) : (
            urgentes.map((i) => (
              <Link
                key={i.key}
                to={i.href}
                onClick={() => setOpen(false)}
                className="flex items-center justify-between px-3 py-2.5 hover:bg-muted border-b last:border-0 transition"
              >
                <span className="text-sm">{i.label}</span>
                <span className={cn("text-sm font-bold tabular-nums", i.tone)}>{i.count}</span>
              </Link>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
