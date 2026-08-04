import { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/design-system/components/Button";
import { Text } from "@/design-system/components/Text";
import { Badge } from "@/design-system/components/Badge";
import type { QuickAction } from "../types";

/** Grade de ações rápidas, com expansão para as ações restantes. */
export function DashboardQuickActions({ actions, initial = 6 }: { actions: QuickAction[]; initial?: number }) {
  const [expandido, setExpandido] = useState(false);
  const visiveis = expandido ? actions : actions.slice(0, initial);
  const restantes = actions.length - visiveis.length;

  return (
    <div className="space-y-3">
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6">
        {visiveis.map((action) => {
          const Icon = action.icon;
          return (
            <li key={action.id}>
              <Link
                to={action.route}
                className="flex h-full flex-col items-center gap-2 rounded-xl border border-white/60 dark:border-white/10 bg-white/70 dark:bg-slate-900/40 p-4 text-center transition-all hover:border-primary/40 hover:bg-white/90 dark:hover:bg-slate-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 backdrop-blur-sm"
              >
                <span className="relative flex h-11 w-11 items-center justify-center rounded-full bg-primary/10" aria-hidden>
                  <Icon className="h-5 w-5 text-primary" />
                  {!!action.badge && (
                    <Badge tone="danger" className="absolute -right-2 -top-2 px-1.5 py-0">
                      {action.badge}
                    </Badge>
                  )}
                </span>
                <Text variant="small" className="font-medium">
                  {action.title}
                </Text>
                {action.description && (
                  <Text variant="caption" className="hidden md:block">
                    {action.description}
                  </Text>
                )}
              </Link>
            </li>
          );
        })}
      </ul>

      {(restantes > 0 || expandido) && (
        <Button variant="ghost" size="sm" onClick={() => setExpandido((v) => !v)}>
          {expandido ? "Mostrar menos ações" : `Ver todas as ações (${restantes})`}
        </Button>
      )}
    </div>
  );
}
