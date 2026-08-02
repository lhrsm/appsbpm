/**
 * Contrato do serviço da Central de Relacionamento (Fase 9, §25).
 *
 * A interface abaixo é o ÚNICO ponto de contato entre a interface e a origem dos
 * dados. Hoje existe a implementação `portalService` (portal seguro + conteúdo
 * institucional local). Amanhã, o SBPMSanitas entra como outra implementação
 * deste mesmo contrato, sem qualquer alteração de tela.
 */
import type {
  CentralAviso,
  CentralDownload,
  CentralFaq,
  CentralFeedback,
  CentralNoticia,
  CentralProtocolo,
  NovaSolicitacaoInput,
} from "../types";

export interface RelationshipService {
  /** Identificador da origem — exibido em rodapés de "fonte dos dados". */
  readonly origem: string;

  listarProtocolos(): Promise<CentralProtocolo[]>;
  obterProtocolo(idOuNumero: string): Promise<CentralProtocolo | null>;
  criarSolicitacao(input: NovaSolicitacaoInput): Promise<CentralProtocolo>;
  enviarFeedback(feedback: CentralFeedback): Promise<void>;

  listarFaq(): Promise<CentralFaq[]>;
  listarDownloads(): Promise<CentralDownload[]>;
  listarNoticias(): Promise<CentralNoticia[]>;
  listarAvisos(): Promise<CentralAviso[]>;

  /** Catálogo de assuntos por módulo (§4 — assuntos virão do banco). */
  listarAssuntos(modulo: string): Promise<string[]>;
}
