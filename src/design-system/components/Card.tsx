import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn, moduleAccent, moduleSurface, type ModuleContext } from "../utilities";
import { icons, type LucideIcon } from "../icons";
import { Text } from "./Text";
import { Skeleton } from "./Skeleton";
import { EmptyState } from "./EmptyState";
import { Badge, type BadgeTone } from "./Badge";

const cardVariants = cva("rounded-xl border bg-card text-card-foreground transition-shadow duration-200", {
  variants: {
    elevation: {
      flat: "",
      sm: "ds-shadow-sm",
      md: "ds-shadow-md",
      lg: "ds-shadow-lg",
    },
    interactive: {
      true: "cursor-pointer hover:ds-shadow-md hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      false: "",
    },
    padding: {
      none: "p-0",
      sm: "p-4",
      md: "p-5",
      lg: "p-6",
    },
  },
  defaultVariants: { elevation: "sm", interactive: false, padding: "md" },
});

export interface CardProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "title">,
    VariantProps<typeof cardVariants> {
  title?: ReactNode;
  subtitle?: ReactNode;
  icon?: LucideIcon;
  /** Cor de contexto do módulo institucional. */
  context?: ModuleContext;
  /** Selo de status exibido no canto superior direito. */
  status?: { label: string; tone?: BadgeTone };
  /** Rodapé (ações, links). */
  footer?: ReactNode;
  /** Exibe skeleton no lugar do conteúdo. */
  loading?: boolean;
  /** Exibe estado vazio no lugar do conteúdo. */
  empty?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
  children?: ReactNode;
}

/**
 * Card base — TODOS os cards da plataforma devem derivar deste componente.
 *
 * @example
 * <Card title="Limite disponível" subtitle="Convênio saúde" icon={icons.limite}>
 *   <Text variant="h2">72%</Text>
 * </Card>
 *
 * Uso recomendado: qualquer superfície de conteúdo agrupado.
 * Uso não recomendado: recriar `div className="rounded-xl border bg-card"` na página.
 */
export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  {
    title,
    subtitle,
    icon: Icon,
    context,
    status,
    footer,
    loading,
    empty,
    emptyTitle = "Nada por aqui",
    emptyDescription,
    elevation,
    interactive,
    padding,
    className,
    children,
    ...props
  },
  ref,
) {
  const hasHeader = Boolean(title || subtitle || Icon || status);
  return (
    <div ref={ref} className={cn(cardVariants({ elevation, interactive, padding }), className)} {...props}>
      {hasHeader && (
        <header className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            {Icon && (
              <span
                className={cn(
                  "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border",
                  context ? moduleSurface[context] : "border-primary/25 bg-primary/10",
                )}
                aria-hidden
              >
                <Icon className={cn("h-5 w-5", context ? moduleAccent[context] : "text-primary")} />
              </span>
            )}
            <div className="min-w-0">
              {title && <Text variant="h6" className="truncate">{title}</Text>}
              {subtitle && <Text variant="caption">{subtitle}</Text>}
            </div>
          </div>
          {status && <Badge tone={status.tone}>{status.label}</Badge>}
        </header>
      )}

      <div className={cn(hasHeader && (children || loading || empty) ? "mt-4" : "")}>
        {loading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : empty ? (
          <EmptyState icon={icons.vazio} title={emptyTitle} description={emptyDescription} compact />
        ) : (
          children
        )}
      </div>

      {footer && <footer className="mt-4 flex flex-wrap items-center gap-2 border-t pt-4">{footer}</footer>}
    </div>
  );
});

export interface StatCardProps extends Omit<CardProps, "children"> {
  /** Valor principal já formatado. */
  value: ReactNode;
  /** Texto auxiliar abaixo do valor. */
  hint?: ReactNode;
}

/**
 * Card de estatística simples.
 * @example <StatCard title="Dependentes" value={3} icon={icons.dependentes} />
 */
export function StatCard({ value, hint, ...card }: StatCardProps) {
  return (
    <Card {...card}>
      <Text variant="h2" as="p">{value}</Text>
      {hint && <Text variant="caption">{hint}</Text>}
    </Card>
  );
}

export interface MetricCardProps extends StatCardProps {
  /** Variação percentual; positivo sobe, negativo desce. */
  trend?: number;
  trendLabel?: string;
}

/**
 * Card de métrica com indicador de tendência.
 * @example <MetricCard title="Adesões" value="128" trend={12} trendLabel="vs. mês anterior" />
 */
export function MetricCard({ trend, trendLabel, value, hint, ...card }: MetricCardProps) {
  const Up = icons.analytics;
  const positive = (trend ?? 0) >= 0;
  return (
    <Card {...card}>
      <Text variant="h2" as="p">{value}</Text>
      {typeof trend === "number" && (
        <p
          className={cn(
            "mt-1 flex items-center gap-1 text-xs font-medium",
            positive ? "text-[hsl(var(--success))]" : "text-destructive",
          )}
        >
          <Up className={cn("h-3.5 w-3.5", !positive && "rotate-180")} aria-hidden />
          <span>
            {positive ? "+" : ""}
            {trend}%
          </span>
          {trendLabel && <span className="font-normal text-muted-foreground">{trendLabel}</span>}
        </p>
      )}
      {hint && <Text variant="caption">{hint}</Text>}
    </Card>
  );
}

export interface InfoCardProps extends Omit<CardProps, "children"> {
  /** Pares rótulo/valor exibidos em lista de definição. */
  items: Array<{ label: string; value: ReactNode }>;
}

/**
 * Card de dados cadastrais (lista de definição acessível).
 * @example <InfoCard title="Dados" items={[{ label: "CPF", value: "***.123.456-**" }]} />
 */
export function InfoCard({ items, ...card }: InfoCardProps) {
  return (
    <Card {...card}>
      <dl className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="min-w-0">
            <dt className="text-xs text-muted-foreground">{item.label}</dt>
            <dd className="text-sm font-medium break-words">{item.value ?? "—"}</dd>
          </div>
        ))}
      </dl>
    </Card>
  );
}

export interface ActionCardProps extends Omit<CardProps, "onClick"> {
  /** Ação executada ao clicar/pressionar Enter. */
  onAction?: () => void;
}

/**
 * Card clicável de navegação (atalhos do painel). Acessível via teclado.
 * @example <ActionCard title="Carteirinha" icon={icons.carteirinha} onAction={() => nav('/carteirinha')} />
 */
export function ActionCard({ onAction, children, ...card }: ActionCardProps) {
  const Chevron = icons.proximo;
  return (
    <Card
      {...card}
      interactive
      role="button"
      tabIndex={0}
      onClick={onAction}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onAction?.();
        }
      }}
      footer={
        <span className="ml-auto flex items-center gap-1 text-sm font-medium text-primary">
          Acessar <Chevron className="h-4 w-4" aria-hidden />
        </span>
      }
    >
      {children}
    </Card>
  );
}

/**
 * Card de destaque do Portal do Associado/Dependente.
 * @example <PortalCard title="Assistência à Saúde" context="saude" icon={icons.saude} description="Rede credenciada" />
 */
export function PortalCard({
  description,
  context,
  ...card
}: Omit<CardProps, "children"> & { description?: ReactNode }) {
  return (
    <ActionCard {...card} context={context} elevation="md">
      {description && <Text variant="small" className="text-muted-foreground">{description}</Text>}
    </ActionCard>
  );
}
