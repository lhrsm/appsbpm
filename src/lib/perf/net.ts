/**
 * Camada de rede resiliente do Portal (Fase 12).
 *
 * Responsabilidades: timeout, retry apenas para falhas transitórias,
 * backoff exponencial com jitter, idempotência e cancelamento.
 */

/** Erros considerados transitórios (rede, timeout, 502/503/504). */
const TRANSIENT_STATUS = new Set([408, 425, 429, 502, 503, 504]);

export class TimeoutError extends Error {
  constructor(public readonly operation: string, public readonly ms: number) {
    super(`Tempo limite excedido em ${operation} (${ms} ms).`);
    this.name = "TimeoutError";
  }
}

export function isTransientError(error: unknown): boolean {
  if (error instanceof TimeoutError) return true;
  if (typeof error !== "object" || error === null) return false;
  const e = error as { name?: string; status?: number; message?: string };
  if (e.name === "AbortError") return false;
  if (typeof e.status === "number") return TRANSIENT_STATUS.has(e.status);
  const msg = (e.message ?? "").toLowerCase();
  return msg.includes("network") || msg.includes("failed to fetch") || msg.includes("timeout");
}

/** Executa uma promessa com limite de tempo; aborta o sinal quando possível. */
export async function withTimeout<T>(
  operation: string,
  ms: number,
  run: (signal: AbortSignal) => Promise<T>,
  externalSignal?: AbortSignal,
): Promise<T> {
  const controller = new AbortController();
  const onAbort = () => controller.abort();
  externalSignal?.addEventListener("abort", onAbort, { once: true });
  const timer = setTimeout(() => controller.abort(), ms);
  try {
    return await run(controller.signal);
  } catch (error) {
    if (controller.signal.aborted && !externalSignal?.aborted) throw new TimeoutError(operation, ms);
    throw error;
  } finally {
    clearTimeout(timer);
    externalSignal?.removeEventListener("abort", onAbort);
  }
}

export interface RetryOptions {
  /** Número máximo de tentativas (inclui a primeira). */
  attempts?: number;
  baseDelayMs?: number;
  maxDelayMs?: number;
  /** Só repete quando a falha é transitória; nunca em operações sensíveis. */
  shouldRetry?: (error: unknown) => boolean;
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** Backoff exponencial com jitter completo. */
export function backoffDelay(attempt: number, base = 300, max = 4000): number {
  const exp = Math.min(max, base * 2 ** (attempt - 1));
  return Math.round(Math.random() * exp);
}

export async function withRetry<T>(run: () => Promise<T>, options: RetryOptions = {}): Promise<T> {
  const { attempts = 3, baseDelayMs = 300, maxDelayMs = 4000, shouldRetry = isTransientError } = options;
  let lastError: unknown;
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await run();
    } catch (error) {
      lastError = error;
      if (attempt === attempts || !shouldRetry(error)) throw error;
      await sleep(backoffDelay(attempt, baseDelayMs, maxDelayMs));
    }
  }
  throw lastError;
}

/** Chave de idempotência para operações que não podem ser duplicadas. */
export function idempotencyKey(prefix = "op"): string {
  const rnd =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${prefix}_${rnd}`;
}

/**
 * Trava lógica por chave: impede submit/upload/download duplicado
 * mesmo que o botão desabilitado falhe.
 */
const inFlight = new Map<string, Promise<unknown>>();

export function runExclusive<T>(key: string, run: () => Promise<T>): Promise<T> {
  const existing = inFlight.get(key) as Promise<T> | undefined;
  if (existing) return existing;
  const promise = run().finally(() => inFlight.delete(key));
  inFlight.set(key, promise);
  return promise;
}

export const isLocked = (key: string) => inFlight.has(key);

/** Registro global de requisições canceláveis (logout / troca de rota). */
const controllers = new Set<AbortController>();

export function trackController(controller: AbortController): AbortController {
  controllers.add(controller);
  controller.signal.addEventListener("abort", () => controllers.delete(controller), { once: true });
  return controller;
}

export function abortAllRequests(): void {
  controllers.forEach((c) => {
    try {
      c.abort();
    } catch {
      /* ignora */
    }
  });
  controllers.clear();
  inFlight.clear();
}
