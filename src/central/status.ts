/**
 * Status padronizados da Central de Relacionamento (Fase 9, §6).
 *
 * REGRA: nunca escrever rótulo de status direto em componente. Sempre
 * `getCentralStatus(valor)`. Sinônimos vindos do banco/legado são normalizados.
 */
import { icons, type LucideIcon } from "@/design-system/icons";
import type { BadgeTone } from "@/design-system/components/Badge";
import type { CentralStatus, CentralPrioridade } from "./types";

export interface CentralStatusConfig {
  key: CentralStatus;
  label: string;
  tone: BadgeTone;
  icon: LucideIcon;
  descricao: string;
  /** Situação encerrada — habilita pedido de feedback e bloqueia novas ações. */
  finalizado?: boolean;
}

export const centralStatus: Record<CentralStatus, CentralStatusConfig> = {
  recebido: {
    key: "recebido",
    label: "Recebido",
    tone: "primary",
    icon: icons.confirmar,
    descricao: "Sua solicitação foi registrada e possui protocolo.",
  },
  em_analise: {
    key: "em_analise",
    label: "Em análise",
    tone: "info",
    icon: icons.buscar,
    descricao: "O setor responsável está avaliando o pedido.",
  },
  aguardando_documentos: {
    key: "aguardando_documentos",
    label: "Aguardando documentos",
    tone: "warning",
    icon: icons.pasta,
    descricao: "É necessário anexar documentos para a análise continuar.",
  },
  em_atendimento: {
    key: "em_atendimento",
    label: "Em atendimento",
    tone: "info",
    icon: icons.atualizar,
    descricao: "A equipe já está tratando a sua solicitação.",
  },
  respondido: {
    key: "respondido",
    label: "Respondido",
    tone: "success",
    icon: icons.comunicado,
    descricao: "Há uma resposta disponível para leitura.",
  },
  concluido: {
    key: "concluido",
    label: "Concluído",
    tone: "success",
    icon: icons.sucesso,
    descricao: "Atendimento finalizado.",
    finalizado: true,
  },
  cancelado: {
    key: "cancelado",
    label: "Cancelado",
    tone: "neutral",
    icon: icons.fechar,
    descricao: "A solicitação foi cancelada.",
    finalizado: true,
  },
  rejeitado: {
    key: "rejeitado",
    label: "Rejeitado",
    tone: "danger",
    icon: icons.erro,
    descricao: "O pedido não pôde ser atendido. Consulte a justificativa.",
    finalizado: true,
  },
  encaminhado: {
    key: "encaminhado",
    label: "Encaminhado",
    tone: "info",
    icon: icons.proximo,
    descricao: "A solicitação foi direcionada a outro setor.",
  },
  aguardando_integracao: {
    key: "aguardando_integracao",
    label: "Aguardando integração",
    tone: "warning",
    icon: icons.atualizar,
    descricao: "Depende da sincronização com o sistema interno da SBPM.",
  },
};

/** Sinônimos legados/BD → chave canônica. */
const aliases: Record<string, CentralStatus> = {
  aberto: "recebido",
  aberta: "recebido",
  nova: "recebido",
  novo: "recebido",
  pendente: "recebido",
  recebida: "recebido",
  analise: "em_analise",
  "em análise": "em_analise",
  em_andamento: "em_atendimento",
  andamento: "em_atendimento",
  in_progress: "em_atendimento",
  atendimento: "em_atendimento",
  aguardando_documento: "aguardando_documentos",
  aguardando_anexo: "aguardando_documentos",
  respondida: "respondido",
  finalizado: "concluido",
  finalizada: "concluido",
  concluida: "concluido",
  concluída: "concluido",
  fechada: "concluido",
  fechado: "concluido",
  done: "concluido",
  cancelada: "cancelado",
  recusado: "rejeitado",
  recusada: "rejeitado",
  negado: "rejeitado",
  indeferido: "rejeitado",
  encaminhada: "encaminhado",
  aguardando_sincronizacao: "aguardando_integracao",
};

/** Normaliza qualquer texto de status para uma chave canônica da Central. */
export function normalizeCentralStatus(value?: string | null): CentralStatus {
  if (!value) return "recebido";
  const key = value.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (key in centralStatus) return key as CentralStatus;
  return aliases[key] ?? "em_analise";
}

/** Configuração visual de um status (rótulo, tom e ícone). */
export function getCentralStatus(value?: string | null): CentralStatusConfig {
  return centralStatus[normalizeCentralStatus(value)];
}

/** Status considerados "em aberto" para contadores do dashboard. */
export const statusEmAberto: CentralStatus[] = [
  "recebido",
  "em_analise",
  "aguardando_documentos",
  "em_atendimento",
  "encaminhado",
  "aguardando_integracao",
];

export const isEmAberto = (value?: string | null) => statusEmAberto.includes(normalizeCentralStatus(value));
export const isFinalizado = (value?: string | null) => !!getCentralStatus(value).finalizado;

/* ---------------------------------------------------------- Prioridade */

export const prioridadeConfig: Record<CentralPrioridade, { label: string; tone: BadgeTone; icon: LucideIcon }> = {
  baixa: { label: "Baixa", tone: "neutral", icon: icons.info },
  media: { label: "Média", tone: "info", icon: icons.info },
  alta: { label: "Alta", tone: "warning", icon: icons.alerta },
  urgente: { label: "Urgente", tone: "danger", icon: icons.alerta },
};

export function getPrioridade(value?: string | null) {
  const key = (value ?? "media").toLowerCase();
  if (key === "normal") return prioridadeConfig.media;
  return prioridadeConfig[(key as CentralPrioridade) in prioridadeConfig ? (key as CentralPrioridade) : "media"];
}
