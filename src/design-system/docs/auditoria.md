# Auditoria — Fase 01 (fundação do Design System)

Varredura executada sobre `src/` antes e depois da criação da biblioteca.
Nenhuma regra de negócio, autenticação, banco de dados, API, permissão, integração,
fluxo de primeiro acesso ou fluxo administrativo foi alterada nesta fase.

## 1. Situação encontrada na varredura

| Achado | Ocorrências | Observação |
| --- | --- | --- |
| Arquivos importando `lucide-react` diretamente | 71 | Mesma função usando ícones diferentes entre páginas (perfil, documento, saúde). |
| Arquivos com cores literais (`text-white`, `bg-white`, hex) | 32 | Quebram tema escuro e o modo de alto contraste. |
| Repetição do "card manual" (`rounded-xl border bg-card …`) | 10 arquivos | Cada página reimplementava cabeçalho/ícone/status do card. |
| `h-screen` em vez de `h-dvh` | 8 arquivos | Corte de conteúdo em navegadores móveis. |
| Estados de carregamento/vazio ad hoc | Diversos | Textos "Carregando..." soltos, sem `role="status"`. |
| Máscaras de CPF/telefone/data replicadas | Diversos | Lógica duplicada fora de `src/lib/format.ts`. |
| Botões com variantes inconsistentes | Diversos | Mistura de `outline`, `link`, `secondary` para a mesma hierarquia. |

Componentes reutilizáveis já existentes e preservados: `src/components/ui/*` (shadcn/Radix),
`ThemeToggle`, `AccessibilityWidget`, `Breadcrumbs`, `PageSkeleton`, `GlobalSearch`,
`admin/ModuleHub`, `admin/PermissionGuard`. O Design System **encapsula** o shadcn em vez de
substituí-lo — sem duplicação de primitivas.

## 2. Entregas da Fase 01

- 10 arquivos de tokens (`colors`, `spacing`, `typography`, `radius`, `shadow`, `breakpoints`,
  `animations`, `zIndex`, `opacity`, `transitions`) + camada CSS `styles/tokens.css`
  (variáveis de módulos, cinzas 50–900, verdes, sucesso/informação, sombras `ds-shadow-*`
  e animações `ds-animate-*`, com equivalentes em tema escuro).
- Biblioteca única de ícones (`icons/index.ts`) com mapa canônico função → ícone.
- 30+ componentes base documentados (botões, cards, badges, avatar, skeletons, empty states,
  alertas, toast, overlays, disclosure, formulários, inputs mascarados, tabela, paginação,
  filtros, cabeçalhos, grid e container).
- 5 layouts padrão sobre um `AppShell` comum.
- 3 hooks utilitários (responsividade, disclosure, debounce).
- Documentação interna em `src/design-system/docs/`.

## 3. Checklist de validação

| Critério | Resultado |
| --- | --- |
| Componentes duplicados dentro do DS | Nenhum — overlays e disclosure reutilizam Radix/shadcn. |
| Estilos duplicados dentro do DS | Nenhum — sombras e animações centralizadas em `tokens.css`. |
| Tokens não utilizados | `opacity` e parte de `transitions` ainda sem consumo direto; ficam reservados para a Fase 02. |
| Componentes sem documentação | Nenhum — todos com TSDoc e entrada em `docs/components.md`. |
| Componentes sem acessibilidade | Nenhum — foco visível, ARIA, `role`, `aria-live`, rótulos obrigatórios em ícones. |
| Componentes sem responsividade | Nenhum — grid 4/8/12, tabela com rolagem, abas roláveis, `min-h-dvh` nos layouts. |
| Verificação de tipos | `tsgo --noEmit` sem erros. |
| Alteração visual em telas existentes | Nenhuma — nada foi migrado ainda. |

## 4. Pendências planejadas para a Fase 02 (migração)

1. Substituir os 71 imports diretos de `lucide-react` pelo mapa `icons`.
2. Eliminar as cores literais nos 32 arquivos identificados.
3. Trocar os cards manuais por `<Card>` e derivados.
4. Trocar `h-screen` por `h-dvh` nos 8 arquivos.
5. Padronizar carregamento/vazio com `Skeleton*` e `EmptyState`.
6. Unificar máscaras nos inputs do Design System.
7. Migrar as páginas por módulo, iniciando pelo Portal do Associado.
