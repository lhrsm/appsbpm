import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AssociadoProvider } from "@/contexts/AssociadoContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Carteirinha from "./pages/Carteirinha";
import Limite from "./pages/Limite";

import Clinicas from "./pages/Clinicas";
import Informes from "./pages/Informes";
import Dependentes from "./pages/Dependentes";
import Perfil from "./pages/Perfil";
import Notificacoes from "./pages/Notificacoes";
import NotFound from "./pages/NotFound";
import Privacidade from "./pages/Privacidade";
import Acessibilidade from "./pages/Acessibilidade";
import CookieConsent from "./components/CookieConsent";
import AccessibilityWidget from "./components/AccessibilityWidget";
import ChatbotWidget from "./components/ChatbotWidget";
import InstallPWAPrompt from "./components/InstallPWAPrompt";
import OfflineBanner from "./components/OfflineBanner";
import BackToTop from "./components/BackToTop";
import PageSkeleton from "./components/PageSkeleton";

// Lazy: páginas menos frequentes do portal do associado
const AssociacaoPremiada = lazy(() => import("./pages/AssociacaoPremiada"));
const Simulador = lazy(() => import("./pages/Simulador"));
const IndicarParceiro = lazy(() => import("./pages/IndicarParceiro"));
const Peculio = lazy(() => import("./pages/Peculio"));
const SolicitarPeculio = lazy(() => import("./pages/SolicitarPeculio"));
const MinhaPrivacidade = lazy(() => import("./pages/MinhaPrivacidade"));
const Solicitacoes = lazy(() => import("./pages/Solicitacoes"));
const MeusDocumentos = lazy(() => import("./pages/MeusDocumentos"));
const Financeiro = lazy(() => import("./pages/Financeiro"));
const Agenda = lazy(() => import("./pages/Agenda"));
const FAQ = lazy(() => import("./pages/FAQ"));
const HistoricoAcessos = lazy(() => import("./pages/HistoricoAcessos"));
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
const PortalBoasVindas = lazy(() => import("./pages/portal/PortalBoasVindas"));
const PortalEntrar = lazy(() => import("./pages/portal/PortalEntrar"));
const PortalPrimeiroAcesso = lazy(() => import("./pages/portal/PortalPrimeiroAcesso"));
const PortalRecuperarAcesso = lazy(() => import("./pages/portal/PortalRecuperarAcesso"));
const AdminValidacaoExterna = lazy(() => import("./pages/admin/AdminValidacaoExterna"));

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

const queryClient = new QueryClient();

const RouteFallback = () => (
  <div className="p-6">
    <PageSkeleton rows={4} />
  </div>
);

const HIDDEN_CHAT_ROUTES = ["/", "/admin/login", "/quiosque", "/redefinir-senha"];

const ChatbotGate = () => {
  const { pathname } = useLocation();
  if (HIDDEN_CHAT_ROUTES.includes(pathname) || pathname.startsWith("/bem/")) return null;
  return <ChatbotWidget />;
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
      <AssociadoProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CookieConsent />
          <AccessibilityWidget />
          <ChatbotGate />

          <InstallPWAPrompt />
          <OfflineBanner />
          <BackToTop />
          <Suspense fallback={<RouteFallback />}>
            <Routes>
              <Route path="/" element={<Login />} />
              <Route path="/quiosque" element={<Quiosque />} />
              <Route path="/bem/:token" element={<BemQR />} />
              <Route path="/redefinir-senha" element={<RedefinirSenha />} />

              <Route path="/privacidade" element={<Privacidade />} />
              <Route path="/acessibilidade" element={<Acessibilidade />} />
              <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
              <Route path="/dashboard" element={<Dashboard />}>
                <Route index element={<Navigate to="/dashboard/carteirinha" replace />} />
                <Route path="carteirinha" element={<Carteirinha />} />
                <Route path="limite" element={<Limite />} />
                
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
                <Route path="solicitacoes" element={<Solicitacoes />} />
                <Route path="documentos" element={<MeusDocumentos />} />
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

                <Route path="dependentes" element={<AdminDependentes />} />
                <Route path="limites" element={<AdminLimites />} />
                <Route path="carencias" element={<AdminCarencias />} />
                <Route path="clinicas" element={<AdminClinicas />} />
                <Route path="informes" element={<AdminInformes />} />
                <Route path="automacoes" element={<AdminAutomacoes />} />
                <Route path="integracoes" element={<AdminIntegracoes />} />
                <Route path="integracoes/inconsistencias" element={<AdminIntegracoes />} />

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
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
