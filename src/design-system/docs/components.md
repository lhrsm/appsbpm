# Catálogo de Componentes

Cada componente traz descrição, props principais, exemplo, variações e orientação de uso.
Os exemplos assumem `import { ... } from "@/design-system";`.

---

## Text

**Descrição:** texto institucional baseado na escala tipográfica.
**Props:** `variant` (display | h1–h6 | bodyLarge | body | small | caption | overline), `as`, `className`.
**Exemplo:** `<Text variant="h2">Painel do associado</Text>`
**Variações:** 12 variantes tipográficas.
**Recomendado:** todo texto de página. **Não recomendado:** classes de tamanho arbitrárias.

## Button

**Descrição:** botão institucional. Somente três padrões.
**Props:** `variant` (primary | secondary | ghost), `tone` (default | danger | success), `size` (sm | md | lg | icon), `loading`, `leftIcon`, `rightIcon`, `fullWidth`, `asChild`.
**Exemplo:** `<Button leftIcon={icons.baixar}>Baixar informe</Button>`
**Variações:** small, medium, large, icon, loading, disabled, danger, success.
**Não recomendado:** criar novas variantes por página.

## IconButton

**Descrição:** botão só com ícone; `label` obrigatório vira `aria-label`.
**Exemplo:** `<IconButton icon={icons.fechar} label="Fechar" />`
**Não recomendado:** usar `Button` com ícone sem rótulo acessível.

## Card / PortalCard / StatCard / MetricCard / InfoCard / ActionCard

**Descrição:** superfície base única. Aceita título, subtítulo, ícone, conteúdo, rodapé, botões, status, loading e empty.
**Props:** `title`, `subtitle`, `icon`, `context` (módulo), `status`, `footer`, `loading`, `empty`, `elevation`, `padding`, `interactive`.
**Exemplos:**
```tsx
<Card title="Limite disponível" icon={icons.limite}><Progress value={72} showValue /></Card>
<StatCard title="Dependentes" value={3} icon={icons.dependentes} />
<MetricCard title="Adesões" value="128" trend={12} trendLabel="vs. mês anterior" />
<InfoCard title="Dados cadastrais" items={[{ label: "CPF", value: "***.123.456-**" }]} />
<ActionCard title="Carteirinha" icon={icons.carteirinha} onAction={abrir} />
<PortalCard title="Assistência à Saúde" context="saude" icon={icons.saude} description="Rede credenciada" />
```
**Não recomendado:** `div` com `rounded-xl border bg-card` em páginas.

## Badge / Chip

**Descrição:** `Badge` é status não interativo; `Chip` é filtro/tag interativo.
**Props Badge:** `tone` (neutral | primary | success | warning | danger | info), `icon`.
**Props Chip:** `selected`, `onSelect`, `onRemove`, `icon`.
**Exemplo:** `<Badge tone="success">Ativo</Badge>`

## Avatar

**Descrição:** foto com fallback de iniciais.
**Props:** `src`, `name`, `size` (xs–xl).
**Exemplo:** `<Avatar src={foto} name="Maria Souza" size="lg" />`

## Skeleton (Card, Table, Profile, Dashboard, List, Form)

**Descrição:** placeholders de carregamento com `role="status"`.
**Exemplo:** `<SkeletonTable rows={6} columns={5} />`
**Não recomendado:** spinner em telas com layout previsível — prefira skeleton.

## EmptyState

**Descrição:** estado vazio com ícone, título, descrição e ação.
**Exemplo:** `<EmptyState icon={icons.documento} title="Nenhum informe" action={<Button>Atualizar</Button>} />`
**Não recomendado:** erros de carregamento — use `Alert tone="danger"`.

## Alert / toast / Loading / Progress

**Alert:** aviso persistente na página. `tone`: info | success | warning | danger | neutral.
**toast:** feedback efêmero — `toast.success("Dados salvos")`.
**Loading:** `<Loading label="Carregando informes" />`.
**Progress:** `<Progress value={72} label="Limite disponível" showValue />` — também usado para limites em %.

