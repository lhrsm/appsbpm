import Carteirinha from "@/pages/Carteirinha";
import { useAssociado } from "@/contexts/AssociadoContext";
import { icons } from "@/design-system/icons";
import PortalPageHeader from "@/portal/components/PortalPageHeader";
import { PortalAlert } from "@/portal/ui/feedback";
import { PortalButton } from "@/portal/forms/buttons";
import { Link } from "react-router-dom";

/**
 * Minha carteirinha (§5 da Fase 8).
 *
 * Página exclusiva do dependente: visualizar, baixar, imprimir e compartilhar a
 * própria identificação. Nenhuma informação interna ou do titular é exibida.
 */
export default function MinhaCarteirinha() {
  const { dependenteLogado } = useAssociado();
  const ativo = dependenteLogado?.ativo !== false;

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Minha carteirinha"
        description="Sua identificação digital da SBPM. Apresente-a na rede credenciada junto a um documento oficial com foto."
        status={ativo ? "ativo" : "inativo"}
        source="Base institucional"
        action={
          <PortalButton variant="outline" iconLeft={icons.solicitacao} asChild>
            <Link to="/dashboard/solicitacoes/nova">Solicitar 2ª via</Link>
          </PortalButton>
        }
      />

      {!ativo && (
        <PortalAlert tone="warning" title="Vínculo inativo" icon={icons.alerta}>
          Sua carteirinha pode não ser aceita na rede credenciada enquanto o vínculo estiver inativo. Fale com a
          Previdência para regularizar.
        </PortalAlert>
      )}

      <PortalAlert tone="info" title="Uso da carteirinha" icon={icons.info}>
        O QR Code permite a validação da sua identificação pelo parceiro. Nunca compartilhe imagens da carteirinha em
        redes sociais ou grupos públicos.
      </PortalAlert>

      <Carteirinha />
    </div>
  );
}
