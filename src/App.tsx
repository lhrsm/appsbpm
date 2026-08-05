import { lazy, Suspense, useEffect } from "react";
import { lazyWithRetry } from "@/lib/async/lazyWithRetry";
import { ChunkErrorBoundary } from "@/components/error/ChunkErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClientProvider } from "@tanstack/react-query";
import { createQueryClient } from "@/lib/perf/queryClient";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AssociadoProvider } from "@/contexts/AssociadoContext";
import { PortalRouteLoading } from "@/components/portal/PortalRouteLoading";
import Dashboard from "./pages/Dashboard";
const DashboardRecovery = lazy(() => import("./pages/DashboardRecovery"));
import NotFound from "./pages/NotFound";
import CookieConsent from "./components/CookieConsent";
import AccessibilityWidget from "./components/AccessibilityWidget";
import InstallPWAPrompt from "./components/InstallPWAPrompt";
import OfflineBanner from "./components/OfflineBanner";
import BackToTop from "./components/BackToTop";
import PWAUpdatePrompt from "./components/PWAUpdatePrompt";
import PageSkeleton from "./components/PageSkeleton";
import { initWebVitals } from "@/lib/observability/webVitals";
import { A11yProvider } from "@/a11y/preferences";
import RouteAnnouncer from "@/a11y/RouteAnnouncer";
import { ThemeProvider } from "@/components/ThemeProvider";

// Lazy: chunks por área — o portal externo nunca baixa código administrativo.
const ChatbotWidget = lazyWithRetry(() => import("./components/ChatbotWidget"), "ChatbotWidget");
const Login = lazyWithRetry(() => import("./pages/Login"), "Login");
const Clinicas = lazyWithRetry(() => import("./pages/Clinicas"), "Clinicas");
const Informes = lazyWithRetry(() => import("./pages/Informes"), "Informes");
const Dependentes = lazyWithRetry(() => import("./pages/Dependentes"), "Dependentes");
const Perfil = lazyWithRetry(() => import("./pages/Perfil"), "Perfil");
const Notificacoes = lazyWithRetry(() => import("./pages/Notificacoes"), "Notificacoes");
const Privacidade = lazyWithRetry(() => import("./pages/Privacidade"), "Privacidade");
const Acessibilidade = lazyWithRetry(() => import("./pages/Acessibilidade"), "Acessibilidade");

// Lazy: páginas menos frequentes do portal do associado
const AssociacaoPremiada = lazy(() => import("./pages/AssociacaoPremiada"));
const Simulador = lazy(() => import("./pages/Simulador"));
const IndicarParceiro = lazy(() => import("./pages/IndicarParceiro"));
const Peculio = lazy(() => import("./pages/Peculio"));
const SolicitarPeculio = lazy(() => import("./pages/SolicitarPeculio"));
const MinhaPrivacidade = lazy(() => import("./pages/portal/conta/PrivacidadeHub"));
const Solicitacoes = lazy(() => import("./pages/Solicitacoes"));
const MeusDocumentos = lazy(() => import("./pages/MeusDocumentos"));
const Financeiro = lazy(() => import("./pages/Financeiro"));
const Agenda = lazy(() => import("./pages/Agenda"));
const FAQ = lazy(() => import("./pages/FAQ"));
const HistoricoAcessos = lazy(() => import("./pages/portal/conta/HistoricoAcessos"));
const SegurancaHub = lazy(() => import("./pages/portal/conta/SegurancaHub"));
const Beneficios = lazy(() => import("./pages/Beneficios"));
const AvaliarClinicas = lazy(() => import("./pages/AvaliarClinicas"));
const AdminRelatorios = lazy(() => import("./pages/admin/AdminRelatorios"));
const AdminAnalytics = lazy(() => import("./pages/admin/AdminAnalytics"));
const AdminComponentes = lazy(() => import("./pages/admin/AdminComponentes"));
const AdminAssinaturaICP = lazy(() => import("./pages/admin/AdminAssinaturaICP"));
const OAuthConsent = lazy(() => import("./pages/OAuthConsent"));
const Quiosque = lazy(() => import("./pages/Quiosque"));
const BemQR = lazy(() => import("./pages/BemQR"));
const RedefinirSenha = lazy(() => import("./pages/RedefinirSenha"));
const PortalBoasVindas = lazyWithRetry(() => import("./pages/portal/PortalBoasVindas"), "PortalBoasVindas");
const PortalEntrar = lazyWithRetry(() => import("./pages/portal/PortalEntrar"), "PortalEntrar");
const PortalPrimeiroAcesso = lazyWithRetry(() => import("./pages/portal/PortalPrimeiroAcesso"), "PortalPrimeiroAcesso");
const PortalRecuperarAcesso = lazyWithRetry(() => import("./pages/portal/PortalRecuperarAcesso"), "PortalRecuperarAcesso");
const PortalQueroMeAssociar = lazyWithRetry(() => import("./pages/portal/PortalQueroMeAssociar"), "PortalQueroMeAssociar");
const PortalVinculo = lazy(() => import("./pages/portal/associado/Vinculo"));
const PortalMeusDados = lazy(() => import("./pages/portal/associado/MeusDados"));
import {
  RotaCarteirinha,
  RotaMeusDados,
  RotaDocumentos,
  RotaAtendimento,
  RotaMeuTitular,
  RotaPreferencias,
} from "./portal/routesByProfile";
const PortalSolicitacoes = lazy(() => import("./pages/portal/associado/Solicitacoes"));
const PortalSolicitacaoNova = lazy(() => import("./pages/portal/associado/SolicitacaoNova"));
const PortalSolicitacaoDetalhes = lazy(() => import("./pages/portal/associado/SolicitacaoDetalhes"));
const PortalAtendimento = lazy(() => import("./pages/portal/associado/Atendimento"));
const AdminValidacaoExterna = lazy(() => import("./pages/admin/AdminValidacaoExterna"));
const AdminPreCadastros = lazy(() => import("./pages/admin/AdminPreCadastros"));

