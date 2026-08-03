import { useEffect } from 'react';
import { useNavigate, Outlet, useLocation } from 'react-router-dom';
import { portalCall } from '@/lib/portal';
import { useAssociado } from '@/contexts/AssociadoContext';
import { useInactivityLock } from '@/hooks/useInactivityLock';
import ComunicadosBanner from '@/components/ComunicadosBanner';
import WelcomeTour from '@/components/WelcomeTour';
import { usePageviewTracker } from '@/hooks/useAnalytics';
import ExternalPortalLayout from '@/portal/ExternalPortalLayout';
import { deprecatedPortalRoutes } from '@/portal/navigation';
import ExternalDashboard from '@/portal/dashboard/ExternalDashboard';
import { usePrefetchRoutes } from '@/hooks/usePrefetchRoutes';
import { PortalLoadingState, PortalProfileNotFound } from '@/portal/components/PortalStates';

/** Rotas mais prováveis após o dashboard — apenas o chunk, nunca documentos. */
const rotasProvaveis = [
  () => import('@/pages/Carteirinha'),
  () => import('@/pages/portal/associado/Solicitacoes'),
  () => import('@/pages/Perfil'),
];

export default function Dashboard() {
  const { 
    associado, 
    logout, 
    isDependente, 
    dependenteLogado, 
    setAssociado, 
    setDependenteLogado,
    initializing,
    error,
    identity,
    refreshProfile
  } = useAssociado();
  usePageviewTracker(associado?.id);
  const navigate = useNavigate();
  const location = useLocation();
  usePrefetchRoutes(rotasProvaveis, !!associado);

  useEffect(() => {
    if (!initializing && !associado && !error) {
      // Se não está carregando, não tem associado e não tem erro, volta pro início
      navigate('/');
    }
  }, [associado, navigate, initializing, error]);

  // Rotas depreciadas do portal externo (ex.: limite disponível) -> visão geral
  useEffect(() => {
    const destino = deprecatedPortalRoutes[location.pathname];
    if (destino) navigate(destino, { replace: true });
  }, [location.pathname, navigate]);

  // Sincroniza a foto do perfil com o backend ao entrar no painel
  useEffect(() => {
    const loadPhoto = async () => {
      if (!associado?.id) return;
      try {
        const res = await portalCall<any>('perfil');
        if (isDependente && dependenteLogado?.id && res?.dependente?.foto_url) {
          setDependenteLogado({ ...dependenteLogado, foto_url: res.dependente.foto_url });
          return;
        }
        if (res?.associado?.foto_url) {
          setAssociado({ ...associado, foto_url: res.associado.foto_url });
        }
      } catch {
        /* sessão expirada: mantém o estado atual */
      }
    };
    void loadPhoto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [associado?.id, isDependente, dependenteLogado?.id]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  useInactivityLock(!!associado, handleLogout);

  if (initializing) return <PortalLoadingState />;
  
  if (error) {
    console.error("[Dashboard] Interrompido por erro:", error, identity);
    
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background gap-8">
        <PortalProfileNotFound 
          title={
            error === 'PROFILE_LINK_MISSING' ? "Estamos vinculando seu cadastro" : 
            error === 'IDENTITY_INCONSISTENCY' ? "Inconsistência de Identidade" :
            "Não foi possível carregar seu cadastro"
          }
          description={
            error === 'PROFILE_LINK_MISSING' ? "Identificamos sua conta, mas precisamos sincronizar seu vínculo institucional para liberar o acesso." : 
            error === 'IDENTITY_INCONSISTENCY' ? "Detectamos um problema na configuração do seu perfil institucional. Por favor, tente novamente ou contate o suporte." :
            "Ocorreu uma falha ao tentar resolver sua identidade. Tente novamente."
          }
          onRetry={() => refreshProfile(error === 'PROFILE_LINK_MISSING' || error === 'IDENTITY_INCONSISTENCY')} 

        />
        
        {/* Debug Panel - Só aparece se houver dados técnicos ou for admin logado */}
        {identity && (
          <div className="max-w-md w-full p-4 bg-muted/50 rounded-lg text-[10px] font-mono border text-muted-foreground overflow-auto">
            <p className="font-bold mb-1 uppercase tracking-wider text-[9px]">Diagnóstico Técnico (Admin)</p>
            <pre>{JSON.stringify({ 
              error,
              identity: {
                resolved: identity.resolved,
                linkStatus: identity.linkStatus,
                associationStatus: identity.associationStatus,
                accessLevel: identity.accessLevel,
                reasonCode: identity.reasonCode,
                associateId: identity.associateId,
                dependentId: identity.dependentId,
                profileType: identity.profileType,
                version: "identity-v3-2026-08-03"
              }
            }, null, 2)}</pre>
          </div>
        )}

      </div>
    );
  }

  if (!associado) {
    console.warn("[Dashboard] Render blocked: associado is null", { initializing, error, identity });
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background gap-4">
        <PortalLoadingState message="Aguardando dados do perfil..." />
        {identity && (
           <div className="max-w-md w-full p-4 bg-muted/30 rounded border text-[10px] font-mono text-muted-foreground">
             Identity Resolved: {String(identity.resolved)} | Status: {identity.reasonCode}
           </div>
        )}
      </div>
    );
  }

  const nomeExibir = isDependente && dependenteLogado ? dependenteLogado.nome : associado.nome;
  const profileType = isDependente ? 'dependent' : 'associate';

  return (
    <ExternalPortalLayout
      profileType={profileType}
      user={{
        nome: nomeExibir,
        fotoUrl: isDependente && dependenteLogado ? dependenteLogado.foto_url : associado.foto_url,
        matricula: associado.matricula,
        titularNome: associado.nome,
        ativo: associado.status === 'regular',
      }}
      onLogout={handleLogout}
      banner={
        <>
          <WelcomeTour isDependente={isDependente} />
          <ComunicadosBanner />
        </>
      }
    >
      {location.pathname === '/dashboard' ? <ExternalDashboard profileType={profileType} /> : <Outlet />}
    </ExternalPortalLayout>
  );
}
