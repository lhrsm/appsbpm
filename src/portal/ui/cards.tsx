import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Text } from "@/design-system/components/Text";
import { Badge } from "@/design-system/components/Badge";
import { Avatar } from "@/design-system/components/Avatar";
import { Progress } from "@/design-system/components/Feedback";
import { icons, type LucideIcon } from "@/design-system/icons";
import { PortalCard, type PortalCardProps } from "./PortalCard";
import { getStatus, type StatusKey } from "./status";
import { DataFreshnessIndicator, type FreshnessStatus } from "./DataFreshnessIndicator";
import { StatCardSkeleton } from "./skeletons";

/* ------------------------------------------------------------------ StatCard */

export interface StatCardProps extends Omit<PortalCardProps, "children" | "status"> {
  /** Valor principal já formatado. `null`/`undefined` cai em `emptyLabel`. */
  value?: ReactNode;
  /** Texto de contexto sob o valor. */
  context?: ReactNode;
  trend?: number;
  trendLabel?: string;
  status?: StatusKey | string;
  /** Rótulo exibido quando não há valor. */
  emptyLabel?: string;
  lastUpdated?: string | null;
  freshness?: FreshnessStatus;
  /** Rota de destino; torna o card navegável por completo. */
  to?: string;
}

/**
 * Indicador numérico simples (dependentes ativos, solicitações em andamento...).
 * Nunca exibe zero durante o carregamento.
 *
 * @example <StatCard title="Dependentes ativos" icon={icons.dependentes} value={3} />
 */
export function StatCard({
  value,
  context,
  trend,
  trendLabel,
  status,
  emptyLabel = "Não disponível",
  lastUpdated,
  freshness,
  loading,
  to,
  ...card
}: StatCardProps) {
  const Trend = icons.analytics;
  const positive = (trend ?? 0) >= 0;
  const hasValue = value !== null && value !== undefined && value !== "";

  const body = (
    <>
      {hasValue ? (
        <Text variant="h2" as="p">
          {value}
        </Text>
      ) : (
        <Text variant="h6" as="p" className="text-muted-foreground">
          {emptyLabel}
        </Text>
      )}
      {typeof trend === "number" && (
        <p
          className={cn(
            "mt-1 flex items-center gap-1 text-xs font-medium",
            positive ? "text-[hsl(var(--success))]" : "text-destructive",
          )}
        >
          <Trend className={cn("h-3.5 w-3.5", !positive && "rotate-180")} aria-hidden />
          <span>
            {positive ? "+" : ""}
            {trend}%
          </span>
          {trendLabel && <span className="font-normal text-muted-foreground">{trendLabel}</span>}
        </p>
      )}
      {context && <Text variant="caption">{context}</Text>}
      {(lastUpdated || freshness) && (
        <DataFreshnessIndicator className="mt-2" date={lastUpdated} status={freshness} />
      )}
    </>
  );

  const content = (
    <PortalCard
      {...card}
      status={status}
      loading={loading}
      skeleton={<StatCardSkeleton />}
      interactive={Boolean(to)}
      density={card.density ?? "regular"}
    >
      {body}
    </PortalCard>
  );

  if (!to) return content;
  return (
    <Link to={to} className="block rounded-[16px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
      {content}
    </Link>
  );
}

/* ---------------------------------------------------------------- MetricCard */

export type MetricKind = "utilizado" | "disponivel" | "concluido" | "pendente" | "crescimento" | "reducao";

export interface MetricCardProps extends Omit<PortalCardProps, "children" | "status"> {
  primaryValue: ReactNode;
  secondaryValue?: ReactNode;
  percentage?: number;
  progress?: number;
  trend?: number;
  trendLabel?: string;
  period?: string;
  status?: StatusKey | string;
  /** Semântica do percentual — evita tratar todo percentual como progresso positivo. */
  kind?: MetricKind;
}

const metricTone: Record<MetricKind, "primary" | "success" | "warning" | "danger"> = {
  utilizado: "warning",
  disponivel: "success",
  concluido: "success",
  pendente: "warning",
  crescimento: "primary",
  reducao: "danger",
};

