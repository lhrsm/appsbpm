/**
 * Índice do serviço da Central de Relacionamento.
 *
 * Ponto único de troca de origem dos dados (§25). Para migrar ao SBPMSanitas,
 * crie `sanitasService.ts` implementando `RelationshipService` e altere apenas
 * a constante abaixo — nenhuma tela da Central precisa ser reescrita.
 */
import { portalService } from "./portalService";
import type { RelationshipService } from "./RelationshipService";

export type { RelationshipService } from "./RelationshipService";
export { portalService, normalizarProtocoloRegistro } from "./portalService";

export const relationshipService: RelationshipService = portalService;
