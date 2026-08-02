import { useSearchParams } from "react-router-dom";
import { useAssociado } from "@/contexts/AssociadoContext";
import PortalPageHeader from "@/portal/components/PortalPageHeader";
import SupportWizard from "@/central/components/SupportWizard";

/** Abertura de solicitação com wizard institucional (Fase 9, §4). */
export default function CentralAbrirSolicitacao() {
  const { isDependente } = useAssociado();
  const [params] = useSearchParams();

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Abrir solicitação"
        description="Em poucos passos você registra seu pedido e recebe um número de protocolo para acompanhamento."
      />
      <SupportWizard perfil={isDependente ? "dependent" : "associate"} moduloInicial={params.get("modulo") ?? undefined} />
    </div>
  );
}