const metricLabel: Record<MetricKind, string> = {
  utilizado: "Utilizado",
  disponivel: "Disponível",
  concluido: "Concluído",
  pendente: "Pendente",
  crescimento: "Crescimento",
  reducao: "Redução",
};

/**
 * Métrica com valor principal, comparação, período e progresso semântico.
 * @example <MetricCard title="Solicitações" primaryValue="12" percentage={40} kind="concluido" />
 */
export function MetricCard({
  primaryValue,
  secondaryValue,
  percentage,
  progress,
  trend,
  trendLabel,
  period,
  status,
  kind = "concluido",
  ...card
}: MetricCardProps) {
  const Trend = icons.analytics;
  const positive = (trend ?? 0) >= 0;
  const barValue = progress ?? percentage;
  return (
    <PortalCard {...card} status={status}>
      <div className="flex flex-wrap items-baseline gap-2">
        <Text variant="h2" as="p">
          {primaryValue}
        </Text>
        {secondaryValue && <Text variant="small" className="text-muted-foreground">{secondaryValue}</Text>}
      </div>
      {typeof barValue === "number" && (
        <Progress
          className="mt-3"
          value={barValue}
          label={`${metricLabel[kind]}`}
          showValue
          tone={metricTone[kind]}
        />
      )}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {typeof trend === "number" && (
          <span
            className={cn(
              "flex items-center gap-1 text-xs font-medium",
              positive ? "text-[hsl(var(--success))]" : "text-destructive",
            )}
          >
            <Trend className={cn("h-3.5 w-3.5", !positive && "rotate-180")} aria-hidden />
            {positive ? "+" : ""}
            {trend}%
            {trendLabel && <span className="font-normal text-muted-foreground">{trendLabel}</span>}
          </span>
        )}
        {period && <Text variant="caption">{period}</Text>}
      </div>
    </PortalCard>
  );
}

/* ------------------------------------------------------------------ InfoCard */

export interface InfoCardItem {
  label: string;
  value: ReactNode;
}

export interface InfoCardProps extends Omit<PortalCardProps, "children"> {
  items?: InfoCardItem[];
  children?: ReactNode;
}

/**
 * Informações cadastrais e institucionais em lista de definição acessível.
 * @example <InfoCard title="Situação cadastral" items={[{ label: "Vínculo", value: "Titular" }]} />
 */
export function InfoCard({ items, children, ...card }: InfoCardProps) {
  return (
    <PortalCard {...card}>
      {items && items.length > 0 && (
        <dl className="grid gap-3 sm:grid-cols-2">
          {items.map((item) => (
            <div key={item.label} className="min-w-0">
              <dt className="text-xs text-muted-foreground">{item.label}</dt>
              <dd className="break-words text-sm font-medium">{item.value ?? "—"}</dd>
            </div>
          ))}
        </dl>
      )}
      {children}
    </PortalCard>
  );
}

/* ---------------------------------------------------------------- ActionCard */

export interface ActionCardProps extends Omit<PortalCardProps, "children" | "onClick" | "action"> {
  /** Rota de destino (preferencial). */
  to?: string;
  /** Ação executada ao acionar o card. */
  onAction?: () => void;
  /** Indisponível: card apresentado desabilitado com motivo. */
  unavailable?: boolean;
  unavailableReason?: string;
  /** Rótulo curto da ação. */
  actionLabel?: string;
}

/**
 * Atalho de serviço/ação rápida. Alvo de toque mínimo de 44px no mobile.
 * @example <ActionCard title="Carteirinha" icon={icons.carteirinha} to="/carteirinha" description="Ver e baixar" />
 */
