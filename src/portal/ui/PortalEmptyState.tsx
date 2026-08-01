import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Text } from "@/design-system/components/Text";
import { Button } from "@/design-system/components/Button";
import { icons, type LucideIcon } from "@/design-system/icons";

export type EmptyStateSize = "compact" | "regular" | "full-section";

export interface PortalEmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: ReactNode;
  /** Ação principal (normalmente um `<Button>`). */
  action?: ReactNode;
  secondaryAction?: ReactNode;
  size?: EmptyStateSize;
  className?: string;
}

/**
 * Estado vazio institucional do portal.
 *
 * @example <PortalEmptyState {...emptyStates.dependentes} action={<Button>Adicionar</Button>} />
 *
 * Uso não recomendado: falha de carregamento — use `SectionErrorState`.
 */
export function PortalEmptyState({
  icon: Icon = icons.vazio,
  title,
  description,
  action,
  secondaryAction,
  size = "regular",
  className,
}: PortalEmptyStateProps) {
  const compact = size === "compact";
  return (
    <div
      role="status"
      className={cn(
        "flex flex-col items-center justify-center text-center",
        compact ? "gap-2 py-6" : size === "full-section" ? "gap-4 py-16" : "gap-3 py-12",
        className,
      )}
    >
      <span
        className={cn(
          "flex items-center justify-center rounded-full bg-muted text-muted-foreground",
          compact ? "h-10 w-10" : size === "full-section" ? "h-16 w-16" : "h-14 w-14",
        )}
        aria-hidden
      >
        <Icon className={compact ? "h-5 w-5" : size === "full-section" ? "h-8 w-8" : "h-7 w-7"} />
      </span>
      <Text variant={compact ? "h6" : "h5"} as="p">
        {title}
      </Text>
      {description && (
        <Text variant="small" className="max-w-md text-muted-foreground">
          {description}
        </Text>
      )}
      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}

/** Mensagens específicas por contexto — evita o genérico "Nenhum dado encontrado". */
export const emptyStates = {
  dependentes: {
    icon: icons.dependentes,
    title: "Nenhum dependente cadastrado",
    description: "Você não possui dependentes cadastrados.",
  },
  solicitacoes: {
    icon: icons.solicitacao,
    title: "Nenhuma solicitação",
    description: "Você ainda não realizou solicitações.",
  },
  documentos: {
    icon: icons.documento,
    title: "Nenhum documento",
    description: "Nenhum documento disponível no momento.",
  },
  notificacoes: {
    icon: icons.notificacao,
    title: "Tudo certo por aqui",
    description: "Você não possui notificações pendentes.",
  },
  eventos: {
    icon: icons.info,
    title: "Sem eventos programados",
    description: "Não há eventos programados.",
  },
  parceiros: {
    icon: icons.saude,
    title: "Nenhum parceiro localizado",
    description: "Nenhum parceiro foi localizado com os filtros informados.",
  },
  historico: {
    icon: icons.info,
    title: "Sem movimentações",
    description: "Ainda não há movimentações registradas.",
  },
  mensagens: {
    icon: icons.notificacao,
    title: "Nenhuma mensagem",
    description: "Você não possui mensagens institucionais no momento.",
  },
} satisfies Record<string, { icon: LucideIcon; title: string; description: string }>;

export interface SearchEmptyStateProps {
  /** Termo pesquisado, exibido na mensagem. */
  term?: string;
  /** Filtros aplicados, exibidos como texto auxiliar. */
  filters?: string[];
  onClearFilters?: () => void;
  supportAction?: ReactNode;
  className?: string;
}

/**
 * Estado vazio específico de busca/filtros.
 * @example <SearchEmptyState term="cardiologia" filters={["Salvador"]} onClearFilters={reset} />
 */
export function SearchEmptyState({ term, filters, onClearFilters, supportAction, className }: SearchEmptyStateProps) {
  return (
    <PortalEmptyState
      className={className}
      icon={icons.buscar}
      title={term ? `Não encontramos resultados para “${term}”.` : "Nenhum resultado encontrado"}
      description={
        <span className="block space-y-1">
          <span className="block">Sugestões: verifique a escrita, utilize termos mais gerais ou remova filtros.</span>
          {filters && filters.length > 0 && (
            <span className="block text-xs">Filtros aplicados: {filters.join(" · ")}</span>
          )}
        </span>
      }
      action={
        onClearFilters ? (
          <Button size="sm" variant="secondary" leftIcon={icons.filtrar} onClick={onClearFilters}>
            Limpar filtros
          </Button>
        ) : undefined
      }
      secondaryAction={supportAction}
    />
  );
}
