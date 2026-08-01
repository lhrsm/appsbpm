# Design System Institucional SBPM — v2.0

Fundação visual única para todos os módulos: Previdência, Saúde, Financeiro, Patrimonial,
Contábil, RH, Administrativo, Gestão Documental, Central de Atendimento, Portal do Associado
e Portal do Dependente.

> **Fase 01 — apenas fundação.** Nenhuma página existente foi migrada nesta etapa.
> A migração ocorre na Fase 02, tela a tela, sem quebrar funcionalidades.

## Estrutura

```
src/design-system/
  tokens/       colors, spacing, typography, radius, shadow, breakpoints,
                animations, zIndex, opacity, transitions
  components/   componentes base reutilizáveis
  layouts/      PortalLayout, DashboardLayout, AdminShellLayout,
                AuthenticationLayout, PublicLayout
  hooks/        useBreakpoint, useDisclosure, useDebouncedValue
  styles/       tokens.css (variáveis CSS + utilitários ds-*)
  icons/        biblioteca única de ícones
  utilities/    cn, cores de contexto por módulo
  docs/         esta documentação
```

Importação única:

```ts
import { Button, Card, Field, CPFInput, icons, tokens } from "@/design-system";
```

## Regras inegociáveis

1. **Sem valores mágicos.** Espaçamento, raio, sombra, tipografia, z-index e transições vêm dos tokens.
2. **Sem cores literais** (`text-white`, `bg-[#0a0]`) em componentes — só tokens semânticos.
3. **Ícones sempre por `icons.<nome>`**; a mesma função usa sempre o mesmo ícone.
4. **Um `<main>` por página**, provido pelos layouts.
5. **Três padrões de botão**: `primary`, `secondary`, `ghost`. Variações via `tone` e `size`.
6. **Todo card deriva de `<Card>`.** Nada de `div` estilizada como card na página.

## Tokens

| Arquivo | Conteúdo |
| --- | --- |
| `colors.ts` | Verde institucional (main/dark/medium/light), cinzas 50–900, branco/preto, feedback (sucesso, erro, alerta, informação) e módulos (LGPD, Financeiro, Saúde, Previdência, Patrimônio, RH). `buildColorSet()` gera os estados background/text/border/hover/pressed/disabled/selected. |
| `spacing.ts` | 4, 8, 12, 16, 20, 24, 32, 40, 48, 56, 64, 80, 96. |
| `typography.ts` | Display, H1–H6, Body Large, Body, Small, Caption, Overline + pesos 300–700, line-height e letter-spacing. |
| `radius.ts` | xs, sm, md, lg, xl, 2xl, full. |
| `shadow.ts` | xs, sm, md, lg, xl, floating (classes `ds-shadow-*`). |
| `breakpoints.ts` | Mobile, Tablet (640), Laptop (1024), Desktop (1280), UltraWide (1600) + `pwa` (display-mode standalone). |
| `animations.ts` | Durações, easings, classes de animação e microinterações. |
| `transitions.ts` | hover, focus, press, loading, collapse, drawer, sidebar, accordion. |
| `zIndex.ts` | base → skipLink, cobrindo header, drawer, modal, popover, tooltip e toast. |
| `opacity.ts` | subtle → full. |

Contêiner: Desktop 1600px, Laptop 1400px, Tablet/Mobile 100%, com padding responsivo.

## Grid

`<Grid cols={{ mobile, tablet, desktop }} />` — 4 colunas no mobile, 8 no tablet, 12 no desktop.

## Acessibilidade (WCAG AA)

- Todos os controles com foco visível (`focus-visible:ring-ring`).
- `IconButton` exige `label` → vira `aria-label`.
- Estados de carregamento com `role="status"` e `aria-live="polite"`.
- Erros de formulário com `role="alert"` e `aria-invalid`.
- Overlays via Radix (foco preso, ESC, ARIA correto).
- Tabelas com `<caption>` acessível e `scope="col"`.
- Alvos de toque mínimos de 44×44 px em `IconButton`.

## Performance

- Componentes puros e sem estado global — seguros para `React.memo`.
- Exportações nomeadas por arquivo (tree shaking).
- Nenhum import de barril dentro dos próprios componentes (evita ciclos e bundles inflados).
- Layouts prontos para `React.lazy` / code splitting por rota.
- Imagens de avatar com `loading="lazy"`.

## Índice de documentação

- [Componentes](./components.md)
- [Auditoria da Fase 01](./auditoria.md)
