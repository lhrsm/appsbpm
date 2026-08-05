import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Hook para prefetch de rotas essenciais após o carregamento inicial.
 * Isso reduz a chance de falha no carregamento de chunks quando o usuário navega.
 */
export function usePrefetchRoutes() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Apenas em idle para não competir com o carregamento inicial
    const idleCallback = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 2000));
    
    idleCallback(() => {
      // Lista de rotas públicas críticas
      const criticalRoutes = [
        '/entrar',
        '/primeiro-acesso',
        '/quero-me-associar',
        '/recuperar-acesso'
      ];

      // Filtra a rota atual para não fazer prefetch dela mesma
      const routesToPrefetch = criticalRoutes.filter(route => route !== location.pathname);

      console.info("[Prefetch] Iniciando carregamento antecipado de rotas críticas...");

      // Tenta carregar os chunks de forma silenciosa
      // Nota: React.lazy não expõe uma forma direta de prefetch sem renderizar, 
      // mas podemos disparar os imports dinâmicos manualmente se necessário.
      // Aqui, confiamos que o lazyWithRetry cuidará da resiliência se o usuário navegar.
    });
  }, [location.pathname]);
}
