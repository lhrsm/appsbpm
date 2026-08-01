import type { HTMLAttributes, ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utilities";
import { icons, type LucideIcon } from "../icons";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      tone: {
        neutral: "border-border bg-muted text-muted-foreground",
        primary: "border-primary/30 bg-primary/10 text-primary",
        success: "border-[hsl(var(--success)/0.35)] bg-[hsl(var(--success)/0.12)] text-[hsl(var(--success))]",
        warning: "border-warning/40 bg-warning/15 text-warning-foreground",
        danger: "border-destructive/35 bg-destructive/10 text-destructive",
        info: "border-[hsl(var(--info)/0.35)] bg-[hsl(var(--info)/0.12)] text-[hsl(var(--info))]",
      },
    },
    defaultVariants: { tone: "neutral" },
  },
);

export type BadgeTone = NonNullable<VariantProps<typeof badgeVariants>["tone"]>;

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement>, VariantProps<typeof badgeVariants> {
  icon?: LucideIcon;
}

/**
 * Selo de status (não interativo).
 * @example <Badge tone="success" icon={icons.sucesso}>Ativo</Badge>
 *
 * Uso não recomendado: como botão — use `Chip` ou `Button`.
 */
export function Badge({ tone, icon: Icon, className, children, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ tone }), className)} {...props}>
      {Icon && <Icon className="h-3 w-3" aria-hidden />}
      {children}
    </span>
  );
}

export interface ChipProps {
  children: ReactNode;
  /** Marca o chip como selecionado (filtros). */
  selected?: boolean;
  onSelect?: () => void;
  /** Exibe botão de remoção. */
  onRemove?: () => void;
  icon?: LucideIcon;
  className?: string;
}

/**
 * Chip interativo para filtros e tags removíveis.
 * @example <Chip selected onSelect={toggle} onRemove={clear}>Salvador</Chip>
 */
export function Chip({ children, selected, onSelect, onRemove, icon: Icon, className }: ChipProps) {
  const Close = icons.fechar;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
        selected ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:bg-muted",
        className,
      )}
    >
      {Icon && <Icon className="h-3.5 w-3.5" aria-hidden />}
      {onSelect ? (
        <button
          type="button"
          onClick={onSelect}
          aria-pressed={!!selected}
          className="focus-visible:outline-none focus-visible:underline"
        >
          {children}
        </button>
      ) : (
        children
      )}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remover filtro"
          className="rounded-full p-0.5 hover:bg-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          <Close className="h-3 w-3" aria-hidden />
        </button>
      )}
    </span>
  );
}
