import { useCallback, useEffect, useMemo, useState } from "react";
import { portalCall } from "@/lib/portal";
import { useAssociado } from "@/contexts/AssociadoContext";
import { icons } from "@/design-system/icons";
import PortalPageHeader from "@/portal/components/PortalPageHeader";
import { PortalCard } from "@/portal/ui/PortalCard";
import { PortalEmptyState, SearchEmptyState } from "@/portal/ui/PortalEmptyState";
import { SectionErrorState } from "@/portal/ui/errorStates";
import { ListSkeleton } from "@/portal/ui/skeletons";
import { PortalAlert, portalToast } from "@/portal/ui/feedback";
import { PortalButton } from "@/portal/forms/buttons";
import { DataSearch } from "@/portal/data/DataSearch";
import { PortalPagination } from "@/portal/data/PortalPagination";
import { useDataView, searchRows, paginateRows } from "@/portal/data";
import { Badge } from "@/design-system/components/Badge";
import { categoriasDocumentoDependente, categoriaDocumentoDependente } from "@/portal/dependente/config";

interface DocumentoRegistro {
  id: string;
  titulo?: string | null;
  descricao?: string | null;
  categoria?: string | null;
  created_at?: string | null;
}

const dataHora = (v?: string | null) =>
  v ? new Date(v).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

/**
 * Meus documentos do dependente (§8 da Fase 8).
 *
 * Lista somente documentos liberados para o próprio dependente pela função
 * segura do portal — o cliente nunca consulta as tabelas diretamente.
 */
export default function DocumentosDependente() {
  const { associado, dependenteLogado } = useAssociado();
  const [itens, setItens] = useState<DocumentoRegistro[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [categoria, setCategoria] = useState("todas");
  const view = useDataView({ pageSize: 8 });

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const res = await portalCall<{ itens: DocumentoRegistro[] }>("documentos");
      setItens(res?.itens ?? []);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível carregar seus documentos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (associado) void carregar();
  }, [associado, dependenteLogado?.id, carregar]);

  const filtrados = useMemo(() => {
    let base = itens.map((d) => ({ ...d, grupo: categoriaDocumentoDependente(d.categoria) }));
    if (categoria !== "todas") base = base.filter((d) => d.grupo === categoria);
    return searchRows(base, view.debouncedSearch, (d) => [d.titulo ?? "", d.descricao ?? "", d.grupo]);
  }, [itens, categoria, view.debouncedSearch]);

  const pagina = useMemo(
    () => paginateRows(filtrados, view.page, view.pageSize),
    [filtrados, view.page, view.pageSize],
  );

  const baixar = async (doc: DocumentoRegistro) => {
    try {
      const { url } = await portalCall<{ url: string }>("documento_url", { documento_id: doc.id });
      window.open(url, "_blank", "noopener,noreferrer");
    } catch {
      portalToast.error("Não foi possível abrir o documento", "Tente novamente em alguns instantes.");
    }
  };

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Meus documentos"
        description="Arquivos disponibilizados pela SBPM exclusivamente para você."
        source="Base institucional"
      />

      <PortalAlert tone="info" title="Documentos protegidos" icon={icons.lgpd}>
        Os links de download são temporários e pessoais. Não compartilhe os arquivos com terceiros.
      </PortalAlert>

      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="w-full md:max-w-sm">
          <DataSearch
            value={view.search}
            onChange={view.setSearch}
            placeholder="Pesquisar documento..."
            label="Pesquisar documentos"
          />
        </div>
        <ul className="flex flex-wrap gap-2" aria-label="Filtrar por categoria">
          <li>
            <FiltroBotao ativo={categoria === "todas"} onClick={() => setCategoria("todas")}>
              Todas
            </FiltroBotao>
          </li>
          {categoriasDocumentoDependente.map((c) => (
            <li key={c.value}>
              <FiltroBotao ativo={categoria === c.value} onClick={() => setCategoria(c.value)}>
                {c.label}
              </FiltroBotao>
            </li>
          ))}
        </ul>
      </div>

      {loading ? (
        <ListSkeleton items={4} />
      ) : erro ? (
        <SectionErrorState description={erro} onRetry={carregar} />
      ) : !itens.length ? (
        <PortalEmptyState
          icon={icons.pasta}
          title="Nenhum documento disponível"
          description="Quando a SBPM disponibilizar documentos para você, eles aparecerão aqui."
        />
      ) : !filtrados.length ? (
        <SearchEmptyState
          term={view.debouncedSearch}
          onClearFilters={() => {
            view.setSearch("");
            setCategoria("todas");
          }}
        />
      ) : (
        <>
          <ul className="grid gap-3 md:grid-cols-2">
            {pagina.map((doc) => (
              <li key={doc.id}>
                <PortalCard title={doc.titulo ?? "Documento"} icon={icons.documento}>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="neutral">
                      {categoriasDocumentoDependente.find((c) => c.value === doc.grupo)?.label ?? "Outros"}
                    </Badge>
                    <span className="text-xs text-muted-foreground">Disponível desde {dataHora(doc.created_at)}</span>
                  </div>
                  {doc.descricao && <p className="mt-2 text-sm text-muted-foreground">{doc.descricao}</p>}
                  <div className="mt-4 flex flex-wrap gap-2">
                    <PortalButton size="small" iconLeft={icons.baixar} onClick={() => baixar(doc)}>
                      Visualizar / baixar
                    </PortalButton>
                    <PortalButton
                      size="small"
                      variant="outline"
                      iconLeft={icons.imprimir}
                      onClick={() => baixar(doc)}
                      ariaLabel={`Imprimir ${doc.titulo ?? "documento"}`}
                    >
                      Imprimir
                    </PortalButton>
                  </div>
                </PortalCard>
              </li>
            ))}
          </ul>

          <PortalPagination
            page={view.page}
            pageSize={view.pageSize}
            total={filtrados.length}
            onPageChange={view.setPage}
            onPageSizeChange={view.setPageSize}
          />
        </>
      )}
    </div>
  );
}

function FiltroBotao({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={ativo}
      className={`min-h-11 rounded-full border px-4 text-sm transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
        ativo ? "border-primary bg-primary/10 font-semibold text-primary" : "border-border text-muted-foreground hover:bg-muted"
      }`}
    >
      {children}
    </button>
  );
}
