import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { icons, type LucideIcon } from "@/design-system/icons";
import { PortalButton } from "@/portal/forms/buttons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { hasPermission, type PermissionSet } from "./types";

export interface RecordAction<T> {
  id: string;
  label: string;
  icon?: LucideIcon;
  onSelect: (row: T) => void;
  /** Ação principal — renderiza botão direto em vez de item de menu. */
  primary?: boolean;
  tone?: "default" | "danger";
  permission?: string;
  disabled?: (row: T) => boolean;
  hidden?: (row: T) => boolean;
}

export interface RowActionsProps<T> {
  row: T;
  actions: RecordAction<T>[];
  permissions?: PermissionSet;
  /** Rótulo acessível do menu (ex.: nome/protocolo do registro). */
  recordLabel?: string;
  className?: string;
}

/**
 * Ações de um registro: ação principal em botão + demais em menu acessível.
 * Ações sem permissão simplesmente não são renderizadas.
 */
export function RowActions<T>({ row, actions, permissions, recordLabel, className }: RowActionsProps<T>) {
  const allowed = actions.filter(
    (a) => hasPermission(permissions, a.permission) && !a.hidden?.(row),
  );
  if (!allowed.length) return null;

  const primary = allowed.filter((a) => a.primary);
  const secondary = allowed.filter((a) => !a.primary);

  return (
    <div className={cn("flex items-center justify-end gap-1", className)}>
      {primary.map((action) => (
        <PortalButton
          key={action.id}
          variant="outline"
          size="small"
          iconLeft={action.icon}
          disabled={action.disabled?.(row)}
          onClick={(e) => {
            e.stopPropagation();
            action.onSelect(row);
          }}
        >
          {action.label}
        </PortalButton>
      ))}
      {secondary.length > 0 && (
        <RecordActionMenu row={row} actions={secondary} recordLabel={recordLabel} />
      )}
    </div>
  );
}

export interface RecordActionMenuProps<T> {
  row: T;
  actions: RecordAction<T>[];
  recordLabel?: string;
  trigger?: ReactNode;
}

/** Menu "mais opções" de um registro (teclado, Escape e foco pelo Radix). */
export function RecordActionMenu<T>({ row, actions, recordLabel, trigger }: RecordActionMenuProps<T>) {
  if (!actions.length) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {trigger ?? (
          <button
            type="button"
            aria-label={recordLabel ? `Mais ações para ${recordLabel}` : "Mais ações"}
            onClick={(e) => e.stopPropagation()}
            className="flex h-11 w-11 items-center justify-center rounded-[12px] text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <icons.menu className="h-4 w-4" aria-hidden />
          </button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" collisionPadding={12} className="min-w-[12rem]">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const danger = action.tone === "danger";
          return (
            <div key={action.id}>
              {danger && index > 0 && <DropdownMenuSeparator />}
              <DropdownMenuItem
                disabled={action.disabled?.(row)}
                onSelect={(e) => {
                  e.stopPropagation();
                  action.onSelect(row);
                }}
                className={cn("gap-2", danger && "text-destructive focus:text-destructive")}
              >
                {Icon && <Icon className="h-4 w-4" aria-hidden />}
                {action.label}
              </DropdownMenuItem>
            </div>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
