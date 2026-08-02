import { useParams, Link } from "react-router-dom";
import PortalPageHeader from "@/portal/components/PortalPageHeader";
import { PortalCard, PortalTimeline, SummaryList } from "@/portal/ui";
import { PortalAlert } from "@/portal/ui/feedback";
import { CardSkeleton } from "@/portal/ui/skeletons";
import { PortalButton } from "@/portal/forms";
import { Badge } from "@/design-system/components/Badge";
import { Text } from "@/design-system/components/Text";
import { icons } from "@/design-system/icons";
import FeedbackForm from "@/central/components/FeedbackForm";
import { diasRestantes } from "@/central/components/ProtocoloCard";
import { getModulo, linkWhatsAppCentral, setoresContato } from "@/central/catalog";
import { getCentralStatus, getPrioridade } from "@/central/status";
import { useProtocolo } from "@/central/hooks/useRelationship";

const dataHora = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

/** Detalhe do protocolo: dados, timeline, resposta e avaliação (§5 e §16). */
export default function CentralProtocoloDetalhe() {
  const { id } = useParams<{ id: string }>();
  const { protocolo, loading, error, reload } = useProtocolo(id);

  if (loading) return <CardSkeleton lines={6} />;

  if (error || !protocolo) {
    return (
      <div className="space-y-4">
        <PortalPageHeader title="Protocolo" />
        <PortalCard
          title="Protocolo não encontrado"
          error={error ?? "Não localizamos este protocolo na sua conta."}
          onRetry={reload}
        />
      </div>
    );
  }

  const status = getCentralStatus(protocolo.status);
  const prioridade = getPrioridade(protocolo.prioridade);
  const modulo = getModulo(protocolo.modulo);
  const restantes = diasRestantes(protocolo.prazoEm);
  const suporte = setoresContato.find((s) => s.id === protocolo.modulo) ?? setoresContato[3];

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title={protocolo.assunto}
        description={<span className="font-mono">{protocolo.protocolo}</span>}
        status={protocolo.status}
        updatedAt={protocolo.atualizadoEm}
        action={
          <PortalButton variant="secondary" asChild iconLeft={icons.anterior}>
            <Link to="/dashboard/central/solicitacoes">Voltar à lista</Link>
          </PortalButton>
        }
      />

      {status.descricao && <PortalAlert tone={status.tone === "danger" ? "danger" : status.tone === "warning" ? "warning" : "info"} title={status.label}>{status.descricao}</PortalAlert>}

      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-4">
          <PortalCard title="Detalhes do pedido" icon={modulo.icon}>
            <Text variant="small" className="whitespace-pre-wrap">
              {protocolo.descricao}
            </Text>
            <div className="mt-3 flex flex-wrap gap-2">
              <Badge tone="neutral" icon={modulo.icon}>{modulo.label}</Badge>
              <Badge tone={prioridade.tone} icon={prioridade.icon}>{prioridade.label}</Badge>
              {restantes !== null && !status.finalizado && (
                <Badge tone={restantes < 0 ? "danger" : "neutral"}>
                  {restantes < 0 ? `Prazo vencido há ${Math.abs(restantes)} dia(s)` : `Prazo em ${restantes} dia(s)`}
                </Badge>
              )}
            </div>
          </PortalCard>

          {protocolo.resposta && (
            <PortalCard title="Resposta da SBPM" icon={icons.comunicado} variant="success">
              <Text variant="small" className="whitespace-pre-wrap">
                {protocolo.resposta}
              </Text>
            </PortalCard>
          )}

          <PortalCard title="Histórico do atendimento" icon={icons.horario}>
            <PortalTimeline
              items={protocolo.historico.map((e) => ({
                id: e.id,
                date: e.data,
                title: e.titulo,
                description: e.descricao,
                status: e.status ?? undefined,
              }))}
              emptyTitle="Sem movimentações"
              emptyDescription="Assim que houver andamento, ele aparecerá aqui."
            />
          </PortalCard>

          {status.finalizado && !protocolo.avaliado && (
            <FeedbackForm protocoloId={protocolo.id} protocolo={protocolo.protocolo} onEnviado={reload} />
          )}
        </div>

        <div className="space-y-4">
          <PortalCard title="Resumo" density="compact">
            <SummaryList
              items={[
                { id: "protocolo", title: "Protocolo", meta: protocolo.protocolo },
                { id: "abertura", title: "Aberto em", meta: dataHora(protocolo.criadoEm) },
                { id: "atualizacao", title: "Última atualização", meta: dataHora(protocolo.atualizadoEm) },
                { id: "responsavel", title: "Responsável", meta: protocolo.responsavel ?? "Equipe SBPM" },
                { id: "origem", title: "Origem", meta: "Portal do associado" },
              ]}
            />
          </PortalCard>

          <PortalCard title="Precisa complementar?" icon={icons.whatsapp} density="compact">
            <Text variant="small" className="text-muted-foreground">
              Envie documentos ou informações adicionais citando o número do protocolo.
            </Text>
            <div className="mt-3 flex flex-col gap-2">
              {suporte.whatsapp && (
                <PortalButton asChild variant="secondary" iconLeft={icons.whatsapp}>
                  <a
                    href={linkWhatsAppCentral(suporte.whatsapp, `Olá! Sobre o protocolo ${protocolo.protocolo}:`)}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    WhatsApp {suporte.setor}
                  </a>
                </PortalButton>
              )}
              {suporte.email && (
                <PortalButton asChild variant="ghost" iconLeft={icons.email}>
                  <a href={`mailto:${suporte.email}?subject=${encodeURIComponent(`Protocolo ${protocolo.protocolo}`)}`}>
                    {suporte.email}
                  </a>
                </PortalButton>
              )}
            </div>
          </PortalCard>
        </div>
      </div>
    </div>
  );
}
