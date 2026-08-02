import { useMemo } from "react";
import { useAssociado } from "@/contexts/AssociadoContext";
import PortalPageHeader from "@/portal/components/PortalPageHeader";
import { ActionCard, PortalCard, StatCard } from "@/portal/ui";
import { PortalAlert } from "@/portal/ui/feedback";
import { GridSkeleton } from "@/portal/ui/skeletons";
import { Text } from "@/design-system/components/Text";
import { Badge } from "@/design-system/components/Badge";
import { icons } from "@/design-system/icons";
import CentralSearch from "@/central/components/CentralSearch";
import ProtocoloCard from "@/central/components/ProtocoloCard";
import { modulosNavegacao } from "@/central/catalog";
import { useAvisos, useProtocolos } from "@/central/hooks/useRelationship";
import { relationshipService } from "@/central/service";

/**
 * Hub da Central de Relacionamento Institucional (Fase 9, §1 e §2).
 * Ponto único de entrada para todos os canais de comunicação com a SBPM.
 */
export default function CentralHub() {
  const { isDependente } = useAssociado();
  const { protocolos, resumo, loading, error, reload } = useProtocolos();
  const { avisos, loading: carregandoAvisos } = useAvisos();

  const modulos = useMemo(
    () => modulosNavegacao.filter((m) => !(isDependente && m.id === "feedback" && false)),
    [isDependente],
  );

  const avisoDestaque = avisos.find((a) => a.fixado) ?? avisos[0];

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Central de Relacionamento"
        description="Um só lugar para abrir solicitações, acompanhar protocolos, tirar dúvidas e falar com a SBPM."
        source={relationshipService.origem}
      />

      <CentralSearch />

      {!carregandoAvisos && avisoDestaque && (
        <PortalAlert
          tone={avisoDestaque.prioridade === "alta" ? "warning" : "info"}
          title={avisoDestaque.titulo}
          dismissible
        >
          {avisoDestaque.mensagem}
        </PortalAlert>
      )}

      <section aria-labelledby="resumo-central" className="space-y-3">
        <Text id="resumo-central" variant="h5" as="h2">
          Seus atendimentos
        </Text>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Em aberto" icon={icons.solicitacao} value={loading ? undefined : resumo.emAberto} loading={loading} to="/dashboard/central/solicitacoes" />
          <StatCard title="Aguardando documentos" icon={icons.pasta} value={loading ? undefined : resumo.aguardandoDocumentos} loading={loading} />
          <StatCard title="Respondidos" icon={icons.comunicado} value={loading ? undefined : resumo.respondidos} loading={loading} />
          <StatCard title="Sem avaliação" icon={icons.avaliacao} value={loading ? undefined : resumo.semAvaliacao} loading={loading} to="/dashboard/central/feedback" />
        </div>
      </section>

      <section aria-labelledby="modulos-central" className="space-y-3">
        <Text id="modulos-central" variant="h5" as="h2">
          O que você precisa hoje?
        </Text>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {modulos.map((m) => (
            <ActionCard key={m.id} title={m.label} description={m.descricao} icon={m.icon} to={m.route} />
          ))}
        </div>
      </section>

      <section aria-labelledby="ultimos-protocolos" className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <Text id="ultimos-protocolos" variant="h5" as="h2">
            Últimos protocolos
          </Text>
          {resumo.total > 0 && <Badge tone="neutral">{resumo.total} no total</Badge>}
        </div>

        {loading ? (
          <GridSkeleton items={3} />
        ) : error ? (
          <PortalCard error={error} onRetry={reload} title="Protocolos" />
        ) : protocolos.length === 0 ? (
          <PortalCard
            empty
            emptyTitle="Nenhuma solicitação registrada"
            emptyDescription="Quando você abrir um pedido, ele aparecerá aqui com número de protocolo."
            title="Protocolos"
          />
        ) : (
          <div className="grid gap-3 lg:grid-cols-2">
            {protocolos.slice(0, 4).map((p) => (
              <ProtocoloCard key={p.id} protocolo={p} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
