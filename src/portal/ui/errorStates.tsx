import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Text } from "@/design-system/components/Text";
import { Button } from "@/design-system/components/Button";
import { icons, type LucideIcon } from "@/design-system/icons";

const SUPPORT_WHATSAPP = "https://wa.me/5571985496972";

export interface SectionErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  /** Rota da página completa, oferecida como alternativa. */
  fullPageRoute?: string;
  /** Versão reduzida, para uso dentro de cards. */
  compact?: boolean;
  className?: string;
}

/**
 * Falha isolada de uma seção. Nunca bloqueia a página inteira.
 * @example <SectionErrorState description="Não foi possível carregar suas solicitações." onRetry={recarregar} />
 */
export function SectionErrorState({
  title = "Não foi possível carregar esta informação",
  description,
  onRetry,
  fullPageRoute,
  compact,
  className,
}: SectionErrorStateProps) {
  const Alerta = icons.alerta;
  return (
    <div
      role="alert"
      aria-live="polite"
      className={cn(
        "flex flex-col gap-3 rounded-[18px] border border-warning/40 bg-white/50 backdrop-blur-md text-left",
        compact ? "p-4" : "p-5",
        className,
      )}
    >

      <div className="flex gap-3">
        <Alerta className="h-5 w-5 shrink-0 text-warning" aria-hidden />
        <div className="min-w-0">
          <Text variant="small" className="font-semibold">
            {title}
          </Text>
          {description && <Text variant="caption">{description}</Text>}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {onRetry && (
          <Button size="sm" variant="secondary" leftIcon={icons.atualizar} onClick={onRetry}>
            Tentar novamente
          </Button>
        )}
        {fullPageRoute && (
          <Button size="sm" variant="ghost" asChild>
            <Link to={fullPageRoute}>Acessar página completa</Link>
          </Button>
        )}
        <Button size="sm" variant="ghost" asChild>
          <a href={SUPPORT_WHATSAPP} target="_blank" rel="noopener noreferrer">
            Falar com o suporte
          </a>
        </Button>
      </div>
    </div>
  );
}

export interface PageErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  onBack?: () => void;
  homeRoute?: string;
  className?: string;
}

/**
 * Erro de página inteira (rota indisponível, sessão inválida, serviço fora do ar).
 * Nunca exibe detalhes técnicos.
 */
export function PageErrorState({
  title = "Não foi possível exibir esta página",
  description = "Tente novamente em instantes. Se o problema continuar, fale com o suporte.",
  onRetry,
  onBack,
  homeRoute = "/dashboard",
  className,
}: PageErrorStateProps) {
  const Alerta = icons.alerta;
  return (
    <div
      role="alert"
      className={cn("flex flex-col items-center gap-4 rounded-[18px] border bg-card p-8 text-center", className)}
    >

      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10" aria-hidden>
        <Alerta className="h-6 w-6 text-destructive" />
      </span>
      <div>
        <Text variant="h5" as="h2">
          {title}
        </Text>
        <Text variant="small" className="mt-1 text-muted-foreground">
          {description}
        </Text>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {onRetry && (
          <Button leftIcon={icons.atualizar} onClick={onRetry}>
            Tentar novamente
          </Button>
        )}
        {onBack && (
          <Button variant="secondary" leftIcon={icons.anterior} onClick={onBack}>
            Voltar
          </Button>
        )}
        <Button variant="secondary" asChild>
          <Link to={homeRoute}>Ir para o início</Link>
        </Button>
        <Button variant="ghost" asChild>
          <a href={SUPPORT_WHATSAPP} target="_blank" rel="noopener noreferrer">
            Falar com o suporte
          </a>
        </Button>
      </div>
    </div>
  );
}

export interface AccessRestrictedStateProps {
  description?: string;
  homeRoute?: string;
  helpRoute?: string;
  className?: string;
}

/**
 * Acesso não permitido ao perfil atual. Não revela a existência de dados restritos.
 */
export function AccessRestrictedState({
  description = "Você não possui permissão para acessar este conteúdo.",
  homeRoute = "/dashboard",
  helpRoute = "/faq",
  className,
}: AccessRestrictedStateProps) {
  const Lock = icons.lgpd;
  return (
    <div
      role="status"
      className={cn("flex flex-col items-center gap-4 rounded-[18px] border bg-card p-8 text-center", className)}
    >

      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted" aria-hidden>
        <Lock className="h-6 w-6 text-muted-foreground" />
      </span>
      <div>
        <Text variant="h5" as="h2">
          Acesso restrito
        </Text>
        <Text variant="small" className="mt-1 text-muted-foreground">
          {description}
        </Text>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        <Button asChild>
          <Link to={homeRoute}>Voltar ao início</Link>
        </Button>
        <Button variant="secondary" asChild>
          <Link to={helpRoute}>Consultar ajuda</Link>
        </Button>
        <Button variant="ghost" asChild>
          <a href={SUPPORT_WHATSAPP} target="_blank" rel="noopener noreferrer">
            Solicitar orientação
          </a>
        </Button>
      </div>
    </div>
  );
}

