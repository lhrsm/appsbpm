import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { portalCall } from "@/lib/portal";
import { icons } from "@/design-system/icons";
import PortalPageHeader from "@/portal/components/PortalPageHeader";
import { PortalButton } from "@/portal/forms/buttons";
import {
  DataToolbar,
  DataExportMenu,
  PortalPagination,
  ResponsiveDataView,
  searchRows,
  sortRows,
  paginateRows,
  useDataView,
  type DataColumn,
} from "@/portal/data";
import { getStatus } from "@/portal/ui/status";
import { categoriasSolicitacao, getCategoriaSolicitacao } from "@/portal/associado/config";

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
  v
    ? new Date(v).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

export const protocoloDe = (s: Pick<SolicitacaoRegistro, "id" | "protocolo">) =>
  s.protocolo || `#${s.id.slice(0, 8).toUpperCase()}`;

/** Central de solicitações do associado (§8): protocolo, situação e histórico. */
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
      { id: "protocolo", header: "Protocolo", accessor: (r) => protocoloDe(r), sortable: true, mobilePriority: "primary" },
      { id: "assunto", header: "Assunto", accessor: (r) => r.assunto, sortable: true, mobilePriority: "primary" },
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
        accessor: (r) => r.created_at,
        cell: (r) => formatarDataHora(r.created_at),
        sortable: true,
        mobilePriority: "secondary",
      },
      {
        id: "status",
        header: "Situação",
        accessor: (r) => getStatus(r.status).label,
        sortable: true,
        mobilePriority: "primary",
      },
    ],
    [],
  );

  const view = useDataView({ syncUrl: true, pageSize: 10, initialSort: { columnId: "created_at", direction: "desc" } });

  const filtradas = useMemo(() => {
    let base = itens;
    if (view.filters.status) base = base.filter((i) => i.status === view.filters.status);
    if (view.filters.categoria) base = base.filter((i) => i.categoria === view.filters.categoria);
    base = searchRows(base, view.debouncedSearch, (r) => [protocoloDe(r), r.assunto, r.descricao, getCategoriaSolicitacao(r.categoria)?.label ?? r.categoria]);
    return sortRows(base, view.sort, columns);
  }, [itens, columns, view.filters, view.debouncedSearch, view.sort]);

  const pagina = useMemo(
    () => paginateRows(filtradas, view.page, view.pageSize),
    [filtradas, view.page, view.pageSize],
  );

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Minhas solicitações"
        description="Acompanhe pelo protocolo todos os pedidos abertos junto à SBPM."
        source="Base institucional"
        action={
          <PortalButton 
            iconLeft={icons.adicionar} 
            onClick={() => navigate("/dashboard/solicitacoes/nova")}
            className="w-full md:w-auto h-[52px] max-w-[380px] mx-auto font-semibold rounded-[14px] flex items-center justify-center"
          >
            Nova solicitação
          </PortalButton>
        }
      />

      <DataToolbar
        search={{ value: view.search, onChange: view.setSearch, placeholder: "Buscar por protocolo ou assunto", loading: view.searching }}
        filters={[
          {
            id: "status",
            label: "Situação",
            options: ["aberto", "em_andamento", "concluido", "cancelado"].map((s) => ({ value: s, label: getStatus(s).label })),
          },
          {
            id: "categoria",
            label: "Categoria",
            options: categoriasSolicitacao.map((c) => ({ value: c.value, label: c.label })),
          },
        ]}
        filterValues={view.filters}
        onFilterChange={view.setFilter}
        onClearFilters={view.clearFilters}
        sortOptions={[
          { value: "created_at:desc", label: "Mais recentes" },
          { value: "created_at:asc", label: "Mais antigas" },
          { value: "status:asc", label: "Situação" },
        ]}
        sort={view.sort}
        onSortChange={view.setSort}
        total={filtradas.length}
        onRefresh={carregar}
        refreshing={loading}
        actions={<DataExportMenu columns={columns} rows={filtradas} baseName="minhas-solicitacoes" title="Minhas solicitações" />}
      />

      <ResponsiveDataView
        caption="Solicitações registradas no portal"
        columns={columns}
        data={pagina}
        rowKey={(r) => r.id}
        loading={loading}
        error={erro}
        onRetry={carregar}
        sorting={{ value: view.sort, onToggle: view.toggleSort }}
        onRowClick={(r) => navigate(`/dashboard/solicitacoes/${r.id}`)}
        empty={{
          title: "Você ainda não abriu solicitações",
          description: "Quando abrir um pedido, ele aparecerá aqui com protocolo e histórico.",
        }}
        toCard={(r) => ({
          title: r.assunto,
          subtitle: protocoloDe(r),
          status: r.status,
          icon: icons.solicitacao,
          date: formatarDataHora(r.created_at),
          metadata: [{ label: "Categoria", value: getCategoriaSolicitacao(r.categoria)?.label ?? r.categoria }],
        })}
      />

      <PortalPagination
        page={view.page}
        pageSize={view.pageSize}
        total={filtradas.length}
        onPageChange={view.setPage}
        onPageSizeChange={view.setPageSize}
      />
    </div>
  );
}
