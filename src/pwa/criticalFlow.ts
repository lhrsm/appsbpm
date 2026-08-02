/**
 * Sinalização de fluxos críticos (Fase 12).
 *
 * Enquanto houver um fluxo crítico ativo (formulário, upload, 2FA, senha,
 * solicitação), o Portal não aplica atualizações do service worker.
 */
const fluxos = new Set<string>();

export const iniciarFluxoCritico = (nome: string) => fluxos.add(nome);
export const encerrarFluxoCritico = (nome: string) => fluxos.delete(nome);
export const emFluxoCritico = () => fluxos.size > 0;

/** Helper para envolver uma operação crítica. */
export async function comFluxoCritico<T>(nome: string, run: () => Promise<T>): Promise<T> {
  iniciarFluxoCritico(nome);
  try {
    return await run();
  } finally {
    encerrarFluxoCritico(nome);
  }
}
