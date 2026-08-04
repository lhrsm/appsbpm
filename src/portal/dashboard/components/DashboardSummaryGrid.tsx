import { Link } from "react-router-dom";
import { Text } from "@/design-system/components/Text";
import { Badge } from "@/design-system/components/Badge";
import { Skeleton } from "@/design-system/components/Skeleton";
import { icons } from "@/design-system/icons";
import { cn } from "@/lib/utils";
import type { SummaryItem } from "../types";

/** Grade de até quatro indicadores principais. */
export function DashboardSummaryGrid({ items }: { items: SummaryItem[] }) {
  if (!items.length) return null;
  return (
    <ul className="grid grid-cols-1 gap-3 xs:grid-cols-2 sm:grid-cols-2 xl:grid-cols-4">
      {items.map((item) => (
        <li key={item.id} className="min-w-0">
          <SummaryCard item={item} />
        </li>
      ))}
    </ul>
  );
}

function SummaryCard({ item }: { item: SummaryItem }) {
  const Icon = item.icon;
  const body = (
    <div className="flex h-full flex-col gap-2 rounded-xl border border-[var(--portal-modal-border-light)]/40 dark:border-[var(--portal-modal-border-dark)]/40 bg-[var(--portal-modal-bg-light)]/70 dark:bg-[var(--portal-modal-bg-dark)]/40 p-4 transition-all hover:border-primary/40 hover:bg-white/90 dark:hover:bg-slate-900/60 backdrop-blur-sm">
      <div className="flex items-start justify-between gap-2">
        <span className="flex h-9 w-9 items-center justify-center portal-icon-circle-green" aria-hidden>
          <Icon className="h-4.5 w-4.5 text-primary" />
        </span>
        {item.status && <Badge tone={item.status.tone}>{item.status.label}</Badge>}
      </div>

      <Text variant="caption">{item.title}</Text>

      {item.loading ? (
        <Skeleton className="h-7 w-16" />
      ) : item.error ? (
        <Text variant="small" className="text-destructive">
          Indisponível
        </Text>
      ) : (
        <Text variant="h3" as="p" className={cn(item.empty && "text-muted-foreground")}>
          {item.value ?? "—"}
        </Text>
      )}

      {item.context && !item.loading && <Text variant="caption">{item.context}</Text>}

      {item.route && (
        <span className="mt-auto inline-flex items-center gap-1 pt-1 text-xs font-medium text-primary">
          {item.actionLabel ?? "Ver detalhes"}
          <icons.proximo className="h-3.5 w-3.5" aria-hidden />
        </span>
      )}
    </div>
  );

  if (!item.route) return body;
  return (
    <Link
      to={item.route}
      aria-label={`${item.title}: ${item.actionLabel ?? "ver detalhes"}`}
      className="block h-full rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
    >
      {body}
    </Link>
  );
}
