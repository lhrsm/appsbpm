/**
 * Implementação atual do `RelationshipService` (Fase 9).
 *
 * Origem dos dados hoje:
 * - Protocolos: edge function segura `portal-associado` (ownership garantido lá).
 * - FAQ / avisos / notícias: tabelas institucionais públicas do portal.
 * - Downloads e assuntos: catálogo institucional local (ver `catalog.ts`).
 *
 * Quando o SBPMSanitas entrar, crie `sanitasService.ts` implementando o mesmo
 * contrato e troque a escolha em `index.ts`. Nenhuma tela precisa mudar.
 */
import { supabase } from "@/integrations/supabase/client";
import { portalCall } from "@/lib/portal";
import { getAssuntos } from "../catalog";
import { normalizarProtocolo, protocoloCombina } from "../protocolo";
import { normalizeCentralStatus } from "../status";
import type { RelationshipService } from "./RelationshipService";
import type {
  CentralAviso,
  CentralDownload,
  CentralFaq,
  CentralFeedback,
  CentralNoticia,
  CentralPrioridade,
  CentralProtocolo,
  CentralTimelineEvento,
  NovaSolicitacaoInput,
} from "../types";

interface SolicitacaoBruta {
  id: string;
  protocolo?: string | null;
  categoria?: string | null;
  assunto?: string | null;
  descricao?: string | null;
  status?: string | null;
  prioridade?: string | null;
  created_at: string;
  updated_at?: string | null;
  sla_prazo?: string | null;
  resposta?: string | null;
  respondido_em?: string | null;
  responsavel?: string | null;
  respondido_por?: string | null;
  anexos?: unknown;
  metadata?: Record<string, unknown> | null;
}

const prioridadeDe = (valor?: string | null): CentralPrioridade => {
  const v = (valor ?? "").toLowerCase();
  if (v === "urgente") return "urgente";
  if (v === "alta") return "alta";
  if (v === "baixa") return "baixa";
  return "media";
};

/** Reconstrói a timeline a partir dos campos disponíveis no registro. */
function montarHistorico(bruta: SolicitacaoBruta, anexos: CentralProtocolo["anexos"]): CentralTimelineEvento[] {
  const eventos: CentralTimelineEvento[] = [
    {
      id: `${bruta.id}-criada`,
      tipo: "criada",
      titulo: "Solicitação criada",
      descricao: "Protocolo gerado e encaminhado ao setor responsável.",
      data: bruta.created_at,
      responsavel: "Você",
      status: "recebido",
    },
  ];

  anexos.forEach((anexo, i) =>
    eventos.push({
      id: `${bruta.id}-anexo-${i}`,
      tipo: "anexo",
      titulo: "Documento anexado",
      descricao: anexo.nome,
      data: anexo.enviadoEm ?? bruta.created_at,
      responsavel: anexo.enviadoPor ?? "Você",
    }),
  );

  if (bruta.resposta) {
    eventos.push({
      id: `${bruta.id}-resposta`,
      tipo: "resposta",
      titulo: "Resposta registrada",
      descricao: bruta.resposta,
      data: bruta.respondido_em ?? bruta.updated_at ?? bruta.created_at,
      responsavel: bruta.responsavel ?? "Equipe SBPM",
      status: "respondido",
    });
  }

  const status = normalizeCentralStatus(bruta.status);
  if (status === "concluido") {
    eventos.push({
      id: `${bruta.id}-concluida`,
      tipo: "concluida",
      titulo: "Atendimento concluído",
      data: bruta.updated_at ?? bruta.created_at,
      responsavel: bruta.responsavel ?? "Equipe SBPM",
      status: "concluido",
    });
  } else if (status === "cancelado" || status === "rejeitado") {
    eventos.push({
      id: `${bruta.id}-encerrada`,
      tipo: "cancelada",
      titulo: status === "cancelado" ? "Solicitação cancelada" : "Solicitação rejeitada",
      data: bruta.updated_at ?? bruta.created_at,
      responsavel: bruta.responsavel ?? "Equipe SBPM",
      status,
    });
  } else if (bruta.updated_at && bruta.updated_at !== bruta.created_at && !bruta.resposta) {
    eventos.push({
      id: `${bruta.id}-atualizada`,
      tipo: "atualizada",
      titulo: "Situação atualizada",
      descricao: "O setor responsável atualizou o andamento.",
      data: bruta.updated_at,
      responsavel: bruta.responsavel ?? "Equipe SBPM",
      status,
    });
  }

  return eventos.sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime());
}