// Lazy: TODO o admin (não baixa para usuários finais)
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminLayout = lazy(() => import("./pages/admin/AdminLayout"));
const AdminHome = lazy(() => import("./pages/admin/AdminHome"));
const AdminVisaoGeral = lazy(() => import("./pages/admin/AdminVisaoGeral"));
const AdminUsuarios = lazy(() => import("./pages/admin/AdminUsuarios"));
const AdminAssociados = lazy(() => import("./pages/admin/AdminAssociados"));
const AdminDependentes = lazy(() => import("./pages/admin/AdminDependentes"));
const AdminLimites = lazy(() => import("./pages/admin/AdminLimites"));
const AdminCarencias = lazy(() => import("./pages/admin/AdminCarencias"));
const AdminClinicas = lazy(() => import("./pages/admin/AdminClinicas"));
const AdminInformes = lazy(() => import("./pages/admin/AdminInformes"));
const AdminAutomacoes = lazy(() => import("./pages/admin/AdminAutomacoes"));
const AdminIntegracoes = lazy(() => import("./pages/admin/AdminIntegracoes"));
const AdminSincronizacao = lazy(() => import("./pages/admin/AdminSincronizacao"));
const AdminConfiguracoes = lazy(() => import("./pages/admin/AdminConfiguracoes"));
const AdminAniversariantes = lazy(() => import("./pages/admin/AdminAniversariantes"));
const AdminComunicados = lazy(() => import("./pages/admin/AdminComunicados"));
const AdminImportar = lazy(() => import("./pages/admin/AdminImportar"));
const AdminAuditoria = lazy(() => import("./pages/admin/AdminAuditoria"));
const AdminPeculio = lazy(() => import("./pages/admin/AdminPeculio"));
const AdminSeguranca = lazy(() => import("./pages/admin/AdminSeguranca"));
const AdminNotificacoes = lazy(() => import("./pages/admin/AdminNotificacoes"));
const AdminSolicitacoes = lazy(() => import("./pages/admin/AdminSolicitacoes"));
const AdminDocumentos = lazy(() => import("./pages/admin/AdminDocumentos"));
const AdminFinanceiro = lazy(() => import("./pages/admin/AdminFinanceiro"));
const ChequesRoutes = lazy(() => import("./pages/admin/financeiro/cheques/routes").then(m => ({ default: m.ChequesRoutes })));
const AdminEventos = lazy(() => import("./pages/admin/AdminEventos"));
const AdminFAQ = lazy(() => import("./pages/admin/AdminFAQ"));
const AdminAvaliacoes = lazy(() => import("./pages/admin/AdminAvaliacoes"));
const AdminPrivacidade = lazy(() => import("./pages/admin/AdminPrivacidade"));
const AdminSobre = lazy(() => import("./pages/admin/AdminSobre"));
const AdminTutoriais = lazy(() => import("./pages/admin/AdminTutoriais"));

