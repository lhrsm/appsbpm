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
    refreshProfile
  } = useAssociado();
  usePageviewTracker(associado?.id);
  const navigate = useNavigate();
  const location = useLocation();
  usePrefetchRoutes(rotasProvaveis, !!associado);

  useEffect(() => {
    if (!initializing && !associado) {
      navigate('/');
    }
  }, [associado, navigate, initializing]);

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
    console.error("[Dashboard] Interrompido por erro de perfil:", error);
    return (
      <div className="flex min-h-screen items-center justify-center p-6 bg-background">
        <PortalProfileNotFound onRetry={() => {
          console.log("[Dashboard] Tentando revalidar perfil...");
          refreshProfile();
        }} />
      </div>
    );
  }

  if (!associado) return null;

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
