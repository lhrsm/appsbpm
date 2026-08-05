import React from "react";

/**
 * Função utilitária para carregamento dinâmico de componentes com suporte a recarga automática
 * em caso de erro de chunk (comum quando o build é atualizado e o arquivo JS antigo não existe mais).
 */
export function lazyWithRetry<T extends React.ComponentType<any>>(
  importer: () => Promise<{ default: T }>,
  componentName?: string
) {
  return React.lazy(async () => {
    try {
      return await importer();
    } catch (error: any) {
      // Verifica se é um erro de carregamento de chunk/módulo
      const isChunkError = 
        error.message?.includes("Failed to fetch dynamically imported module") ||
        error.message?.includes("Loading chunk") ||
        error.message?.includes("ChunkLoadError") ||
        error.message?.includes("Importing a module script failed");

      if (isChunkError) {
        const key = `sbpm_chunk_reload_${componentName || 'generic'}`;
        const hasAttempted = sessionStorage.getItem(key);

        if (!hasAttempted) {
          sessionStorage.setItem(key, "true");
          console.warn(`[Build Sync] Falha ao carregar chunk para ${componentName || 'módulo'}. Tentando recarregar aplicação...`);

          // Limpa caches do browser se possível
          if ("caches" in window) {
            try {
              const names = await caches.keys();
              await Promise.all(
                names
                  .filter(name => name.startsWith("sbpm") || name.includes("assets"))
                  .map(name => caches.delete(name))
              );
            } catch (cacheErr) {
              console.error("[Build Sync] Erro ao limpar caches:", cacheErr);
            }
          }

          // Força recarga do index.html ignorando o cache
          window.location.reload();
          
          // Retorna uma promise que nunca resolve para evitar renderizar o estado de erro antes do reload
          return new Promise(() => {}) as Promise<{ default: T }>;
        }
      }

      // Se já tentou recarregar ou não é erro de chunk, propaga o erro para o ErrorBoundary
      throw error;
    }
  });
}