/** Converte o registro do backend no contrato da Central. */
export function normalizarProtocoloRegistro(bruta: SolicitacaoBruta): CentralProtocolo {
  const anexos = Array.isArray(bruta.anexos)
    ? (bruta.anexos as Array<Record<string, unknown>>).map((a, i) => ({
        id: String(a.id ?? `${bruta.id}-${i}`),
        nome: String(a.nome ?? a.name ?? `Anexo ${i + 1}`),
        tamanho: typeof a.tamanho === "number" ? a.tamanho : null,
        tipo: typeof a.tipo === "string" ? a.tipo : null,
        url: typeof a.url === "string" ? a.url : null,
        enviadoEm: typeof a.enviado_em === "string" ? a.enviado_em : bruta.created_at,
        enviadoPor: typeof a.enviado_por === "string" ? a.enviado_por : "Você",
      }))
    : [];

  const metadata = (bruta.metadata ?? {}) as Record<string, unknown>;
  const avaliacao = metadata.avaliacao as Record<string, unknown> | undefined;

  return {
    id: bruta.id,
    protocolo: normalizarProtocolo(
      (typeof metadata.protocolo === "string" ? metadata.protocolo : null) ?? bruta.protocolo,
      bruta.id,
      bruta.created_at,
    ),
    modulo: bruta.categoria ?? "outros",
    assunto: bruta.assunto ?? "Solicitação",
    descricao: bruta.descricao ?? "",
    status: normalizeCentralStatus(bruta.status),
    prioridade: prioridadeDe(bruta.prioridade),
    origem: (typeof metadata.origem === "string" ? metadata.origem : "portal") as CentralProtocolo["origem"],
    responsavel: bruta.responsavel ?? bruta.respondido_por ?? null,
    criadoEm: bruta.created_at,
    atualizadoEm: bruta.updated_at ?? bruta.created_at,
    prazoEm: bruta.sla_prazo ?? null,
    resposta: bruta.resposta ?? null,
    anexos,
    historico: montarHistorico(bruta, anexos),
    avaliado: !!avaliacao,
  };
}

/** Biblioteca institucional de downloads (catálogo local até o CMS existir). */
const downloadsInstitucionais: CentralDownload[] = [
  { id: "form-dependente", nome: "Formulário de inclusão de dependente", categoria: "formularios", descricao: "Solicitação de inclusão de dependente no vínculo do titular.", versao: "2.1", formato: "PDF", atualizadoEm: "2026-01-15" },
  { id: "form-peculio", nome: "Formulário de indicação de beneficiários do pecúlio", categoria: "formularios", descricao: "Indicação e alteração de beneficiários.", versao: "1.4", formato: "PDF", atualizadoEm: "2026-02-02" },
  { id: "form-reembolso", nome: "Formulário de solicitação de reembolso", categoria: "formularios", descricao: "Pedido de reembolso de despesas assistenciais.", versao: "1.0", formato: "PDF", atualizadoEm: "2025-11-20" },
  { id: "cartilha-portal", nome: "Cartilha do Portal do Associado", categoria: "cartilhas", descricao: "Guia rápido de uso do portal e do aplicativo.", versao: "2.0", formato: "PDF", atualizadoEm: "2026-03-10" },
  { id: "cartilha-saude", nome: "Cartilha da Assistência à Saúde", categoria: "cartilhas", descricao: "Como utilizar a rede credenciada.", versao: "1.2", formato: "PDF", atualizadoEm: "2025-12-05" },
  { id: "reg-peculio", nome: "Regulamento do Pecúlio", categoria: "regulamentos", descricao: "Regras, carências e condições do benefício.", versao: "3.0", formato: "PDF", atualizadoEm: "2026-01-30" },
  { id: "reg-associacao", nome: "Regulamento da Associação Premiada", categoria: "regulamentos", descricao: "Critérios do programa de indicação.", versao: "1.1", formato: "PDF", atualizadoEm: "2025-10-18" },
  { id: "estatuto", nome: "Estatuto Social da SBPM", categoria: "leis", descricao: "Estatuto vigente da entidade.", versao: "2024", formato: "PDF", atualizadoEm: "2024-08-12" },
  { id: "lgpd", nome: "Política de Privacidade e LGPD", categoria: "leis", descricao: "Tratamento de dados pessoais no portal.", versao: "1.3", formato: "PDF", atualizadoEm: "2026-02-20" },
  { id: "modelo-procuracao", nome: "Modelo de procuração", categoria: "modelos", descricao: "Representação do associado perante a SBPM.", versao: "1.0", formato: "DOCX", atualizadoEm: "2025-09-01" },
  { id: "modelo-declaracao", nome: "Modelo de declaração de dependência econômica", categoria: "modelos", versao: "1.0", formato: "DOCX", atualizadoEm: "2025-09-01" },
  { id: "decl-vinculo", nome: "Declaração de vínculo associativo", categoria: "declaracoes", descricao: "Emitida a pedido pela Previdência.", versao: "—", formato: "PDF", atualizadoEm: "2026-03-01" },
  { id: "relatorio-anual", nome: "Relatório institucional anual", categoria: "institucionais", descricao: "Prestação de contas e resultados do exercício.", versao: "2025", formato: "PDF", atualizadoEm: "2026-04-01" },
];

