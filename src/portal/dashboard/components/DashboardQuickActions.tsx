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
      <ul className="grid grid-cols-2 gap-5 md:gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-6 px-4 md:px-0">
        {visiveis.map((action) => {
          const Icon = action.icon;
          return (
            <li key={action.id}>
              <Link
                to={action.route}
                className="flex h-full flex-col items-center gap-2 rounded-[18px] md:rounded-xl border border-[var(--portal-modal-border-light)]/40 dark:border-[var(--portal-modal-border-dark)]/40 bg-[var(--portal-modal-bg-light)]/70 dark:bg-[var(--portal-modal-bg-dark)]/40 p-5 md:p-4 text-center transition-all hover:border-primary/40 hover:bg-white/90 dark:hover:bg-slate-900/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 backdrop-blur-sm shadow-sm md:shadow-none"
              >
                <span className="relative flex h-11 w-11 items-center justify-center portal-icon-circle-green" aria-hidden>
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

    </div>
  );
}
