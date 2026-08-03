import React, { useEffect, useState } from 'react';
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
import { PortalLoadingState, PortalProfileNotFound, PortalErrorState } from '@/portal/components/PortalStates';

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error: any) { return { hasError: true, error }; }
  componentDidCatch(error: any, errorInfo: any) { console.error("[DashboardErrorBoundary]", error, errorInfo); }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-8">
          <PortalErrorState 
            title="Não foi possível carregar este módulo" 
            description={this.state.error?.message || "Ocorreu um erro interno na renderização desta seção."}
            onRetry={() => this.setState({ hasError: false, error: null })}
          />
        </div>
      );
    }
    return this.props.children;
  }
}

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

  if (initializing) {
    console.info("[Dashboard] Render stage: initializing");
    return <PortalLoadingState />;
  }
  
  if (error) {
    console.error("[Dashboard] Interrompido por erro:", error, identity);
    
    const isTechnicalError = ['ASSOCIATE_QUERY_ERROR', 'ASSOCIATE_RLS_DENIED', 'ASSOCIATE_PAYLOAD_INVALID', 'RPC_ERROR'].includes(error);

    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background gap-8">
        <PortalProfileNotFound 
          title={
            error === 'PROFILE_LINK_MISSING' ? "Estamos vinculando seu cadastro" : 
            error === 'ASSOCIATE_RLS_DENIED' ? "Acesso Restrito" :
            error === 'ASSOCIATE_PAYLOAD_INVALID' ? "Erro no Carregamento de Dados" :
            "Não foi possível localizar seu cadastro"
          }
          description={
            error === 'PROFILE_LINK_MISSING' ? "Identificamos sua conta, mas precisamos sincronizar seu vínculo institucional para liberar o acesso." : 
            error === 'ASSOCIATE_RLS_DENIED' ? "Seu usuário não tem permissão para visualizar estes dados institucionais no momento." :
            error === 'ASSOCIATE_PAYLOAD_INVALID' ? "Os dados recebidos do servidor estão incompletos ou em formato incorreto." :
            "Identificamos sua conta, mas não conseguimos carregar os dados vinculados ao seu perfil institucional."
          }
          onRetry={() => refreshProfile(error === 'PROFILE_LINK_MISSING' || error === 'IDENTITY_INCONSISTENCY')} 
        />
        
        {/* Debug Panel - Sempre visível para auxílio no diagnóstico solicitado */}
        <div className="max-w-md w-full p-4 bg-muted/50 rounded-lg text-[10px] font-mono border text-muted-foreground overflow-auto">
          <p className="font-bold mb-1 uppercase tracking-wider text-[9px] flex justify-between">
            <span>Diagnóstico Técnico</span>
            <span className="text-primary/70">{new Date().toLocaleTimeString()}</span>
          </p>
          <pre>{JSON.stringify({ 
            error,
            identity: identity ? {
              resolved: identity.resolved,
              associateId: identity.associateId,
              profileType: identity.profileType,
              associationStatus: identity.associationStatus,
              accessLevel: identity.accessLevel,
              reasonCode: identity.reasonCode,
              linkStatus: identity.linkStatus
            } : null,
            associateQuery: {
              started: true,
              source: "portalCall('perfil')",
              status: error ? 'error' : 'pending',
              associateIdPresent: !!identity?.associateId
            },
            version: "portal-auth-dashboard-v4-2026-08-03"
          }, null, 2)}</pre>
        </div>
      </div>
    );
  }

  if (!associado) {
    console.warn("[Dashboard] Render blocked: associado is null", { initializing, error, identity });
    return (
      <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-background gap-4">
        <PortalLoadingState message="Aguardando dados do perfil..." />
        {identity && (
           <div className="max-w-md w-full p-4 bg-muted/30 rounded border text-[10px] font-mono text-muted-foreground animate-pulse">
             Identity Resolved: {String(identity.resolved)} | Status: {identity.reasonCode}
             <br />
             Associate ID: {identity.associateId?.slice(0, 8)}...
           </div>
        )}
      </div>
    );
  }

  const nomeExibir = isDependente && dependenteLogado ? dependenteLogado.nome : (associado?.nome || "Associado");
  const profileType = isDependente ? 'dependent' : 'associate';

  return (
    <ExternalPortalLayout
      profileType={profileType}
      user={{
        nome: nomeExibir,
        fotoUrl: isDependente && dependenteLogado ? dependenteLogado.foto_url : associado?.foto_url,
        matricula: associado?.matricula || "",
        titularNome: associado?.nome || "",
        ativo: associado?.status === 'regular',
      }}
      onLogout={handleLogout}
      banner={
        <div key="dashboard-banners">
          <WelcomeTour isDependente={isDependente} />
          <ComunicadosBanner />
        </div>
      }
    >
      {location.pathname === '/dashboard' ? (
        <ErrorBoundary key={location.pathname}>
          <ExternalDashboard profileType={profileType} />
        </ErrorBoundary>
      ) : <Outlet />}
    </ExternalPortalLayout>
  );
}
