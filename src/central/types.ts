/**
 * Central de Relacionamento SBPM — contratos de dados (Fase 9).
 *
 * Estes tipos são o CONTRATO entre a interface e a fonte de dados. Hoje a fonte
 * é um serviço local (mock + portal seguro); amanhã será o SBPMSanitas. Ao trocar
 * a implementação do serviço (`src/central/service`), nenhuma tela precisa mudar.
 */
import type { LucideIcon } from "@/design-system/icons";

/* ---------------------------------------------------------- Status */

/** Status canônicos da Central. Nenhum módulo pode inventar rótulo novo. */
export type CentralStatus =
  | "recebido"
  | "em_analise"
  | "aguardando_documentos"
  | "em_atendimento"
  | "respondido"
  | "concluido"
  | "cancelado"
  | "rejeitado"
  | "encaminhado"
  | "aguardando_integracao";

export type CentralPrioridade = "baixa" | "media" | "alta" | "urgente";

/** De onde a solicitação entrou — importante para a futura integração. */
export type CentralOrigem = "portal" | "whatsapp" | "presencial" | "telefone" | "email" | "integracao";

/* ---------------------------------------------------------- Protocolo */

export interface CentralAnexo {
  id: string;
  nome: string;
  tamanho?: number | null;
  tipo?: string | null;
  /** URL temporária — nunca persistir no cliente. */
  url?: string | null;
  enviadoEm?: string | null;
  enviadoPor?: string | null;
}

export interface CentralTimelineEvento {
  id: string;
  tipo:
    | "criada"
    | "anexo"
    | "resposta"
    | "encaminhada"
    | "atualizada"
    | "concluida"
    | "cancelada"
    | "feedback";
  titulo: string;
  descricao?: string | null;
  /** ISO 8601. */
  data: string;
  responsavel?: string | null;
  status?: CentralStatus | null;
}

export interface CentralProtocolo {
  id: string;
  /** Formato institucional SBPM-AAAA-000000000. */
  protocolo: string;
  modulo: string;
  assunto: string;
  descricao: string;
  status: CentralStatus;
  prioridade: CentralPrioridade;
  origem: CentralOrigem;
  responsavel?: string | null;
  criadoEm: string;
  atualizadoEm: string;
  prazoEm?: string | null;
  resposta?: string | null;
  anexos: CentralAnexo[];
  historico: CentralTimelineEvento[];
  /** Já avaliado pelo usuário? Evita pedir feedback duas vezes. */
  avaliado?: boolean;
}

export interface NovaSolicitacaoInput {
  modulo: string;
  assunto: string;
  descricao: string;
  prioridade: CentralPrioridade;
  anexos?: File[];
}

/* ---------------------------------------------------------- Conteúdo */

export interface CentralFaq {
  id: string;
  categoria: string;
  pergunta: string;
  resposta: string;
  tags: string[];
  relacionados?: string[];
  atualizadoEm?: string | null;
}

export interface CentralDownload {
  id: string;
  nome: string;
  categoria: string;
  descricao?: string;
  versao?: string;
  atualizadoEm?: string | null;
  url?: string | null;
  formato?: string;
}

export interface CentralContato {
  id: string;
  setor: string;
  descricao: string;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  horario: string;
  localizacao?: string;
  icon: LucideIcon;
}

export interface CentralNoticia {
  id: string;
  titulo: string;
  resumo: string;
  conteudo?: string;
  categoria: string;
  data: string;
  autor: string;
  imagemUrl?: string | null;
  destaque?: boolean;
}

export interface CentralAviso {
  id: string;
  titulo: string;
  mensagem: string;
  prioridade: "alta" | "media" | "baixa";
  fixado?: boolean;
  publicadoEm: string;
  expiraEm?: string | null;
  route?: string;
}

export interface CentralFeedback {
  protocoloId: string;
  nota: number;
  satisfacao: "muito_insatisfeito" | "insatisfeito" | "neutro" | "satisfeito" | "muito_satisfeito";
  tempoAtendimento: "muito_rapido" | "adequado" | "demorado";
  comentario?: string;
}

/* ---------------------------------------------------------- Pesquisa */

export type CentralSearchTipo =
  | "faq"
  | "tutorial"
  | "solicitacao"
  | "documento"
  | "noticia"
  | "parceiro"
  | "beneficio"
  | "evento";

export interface CentralSearchResult {
  id: string;
  tipo: CentralSearchTipo;
  titulo: string;
  descricao?: string;
  route: string;
  /** Peso simples de relevância — maior aparece primeiro. */
  score?: number;
}
