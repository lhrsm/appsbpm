import { supabase } from '@/integrations/supabase/client';
import { withTimeout, withRetry, trackController, isTransientError } from '@/lib/perf/net';
import { getCorrelationId, logger } from '@/lib/observability/logger';

const TOKEN_KEY = 'sbpm_portal_token';

export const getPortalToken = () => localStorage.getItem(TOKEN_KEY);
export const setPortalToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearPortalToken = () => localStorage.removeItem(TOKEN_KEY);

/** Ações que nunca podem ser repetidas automaticamente (efeito colateral). */
const NAO_REPETIVEIS = new Set([
  'login',
  'solicitacao_criar',
  'notificacoes_marcar',
  'perfil_atualizar',
  'dependente_solicitar',
  'peculio_solicitar',
  'exportar_dados',
]);

const TIMEOUT_PADRAO = 15_000;

export interface PortalCallOptions {
  /** Cancelamento externo (troca de rota, filtro, fechamento de modal). */
  signal?: AbortSignal;
  timeoutMs?: number;
  /** Chave de idempotência para operações sensíveis. */
  idempotencyKey?: string;
}

/**
 * Chama a função segura do portal do associado.
 * Todos os dados pessoais passam por essa função — o cliente nunca lê as tabelas direto.
 */
export async function portalCall<T = any>(
  action: string,
  payload: Record<string, unknown> = {},
  options: PortalCallOptions = {},
): Promise<T> {
  const token = action === 'login' ? undefined : getPortalToken() ?? undefined;
  if (action !== 'login' && !token) throw new Error('Sessão expirada');

  const { signal, timeoutMs = TIMEOUT_PADRAO, idempotencyKey } = options;
  const correlationId = getCorrelationId();
  const iniciado = performance.now();

  const executar = () =>
    withTimeout(
      `portal:${action}`,
      timeoutMs,
      async (timeoutSignal) => {
        const controller = trackController(new AbortController());
        timeoutSignal.addEventListener('abort', () => controller.abort(), { once: true });

        const { data, error } = await supabase.functions.invoke('portal-associado', {
          body: { action, token, correlation_id: correlationId, idempotency_key: idempotencyKey, ...payload },
          headers: { 'x-correlation-id': correlationId },
        });

        if (error) {
          let msg = 'Não foi possível concluir a operação.';
          const ctx: any = (error as any).context;
          const status = ctx?.status;
          try {
            const body = await ctx?.json?.();
            if (body?.error) msg = body.error;
          } catch {
            /* corpo não json */
          }
          if (status === 401) clearPortalToken();
          const err = Object.assign(new Error(msg), { status });
          throw err;
        }

        return data as T;
      },
      signal,
    );

  try {
    const resultado = NAO_REPETIVEIS.has(action)
      ? await executar()
      : await withRetry(executar, { attempts: 3, shouldRetry: isTransientError });
    logger.info(`portal.${action}`, { result: 'ok', duration_ms: Math.round(performance.now() - iniciado) });
    return resultado;
  } catch (error) {
    logger.error(`portal.${action}`, {
      result: (error as Error)?.name === 'TimeoutError' ? 'timeout' : 'error',
      duration_ms: Math.round(performance.now() - iniciado),
      error_code: (error as { status?: number })?.status?.toString() ?? (error as Error)?.name,
    });
    throw error;
  }
}