export function ActionCard({
  to,
  onAction,
  unavailable,
  unavailableReason,
  actionLabel = "Acessar",
  description,
  title,
  icon: Icon,
  badge,
  status,
  className,
  ...card
}: ActionCardProps) {
  const Chevron = icons.proximo;

  const inner = (
    <span className="flex min-h-[44px] w-full items-center gap-3 text-left">
      {Icon && (
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10"
          aria-hidden
        >
          <Icon className="h-5 w-5 text-primary" />
        </span>
      )}
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <Text variant="h6" as="span" className="truncate">
            {title}
          </Text>
          {badge}
          {unavailable && <Badge tone="neutral">Indisponível</Badge>}
        </span>
        {(description || unavailableReason) && (
          <Text variant="caption" as="span" className="mt-0.5 block">
            {unavailable ? unavailableReason ?? "Recurso indisponível no momento." : description}
          </Text>
        )}
      </span>
      {!unavailable && (
        <span className="flex shrink-0 items-center gap-1 text-sm font-medium text-primary">
          <span className="sr-only sm:not-sr-only">{actionLabel}</span>
          <Chevron className="h-4 w-4" aria-hidden />
        </span>
      )}
    </span>
  );

  const shell = cn(
    "block rounded-[16px] border border-border bg-card p-4 ds-shadow-sm transition-shadow duration-200 motion-reduce:transition-none",
    unavailable
      ? "pointer-events-none opacity-60"
      : "hover:ds-shadow-md hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
    className,
  );

  if (unavailable) {
    return (
      <div className={shell} aria-disabled {...card}>
        {inner}
      </div>
    );
  }

  if (to) {
    return (
      <Link to={to} className={shell} aria-label={typeof title === "string" ? title : undefined}>
        {inner}
      </Link>
    );
  }

  return (
    <button type="button" onClick={onAction} className={cn(shell, "w-full text-left")}>
      {inner}
    </button>
  );
}

/* ---------------------------------------------------------------- StatusCard */

export interface StatusCardProps extends Omit<PortalCardProps, "children" | "status"> {
  status: StatusKey | string;
  /** Data associada ao status. */
  date?: string;
  /** Detalhes adicionais em lista. */
  details?: InfoCardItem[];
  children?: ReactNode;
}

/**
 * Situação de vínculo, solicitação, sincronização, documento ou segurança.
 * Sempre exibe ícone + texto + badge — nunca apenas cor.
 */
export function StatusCard({ status, date, details, description, children, ...card }: StatusCardProps) {
  const info = getStatus(status);
  const Icon = info.icon;
  return (
    <PortalCard {...card} icon={card.icon ?? Icon} status={status} description={description ?? info.description}>
      {date && <Text variant="caption">{date}</Text>}
      {details && details.length > 0 && (
        <dl className="mt-2 grid gap-2 sm:grid-cols-2">
          {details.map((d) => (
            <div key={d.label}>
              <dt className="text-xs text-muted-foreground">{d.label}</dt>
              <dd className="text-sm font-medium">{d.value ?? "—"}</dd>
            </div>
          ))}
        </dl>
      )}
      {children}
    </PortalCard>
  );
}

/* -------------------------------------------------------- ProfileSummaryCard */

export interface ProfileSummaryCardProps extends Omit<PortalCardProps, "children" | "title"> {
  /** Nome já mascarado pela camada de apresentação. */
  name: string;
  photoUrl?: string | null;
  /** Vínculo: Titular, Dependente... */
  bond?: string;
  /** Parentesco, quando dependente. */
  relationship?: string;
  /** Matrícula já mascarada. */
  maskedRegistration?: string;
  status?: StatusKey | string;
}

/**
 * Resumo de pessoa (titular, dependente, usuário).
 * Exibe apenas dados autorizados — nunca CPF completo, endereço, telefone,
 * nascimento, dados financeiros ou de saúde.
 */
export function ProfileSummaryCard({
  name,
  photoUrl,
  bond,
  relationship,
  maskedRegistration,
  status,
  action,
  ...card
}: ProfileSummaryCardProps) {
  const info = status ? getStatus(status) : null;
  return (
    <PortalCard {...card} density={card.density ?? "compact"}>
      <div className="flex items-center gap-3">
        <Avatar src={photoUrl} name={name} size="md" />
        <div className="min-w-0 flex-1">
          <Text variant="h6" as="p" className="truncate">
            {name}
          </Text>
          <Text variant="caption">
            {[bond, relationship, maskedRegistration].filter(Boolean).join(" · ") || "Vínculo não informado"}
          </Text>
        </div>
        {info && (
          <Badge tone={info.tone} icon={info.icon}>
            {info.label}
          </Badge>
        )}
      </div>
      {action && <div className="mt-3 flex flex-wrap gap-2">{action}</div>}
    </PortalCard>
  );
}