/** Prioridade do aviso derivada do tipo do comunicado institucional. */
const prioridadeAviso = (tipo?: string | null): CentralAviso["prioridade"] =>
  tipo === "alerta" ? "alta" : tipo === "promocao" ? "baixa" : "media";

export const portalService: RelationshipService = {
  origem: "Portal SBPM",

  async listarProtocolos() {
    const { itens } = await portalCall<{ itens: SolicitacaoBruta[] }>("solicitacoes_listar");
    return (itens ?? [])
      .map(normalizarProtocoloRegistro)
      .sort((a, b) => new Date(b.criadoEm).getTime() - new Date(a.criadoEm).getTime());
  },

  async obterProtocolo(idOuNumero) {
    const lista = await this.listarProtocolos();
    return (
      lista.find((p) => p.id === idOuNumero) ??
      lista.find((p) => protocoloCombina(p.protocolo, idOuNumero)) ??
      null
    );
  },

  async criarSolicitacao(input: NovaSolicitacaoInput) {
    const criada = await portalCall<{ item?: SolicitacaoBruta } & SolicitacaoBruta>("solicitacoes_criar", {
      categoria: input.modulo,
      assunto: input.assunto.slice(0, 190),
      descricao: input.descricao,
      prioridade: input.prioridade === "media" ? "normal" : input.prioridade,
    });
    const bruta = criada?.item ?? (criada as SolicitacaoBruta);
    return normalizarProtocoloRegistro({
      ...bruta,
      id: bruta?.id ?? crypto.randomUUID(),
      created_at: bruta?.created_at ?? new Date().toISOString(),
      categoria: bruta?.categoria ?? input.modulo,
      assunto: bruta?.assunto ?? input.assunto,
      descricao: bruta?.descricao ?? input.descricao,
      status: bruta?.status ?? "recebido",
    });
  },

  async enviarFeedback(feedback: CentralFeedback) {
    await portalCall("solicitacoes_feedback", {
      solicitacao_id: feedback.protocoloId,
      nota: feedback.nota,
      satisfacao: feedback.satisfacao,
      tempo_atendimento: feedback.tempoAtendimento,
      comentario: feedback.comentario ?? null,
    });
  },

  async listarFaq() {
    const { data } = await supabase
      .from("faq_items")
      .select("id, categoria, pergunta, resposta, ordem, updated_at")
      .eq("publicado", true)
      .order("categoria")
      .order("ordem");

    return (data ?? []).map((item) => ({
      id: item.id,
      categoria: item.categoria,
      pergunta: item.pergunta,
      resposta: item.resposta,
      tags: item.categoria ? [item.categoria] : [],
      atualizadoEm: (item as { updated_at?: string }).updated_at ?? null,
    })) satisfies CentralFaq[];
  },

  async listarDownloads() {
    return downloadsInstitucionais;
  },

  async listarNoticias() {
    const { data } = await supabase
      .from("comunicados")
      .select("id, titulo, mensagem, tipo, data_inicio, created_at, ativo")
      .eq("ativo", true)
      .order("data_inicio", { ascending: false })
      .limit(30);

    return (data ?? []).map<CentralNoticia>((c, index) => ({
      id: c.id,
      titulo: c.titulo,
      resumo: c.mensagem.slice(0, 180),
      conteudo: c.mensagem,
      categoria: c.tipo === "alerta" ? "Aviso" : c.tipo === "promocao" ? "Benefícios" : "Institucional",
      data: c.data_inicio ?? c.created_at,
      autor: "Comunicação SBPM",
      destaque: index === 0,
    }));
  },

  async listarAvisos() {
    const hoje = new Date().toISOString();
    const { data } = await supabase
      .from("comunicados")
      .select("id, titulo, mensagem, tipo, data_inicio, data_fim, created_at, ativo")
      .eq("ativo", true)
      .order("data_inicio", { ascending: false })
      .limit(30);

    return (data ?? [])
      .filter((c) => (!c.data_inicio || c.data_inicio <= hoje) && (!c.data_fim || c.data_fim >= hoje))
      .map<CentralAviso>((c) => ({
        id: c.id,
        titulo: c.titulo,
        mensagem: c.mensagem,
        prioridade: prioridadeAviso(c.tipo),
        fixado: c.tipo === "alerta",
        publicadoEm: c.data_inicio ?? c.created_at,
        expiraEm: c.data_fim ?? null,
      }));
  },

  async listarAssuntos(modulo: string) {
    // Assuntos ainda não vêm do banco; o catálogo local mantém o wizard genérico.
    return getAssuntos(modulo);
  },
};
