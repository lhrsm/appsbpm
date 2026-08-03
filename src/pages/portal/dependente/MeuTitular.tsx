import { Link } from "react-router-dom";
import { useAssociado } from "@/contexts/AssociadoContext";
import { icons } from "@/design-system/icons";
import PortalPageHeader from "@/portal/components/PortalPageHeader";
import { InfoCard } from "@/portal/ui/cards";
import { PortalCard } from "@/portal/ui/PortalCard";
import { PortalAlert } from "@/portal/ui/feedback";
import { PortalButton } from "@/portal/forms/buttons";
import { maskNome } from "@/portal/mask";
import { parentescoLabel } from "@/portal/dependente/config";

const dataBR = (v?: string | null) => (v ? new Date(v).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "—");

/**
 * Meu titular (§4 da Fase 8).
 *
 * Exibe apenas o essencial do titular responsável. NUNCA exibe CPF, matrícula
 * completa, telefone pessoal, endereço ou qualquer informação financeira.
 */
export default function MeuTitular() {
  const { associado, dependenteLogado } = useAssociado();

  if (!associado) return null;

  const vinculoAtivo = associado.status === 'regular';

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Meu titular"
        description="Informações do associado responsável pelo seu vínculo com a SBPM."
        status={vinculoAtivo ? "ativo" : "inativo"}
        source="Base institucional"
      />

      <PortalAlert tone="info" title="Proteção de dados" icon={icons.lgpd}>
        Por segurança, exibimos somente as informações necessárias para identificar o seu titular. Dados pessoais,
        financeiros e de contato particular do titular não são disponibilizados no seu portal.
      </PortalAlert>

      <InfoCard
        title="Titular responsável"
        icon={icons.associados}
        description="Dados mantidos pela base institucional (somente leitura)."
        items={[
          { label: "Nome", value: maskNome(associado.nome) },
          { label: "Posto / graduação", value: (associado as { patente?: string | null }).patente || "Não informado" },
          { label: "Situação do vínculo", value: vinculoAtivo ? "Ativo" : "Inativo" },
          { label: "Associado desde", value: dataBR(associado.data_admissao) },
          { label: "Meu grau de parentesco", value: parentescoLabel[dependenteLogado?.tipo ?? "outro"] ?? "Outro" },
        ]}
      />

      <PortalCard
        title="Contato institucional"
        description="Fale com a SBPM caso precise tratar de assuntos do vínculo."
        icon={icons.whatsapp}
      >
        <p className="text-sm text-muted-foreground">
          Assuntos sobre o vínculo de dependência são tratados pelo setor de Previdência. Se algum dado estiver
          incorreto, abra uma solicitação de correção.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          <PortalButton variant="primary" iconLeft={icons.whatsapp} asChild>
            <a href="https://wa.me/5571985496972" target="_blank" rel="noopener noreferrer">
              Falar com a Previdência
            </a>
          </PortalButton>
          <PortalButton variant="outline" iconLeft={icons.solicitacao} asChild>
            <Link to="/dashboard/solicitacoes/nova">Abrir solicitação</Link>
          </PortalButton>
        </div>
      </PortalCard>
    </div>
  );
}
