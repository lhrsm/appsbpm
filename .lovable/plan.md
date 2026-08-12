# Refinamento Mobile e PWA - Portal do Associado/Dependente

Este plano foca exclusivamente na otimização da experiência Mobile e PWA, garantindo responsividade, usabilidade e conformidade com a identidade visual institucional da SBPM, sem impactar a versão Desktop.

## Ajustes de Interface (Mobile/PWA)

### 1. Carteirinha Digital (`src/pages/Carteirinha.tsx`)
- Adicionar margem lateral de 16px em todo o container da página.
- Garantir que o card da carteirinha (`digital-membership-card`) tenha `max-width: calc(100vw - 32px)` para nunca tocar as bordas.
- Padronizar botões "Baixar PDF" e "Compartilhar":
  - Altura: 54px.
  - Largura: 100% (alinhado ao card).
  - Espaçamentos verticais: 24px (topo), 12px (entre botões), 24px (base).
  - Ícones e textos centralizados perfeitamente.

### 2. Menu Inferior (`src/portal/components/MobileBottomNavigation.tsx` ou `src/portal/components/PortalBottomNav.tsx`)
- Corrigir lógica de estado ativo: comparar `location.pathname` com as rotas definidas.
- Garantir que "Visão" (`/dashboard`) só esteja ativo na rota exata, enquanto outros itens usem `startsWith`.
- Resolver conflito entre "Visão" e "Carteirinha" no destaque.

### 3. Página de Solicitações (`src/pages/portal/associado/Solicitacoes.tsx`)
- Refatorar botão "Nova Solicitação":
  - `max-width: 380px`, `width: 100%`, `height: 52px`.
  - `margin: 0 auto` para centralização.
  - Border-radius: 14px.

### 4. Header e Identidade do Usuário (`src/portal/components/PortalUserMenu.tsx`)
- Corrigir acionamento do Dropdown no mobile: garantir que o clique no bloco do usuário abra o menu consistentemente.
- Otimizar bloco de identidade no mobile:
  - Avatar de 36px.
  - Nome com `truncate` e `ellipsis` para evitar quebras de layout.
  - Manter estrutura: Avatar | Nome | Vínculo | Ícone Dropdown.

### 5. Floating Chat (WhatsApp) (`src/portal/components/FloatingActionsManager.tsx`)
- Ajustar posição: `bottom: calc(var(--mobile-bottom-nav-height) + 24px)`.
- Garantir que não sobreponha elementos interativos da interface.

### 6. Padronização Global de Layout (`src/index.css` e `src/portal/mobile-responsive.css`)
- Aplicar margens laterais de 16px em todas as páginas do portal.
- Cards do Dashboard: `padding: 20px`, `border-radius: 18px`, sombra suave.
- Espaçamentos: 20px (entre cards), 24px (entre seções), 32px (blocos principais).

## Detalhes Técnicos
- Uso de media queries `@media (max-width: 1023px)` para isolar mudanças.
- Utilização de variáveis CSS (`--mobile-bottom-nav-height`) para cálculos dinâmicos.
- Refatoração de lógica de roteamento no componente de navegação para usar `matchPath` ou lógica de prefixo rigorosa.
- Aplicação de `safe-area-inset` para compatibilidade total com PWA em iOS/Android.

## Auditoria Final
- Verificação visual em simuladores de Chrome Android e Safari iOS.
- Teste de fluxo de navegação completo (Dashboard -> Carteirinha -> Perfil).
- Validação de centralização e alinhamento de todos os botões e cards.
