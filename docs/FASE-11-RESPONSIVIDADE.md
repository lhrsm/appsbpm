# Fase 11 — Responsividade avançada (inventário e correções)

Escopo: plataforma externa (Portal do Associado e do Dependente) e componentes
compartilhados. Sem alterações de regra de negócio, autenticação, integrações,
permissões ou banco de dados.

## Breakpoints oficiais

| Faixa | Largura | Tailwind |
| --- | --- | --- |
| Mobile pequeno | até 359px | (base) |
| Mobile | 360–479px | `xs` |
| Mobile grande | 480–639px | `ms` |
| Tablet retrato | 640–1023px | `sm` / `md` |
| Tablet paisagem / notebook | 1024–1279px | `lg` |
| Desktop | 1280–1919px | `xl` / `2xl` |
| Desktop grande | 1920–2559px | `3xl` |
| Ultrawide | 2560px+ | `uw` |

Fonte única: `src/design-system/tokens/breakpoints.ts` + `tailwind.config.ts`.
Hooks: `useBreakpoint()` (faixas, PWA, landscape) e `useViewport()`
(altura visual, teclado virtual, standalone).

## Correções aplicadas

| Área | Problema | Componente | Correção | Status |
| --- | --- | --- | --- | --- |
| Global | `overflow-x: hidden` mascarava estouros | `src/index.css` | `overflow-x: clip` + `min-w-0` nos containers | OK |
| Global | Mídia estourando o container | `src/index.css` | `max-width:100%` para img/video/svg/iframe | OK |
| Global | Zoom automático do iOS em inputs | `src/index.css` | `font-size: max(16px, 1rem)` < 768px | OK |
| Container | Padding fixo e sem limite ultrawide | `PortalPageContainer` | 16→24/32→32/48px, max-width 1400/1600/1800px, `readable` | OK |
| Header | Altura fixa em landscape, sem alinhamento ultrawide | `PortalHeader` | `h-14`/`md:h-16`, `.landscape-compact`, container alinhado | OK |
| Menu mobile | Sem rodapé de ajuda/sair, sem safe-area lateral | `MobileNavigationDrawer` | rodapé com Ajuda e Sair, `env(safe-area-inset-left)` | OK |
| Bottom nav | Cobria formulários com teclado aberto | `PortalBottomNav` | oculta quando `keyboardOpen`, safe-area lateral | OK |
| Footer | Sobreposto pela navegação inferior | `PortalFooter` | `.pb-bottom-nav` + largura alinhada ao container | OK |
| Modais | Altura fixa e conteúdo cortado no mobile | `PortalModal` | `max-h-[calc(100dvh-2rem)]`, scroll só no corpo, safe-area | OK |
| Drawers | Estreito demais no desktop, sem safe-area | `PortalDrawer` | larguras `sm/lg/xl`, `pb env(safe-area-inset-bottom)` | OK |
| Abas | Overflow horizontal da página | `ResponsiveTabs` | rolagem local `.scroll-x`, seletor no mobile, ARIA completo | OK |
| Offline | Banner fixo cobria o topo | `OfflineBanner` | `sticky` + safe-area + ação "Atualizar" | OK |

## Utilitários disponíveis

- `.safe-pt` `.safe-pb` `.safe-px` `.safe-mb` — safe areas (notch/PWA).
- `.pb-bottom-nav` — espaço da navegação inferior (zerado a partir de `md`).
- `.readable` / `max-w-readable` — 72ch de largura de leitura.
- `.scroll-x` / `.no-scrollbar` — rolagem horizontal local e acessível.
- `.break-anywhere` — protocolos, e-mails e URLs longos.
- `.touch-target` — área mínima de toque 44×44.
- `.landscape-compact` / `.landscape-hide` — mobile deitado (altura ≤ 500px).

## Regras para novas telas

1. Todo container flexível recebe `min-w-0`; nada de `w-100vw` com padding.
2. Toda tabela tem estratégia mobile (`ResponsiveDataView` / `MobileRecordCard`).
3. Fluxos longos usam página própria, nunca modal pequena.
4. Alturas fixas apenas em elementos decorativos — botões, cards, abas e campos
   devem crescer com o texto (fonte aumentada / zoom 200%).
5. Textos críticos (erros, protocolos, orientações) nunca são truncados.