// Lazy: hubs dos módulos institucionais (área administrativa interna)
const AdminPrevidencia = lazy(() => import("./pages/admin/AdminPrevidencia"));
const AdminSaude = lazy(() => import("./pages/admin/AdminSaude"));
const AdminPatrimonio = lazy(() => import("./pages/admin/AdminPatrimonio"));
const AdminContabilidade = lazy(() => import("./pages/admin/AdminContabilidade"));
const AdminRH = lazy(() => import("./pages/admin/AdminRH"));

const queryClient = createQueryClient();

initWebVitals();

const RouteFallback = () => <PortalRouteLoading />;

const HIDDEN_CHAT_ROUTES = ["/", "/entrar", "/quero-me-associar", "/primeiro-acesso", "/recuperar-acesso", "/admin/login", "/quiosque", "/redefinir-senha"];

const ChatbotGate = () => {
  const { pathname } = useLocation();
  if (HIDDEN_CHAT_ROUTES.includes(pathname) || pathname.startsWith("/bem/")) return null;
  return (
    <Suspense fallback={null}>
      <ChatbotWidget />
    </Suspense>
  );
};

/**
 * Alias do portal externo: /portal/* -> /dashboard/*
 * Mantém as rotas antigas funcionando enquanto a nomenclatura nova é adotada.
 */
const PortalAlias = () => {
  const { pathname, search, hash } = useLocation();
  const target = pathname.replace(/^\/portal/, "/dashboard") || "/dashboard";
  return <Navigate to={`${target}${search}${hash}`} replace />;
};


