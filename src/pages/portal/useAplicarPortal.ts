import { useAssociado, Dependente } from '@/contexts/AssociadoContext';
import { setPortalToken } from '@/lib/portal';

/** Aplica no contexto o pacote de dados devolvido pela função portal-acesso. */
export function useAplicarPortal() {
  const {
    setAssociado,
    setDependentes,
    setLimite,
    setHistoricoLimite,
    setCarencias,
    setInformes,
    setIsDependente,
    setDependenteLogado,
  } = useAssociado();

  return (portal: any) => {
    if (!portal?.token || !portal?.associado) return false;
    setPortalToken(portal.token);
    const dependente: Dependente | null = portal.dependente ?? null;
    setAssociado(portal.associado);
    setDependentes(portal.dependentes || []);
    setLimite(portal.limite || null);
    setHistoricoLimite(portal.historico || []);
    setCarencias([]);
    setInformes(portal.informes || []);
    setIsDependente(Boolean(dependente));
    setDependenteLogado(dependente);
    return true;
  };
}
