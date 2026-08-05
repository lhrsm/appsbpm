import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * Hook para prefetch de rotas ou componentes essenciais após o carregamento inicial.
 */
export function usePrefetchRoutes(importers?: (() => Promise<any>)[], condition: boolean = true) {
  const location = useLocation();

  useEffect(() => {
    if (!condition) return;

    const idleCallback = (window as any).requestIdleCallback || ((cb: any) => setTimeout(cb, 3000));
    
    idleCallback(() => {
      // 1. Prefetch de rotas públicas básicas se estiver fora do dashboard
      if (!location.pathname.startsWith('/dashboard')) {
        const publicImporters = [
          () => import('@/pages/portal/PortalEntrar'),
          () => import('@/pages/portal/PortalPrimeiroAcesso'),
          () => import('@/pages/portal/PortalQueroMeAssociar')
        ];
        
        console.info("[Prefetch] Carregando antecipadamente componentes do portal público...");
        publicImporters.forEach(imp => {
          try { imp().catch(() => {}); } catch(e) {}
        });
      }

      // 2. Prefetch de importers específicos passados via props
      if (importers && importers.length > 0) {
        console.info("[Prefetch] Carregando antecipadamente módulos específicos...");
        importers.forEach(imp => {
          try { imp().catch(() => {}); } catch(e) {}
        });
      }
    });
  }, [location.pathname, condition, importers]);
}

