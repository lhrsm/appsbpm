import type { ReactNode } from "react";
import { cn } from "../utilities";
import { icons, type LucideIcon } from "../icons";
import { Text } from "./Text";

export interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  /** Ação principal (normalmente um `<Button>`). */
  action?: ReactNode;
  /** Versão reduzida, para uso dentro de cards. */
  compact?: boolean;
  className?: string;
}

/**
 * Estado vazio institucional.
 *
 * @example
 * <EmptyState icon={icons.documento} title="Nenhum informe" description="Ainda não há informes." action={<Button>Atualizar</Button>} />
 *
 * Uso recomendado: listas, tabelas e cards sem dados.
 * Uso não recomendado: erros de carregamento — use `Alert` com tom `danger`.
 */
export function EmptyState({ icon: Icon = icons.vazio, title, description, action, compact, className }: EmptyStateProps) {
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-2 py-6" : "gap-3 py-12",
        className,
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-muted text-muted-foreground",
          compact ? "h-10 w-10" : "h-14 w-14",
        )}
        aria-hidden
      >
        <Icon className={compact ? "h-5 w-5" : "h-7 w-7"} />
      </span>
      <Text variant={compact ? "h6" : "h5"}>{title}</Text>
      {description && (
        <Text variant="small" className="max-w-md text-muted-foreground">
          {description}
        </Text>
      )}
      {action && <div className="pt-2">{action}</div>}
    </div>
  );
}
