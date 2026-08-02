import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { portalCall } from "@/lib/portal";
import { icons } from "@/design-system/icons";
import PortalPageHeader from "@/portal/components/PortalPageHeader";
import { PortalButton } from "@/portal/forms/buttons";
import { ResponsiveDataView, useDataView, type DataColumn } from "@/portal/data";
import { getStatus } from "@/portal/ui/status";
import { getCategoriaSolicitacao } from "@/portal/associado/config";

export interface SolicitacaoRegistro {
  id: string;
  protocolo?: string | null;
  categoria: string;
  assunto: string;
  descricao: string;
  status: string;
  prioridade: string;
  created_at: string;
  updated_at?: string | null;
  sla_prazo?: string | null;
  resposta?: string | null;
}

export const formatarDataHora = (v?: string | null) =>
  v ? new Date(v).toLocaleString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "—";

export const protocoloDe = (s: SolicitacaoRegistro) =>
  s.protocolo || `#${s.id.slice(0, 8).toUpperCase()}`;

/** Central de solicitações do associado (§8) — listagem com filtros e protocolo. */
export default function Solicitacoes() {
  const navigate = useNavigate();
  const [itens, setItens] = useState<SolicitacaoRegistro[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const { itens } = await portalCall<{ itens: SolicitacaoRegistro[] }>("solicitacoes_listar");
      setItens(itens ?? []);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Falha ao carregar suas solicitações.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const columns = useMemo<DataColumn<SolicitacaoRegistro>[]>(
    () => [
      {
        id: "protocolo",
        header: "Protocolo",
        accessor: (r) => protocoloDe(r),
        sortable: true,
        mobilePriority: "primary",
      },
      {
        id: "assunto",
        header: "Assunto",
        accessor: (r) => r.assunto,
        sortable: true,
        mobilePriority: "primary",
      },
      {
        id: "categoria",
        header: "Categoria",
        accessor: (r) => getCategoriaSolicitacao(r.categoria)?.label ?? r.categoria,
        sortable: true,
        mobilePriority: "secondary",
      },
      {
        id: "created_at",
        header: "Abertura",
        accessor: (r) => formatarDataHora(r.created_at),
        sortValue: (r) => r.created_at,
        sortable: true,
        mobilePriority: "secondary",
      },
      {
        id: "status",
        header: "Situação",
        accessor: (r) => getStatus(r.status).label,
        type: "status",
        statusValue: (r) => r.status,
        sortable: true,
        mobilePriority: "primary",
      },
    ],
    [],
  );

  const view = useDataView<SolicitacaoRegistro>({
    data: itens,
    columns,
    searchKeys: ["assunto", "descricao", "categoria", "protocolo"],
    filters: [
      {
        id: "status",
        label: "Situação",
        options: ["aberto", "em_andamento", "concluido", "cancelado"].map((s) => ({
          value: s,
          label: getStatus(s).label,
        })),
        accessor: (r) => r.status,
      },
      {
        id: "categoria",
        label: "Categoria",
        options: [...new Set(itens.map((i) => i.categoria))].map((c) => ({
          value: c,
          label: getCategoriaSolicitacao(c)?.label ?? c,
        })),
        accessor: (r) => r.categoria,
      },
    ],
    initialSort: { column: "created_at", direction: "desc" },
  });

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Minhas solicitações"
        description="Acompanhe pelo protocolo todos os pedidos abertos junto à SBPM."
        source="Base institucional"
        action={
          <PortalButton iconLeft={icons.adicionar} onClick={() => navigate("/dashboard/solicitacoes/nova")}>
            Nova solicitação
          </PortalButton>
        }
      />

      <ResponsiveDataView
        {...view}
        columns={columns}
        loading={loading}
        error={erro}
        onRetry={carregar}
        caption="Solicitações registradas no portal"
        emptyTitle="Você ainda não abriu solicitações"
        emptyDescription="Quando abrir um pedido, ele aparecerá aqui com protocolo e histórico."
        onRowClick={(row) => navigate(`/dashboard/solicitacoes/${row.id}`)}
        exportFileName="minhas-solicitacoes"
      />
    </div>
  );
}
