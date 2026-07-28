# Arquitetura do Portal SBPM

Documento interno de referência. Atualizado na etapa de preparação para os módulos institucionais
(Financeiro, Patrimonial e Contábil).

---

## 1. Visão geral

O sistema passa a ter duas áreas com regras independentes:

| Área | Base de rotas | Público | Autenticação |
|---|---|---|---|
| **Portal Externo** | `/` e `/dashboard/*` (alias `/portal/*`) | Associados e dependentes | Sem senha: matrícula ou CPF, sessão em memória (`AssociadoContext`) |
| **Área Administrativa Interna** | `/admin/*` | Setores e funcionários da SBPM | Auth do backend (e-mail + senha) + papéis no banco |

As duas áreas **não compartilham** contexto de sessão, layout ou regras de acesso.

---

## 2. Estrutura atual

### 2.1 Rotas públicas
- `/` — Login do associado (matrícula/CPF)
- `/quiosque` — Modo quiosque
- `/redefinir-senha` — Redefinição de senha (admin)
- `/privacidade`, `/acessibilidade`
- `/.lovable/oauth/consent` — Consentimento OAuth do servidor MCP
- `/admin/login`

### 2.2 Portal do associado/dependente (`/dashboard/*`, alias `/portal/*`)
`carteirinha`, `limite`, `clinicas`, `informes`, `dependentes`, `associacao-premiada`,
`simulador`, `indicar-parceiro`, `peculio`, `solicitar-peculio`, `perfil`,
`minha-privacidade`, `notificacoes`, `solicitacoes`, `documentos`, `financeiro`,
`agenda`, `faq`, `historico`, `beneficios`, `avaliar`.

Restrições de dependente (mantidas): vê apenas a própria carteirinha, seus procedimentos,
rede credenciada e canais de comunicação. "Carências" permanece removida do portal.

### 2.3 Área administrativa (`/admin/*`)
Hubs institucionais (novos): `previdencia`, `saude`, `patrimonio`, `contabilidade`.

Telas operacionais existentes: `associados`, `dependentes`, `limites`, `carencias`,
`clinicas`, `informes`, `peculio`, `comunicados`, `eventos`, `faq`, `avaliacoes`,
`notificacoes`, `solicitacoes`, `documentos`, `financeiro`, `importar`, `sincronizacao`,
`automacoes`, `integracoes`, `auditoria`, `privacidade`, `seguranca`, `assinatura-icp`,
`componentes`, `configuracoes`, `relatorios`, `analytics`, `aniversariantes`.

### 2.4 Componentes compartilhados
`AuthBackgroundLayout`, `CookieConsent`, `AccessibilityWidget`, `ChatbotWidget`,
`InstallPWAPrompt`, `OfflineBanner`, `BackToTop`, `PageSkeleton`, `Breadcrumbs`,
`ThemeToggle`, `SignaturePad`, `DrawSignatureCanvas`, `ProfilePhotoUpload`,
`PushNotificationToggle`, `GlobalSearch`, `WelcomeTour`, `AdminNotificationsBell`,
`admin/ModuleHub` (novo), além da biblioteca shadcn em `src/components/ui`.

### 2.5 Tabelas existentes
`associados`, `dependentes`, `limites`, `historico_limite`, `carencias`,
`informes_rendimentos`, `documentos_associado`, `mensalidades`, `clinicas_parceiros`,
`avaliacoes_parceiros`, `eventos`, `evento_rsvps`, `faq_items`, `comunicados`,
`notificacoes`, `push_tokens`, `solicitacoes`, `resposta_templates`,
`indicacoes_premiadas`, `peculio_solicitacoes`, `consentimentos`,
`solicitacoes_privacidade`, `acessos_log`, `analytics_events`, `audit_logs`,
`sync_sources`, `sync_logs`, `webhook_endpoints`, `sistema_config`,
`user_roles`, `previdencia_admins`.

### 2.6 Funções de banco
`has_role`, `is_previdencia_admin`, `grant_previdencia_on_signup`,
`meu_historico_acessos`, `update_updated_at_column`.

### 2.7 Edge Functions
`chat-assistant`, `mcp`, `get-firebase-config`, `send-push`, `send-whatsapp`,
`send-indicacao`, `send-parceiro-indicacao`, `send-dependente-solicitacao`,
`send-dependente-exclusao`, `send-peculio-solicitacao`, `send-peculio-beneficiarios`,
`send-privacidade-solicitacao`, `update-perfil`, `sync-external`,
`webhook-ingest` (`verify_jwt = false`).

### 2.8 Integrações
- Firebase Cloud Messaging (push)
- Servidor MCP (leitura de dados públicos)
- Lovable AI (assistente de chat)
- WhatsApp (links diretos por setor)
- Sincronização externa via `sync_sources` / `webhook_endpoints` (destino da carga SBPM Sanitas)

