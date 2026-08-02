import { QueryClient } from "@tanstack/react-query";
import { isTransientError } from "./net";
import { abortAllRequests } from "./net";
import { logger, resetCorrelationId } from "@/lib/observability/logger";

/**
 * Política central de cache do Portal (Fase 12).
 *
 * Curta duração: dados vivos (notificações, solicitações, segurança).
 * Média duração: conteúdo institucional (FAQ, tutoriais, canais, categorias).
 * Longa duração: dados estáticos versionados.
 */
export const CACHE = {
  curta: { staleTime: 30_000, gcTime: 2 * 60_000 },
  media: { staleTime: 5 * 60_000, gcTime: 30 * 60_000 },
  longa: { staleTime: 60 * 60_000, gcTime: 24 * 60 * 60_000 },
  /** Dados sensíveis: sempre revalidados, nunca reaproveitados entre telas. */
  sensivel: { staleTime: 0, gcTime: 0 },
} as const;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        ...CACHE.curta,
        refetchOnWindowFocus: false,
        refetchOnReconnect: true,
        retry: (failureCount, error) => failureCount < 2 && isTransientError(error),
        retryDelay: (attempt) => Math.min(4000, Math.round(Math.random() * 300 * 2 ** attempt)),
      },
      mutations: { retry: false },
    },
  });
}

/**
 * Escopo obrigatório de toda chave de cache autenticada.
 * Impede que um usuário veja, mesmo brevemente, dados do usuário anterior.
 */
export type CacheScope = { userId: string | null; profile: "associate" | "dependent" | "internal" | "anon" };

export const scopedKey = (scope: CacheScope, ...parts: unknown[]) =>
  ["sbpm", scope.profile, scope.userId ?? "anon", ...parts] as const;

/** Chaves públicas (sem dados pessoais) podem ser compartilhadas. */
export const publicKey = (...parts: unknown[]) => ["sbpm", "public", ...parts] as const;

/** Prefixos de armazenamento local que podem persistir após o logout. */
const PERSIST_ALLOWLIST = ["sbpm:portal:sidebar-collapsed", "sbpm:theme", "sbpm:cookie-consent", "sbpm:a11y"];

/**
 * Limpeza completa do estado privado: cache de queries, storages,
 * requisições em voo, canais realtime e correlação de logs.
 */
export function clearPrivateState(queryClient?: QueryClient) {
  abortAllRequests();
  queryClient?.cancelQueries();
  queryClient?.clear();

  const wipe = (storage: Storage) => {
    try {
      Object.keys(storage)
        .filter((k) => !PERSIST_ALLOWLIST.includes(k))
        .forEach((k) => storage.removeItem(k));
    } catch {
      /* storage indisponível */
    }
  };
  wipe(localStorage);
  wipe(sessionStorage);

  resetCorrelationId();
  logger.info("logout.cache-cleared", { result: "ok" });
}