const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <ThemeProvider defaultTheme="system" storageKey="sbpm-ui-theme">
        <A11yProvider>
          <AssociadoProvider>
          <BrowserRouter>
            <Toaster />
            <PortalRouteLoading />
            <Sonner />
            <RouteAnnouncer />
            <CookieConsent />
            <AccessibilityWidget />
              <ChatbotGate />
              <InstallPWAPrompt />
              <OfflineBanner />
              <BackToTop />
              <PWAUpdatePrompt />
              <Suspense fallback={<RouteFallback />}>
                <Routes>
                <Route path="/" element={<PortalBoasVindas />} />
                <Route path="/entrar" element={<PortalEntrar />} />
                <Route path="/primeiro-acesso" element={<PortalPrimeiroAcesso />} />
                <Route path="/recuperar-acesso" element={<PortalRecuperarAcesso />} />
                <Route path="/quero-me-associar" element={<PortalQueroMeAssociar />} />
                <Route path="/acesso-simplificado" element={<Login />} />
                <Route path="/quiosque" element={<Quiosque />} />
                <Route path="/bem/:token" element={<BemQR />} />
                <Route path="/redefinir-senha" element={<RedefinirSenha />} />

                <Route path="/privacidade" element={<Privacidade />} />
                <Route path="/acessibilidade" element={<Acessibilidade />} />
                <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
                <Route path="/recovery" element={<DashboardRecovery />} />
                <Route path="/dashboard" element={<Dashboard />}>
                  <Route index element={<Navigate to="/dashboard/carteirinha" replace />} />
                  <Route path="carteirinha" element={<RotaCarteirinha />} />
                  {/* Rota depreciada: "Limite disponível" foi removido do portal externo */}
                  <Route path="limite" element={<Navigate to="/dashboard" replace />} />
                  
                  <Route path="clinicas" element={<Clinicas />} />
                  <Route path="informes" element={<Informes />} />
                  <Route path="dependentes" element={<Dependentes />} />
                  <Route path="associacao-premiada" element={<AssociacaoPremiada />} />
                  <Route path="simulador" element={<Simulador />} />
                  <Route path="indicar-parceiro" element={<IndicarParceiro />} />
                  <Route path="peculio" element={<Peculio />} />
                  <Route path="solicitar-peculio" element={<SolicitarPeculio />} />
                  <Route path="perfil" element={<Perfil />} />
                  <Route path="minha-privacidade" element={<MinhaPrivacidade />} />
                  <Route path="notificacoes" element={<Notificacoes />} />
                  <Route path="vinculo" element={<PortalVinculo />} />
                  <Route path="meus-dados" element={<RotaMeusDados />} />
                  <Route path="meu-titular" element={<RotaMeuTitular />} />
                  <Route path="seguranca" element={<SegurancaHub />} />
                  <Route path="preferencias" element={<RotaPreferencias />} />
                  <Route path="atendimento" element={<RotaAtendimento />} />
                  <Route path="solicitacoes" element={<PortalSolicitacoes />} />
                  <Route path="solicitacoes/nova" element={<PortalSolicitacaoNova />} />
                  <Route path="solicitacoes/:id" element={<PortalSolicitacaoDetalhes />} />
                  {/* Rota antiga da central de solicitações */}
                  <Route path="solicitacoes-legado" element={<Solicitacoes />} />
                  <Route path="documentos" element={<RotaDocumentos />} />
                  <Route path="financeiro" element={<Financeiro />} />
                  <Route path="agenda" element={<Agenda />} />
                  <Route path="faq" element={<FAQ />} />
                  <Route path="historico" element={<HistoricoAcessos />} />
                  <Route path="beneficios" element={<Beneficios />} />
                  <Route path="avaliar" element={<AvaliarClinicas />} />
                </Route>
                {/* Alias do portal externo */}
                <Route path="/portal/*" element={<PortalAlias />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminVisaoGeral />} />
                  <Route path="painel" element={<AdminHome />} />
                  <Route path="usuarios" element={<AdminUsuarios />} />
                  {/* Hubs dos módulos institucionais */}
                  <Route path="previdencia" element={<AdminPrevidencia />} />
                  <Route path="saude" element={<AdminSaude />} />
                  <Route path="patrimonio" element={<AdminPatrimonio />} />
                  <Route path="contabilidade" element={<AdminContabilidade />} />
                  <Route path="rh" element={<AdminRH />} />
                  <Route path="associados" element={<AdminAssociados />} />
                  <Route path="associacoes/pre-cadastros" element={<AdminPreCadastros />} />

                  <Route path="dependentes" element={<AdminDependentes />} />
                  <Route path="limites" element={<AdminLimites />} />
                  <Route path="carencias" element={<AdminCarencias />} />
                  <Route path="clinicas" element={<AdminClinicas />} />
                  <Route path="informes" element={<AdminInformes />} />
                  <Route path="automacoes" element={<AdminAutomacoes />} />
                  <Route path="integracoes" element={<AdminIntegracoes />} />
                  <Route path="integracoes/inconsistencias" element={<AdminIntegracoes />} />
                  <Route path="integracoes/validacao-externa" element={<AdminValidacaoExterna />} />


                  <Route path="sincronizacao" element={<AdminSincronizacao />} />
                  <Route path="configuracoes" element={<AdminConfiguracoes />} />
                  <Route path="aniversariantes" element={<AdminAniversariantes />} />
                  <Route path="comunicados" element={<AdminComunicados />} />
                  <Route path="importar" element={<AdminImportar />} />
                  <Route path="auditoria" element={<AdminAuditoria />} />
                  <Route path="peculio" element={<AdminPeculio />} />
                  <Route path="seguranca" element={<AdminSeguranca />} />
                  <Route path="notificacoes" element={<AdminNotificacoes />} />
                  <Route path="solicitacoes" element={<AdminSolicitacoes />} />
                  <Route path="documentos" element={<AdminDocumentos />} />
                  <Route path="financeiro" element={<AdminFinanceiro />} />
                  <Route path="financeiro/cheques/*" element={<ChequesRoutes />} />
                  <Route path="eventos" element={<AdminEventos />} />
                  <Route path="faq" element={<AdminFAQ />} />
                  <Route path="avaliacoes" element={<AdminAvaliacoes />} />
                  <Route path="privacidade" element={<AdminPrivacidade />} />
                  <Route path="relatorios" element={<AdminRelatorios />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="componentes" element={<AdminComponentes />} />
                  <Route path="assinatura-icp" element={<AdminAssinaturaICP />} />
                  <Route path="sobre" element={<AdminSobre />} />
                  <Route path="tutoriais" element={<AdminTutoriais />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </BrowserRouter>
          </AssociadoProvider>
        </A11yProvider>
      </ThemeProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;