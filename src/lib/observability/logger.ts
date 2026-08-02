/**
 * Logs estruturados e seguros (Fase 12).
 *
 * Nunca registra senha, OTP, token, CPF completo, documentos ou dados de saúde.
 */

export type LogLevel = "debug" | "info" | "warn" | "error";

const SENSITIVE_KEYS = [
  "password",
  "senha",
  "otp",
  "codigo",
  "code",
  "token",
  "access_token",
  "refresh_token",
  "secret",
  "totp",
  "recovery",
  "cpf",
  "matricula",
  "documento",
  "anexo",
  "arquivo",
  "email",
  "telefone",
  "endereco",
  "conteudo",
  "authorization",
  "apikey",
  "api_key",
];

const isSensitive = (key: string) => SENSITIVE_KEYS.some((s) => key.toLowerCase().includes(s));

/** Remove/oculta campos sensíveis antes de registrar. */
export function redact(value: unknown, depth = 0): unknown {
  if (depth > 4) return "[deep]";
  if (Array.isArray(value)) return value.slice(0, 20).map((v) => redact(v, depth + 1));
  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([k, v]) => [
        k,
        isSensitive(k) ? "[redacted]" : redact(v, depth + 1),
      ]),
    );
  }
  if (typeof value === "string" && value.length > 300) return `${value.slice(0, 300)}…`;
  return value;
}

/** Identificador de correlação por fluxo (login, upload, exportação…). */
export function newCorrelationId(prefix = "flow"): string {
  const rnd =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
  return `${prefix}-${rnd}`;
}

let currentCorrelationId = newCorrelationId("session");
export const getCorrelationId = () => currentCorrelationId;
export const setCorrelationId = (id: string) => {
  currentCorrelationId = id;
};
export const resetCorrelationId = () => setCorrelationId(newCorrelationId("session"));

export interface LogEntry {
  timestamp: string;
  environment: string;
  service: string;
  operation: string;
  correlation_id: string;
  request_id?: string;
  result?: "ok" | "error" | "timeout" | "aborted";
  duration_ms?: number;
  error_code?: string;
  metadata_safe?: Record<string, unknown>;
}

const environment = import.meta.env.PROD ? "production" : "development";
const buffer: LogEntry[] = [];
const MAX_BUFFER = 100;

function emit(level: LogLevel, entry: LogEntry) {
  buffer.push(entry);
  if (buffer.length > MAX_BUFFER) buffer.shift();
  // Em produção só erros e avisos vão para o console.
  if (environment === "production" && level !== "error" && level !== "warn") return;
  const fn = level === "error" ? console.error : level === "warn" ? console.warn : console.info;
  fn(`[sbpm:${entry.operation}]`, entry);
}

export function log(
  level: LogLevel,
  operation: string,
  data: Partial<Omit<LogEntry, "timestamp" | "environment" | "operation">> = {},
) {
  emit(level, {
    timestamp: new Date().toISOString(),
    environment,
    service: "portal-web",
    operation,
    correlation_id: data.correlation_id ?? currentCorrelationId,
    ...data,
    metadata_safe: data.metadata_safe ? (redact(data.metadata_safe) as Record<string, unknown>) : undefined,
  });
}

export const logger = {
  debug: (op: string, data?: Parameters<typeof log>[2]) => log("debug", op, data),
  info: (op: string, data?: Parameters<typeof log>[2]) => log("info", op, data),
  warn: (op: string, data?: Parameters<typeof log>[2]) => log("warn", op, data),
  error: (op: string, data?: Parameters<typeof log>[2]) => log("error", op, data),
  /** Últimos eventos — usado pelo painel de diagnóstico. */
  recent: () => [...buffer],
  clear: () => {
    buffer.length = 0;
  },
};

/** Mede uma operação e registra duração + resultado, sem expor payload. */
export async function measure<T>(
  operation: string,
  run: () => Promise<T>,
  metadata_safe?: Record<string, unknown>,
): Promise<T> {
  const started = performance.now();
  try {
    const result = await run();
    logger.info(operation, { result: "ok", duration_ms: Math.round(performance.now() - started), metadata_safe });
    return result;
  } catch (error) {
    const name = (error as Error)?.name;
    logger.error(operation, {
      result: name === "AbortError" ? "aborted" : name === "TimeoutError" ? "timeout" : "error",
      duration_ms: Math.round(performance.now() - started),
      error_code: name ?? "unknown",
      metadata_safe,
    });
    throw error;
  }
}