### 2.9 Perfis de usuário
1. **Associado titular** — portal externo
2. **Dependente** — portal externo com escopo reduzido
3. **Admin** (`user_roles.role = 'admin'`) — acesso total ao `/admin`
4. **Previdência** (`previdencia_admins`) — subconjunto de telas do `/admin`

### 2.10 Dados demonstrativos
Ainda existem conteúdos estáticos/demonstrativos em: simulador de mensalidade (tabela salarial),
textos de benefícios, FAQ inicial e parte da rede credenciada importada do site institucional.
Previdência e Saúde só exibirão dados fidedignos após a importação do SBPM Sanitas.

---

## 3. Estrutura proposta

```
/                      login do portal externo
/portal/*   ->         alias de /dashboard/* (portal do associado/dependente)
/admin                 dashboard institucional
/admin/previdencia     módulo Previdência        (depende de integração)
/admin/saude           módulo Assistência à Saúde (depende de integração)
/admin/financeiro      módulo Financeiro          (pode evoluir já)
/admin/patrimonio      módulo Patrimonial         (pode evoluir já)
/admin/contabilidade   módulo Contábil            (após Financeiro/Patrimonial)
/admin/integracoes     integrações e importações
/admin/auditoria       logs e histórico
/admin/configuracoes   configurações institucionais
```

Cada módulo tem um **hub** (`ModuleHub`) que agrupa suas telas. As telas operacionais atuais
permanecem nas rotas originais para não quebrar links, sendo referenciadas pelos hubs.

---

## 4. Novas tabelas previstas (ainda não criadas)

**Patrimonial**
- `patrimonio_categorias`
- `patrimonio_locais`
- `patrimonio_bens` (tombamento, categoria, local, responsável, valor, aquisição, estado)
- `patrimonio_movimentacoes`
- `patrimonio_manutencoes`
- `patrimonio_inventarios` / `patrimonio_inventario_itens`

**Financeiro institucional**
- `fin_contas_bancarias`
- `fin_centros_custo`
- `fin_fornecedores`
- `fin_lancamentos` (receita/despesa, competência, vencimento, status)
- `fin_anexos`

**Contábil**
- `cont_plano_contas`
- `cont_lancamentos` / `cont_partidas`
- `cont_periodos`

**Controle de acesso institucional**
- Novos valores em `app_role`: `financeiro`, `patrimonio`, `contabil`, `saude`, `previdencia`, `auditor`
- Opcional: `funcionarios` (vínculo de usuário interno com setor)

Todas serão criadas por **migrations versionadas**, seguindo o padrão:
`CREATE TABLE` → `GRANT` → `ENABLE ROW LEVEL SECURITY` → `CREATE POLICY`,
com políticas baseadas em `has_role(auth.uid(), <papel>)` e **sem acesso `anon`**.

---

## 5. Dependências

- Previdência e Saúde → importação do SBPM Sanitas (`sync_sources`, `webhook-ingest`).
- Contábil → Financeiro e Patrimonial consolidados.
- Papéis por setor → migration de `app_role` antes de aplicar RLS dos novos módulos.
- Relatórios institucionais → dados dos três módulos novos.

---

## 6. Riscos

| Risco | Mitigação |
|---|---|
| Mistura de regras entre portal externo e área interna | Separação por base de rota, layout e contexto; nenhuma tela `/admin` usa `AssociadoContext` |
| Perda de dados em migrations | Somente migrations aditivas; nada de `DROP`/`ALTER` destrutivo em tabelas em uso |
| Tabelas novas sem RLS | Checklist obrigatório CREATE → GRANT → RLS → POLICY em toda migration |
| Papel único `admin` com acesso total | Introduzir papéis por setor antes de dados sensíveis dos novos módulos |
| Quebra de links antigos | `/dashboard/*` mantido; `/portal/*` apenas como alias |
| Dados demonstrativos confundidos com reais | Marcar módulos "depende de integração" nos hubs até a carga oficial |

---

## 7. Plano de migração

1. **Etapa atual** — separação lógica de rotas, hubs dos módulos e esta documentação. Sem alteração de banco.
2. **Papéis por setor** — migration aditiva em `app_role` + tabela de vínculo de funcionários; ajuste do guard do `AdminLayout` para autorizar por papel do módulo.
3. **Patrimonial** — migrations das tabelas de patrimônio, CRUD e relatórios.
4. **Financeiro institucional** — contas, centros de custo, lançamentos e conciliação, mantendo `mensalidades` (portal externo) intacta.
5. **Integração SBPM Sanitas** — mapeamento em `sync_sources`, carga incremental e validação com `sync_logs`.
6. **Previdência e Saúde fidedignas** — troca dos dados demonstrativos pelos importados.
7. **Contábil** — plano de contas e integração com Financeiro/Patrimonial.
8. **Auditoria** — cobertura de `audit_logs` para todas as ações dos novos módulos.
