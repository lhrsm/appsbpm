import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Text } from "@/design-system/components/Text";
import { Badge } from "@/design-system/components/Badge";
import { getStatus } from "@/portal/ui/status";
import { DataFreshnessIndicator } from "@/portal/ui/DataFreshnessIndicator";
import PortalBreadcrumbs from "./PortalBreadcrumbs";

export interface PortalPageHeaderProps {
  title: string;
  description?: ReactNode;
  /** Ação principal da página (um único botão). */
  action?: ReactNode;
  /** Ações secundárias exibidas à esquerda da principal. */
  secondaryActions?: ReactNode;
  /** Status canônico do conteúdo da página. */
  status?: string;
  /** Data ISO da última atualização do dado exibido. */
  updatedAt?: string | null;
  /** Origem do dado (ex.: "Base institucional"). */
  source?: string;
  /** Oculta a trilha de navegação (apenas na visão geral). */
  hideBreadcrumbs?: boolean;
  className?: string;
}

/**
 * Cabeçalho padrão de todas as páginas do portal externo (Fase 7).
 * Nenhuma página deve criar cabeçalho próprio.
 *
 * @example
 * <PortalPageHeader title="Meus dados" description="Informações cadastrais." status="ativo" updatedAt={iso} source="Base institucional" />
 */
export default function PortalPageHeader({
  title,
  description,
  action,
  secondaryActions,
  status,
  updatedAt,
  source,
  hideBreadcrumbs,
  className,
}: PortalPageHeaderProps) {
  const statusInfo = status ? getStatus(status) : undefined;

  return (
    <header className={cn("space-y-3", className)}>
      {!hideBreadcrumbs && <PortalBreadcrumbs />}

      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0 space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <Text as="h1" variant="h3" className="min-w-0 break-words">
              {title}
            </Text>
            {statusInfo && (
              <Badge tone={statusInfo.tone} icon={statusInfo.icon}>
                {statusInfo.label}
              </Badge>
            )}
          </div>
          {description && (
            <Text variant="small" className="max-w-2xl text-muted-foreground">
              {description}
            </Text>
          )}
          {(updatedAt || source) && (
            <DataFreshnessIndicator date={updatedAt ?? undefined} source={source} />
          )}
        </div>

        {(action || secondaryActions) && (
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center md:shrink-0">
            {secondaryActions}
            {action}
          </div>
        )}
      </div>
    </header>
  );
}
