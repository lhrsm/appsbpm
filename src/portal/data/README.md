# Listagens do Portal — Fase 6

Importe sempre de `@/portal/data`. Nenhuma página do Portal do Associado/Dependente
deve criar tabela, busca, filtro, paginação, ordenação ou exportação própria.

## Estado
`useDataView` centraliza busca (debounce 350 ms), filtros, ordenação e paginação,
com sincronização opcional na URL (`syncUrl`). Helpers locais: `searchRows`,
`sortRows`, `paginateRows`.

```tsx
const view = useDataView({ syncUrl: true, pageSize: 10 });
```

## Colunas
`DataColumn` define `accessor` (ordenação/busca/exportação), `cell` (renderização),
`mobilePriority`, `sensitive` (dado pessoal) e `permission`. Colunas sem permissão
não são renderizadas nem exportadas.

## Componentes
| Componente | Quando usar | Quando não usar |
| --- | --- | --- |
| `DataToolbar` | Busca + filtros + ordenação + contador + ações | Página sem listagem |
| `DataSearch` | Campo de busca padrão | Busca global → `PortalGlobalSearch` |
| `DataFilters` / `MobileFiltersDrawer` | Filtros inline (desktop) e drawer (mobile) | Filtros que não afetam resultados |
| `DataSort` | Ordenação em select (mobile) | Desktop com cabeçalho ordenável |
| `PortalDataTable` | Tabela semântica no desktop | Mobile → `ResponsiveDataView` |
| `MobileRecordCard` | Registro em card no mobile | Substituir tabela no desktop |
| `ResponsiveDataView` | Alternância automática tabela/cards | Quando o modo é fixo por regra |
| `PortalPagination` | Navegação e registros por página | Listas curtas (< 1 página) |
| `RowActions` / `RecordActionMenu` | Ações por registro | Ações globais → toolbar |
| `DataExportMenu` | CSV, XLSX, PDF e impressão | Exportar dados fora do escopo do usuário |

## Estados
Tabela e view responsiva já renderizam internamente carregamento (`TableSkeleton`,
`MobileRecordCardSkeleton`), erro isolado (`SectionErrorState`) e vazio
(`PortalEmptyState`) — a página não deve duplicar.

## Exportação
Exporta somente o conjunto filtrado e visível. `sanitizeCell` neutraliza injeção de
fórmula (`=`, `+`, `-`, `@`) em CSV/planilha. Colunas `sensitive` só saem com
`includeSensitive` explícito e permissão.

## Acessibilidade
`caption` obrigatório, `aria-sort` nos cabeçalhos ordenáveis, `aria-live` no contador
e na paginação, alvo de toque de 44px, foco visível e ações operáveis por teclado.
