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

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AssociadoProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/.lovable/oauth/consent" element={<OAuthConsent />} />
            <Route path="/dashboard" element={<Dashboard />}>
              <Route index element={<Navigate to="/dashboard/carteirinha" replace />} />
              <Route path="carteirinha" element={<Carteirinha />} />
              <Route path="limite" element={<Limite />} />
              <Route path="carencias" element={<Carencias />} />
              <Route path="clinicas" element={<Clinicas />} />
              <Route path="informes" element={<Informes />} />
              <Route path="dependentes" element={<Dependentes />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AssociadoProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
