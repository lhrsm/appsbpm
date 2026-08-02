import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { portalCall } from "@/lib/portal";
import { icons } from "@/design-system/icons";
import PortalPageHeader from "@/portal/components/PortalPageHeader";
import { PortalCard } from "@/portal/ui/PortalCard";
import { InfoCard } from "@/portal/ui/cards";
import { PortalTimeline, type TimelineItem } from "@/portal/ui/PortalTimeline";
import { PortalAlert } from "@/portal/ui/feedback";
import { CardSkeleton } from "@/portal/ui/skeletons";
import { PageErrorState } from "@/portal/ui/errorStates";
import { PortalButton } from "@/portal/forms/buttons";
import { Text } from "@/design-system/components/Text";
import { etapasSolicitacao, getCategoriaSolicitacao } from "@/portal/associado/config";
import { formatarDataHora, protocoloDe, type SolicitacaoRegistro } from "./Solicitacoes";

const ordemStatus: Record<string, number> = { aberto: 0, em_andamento: 1, concluido: 2, cancelado: 2 };

/** Acompanhamento de uma solicitação (§8): protocolo, situação, prazo e histórico. */
export default function SolicitacaoDetalhes() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [item, setItem] = useState<SolicitacaoRegistro | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  useEffect(() => {
    let ativo = true;
    (async () => {
      setLoading(true);
      setErro(null);
      try {
        const { itens } = await portalCall<{ itens: SolicitacaoRegistro[] }>("solicitacoes_listar");
        const encontrada = (itens ?? []).find((i) => i.id === id) ?? null;
        if (!ativo) return;
        if (!encontrada) setErro("Solicitação não encontrada ou indisponível para o seu acesso.");
        setItem(encontrada);
      } catch (e) {
        if (ativo) setErro(e instanceof Error ? e.message : "Falha ao carregar a solicitação.");
      } finally {
        if (ativo) setLoading(false);
      }
    })();
    return () => {
      ativo = false;
    };
  }, [id]);

  const timeline = useMemo<TimelineItem[]>(() => {
    if (!item) return [];
    const atual = ordemStatus[item.status] ?? 0;
    return etapasSolicitacao.map((etapa, indice) => ({
      id: etapa.key,
      date: indice === 0 ? item.created_at : item.updated_at ?? item.created_at,
      title: etapa.label,
      description: etapa.description,
      status: indice <= atual ? item.status : undefined,
      current: indice === atual,
      upcoming: indice > atual,
    }));
  }, [item]);

  if (loading) return <CardSkeleton lines={6} />;
  if (erro || !item)
    return (
      <PageErrorState
        title="Solicitação indisponível"
        description={erro ?? "Não foi possível exibir esta solicitação."}
        onRetry={() => navigate("/dashboard/solicitacoes")}
      />
    );

  const categoria = getCategoriaSolicitacao(item.categoria);

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title={item.assunto}
        description={`Protocolo ${protocoloDe(item)}`}
        status={item.status}
        updatedAt={item.updated_at ?? item.created_at}
        source="Base institucional"
        action={
          <PortalButton variant="outline" iconLeft={icons.voltar} onClick={() => navigate("/dashboard/solicitacoes")}>
            Voltar às solicitações
          </PortalButton>
        }
      />

      <InfoCard
        title="Resumo"
        icon={icons.solicitacao}
        items={[
          { label: "Protocolo", value: protocoloDe(item) },
          { label: "Categoria", value: categoria?.label ?? item.categoria },
          { label: "Abertura", value: formatarDataHora(item.created_at) },
          { label: "Prazo estimado", value: item.sla_prazo ? formatarDataHora(item.sla_prazo) : "—" },
          { label: "Prioridade", value: item.prioridade === "alta" ? "Alta" : "Normal" },
        ]}
      />

      <PortalCard title="Descrição enviada" icon={icons.documento}>
        <Text variant="small" className="whitespace-pre-wrap text-muted-foreground">
          {item.descricao}
        </Text>
      </PortalCard>

      {item.resposta && (
        <PortalCard title="Resposta da SBPM" icon={icons.info}>
          <Text variant="small" className="whitespace-pre-wrap">
            {item.resposta}
          </Text>
        </PortalCard>
      )}

      <PortalCard title="Andamento" icon={icons.agenda}>
        <PortalTimeline items={timeline} />
      </PortalCard>

      <PortalAlert tone="info" title="Precisa complementar o pedido?" icon={icons.whatsapp}>
        Informe o protocolo {protocoloDe(item)} ao falar com o setor responsável pelos canais oficiais de atendimento.
      </PortalAlert>
    </div>
  );
}