## Modal / Drawer / Tooltip / Dropdown

**Modal:** `open`, `onOpenChange`, `title`, `description`, `footer`, `size` (sm–xl).
**Drawer:** mesmo contrato + `side` (left | right | top | bottom). Preferir no mobile.
**Tooltip:** `content`, `side`. Nunca única fonte de informação essencial.
**Dropdown:** `trigger`, `items` (`label`, `icon`, `onSelect`, `danger`, `separatorBefore`).

## Accordion / Tabs / Timeline

**Accordion:** `items` (`id`, `title`, `content`, `icon`), `multiple`, `defaultOpen`.
**Tabs:** `items` (`id`, `label`, `icon`, `content`, `disabled`), controlado ou não; rola no mobile.
**Timeline:** `items` (`id`, `title`, `description`, `date`, `icon`, `tone`) — histórico e auditoria.

## Formulários: Field / Label / Hint / ErrorMessage / SuccessMessage / Divider

**Field:** agrupa rótulo, controle e mensagem. Props: `label`, `htmlFor`, `required`, `hint`, `error`, `success`.
**Exemplo:**
```tsx
<Field label="E-mail" htmlFor="email" required error={erro}>
  <EmailInput id="email" invalid={!!erro} />
</Field>
```

## Inputs: Input / CPFInput / PhoneInput / DateInput / EmailInput / PasswordInput / SearchInput / MoneyInput / Textarea

**Descrição:** todos suportam ícone, erro (`invalid`), sucesso (`valid`), placeholder, `loading` e `disabled`.
**Máscaras:** CPF `000.000.000-00`, telefone `(00) 00000-0000`, data `dd/mm/aaaa` (padrão brasileiro), moeda em BRL.
**Exemplo:** `<CPFInput value={cpf} onValueChange={setCpf} />`
**Não recomendado:** máscara manual espalhada em páginas.

## Table / Pagination / FilterBar

**Table:** `columns` (`id`, `header`, `cell`, `align`, `hideOnMobile`), `rows`, `rowKey`, `loading`, `caption`, `onRowClick`, estados vazio embutidos.
**Pagination:** `page`, `totalPages`, `onPageChange` — oculta-se com uma página.
**FilterBar:** chips de filtro com limpar.

## Breadcrumb / PageHeader / SectionHeader

**PageHeader:** título, descrição, ícone, breadcrumb e ações. Renderiza o `<h1>` da página.
**SectionHeader:** título de seção (`<h2>`) com ações.
**Breadcrumb:** `items` (`label`, `to`) com `aria-current="page"` no último.

## Container / Grid / Stack / Row

**Container:** `width` narrow | laptop (1400px) | desktop (1600px) | full, com padding responsivo.
**Grid:** `cols={{ mobile, tablet, desktop }}` — 4 / 8 / 12 colunas.
**Stack / Row:** espaçamento vertical/horizontal tokenizado.

## Layouts

`PortalLayout`, `DashboardLayout`, `AdminShellLayout`, `PublicLayout` compartilham `AppShell`
(Header + Sidebar + Container + Content + Footer, com um único `<main>`).
`AuthenticationLayout` centraliza o cartão de acesso.

## Hooks

- `useBreakpoint()` → `isMobile`, `isTablet`, `isLaptop`, `isDesktop`, `isUltrawide`, `isPWA`, `columns`.
- `useDisclosure()` → `isOpen`, `open`, `close`, `toggle`.
- `useDebouncedValue(valor, ms)` → busca e filtros.

## Ícones

`icons` é o mapa canônico função → ícone (perfil, documento, saúde, financeiro, previdência,
patrimônio, RH, LGPD, notificação, busca, filtro, ações, navegação, estados).
Nunca importe `lucide-react` diretamente em código novo.
