# Biblioteca de UI do Portal — Fase 4

Importe sempre de `@/portal/ui`. Nenhuma página do Portal do Associado/Dependente
deve criar cards, badges, estados vazios, skeletons ou alertas próprios.

## Status
`status.ts` é o mapa central (`getStatus("aprovado") → Concluído / success / Check`).
Sinônimos de API são normalizados. Status sempre exibe **ícone + texto**, nunca só cor.

## Cards
| Componente | Quando usar | Quando não usar |
| --- | --- | --- |
| `PortalCard` | Base de qualquer superfície de conteúdo | Não recriar `div.rounded-xl.border` |
| `StatCard` | Indicador numérico simples | Métrica com progresso → `MetricCard` |
| `MetricCard` | Percentual/progresso com semântica (`kind`) | Números sem comparação |
| `InfoCard` | Dados cadastrais (lista de definição) | Listas cronológicas |
| `ActionCard` | Atalho de serviço (alvo ≥ 44px) | Cards com vários botões internos |
| `StatusCard` | Situação de vínculo/solicitação/sincronização | Conteúdo livre |
| `ProfileSummaryCard` | Resumo de pessoa (dados autorizados) | Exibir CPF, endereço, telefone, saúde |

## Listas e histórico
- `SummaryList` — documentos, solicitações, eventos, notificações (com `maxItems` + `viewAllRoute`).
- `PortalTimeline` — cronologia com etapas (`current`, `upcoming`).

## Estados
- `PortalEmptyState` + `emptyStates` (mensagens por contexto) e `SearchEmptyState` (busca/filtros).
- `SectionErrorState` (falha isolada, não bloqueia a página), `PageErrorState`, `AccessRestrictedState`.
- `IntegrationPendingState` — conteúdo dependente de integração. **Nunca simular dados reais.**
- `DemonstrationDataNotice` e `OfflineNotice` — ambiente de demonstração e modo offline.
- `DataFreshnessIndicator` — carimbo de atualização/origem.

## Skeletons
`CardSkeleton`, `StatCardSkeleton`, `MetricSkeleton`, `ListSkeleton`, `TableSkeleton`,
`TimelineSkeleton`, `FormSkeleton`, `GridSkeleton` — mesma altura do conteúdo real,
sem valores falsos (nunca exibir `0` durante o carregamento).

## Feedback
`PortalAlert`, `PortalGlobalNotice`, `InlineFeedback`, `ProcessingState`,
`ConfirmationDialog` (ações irreversíveis) e `portalToast` (linguagem institucional,
`portalToast.protocol("2026-0001")` para envios com protocolo).

## Acessibilidade
Contraste AA, foco visível, `aria-live` em erros e processamentos,
`prefers-reduced-motion` respeitado e alvo de toque mínimo de 44px no mobile.
