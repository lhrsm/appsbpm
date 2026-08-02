import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { icons, type LucideIcon } from "@/design-system/icons";
import { Badge } from "@/design-system/components/Badge";
import { getStatus } from "@/portal/ui/status";
import { Skeleton } from "@/design-system/components/Skeleton";

export interface MobileRecordCardProps {
  title: ReactNode;
  subtitle?: ReactNode;
  /** Chave de status canônica (ver `getStatus`). */
  status?: string | null;
  icon?: LucideIcon;
  /** Pares rótulo/valor exibidos no corpo do card. */
  metadata?: { label: string; value: ReactNode }[];
  date?: ReactNode;
  /** Ação principal (botão) e menu de ações secundárias. */
  action?: ReactNode;
  menu?: ReactNode;
  onClick?: () => void;
  /** Nível do heading do título (acessibilidade). */
  headingLevel?: 2 | 3 | 4;
  className?: string;
}

/**
 * Card de registro para listagens no mobile/PWA.
 *
 * @example <MobileRecordCard title="2ª via de carteirinha" subtitle="#A1B2C3" status="em_analise" date="12/03/2026" action={<PortalButton size="small">Ver</PortalButton>} />
 *
 * Uso não recomendado: substituir a tabela no desktop — use `ResponsiveDataView`.
 */
export function MobileRecordCard({
  title,
  subtitle,
  status,
  icon: Icon,
  metadata,
  date,
  action,
  menu,
  onClick,
  headingLevel = 3,
  className,
}: MobileRecordCardProps) {
  const Heading = `h${headingLevel}` as "h2" | "h3" | "h4";
  const statusInfo = status ? getStatus(status) : undefined;

  const content = (
    <>
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-2">
          {Icon && (
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted text-muted-foreground" aria-hidden>
              <Icon className="h-4 w-4" />
            </span>
          )}
          <div className="min-w-0">
            <Heading className="truncate text-sm font-semibold text-foreground">{title}</Heading>
            {subtitle && <p className="mt-0.5 truncate text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {statusInfo && (
            <Badge tone={statusInfo.tone} icon={statusInfo.icon}>
              {statusInfo.label}
            </Badge>
          )}
          {menu}
        </div>
      </div>

      {metadata && metadata.length > 0 && (
        <dl className="mt-3 grid grid-cols-2 gap-x-3 gap-y-1.5">
          {metadata.map((item) => (
            <div key={item.label} className="min-w-0">
              <dt className="text-[11px] uppercase tracking-wide text-muted-foreground">{item.label}</dt>
              <dd className="truncate text-sm text-foreground">{item.value}</dd>
            </div>
          ))}
        </dl>
      )}

      {(date || action) && (
        <div className="mt-3 flex items-center justify-between gap-2">
          {date ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <icons.horario className="h-3.5 w-3.5" aria-hidden />
              {date}
            </span>
          ) : (
            <span />
          )}
          {action}
        </div>
      )}
    </>
  );

  const base = "rounded-[16px] border bg-card p-4 text-left ds-shadow-sm transition-colors";

  if (onClick) {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={onClick}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onClick();
          }
        }}
        className={cn(base, "cursor-pointer hover:bg-muted/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", className)}
      >
        {content}
      </div>
    );
  }

  return <article className={cn(base, className)}>{content}</article>;
}

/** Skeleton do card de registro mobile. */
export function MobileRecordCardSkeleton({ items = 3 }: { items?: number }) {
  return (
    <div className="space-y-3" aria-hidden>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="rounded-[16px] border bg-card p-4 ds-shadow-sm">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-1/3" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
          <div className="mt-4 flex items-center justify-between">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-9 w-24 rounded-[12px]" />
          </div>
        </div>
      ))}
    </div>
  );
}

/** Skeleton da barra de ferramentas (busca + filtros). */
export function ToolbarSkeleton() {
  return (
    <div className="flex flex-wrap items-center gap-2" aria-hidden>
      <Skeleton className="h-11 flex-1 min-w-[12rem] rounded-[12px]" />
      <Skeleton className="h-11 w-28 rounded-[12px]" />
      <Skeleton className="h-11 w-28 rounded-[12px]" />
    </div>
  );
}
