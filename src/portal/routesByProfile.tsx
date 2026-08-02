import { lazy, Suspense, type ComponentType } from "react";
import { Navigate } from "react-router-dom";
import { useAssociado } from "@/contexts/AssociadoContext";
import { CardSkeleton } from "@/portal/ui/skeletons";

/**
 * Roteamento por perfil (Fase 8).
 *
 * O dependente possui páginas próprias para carteirinha, dados, documentos,
 * atendimento, segurança e preferências. O associado mantém as versões da Fase 7.
 */
function porPerfil(Associado: ComponentType, Dependente: ComponentType) {
  return function RotaPorPerfil() {
    const { isDependente } = useAssociado();
    const Componente = isDependente ? Dependente : Associado;
    return (
      <Suspense fallback={<CardSkeleton />}>
        <Componente />
      </Suspense>
    );
  };
}

const AssociadoCarteirinha = lazy(() => import("@/pages/Carteirinha"));
const AssociadoMeusDados = lazy(() => import("@/pages/portal/associado/MeusDados"));
const AssociadoDocumentos = lazy(() => import("@/pages/MeusDocumentos"));
const AssociadoAtendimento = lazy(() => import("@/pages/portal/associado/Atendimento"));

const DependenteCarteirinha = lazy(() => import("@/pages/portal/dependente/MinhaCarteirinha"));
const DependenteMeusDados = lazy(() => import("@/pages/portal/dependente/MeusDados"));
const DependenteDocumentos = lazy(() => import("@/pages/portal/dependente/Documentos"));
const DependenteAtendimento = lazy(() => import("@/pages/portal/dependente/Atendimento"));
const DependenteSeguranca = lazy(() => import("@/pages/portal/dependente/Seguranca"));
const DependentePreferencias = lazy(() => import("@/pages/portal/dependente/Preferencias"));
const DependenteMeuTitular = lazy(() => import("@/pages/portal/dependente/MeuTitular"));

export const RotaCarteirinha = porPerfil(AssociadoCarteirinha, DependenteCarteirinha);
export const RotaMeusDados = porPerfil(AssociadoMeusDados, DependenteMeusDados);
export const RotaDocumentos = porPerfil(AssociadoDocumentos, DependenteDocumentos);
export const RotaAtendimento = porPerfil(AssociadoAtendimento, DependenteAtendimento);

/** Rotas exclusivas do dependente — o associado é redirecionado ao início. */
function somenteDependente(Componente: ComponentType) {
  return function RotaDependente() {
    const { isDependente } = useAssociado();
    if (!isDependente) return <Navigate to="/dashboard" replace />;
    return (
      <Suspense fallback={<CardSkeleton />}>
        <Componente />
      </Suspense>
    );
  };
}

export const RotaMeuTitular = somenteDependente(DependenteMeuTitular);
export const RotaSeguranca = somenteDependente(DependenteSeguranca);
export const RotaPreferencias = somenteDependente(DependentePreferencias);
