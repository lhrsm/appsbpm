import { lazy } from "react";
import { Route, Routes, Navigate } from "react-router-dom";

// Lazy loading das páginas do módulo de cheques
const ChequesDashboard = lazy(() => import("@/pages/admin/financeiro/cheques/ChequesDashboard"));
const EmitirCheque = lazy(() => import("@/pages/admin/financeiro/cheques/EmitirCheque"));
const ChequesEmitidos = lazy(() => import("@/pages/admin/financeiro/cheques/ChequesEmitidos"));
const GestaoTaloes = lazy(() => import("@/pages/admin/financeiro/cheques/GestaoTaloes"));
const ModelosImpressao = lazy(() => import("@/pages/admin/financeiro/cheques/ModelosImpressao"));
const AprovacoesCheque = lazy(() => import("@/pages/admin/financeiro/cheques/AprovacoesCheque"));
const DetalhesCheque = lazy(() => import("@/pages/admin/financeiro/cheques/DetalhesCheque"));

/**
 * Rotas do módulo de gestão e impressão de cheques.
 * Integrado ao fluxo financeiro da SBPM.
 */
export function ChequesRoutes() {
  return (
    <Routes>
      <Route index element={<ChequesDashboard />} />
      <Route path="novo" element={<EmitirCheque />} />
      <Route path="emitidos" element={<ChequesEmitidos />} />
      <Route path="taloes" element={<GestaoTaloes />} />
      <Route path="modelos" element={<ModelosImpressao />} />
      <Route path="aprovacoes" element={<AprovacoesCheque />} />
      <Route path=":id" element={<DetalhesCheque />} />
      <Route path="*" element={<Navigate to="." replace />} />
    </Routes>
  );
}