export type IntegrationPendingReason =
  | "nao_configurada"
  | "importacao_pendente"
  | "sincronizando"
  | "divergencia"
  | "indisponivel";

const integrationCopy: Record<IntegrationPendingReason, string> = {
  nao_configurada: "A integração com a base institucional ainda não foi configurada.",
  importacao_pendente: "Os dados foram enviados e aguardam importação pela administração.",
  sincronizando: "A sincronização está em andamento. Consulte novamente em instantes.",
  divergencia: "Identificamos uma divergência nesta informação. A administração já foi notificada.",
  indisponivel: "A origem institucional está temporariamente indisponível.",
};

export interface IntegrationPendingStateProps {
  title?: string;
  reason?: IntegrationPendingReason;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
  className?: string;
}

/**
 * Conteúdo que depende de integração. Nunca simular dados reais para preencher a tela.
 */
export function IntegrationPendingState({
  title = "Informação aguardando integração",
  reason = "nao_configurada",
  description,
  action,
  compact,
  className,
}: IntegrationPendingStateProps) {
  const Sync = icons.atualizar;
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center gap-3 rounded-[18px] border border-dashed bg-muted/30 text-center",
        compact ? "p-4" : "p-6",
        className,
      )}
    >

      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-muted" aria-hidden>
        <Sync className="h-5 w-5 text-muted-foreground" />
      </span>
      <Text variant={compact ? "h6" : "h5"} as="p">
        {title}
      </Text>
      <Text variant="small" className="max-w-md text-muted-foreground">
        {description ??
          `Este conteúdo será disponibilizado após a sincronização com a base institucional. ${integrationCopy[reason]}`}
      </Text>
      {action}
    </div>
  );
}

/**
 * Aviso persistente de ambiente de demonstração.
 * @example <DemonstrationDataNotice />
 */
export function DemonstrationDataNotice({ className, inline }: { className?: string; inline?: boolean }) {
  const Info = icons.info;
  return (
    <p
      role="status"
      className={cn(
        "inline-flex items-center gap-2 rounded-full border border-warning/40 bg-warning/10 px-3 py-1 text-xs font-medium text-warning-foreground",
        !inline && "w-full justify-center rounded-[18px] py-2",
        className,
      )}
    >

      <Info className="h-3.5 w-3.5" aria-hidden />
      Ambiente de demonstração — dados fictícios.
    </p>
  );
}

export interface OfflineNoticeProps {
  /** Última atualização local disponível. */
  lastUpdated?: string | null;
  /** Recursos que continuam disponíveis sem conexão. */
  availableFeatures?: string[];
  onRetry?: () => void;
  retrying?: boolean;
  className?: string;
}

/**
 * Estado offline do PWA. Nunca simular sucesso de ações dependentes do backend.
 */
export function OfflineNotice({ lastUpdated, availableFeatures, onRetry, retrying, className }: OfflineNoticeProps) {
  const WifiOff = icons.erro;
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn("flex flex-col gap-3 rounded-[18px] border border-destructive/35 bg-destructive/[0.06] p-4", className)}
    >

      <div className="flex gap-3">
        <WifiOff className="h-5 w-5 shrink-0 text-destructive" aria-hidden />
        <div className="min-w-0 space-y-1">
          <Text variant="small" className="font-semibold">
            Você está sem conexão.
          </Text>
          <Text variant="caption">
            Consultas já carregadas continuam disponíveis. Envios de solicitações e downloads exigem internet.
          </Text>
          {availableFeatures && availableFeatures.length > 0 && (
            <Text variant="caption">Disponível offline: {availableFeatures.join(" · ")}</Text>
          )}
          {lastUpdated && <Text variant="caption">Última atualização local: {lastUpdated}</Text>}
        </div>
      </div>
      {onRetry && (
        <div>
          <Button size="sm" variant="secondary" leftIcon={icons.atualizar} loading={retrying} onClick={onRetry}>
            {retrying ? "Reconectando..." : "Tentar reconectar"}
          </Button>
        </div>
      )}
    </div>
  );
}

