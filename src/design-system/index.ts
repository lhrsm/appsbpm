/**
 * Design System institucional SBPM.
 *
 * Ponto de entrada único:
 *   import { Button, Card, icons, tokens } from "@/design-system";
 *
 * Regras de uso:
 * 1. Páginas não criam componentes visuais próprios sem necessidade.
 * 2. Nenhuma cor literal em componentes — apenas tokens semânticos.
 * 3. Ícones vêm sempre de `icons`, nunca de `lucide-react` direto.
 * 4. Espaçamento, raio, sombra, tipografia e z-index vêm dos tokens.
 */
export * from "./components";
export * from "./layouts";
export * from "./hooks";
export * from "./icons";
export * from "./utilities";
export * as tokens from "./tokens";
