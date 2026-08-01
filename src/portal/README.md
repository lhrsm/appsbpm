# Portal externo — layout compartilhado (Fase 2)

Estrutura de navegação do **Portal do Associado** e do **Portal do Dependente**.
Não contém regra de negócio: apenas layout, navegação, permissões de exibição e estados.

## ExternalPortalLayout

Layout único para os dois perfis (`profileType`), com variações controladas por perfil e permissão.

| Prop | Tipo | Descrição |
| --- | --- | --- |
| `profileType` | `"associate" \| "dependent"` | Define o menu, a busca e a navegação inferior |
| `user` | `PortalUser` | Nome, foto, matrícula, titular e situação do vínculo |
| `permissions` | `string[]` | Permissões concedidas; filtram itens com `requiredPermissions` |
| `pageTitle` / `pageDescription` / `actions` | `ReactNode` | Alimentam o `PageHeader` do Design System |
| `banner` | `ReactNode` | Alertas/comunicados acima do cabeçalho da página |
| `loading` | `boolean` | Exibe skeletons de cabeçalho e conteúdo |
| `error` | `string \| null` | Exibe estado de erro amigável com "Tentar novamente" |
| `onRetry` / `onLogout` | `() => void` | Ações de recuperação e saída |
| `environment` | `string` | Selo discreto exibido fora de produção |

```tsx
<ExternalPortalLayout
  profileType={isDependente ? "dependent" : "associate"}
  user={{ nome, matricula, titularNome, fotoUrl, ativo }}
  onLogout={sair}
>
  <Outlet />
</ExternalPortalLayout>
```

Comportamento responsivo: sidebar fixa ≥768px (expandida 256px / recolhida 72px, preferência local),
drawer abaixo disso, navegação inferior somente no mobile, `min-h-dvh`, uma única rolagem vertical
e `min-w-0` no conteúdo para impedir overflow horizontal.

## PortalHeader

Esquerda: botão do menu (mobile), logo, "Portal da SBPM", selo de ambiente.
Centro: `PortalGlobalSearch` (barra em ≥1024px, ícone abaixo disso).
Direita: notificações, ajuda, tema e menu da conta. **Não existe botão "Sair" isolado** — ele vive no menu da conta.

## PortalSidebar

Montada por `getNavigationSections()` a partir de `navigation.ts`. Cada item declara
`allowedProfiles`, `requiredPermissions`, `status`, `keywords` e `order`; a filtragem é feita em
dados, não com CSS. O item ativo recebe fundo suave, texto institucional, indicador lateral e
`aria-current="page"`. Recolhida exibe apenas ícones com tooltip.

## MobileNavigationDrawer

Radix Sheet: overlay, focus trap, `Escape`, devolução de foco ao gatilho, fechamento ao navegar,
`safe-area-inset` no topo e na base, e resumo do usuário no cabeçalho.

## PortalFooter

SBPM, versão do portal, Política de Privacidade, Termos de Uso, Acessibilidade, Meus Dados (LGPD)
e Suporte. Horizontal no desktop, empilhado com área de toque de 44px no mobile.

## Mapa de rotas externas por perfil

| Rota | Associado | Dependente |
| --- | --- | --- |
| `/dashboard` | ✔ | ✔ |
| `/dashboard/carteirinha` | ✔ | ✔ |
| `/dashboard/dependentes` | ✔ | — |
| `/dashboard/perfil` | ✔ | ✔ |
| `/dashboard/documentos` | ✔ | ✔ |
| `/dashboard/associacao-premiada` | ✔ | — |
| `/dashboard/financeiro` | ✔ | — |
| `/dashboard/informes` | ✔ | — |
| `/dashboard/beneficios` | ✔ | — |
| `/dashboard/simulador` | ✔ | — |
| `/dashboard/clinicas` | ✔ | ✔ |
| `/dashboard/agenda` | ✔ | ✔ |
| `/dashboard/avaliar` | ✔ | ✔ |
| `/dashboard/peculio` | ✔ | — |
| `/dashboard/solicitar-peculio` | — | ✔ |
| `/dashboard/solicitacoes` | ✔ | ✔ |
| `/dashboard/indicar-parceiro` | ✔ | — |
| `/dashboard/notificacoes` | ✔ | ✔ |
| `/dashboard/minha-privacidade` | ✔ | ✔ |
| `/dashboard/historico` | ✔ | ✔ |
| `/dashboard/faq` | ✔ | ✔ |
| `/dashboard/limite` | **depreciada** → `/dashboard` | **depreciada** → `/dashboard` |

Nenhuma tabela ou coluna foi removida; apenas os links e a rota do portal externo.
