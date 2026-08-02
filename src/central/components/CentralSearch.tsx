import { useState } from "react";
import { Link } from "react-router-dom";
import { Text } from "@/design-system/components/Text";
import { Badge } from "@/design-system/components/Badge";
import { icons } from "@/design-system/icons";
import { PortalCard, SearchEmptyState } from "@/portal/ui";
import { ListSkeleton } from "@/portal/ui/skeletons";
import { rotulosTipoBusca, useCentralSearch } from "../hooks/useCentralSearch";

/**
 * Pesquisa global da Central (§22): FAQ, tutoriais, downloads, notícias,
 * avisos e protocolos do próprio usuário em um único campo.
 */
export default function CentralSearch({ autoFocus }: { autoFocus?: boolean }) {
  const [termo, setTermo] = useState("");
  const { agrupados, loading, vazio } = useCentralSearch(termo);

  return (
    <div className="space-y-3">
      <label className="relative block">
        <span className="sr-only">Pesquisar na Central de Relacionamento</span>
        <icons.buscar className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <input
          type="search"
          autoFocus={autoFocus}
          value={termo}
          onChange={(e) => setTermo(e.target.value)}
          placeholder="Busque por protocolo, dúvida, documento ou tutorial"
          className="h-12 w-full rounded-xl border border-border bg-background pl-10 pr-4 text-sm outline-none transition focus-visible:ring-2 focus-visible:ring-ring"
        />
      </label>

      {termo.trim().length >= 2 && (
        <PortalCard density="compact" ariaLabel="Resultados da pesquisa">
          {loading ? (
            <ListSkeleton items={3} />
          ) : vazio ? (
            <SearchEmptyState term={termo} />
          ) : (
            <div className="space-y-4">
              {Array.from(agrupados.entries()).map(([tipo, itens]) => (
                <section key={tipo} className="space-y-1">
                  <Text variant="caption" as="h3" className="uppercase tracking-wide">
                    {rotulosTipoBusca[tipo]}
                  </Text>
                  <ul className="divide-y divide-border">
                    {itens.slice(0, 5).map((r) => (
                      <li key={`${tipo}-${r.id}`}>
                        <Link
                          to={r.route}
                          className="flex min-h-[44px] items-center justify-between gap-3 py-2 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm font-medium">{r.titulo}</span>
                            {r.descricao && <span className="block truncate text-xs text-muted-foreground">{r.descricao}</span>}
                          </span>
                          <icons.proximo className="h-4 w-4 shrink-0" aria-hidden />
                        </Link>
                      </li>
                    ))}
                  </ul>
                  {itens.length > 5 && <Badge tone="neutral">+{itens.length - 5} resultado(s)</Badge>}
                </section>
              ))}
            </div>
          )}
        </PortalCard>
      )}
    </div>
  );
}
