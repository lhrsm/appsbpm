/**
 * Mapa central de status do portal externo (Fase 4).
 *
 * REGRA: nenhuma página deve definir cor, rótulo ou ícone próprios para um status
 * já previsto aqui. Sempre use `getStatus(chave)`.
 */
import { icons, type LucideIcon } from "@/design-system/icons";
import type { BadgeTone } from "@/design-system/components/Badge";

export type StatusTone = BadgeTone;

export interface StatusConfig {
  label: string;
  tone: StatusTone;
  icon: LucideIcon;
  /** Descrição curta opcional, usada em StatusCard e tooltips. */
  description?: string;
}

/** Chaves canônicas de status. Termos sinônimos são normalizados por `getStatus`. */
export const statusConfig = {
  ativo: { label: "Ativo", tone: "success", icon: icons.sucesso },
  inativo: { label: "Inativo", tone: "neutral", icon: icons.erro },
  suspenso: { label: "Suspenso", tone: "warning", icon: icons.alerta },
  pendente: { label: "Pendente", tone: "warning", icon: icons.horario ?? icons.alerta },
  em_analise: { label: "Em análise", tone: "info", icon: icons.buscar },
  em_andamento: { label: "Em andamento", tone: "info", icon: icons.atualizar },
  concluido: { label: "Concluído", tone: "success", icon: icons.confirmar },
  cancelado: { label: "Cancelado", tone: "neutral", icon: icons.fechar },
  recusado: { label: "Recusado", tone: "danger", icon: icons.erro },
  vencido: { label: "Vencido", tone: "danger", icon: icons.alerta },
  novo: { label: "Novo", tone: "primary", icon: icons.info },
  nao_lido: { label: "Não lido", tone: "primary", icon: icons.notificacao },
  rascunho: { label: "Rascunho", tone: "neutral", icon: icons.editar },
  aguardando_integracao: {
    label: "Aguardando integração",
    tone: "warning",
    icon: icons.atualizar,
    description: "Este conteúdo depende da sincronização com a base institucional.",
  },
  sincronizando: { label: "Sincronizando", tone: "info", icon: icons.atualizar },
  divergencia: { label: "Com divergência", tone: "danger", icon: icons.alerta },
  indisponivel: { label: "Indisponível", tone: "danger", icon: icons.erro },
  demonstracao: {
    label: "Dados fictícios",
    tone: "warning",
    icon: icons.info,
    description: "Ambiente de demonstração — dados fictícios.",
  },
  atualizado: { label: "Atualizado", tone: "success", icon: icons.sucesso },
  sem_registro: { label: "Nenhum registro", tone: "neutral", icon: icons.vazio },
  nao_disponivel: { label: "Não disponível", tone: "neutral", icon: icons.info },
} as const satisfies Record<string, StatusConfig>;

export type StatusKey = keyof typeof statusConfig;

/** Sinônimos vindos de APIs/legado → chave canônica. */
const aliases: Record<string, StatusKey> = {
  active: "ativo",
  ativa: "ativo",
  inactive: "inativo",
  inativa: "inativo",
  pending: "pendente",
  aguardando: "pendente",
  aguardando_sincronizacao: "aguardando_integracao",
  processando: "em_andamento",
  em_processo: "em_andamento",
  in_progress: "em_andamento",
  analise: "em_analise",
  "em análise": "em_analise",
  concluida: "concluido",
  concluída: "concluido",
  finalizado: "concluido",
  done: "concluido",
  aprovado: "concluido",
  rejeitado: "recusado",
  negado: "recusado",
  expirado: "vencido",
  unread: "nao_lido",
  draft: "rascunho",
  mock: "demonstracao",
  demo: "demonstracao",
};

function normalize(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, "_");
}

/** Resolve qualquer texto de status para a configuração canônica. */
export function getStatus(value?: string | null, fallback: StatusKey = "nao_disponivel"): StatusConfig {
  if (!value) return statusConfig[fallback];
  const key = normalize(value);
  if (key in statusConfig) return statusConfig[key as StatusKey];
  const alias = aliases[key];
  if (alias) return statusConfig[alias];
  return { label: value, tone: "neutral", icon: icons.info };
}
