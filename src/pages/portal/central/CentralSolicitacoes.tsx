import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import PortalPageHeader from "@/portal/components/PortalPageHeader";
import { PortalCard } from "@/portal/ui";
import { GridSkeleton } from "@/portal/ui/skeletons";
import { PortalButton } from "@/portal/forms";
import { SelectField } from "@/portal/forms";
import { icons } from "@/design-system/icons";
import { Text } from "@/design-system/components/Text";
import ProtocoloCard from "@/central/components/ProtocoloCard";
import { modulosCentral } from "@/central/catalog";
import { centralStatus } from "@/central/status";
import { useProtocolos } from "@/central/hooks/useRelationship";
import { protocoloCombina } from "@/central/protocolo";

/** Listagem de solicitações do usuário com busca, filtros e ordenação (§5). */
export default function CentralSolicitacoes() {
  const { protocolos, resumo, loading, error, reload } = useProtocolos();
  const [busca, setBusca] = useState("");
  const [status, setStatus] = useState("");
  const [modulo, setModulo] = useState("");
  const [ordem, setOrdem] = useState("recentes");

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const lista = protocolos.filter((p) => {
      if (status && p.status !== status) return false;
      if (modulo && p.modulo !== modulo) return false;
      if (!termo) return true;
      return (
        protocoloCombina(p.protocolo, termo) ||
        p.assunto.toLowerCase().includes(termo) ||
        p.descricao.toLowerCase().includes(termo)
      );
    });
    return lista.sort((a, b) => {
      const da = new Date(a.criadoEm).getTime();
      const db = new Date(b.criadoEm).getTime();
      return ordem === "antigos" ? da - db : db - da;
    });
  }, [protocolos, busca, status, modulo, ordem]);

  return (
    <div className="space-y-5">
      <PortalPageHeader
        title="Minhas solicitações"
        description={`${resumo.emAberto} em aberto · ${resumo.concluidos} finalizada(s)`}
        action={
          <PortalButton asChild iconLeft={icons.adicionar}>
            <Link to="/dashboard/central/abrir">Abrir solicitação</Link>
          </PortalButton>
        }
      />

      <PortalCard density="compact" ariaLabel="Filtros">
        <div className="grid gap-3 md:grid-cols-4">
          <label className="relative md:col-span-2">
            <span className="sr-only">Buscar por protocolo ou assunto</span>
            <icons.buscar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
            <input
              type="search"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Protocolo ou assunto"
              className="h-11 w-full rounded-xl border border-border bg-background pl-10 pr-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
          </label>
          <SelectField
            aria-label="Filtrar por situação"
            placeholder="Todas as situações"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            options={Object.values(centralStatus).map((s) => ({ value: s.key, label: s.label }))}
          />
          <SelectField
            aria-label="Filtrar por módulo"
            placeholder="Todos os módulos"
            value={modulo}
            onChange={(e) => setModulo(e.target.value)}
            options={modulosCentral.map((m) => ({ value: m.value, label: m.label }))}
          />
        </div>
        <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <Text variant="caption">{filtrados.length} resultado(s)</Text>
          <div className="flex items-center gap-2">
            <SelectField
              aria-label="Ordenar"
              value={ordem}
              onChange={(e) => setOrdem(e.target.value)}
              options={[
                { value: "recentes", label: "Mais recentes" },
                { value: "antigos", label: "Mais antigos" },
              ]}
            />
            {(busca || status || modulo) && (
              <PortalButton variant="ghost" onClick={() => { setBusca(""); setStatus(""); setModulo(""); }}>
                Limpar filtros
              </PortalButton>
            )}
          </div>
        </div>
      </PortalCard>

      {loading ? (
        <GridSkeleton items={4} />
      ) : error ? (
        <PortalCard title="Solicitações" error={error} onRetry={reload} />
      ) : filtrados.length === 0 ? (
        <PortalCard
          empty
          title="Solicitações"
          emptyTitle={protocolos.length ? "Nenhum resultado para os filtros" : "Você ainda não abriu solicitações"}
          emptyDescription={
            protocolos.length
              ? "Ajuste a busca ou limpe os filtros para ver todos os protocolos."
              : "Abra um pedido e acompanhe todo o andamento por aqui."
          }
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtrados.map((p) => (
            <ProtocoloCard key={p.id} protocolo={p} />
          ))}
        </div>
      )}
    </div>
  );
}
