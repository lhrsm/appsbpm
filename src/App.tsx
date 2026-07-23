import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AssociadoProvider } from "@/contexts/AssociadoContext";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Carteirinha from "./pages/Carteirinha";
import Limite from "./pages/Limite";
import Carencias from "./pages/Carencias";
import Clinicas from "./pages/Clinicas";
import Informes from "./pages/Informes";
import Dependentes from "./pages/Dependentes";
import AssociacaoPremiada from "./pages/AssociacaoPremiada";
import Simulador from "./pages/Simulador";
import IndicarParceiro from "./pages/IndicarParceiro";
import Peculio from "./pages/Peculio";
import Perfil from "./pages/Perfil";
import MinhaPrivacidade from "./pages/MinhaPrivacidade";
import Notificacoes from "./pages/Notificacoes";
import Solicitacoes from "./pages/Solicitacoes";
import MeusDocumentos from "./pages/MeusDocumentos";
import Financeiro from "./pages/Financeiro";
import AdminSolicitacoes from "./pages/admin/AdminSolicitacoes";
import AdminDocumentos from "./pages/admin/AdminDocumentos";
import AdminFinanceiro from "./pages/admin/AdminFinanceiro";
import OAuthConsent from "./pages/OAuthConsent";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/admin/AdminLogin";
import AdminLayout from "./pages/admin/AdminLayout";
import AdminHome from "./pages/admin/AdminHome";
import AdminAssociados from "./pages/admin/AdminAssociados";
import AdminDependentes from "./pages/admin/AdminDependentes";
import AdminLimites from "./pages/admin/AdminLimites";
import AdminCarencias from "./pages/admin/AdminCarencias";
import AdminClinicas from "./pages/admin/AdminClinicas";
import AdminInformes from "./pages/admin/AdminInformes";
import AdminAutomacoes from "./pages/admin/AdminAutomacoes";
import AdminIntegracoes from "./pages/admin/AdminIntegracoes";
import AdminSincronizacao from "./pages/admin/AdminSincronizacao";
import AdminConfiguracoes from "./pages/admin/AdminConfiguracoes";
import AdminAniversariantes from "./pages/admin/AdminAniversariantes";
import AdminComunicados from "./pages/admin/AdminComunicados";
import AdminImportar from "./pages/admin/AdminImportar";
import AdminAuditoria from "./pages/admin/AdminAuditoria";
import AdminPeculio from "./pages/admin/AdminPeculio";
import AdminSeguranca from "./pages/admin/AdminSeguranca";
import AdminNotificacoes from "./pages/admin/AdminNotificacoes";
import Privacidade from "./pages/Privacidade";
import Acessibilidade from "./pages/Acessibilidade";
import CookieConsent from "./components/CookieConsent";
import AccessibilityWidget from "./components/AccessibilityWidget";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AssociadoProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <CookieConsent />
          <AccessibilityWidget />
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/privacidade" element={<Privacidade />} />
            <Route path="/acessibilidade" element={<Acessibilidade />} />
            <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<Navigate to="/dashboard/carteirinha" replace />} />
              <Route path="carteirinha" element={<Carteirinha />} />
              <Route path="limite" element={<Limite />} />
              <Route path="carencias" element={<Carencias />} />
              <Route path="clinicas" element={<Clinicas />} />
              <Route path="informes" element={<Informes />} />
              <Route path="dependentes" element={<Dependentes />} />
              <Route path="associacao-premiada" element={<AssociacaoPremiada />} />
              <Route path="simulador" element={<Simulador />} />
              <Route path="indicar-parceiro" element={<IndicarParceiro />} />
              <Route path="peculio" element={<Peculio />} />
              <Route path="perfil" element={<Perfil />} />
              <Route path="minha-privacidade" element={<MinhaPrivacidade />} />
              <Route path="notificacoes" element={<Notificacoes />} />
              <Route path="solicitacoes" element={<Solicitacoes />} />
              <Route path="documentos" element={<MeusDocumentos />} />
            </Route>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin" element={<AdminLayout />}>
              <Route index element={<AdminHome />} />
              <Route path="associados" element={<AdminAssociados />} />
              <Route path="dependentes" element={<AdminDependentes />} />
              <Route path="limites" element={<AdminLimites />} />
              <Route path="carencias" element={<AdminCarencias />} />
              <Route path="clinicas" element={<AdminClinicas />} />
              <Route path="informes" element={<AdminInformes />} />
              <Route path="automacoes" element={<AdminAutomacoes />} />
              <Route path="integracoes" element={<AdminIntegracoes />} />
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
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AssociadoProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
