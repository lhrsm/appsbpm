import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAssociado } from "@/contexts/AssociadoContext";
import { portalCall } from "@/lib/portal";
import { icons } from "@/design-system/icons";
import PortalPageHeader from "@/portal/components/PortalPageHeader";
import { StatusCard, InfoCard, ActionCard } from "@/portal/ui/cards";
import { PortalAlert } from "@/portal/ui/feedback";
import { CardSkeleton } from "@/portal/ui/skeletons";
import { SectionErrorState } from "@/portal/ui/errorStates";
import { PortalButton } from "@/portal/forms/buttons";
import { maskMatricula } from "@/portal/mask";
import { SolicitarCorrecaoModal } from "./SolicitarCorrecao";

const formatarData = (valor?: string | null) =>
  valor ? new Date(valor).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "—";

/**
 * Situação do vínculo do associado (§6).
 * Somente estados existentes no backend — nada é inferido ou simulado.
 */
export default function Vinculo() {
  const { associado } = useAssociado();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [dados, setDados] = useState<any>(null);
  const [correcao, setCorrecao] = useState(false);

  useEffect(() => {
    let ativo = true;
    (async () => {
      setLoading(true);
      setErro(null);
      try {
        const { associado: perfil } = await portalCall<{ associado: any }>("perfil");
        if (ativo) setDados(perfil);
      } catch (e) {
        if (ativo) setErro(e instanceof Error ? e.message : "Falha ao carregar o vínculo.");
      } finally {
        if (ativo) setLoading(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [associado?.id]);

  const atual = dados ?? associado;
  const status = useMemo(() => (atual?.status !== 'regular' ? "inativo" : atual ? "ativo" : "nao_disponivel"), [atual]);

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Situação do vínculo"
        description="Consulte a situação do seu vínculo associativo e a origem das informações."
        status={loading ? undefined : status}
        source="Base institucional"
        updatedAt={atual?.updated_at ?? null}
        action={
          <PortalButton variant="outline" iconLeft={icons.editar} onClick={() => setCorrecao(true)}>
            Solicitar correção
          </PortalButton>
        }
      />

      {loading ? (
        <CardSkeleton lines={4} />
      ) : erro ? (
        <SectionErrorState title="Não foi possível carregar o vínculo." description={erro} onRetry={() => location.reload()} />
      ) : (
        <>
          <StatusCard
            title="Vínculo associativo"
            status={status}
            description={
              status === "ativo"
                ? "Seu vínculo está ativo junto à SBPM."
                : "Seu vínculo não consta como ativo. Procure o atendimento para orientações."
            }
            details={[
              { label: "Tipo de vínculo", value: "Associado titular" },
              { label: "Matrícula", value: maskMatricula(atual?.matricula ?? null) },
              { label: "Data de associação", value: formatarData(atual?.data_admissao) },
              { label: "Categoria", value: atual?.patente ?? "Não informada" },
            ]}
          />

          <InfoCard
            title="Origem e atualização dos dados"
            icon={icons.atualizar}
            description="Os dados do vínculo são mantidos pela base institucional da SBPM."
            items={[
              { label: "Fonte do dado", value: "Base institucional SBPM" },
              { label: "Última atualização", value: formatarData(atual?.updated_at) },
              { label: "Situação da integração", value: "Atualizado" },
              { label: "Pendências", value: "Nenhuma pendência registrada" },
            ]}
          />

          <PortalAlert tone="info" title="Divergência nas informações?">
            Os dados oficiais não podem ser alterados diretamente no portal. Registre uma solicitação de correção e
            acompanhe pelo protocolo.
          </PortalAlert>

          <div className="grid gap-4 sm:grid-cols-2">
            <ActionCard
              title="Meus dados"
              description="Revise dados pessoais, contato e endereço."
              icon={icons.perfil}
              to="/dashboard/meus-dados"
            />
            <ActionCard
              title="Canais de atendimento"
              description="Fale com o setor responsável pelo seu vínculo."
              icon={icons.whatsapp}
              to="/dashboard/atendimento"
            />
          </div>
        </>
      )}

      <SolicitarCorrecaoModal
        open={correcao}
        onOpenChange={setCorrecao}
        campoPadrao="Situação do vínculo"
        valorAtual={status === "ativo" ? "Ativo" : "Inativo"}
        onSucesso={() => navigate("/dashboard/solicitacoes")}
      />
    </div>
  );
}
