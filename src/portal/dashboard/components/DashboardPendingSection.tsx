import { Link } from "react-router-dom";
import { Text } from "@/design-system/components/Text";
import { Badge } from "@/design-system/components/Badge";
import { Button } from "@/design-system/components/Button";
import { icons } from "@/design-system/icons";
import { cn } from "@/lib/utils";
import type { PendingItem, PendingPriority } from "../types";
import { DashboardEmptyState } from "./DashboardPrimitives";

const ordem: Record<PendingPriority, number> = { critica: 0, pendente: 1, informativa: 2 };
const tone: Record<PendingPriority, "danger" | "warning" | "info"> = {
  critica: "danger",
  pendente: "warning",
  informativa: "info",
};
const borda: Record<PendingPriority, string> = {
  critica: "border-l-destructive",
  pendente: "border-l-warning",
  informativa: "border-l-[hsl(var(--info))]",
};

/** Seção "Para você": pendências e avisos priorizados (máx. 5). */
export function DashboardPendingSection({ items, max = 5 }: { items: PendingItem[]; max?: number }) {
  const lista = [...items].sort((a, b) => ordem[a.priority] - ordem[b.priority]).slice(0, max);

  if (!lista.length) {
    return (
      <DashboardEmptyState
        icon={icons.sucesso}
        title="Tudo certo por aqui."
        description="Você não possui pendências no momento."
      />
    );
  }

  return (
    <ul className="space-y-5 md:space-y-2">
      {lista.map((item) => {
        const Icon = item.icon;
        return (
          <li
            key={item.id}
            className={cn("flex flex-wrap items-start gap-3 rounded-[18px] md:rounded-xl border border-l-4 bg-card p-5 md:p-4 shadow-sm md:shadow-none", borda[item.priority])}
          >
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted" aria-hidden>
              <Icon className="h-4 w-4 text-foreground" />
            </span>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <Text variant="small" className="font-semibold">
                  {item.title}
                </Text>
                <Badge tone={tone[item.priority]}>
                  {item.statusLabel ??
                    (item.priority === "critica" ? "Crítico" : item.priority === "pendente" ? "Pendente" : "Informativo")}
                </Badge>
              </div>
              {item.description && <Text variant="caption">{item.description}</Text>}
              {item.date && (
                <Text variant="caption">{new Date(item.date).toLocaleDateString("pt-BR")}</Text>
              )}
            </div>
            {item.route && (
              <Button variant="ghost" size="sm" rightIcon={icons.proximo} asChild className="ml-auto">
                <Link to={item.route}>{item.actionLabel ?? "Ver"}</Link>
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Lista compacta de notificações recentes. */
export function DashboardNotificationList({
  items,
  max = 4,
}: {
  items: Array<{ id: string; titulo: string; corpo?: string | null; created_at?: string | null; lida?: boolean; url?: string | null }>;
  max?: number;
}) {
  if (!items.length) {
    return (
      <DashboardEmptyState
        icon={icons.notificacao}
        title="Tudo certo por aqui."
        description="Você não possui novas mensagens."
      />
    );
  }

  return (
    <ul className="divide-y rounded-[18px] md:rounded-xl border bg-card shadow-sm md:shadow-none">
      {items.slice(0, max).map((n) => (
        <li key={n.id} className="flex items-start gap-3 p-4">
          <icons.notificacao className={cn("mt-0.5 h-4 w-4", n.lida ? "text-muted-foreground" : "text-primary")} aria-hidden />
          <div className="min-w-0 flex-1">
            <Text variant="small" className={cn("truncate", !n.lida && "font-semibold")}>
              {n.titulo}
            </Text>
            {n.corpo && <Text variant="caption" className="line-clamp-2">{n.corpo}</Text>}
          </div>
          {n.created_at && (
            <span className="shrink-0 text-xs text-muted-foreground">
              {new Date(n.created_at).toLocaleDateString("pt-BR")}
            </span>
          )}
        </li>
      ))}
    </ul>
  );
}
