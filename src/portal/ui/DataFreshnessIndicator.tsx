import { cn } from "@/lib/utils";
import { icons } from "@/design-system/icons";

export type FreshnessStatus =
  | "atualizado"
  | "aguardando"
  | "processando"
  | "divergencia"
  | "indisponivel"
  | "demonstracao"
  | "offline";

const freshnessCopy: Record<FreshnessStatus, { text: string; className: string }> = {
  atualizado: { text: "Atualizado", className: "text-muted-foreground" },
  aguardando: { text: "Aguardando sincronização", className: "text-warning-foreground" },
  processando: { text: "Em processamento", className: "text-muted-foreground" },
  divergencia: { text: "Com divergência", className: "text-destructive" },
  indisponivel: { text: "Origem indisponível", className: "text-destructive" },
  demonstracao: { text: "Ambiente de demonstração — dados fictícios.", className: "text-warning-foreground" },
  offline: { text: "Dados locais (sem conexão)", className: "text-warning-foreground" },
};

export interface DataFreshnessIndicatorProps {
  /** Data ISO da última atualização. */
  date?: string | null;
  status?: FreshnessStatus;
  /** Origem do dado (ex.: "Base institucional"). */
  source?: string;
  className?: string;
}

/**
 * Carimbo padrão de atualização e origem do dado.
 * @example <DataFreshnessIndicator date={dados.atualizadoEm} status="atualizado" />
 */
export function DataFreshnessIndicator({
  date,
  status = "atualizado",
  source,
  className,
}: DataFreshnessIndicatorProps) {
  const info = freshnessCopy[status];
  const formatted = date
    ? new Date(date).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

  return (
    <p className={cn("flex items-center gap-1.5 text-xs", info.className, className)}>
      <icons.horario className="h-3.5 w-3.5 shrink-0" aria-hidden />
      <span>
        {status === "demonstracao" || !formatted
          ? info.text
          : `Dados atualizados em ${formatted} · ${info.text}`}
        {source ? ` · ${source}` : ""}
      </span>
    </p>
  );
}
