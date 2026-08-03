export default function RoutesIndex() {
  return (
    <div className="p-8 max-w-4xl mx-auto bg-white shadow-sm border rounded-lg">
      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800">
        {`SBPM PORTAL UI/UX REFACTORING V2.0

FASE 15 — EXECUTAR AUDITORIA FINAL, TESTES COMPLETOS, LIMPEZA TÉCNICA, CONSOLIDAÇÃO VISUAL E PREPARAÇÃO PARA PRODUÇÃO

CONTEXTO

As fases anteriores criaram ou deverão criar:

- Design System institucional;
- Layout principal;
- Header, sidebar, menu mobile e footer;
- Dashboards do associado e do dependente;
- Cards, indicadores, timelines e estados;
- Botões, formulários, modais e drawers;
- Tabelas, buscas, filtros, paginação e exportações;
- Portal completo do associado;
- Portal completo do dependente;
- Central de Relacionamento;
- Perfil, segurança, 2FA, privacidade e LGPD;
- Responsividade avançada;
- Performance, cache, lazy loading e observabilidade;
- Acessibilidade segundo WCAG 2.2 AA;
- Microinterações, animações e feedbacks visuais.

Agora a Fase 15 deverá consolidar todo o trabalho realizado e preparar o Portal da SBPM para uma entrada segura em homologação avançada e, posteriormente, produção.

OBJETIVO

Realizar uma auditoria completa, corrigir regressões, remover inconsistências, eliminar componentes obsoletos, validar permissões, revisar rotas, testar fluxos críticos e garantir que toda a plataforma funcione de forma:

- Coerente;
- Segura;
- Responsiva;
- Acessível;
- Performática;
- Auditável;
- Estável;
- Preparada para integração futura;
- Preparada para crescimento modular.

IMPORTANTE

Nesta fase:

- Não adicionar grandes funcionalidades novas;
- Não redesenhar novamente o portal sem necessidade;
- Não alterar regras de negócio sem justificativa;
- Não reintroduzir “Limite disponível”;
- Não excluir estruturas de banco sem análise;
- Não remover componentes usados por outras páginas;
- Não alterar autenticação de forma destrutiva;
- Não remover logs, RLS ou auditoria;
- Não migrar produção sem validação;
- Não considerar concluído apenas porque a aplicação compila;
- Validar funcionamento real dos fluxos;
- Criar rollback para alterações críticas;
- Documentar todas as correções.

==================================================
1. CRIAR PLANO DE AUDITORIA FINAL
==================================================

Antes de executar alterações, criar um plano com:

- Escopo;
- Rotas;
- Perfis;
- Módulos;
- Fluxos;
- Riscos;
- Dependências;
- Critérios de aceite;
- Responsáveis;
- Ambiente;
- Dados de teste;
- Evidências;
- Rollback.

Separar a auditoria em:

1. Funcional;
2. Visual;
3. Responsividade;
4. Acessibilidade;
5. Segurança;
6. Permissões;
7. Banco;
8. Performance;
9. Integrações;
10. PWA;
11. Auditoria e logs;
12. Conteúdo e documentação.

==================================================
2. INVENTÁRIO COMPLETO DAS ROTAS
==================================================

Mapear todas as rotas da área externa.

Exemplos:

- Boas-vindas;
- Login;
- Primeiro acesso;
- Validação;
- Confirmação de e-mail;
- Criação de senha;
- Recuperação;
- 2FA;
- Quero me associar;
- Dashboard associado;
- Dashboard dependente;
- Carteirinha;
- Titular;
- Dependentes;
- Meus dados;
- Documentos;
- Solicitações;
- Clínicas e parceiros;
- Benefícios;
- Eventos;
- Financeiro autorizado;
- Informe de rendimentos;
- Perfil;
- Segurança;
- Sessões;
- Histórico;
- Privacidade;
- LGPD;
- Preferências;
- Atendimento;
- FAQ;
- Tutoriais;
- Downloads;
- Notícias;
- Avisos;
- Acessibilidade.

Para cada rota, registrar:

- Situação;
- Perfil autorizado;
- Permissão;
- Dados carregados;
- Integração;
- Responsividade;
- Acessibilidade;
- Loading;
- Erro;
- Empty state;
- Auditoria;
- Testes;
- Status final.

==================================================
3. INVENTÁRIO DOS COMPONENTES
==================================================

Mapear:

- Componentes do Design System;
- Componentes de layout;
- Componentes de formulário;
- Cards;
- Tabelas;
- Modais;
- Drawers;
- Badges;
- Skeletons;
- Alertas;
- Timelines;
- Menus;
- Hooks;
- Stores;
- Contextos;
- Utilitários;
- Serviços;
- Providers.

Classificar:

- Em uso;
- Duplicado;
- Obsoleto;
- Parcialmente migrado;
- Sem documentação;
- Sem teste;
- Sem acessibilidade;
- Sem responsividade.

Não excluir imediatamente componentes classificados como obsoletos.

Primeiro verificar imports e dependências.

==================================================
4. LIMPEZA DE CÓDIGO
==================================================

Remover de forma segura:

- Imports não utilizados;
- Componentes obsoletos;
- CSS duplicado;
- Classes antigas;
- Hooks não utilizados;
- Funções mortas;
- Rotas antigas;
- Feature flags vencidas;
- Logs de desenvolvimento;
- Console.log;
- Código comentado sem finalidade;
- Dados mock fora do ambiente correto;
- Dependências não utilizadas.

Não remover:

- Migrações;
- Auditoria;
- Tratamentos de fallback;
- Rollback;
- Código usado por ambiente de homologação;
- Compatibilidade necessária sem análise.

==================================================
5. CONSOLIDAÇÃO DO DESIGN SYSTEM
==================================================

Verificar se todas as páginas utilizam:

- Tokens;
- Cores;
- Tipografia;
- Espaçamentos;
- Radius;
- Sombras;
- Breakpoints;
- Botões;
- Inputs;
- Cards;
- Badges;
- Modais;
- Drawers;
- Tabelas;
- Feedbacks.

Identificar páginas que ainda usam:

- Cores locais;
- Padding arbitrário;
- Botões próprios;
- Inputs próprios;
- Cards próprios;
- Modais próprias;
- Ícones inconsistentes.

Migrar para o Design System quando seguro.

==================================================
6. CONSISTÊNCIA VISUAL
==================================================

Auditar:

- Header;
- Sidebar;
- Hero;
- Cards;
- Títulos;
- Subtítulos;
- Botões;
- Inputs;
- Abas;
- Accordions;
- Tabelas;
- Páginas vazias;
- Loading;
- Modais;
- Drawers;
- Rodapés;
- Navegação inferior;
- Tooltips;
- Toasts;
- Timeline.

Verificar:

- Alinhamento;
- Espaçamento;
- Altura;
- Tipografia;
- Cores;
- Ícones;
- Estado ativo;
- Foco;
- Contraste;
- Responsividade.

==================================================
7. AUDITORIA DO MENU
==================================================

Verificar o menu do associado.

Confirmar presença somente de itens autorizados.

Verificar o menu do dependente.

Confirmar ausência de:

- Financeiro indevido;
- Mensalidades;
- Informe de rendimentos;
- Dependentes;
- Associação premiada;
- Pecúlio;
- Simulador;
- Limite disponível.

Verificar:

- Grupos;
- Ordem;
- Ícones;
- Item ativo;
- Permissões;
- Mobile;
- Sidebar recolhida;
- Drawer;
- Navegação inferior.

==================================================
8. REMOÇÃO DEFINITIVA DE “LIMITE DISPONÍVEL”
==================================================

Executar busca global em:

- Código;
- Rotas;
- Menus;
- Dashboard;
- Componentes;
- Busca;
- FAQ;
- Tutoriais;
- Textos;
- Notificações;
- Relatórios;
- Mock;
- Banco;
- Feature flags;
- Breadcrumbs;
- Testes;
- Exportações.

Confirmar ausência de:

- Card;
- Percentual;
- Barra;
- Valor;
- Página;
- Atalho;
- Link;
- Resultado;
- Tutorial;
- FAQ;
- Rota antiga ativa.

Caso a rota antiga exista:

- Redirecionar;
- Marcar depreciada;
- Não gerar 404;
- Não reativar no menu.

Não excluir estrutura de banco sem análise.

==================================================
9. TESTES FUNCIONAIS DO PRIMEIRO ACESSO
==================================================

Testar:

- Tela de boas-vindas;
- Primeiro acesso;
- Já tenho acesso;
- Quero me associar;
- Seleção de associado/dependente;
- CPF;
- Data de nascimento;
- Perguntas;
- Alternativas;
- Validação positiva;
- Validação negativa;
- Tentativas;
- Bloqueio;
- E-mail;
- Código;
- Reenvio;
- Senha;
- Termos;
- Conta criada;
- Primeiro login.

Validar modo:

- Mock;
- Provedor real futuro;
- E-mail mock;
- E-mail real, quando ativado.

==================================================
10. TESTES DA VALIDAÇÃO POR PERGUNTAS
==================================================

Confirmar:

- Perguntas diferentes por perfil;
- Alternativas plausíveis;
- Embaralhamento;
- Backend valida;
- Resposta correta não vai ao frontend;
- Sessão expira;
- Tentativas controladas;
- Erro genérico;
- Não revela resposta;
- Não revela existência de CPF;
- “Não sei responder” funciona;
- Auditoria registra;
- Mobile funciona;
- Teclado funciona;
- Leitor de tela funciona.

==================================================
11. TESTES DO PRÉ-CADASTRO
==================================================

Validar:

- Nome;
- CPF;
- Matrícula;
- Posto/graduação;
- Ativo/inativo;
- E-mail;
- WhatsApp;
- Consentimento;
- Duplicidade;
- Protocolo;
- Mensagem de sucesso;
- Texto sobre SAEB;
- Notificação interna;
- E-mail;
- Painel administrativo;
- Status;
- Conversão em processo.

Confirmar que o pré-cadastro não cria associado ativo.

==================================================
12. TESTES DE LOGIN E RECUPERAÇÃO
==================================================

Testar:

- CPF;
- Matrícula;
- Senha;
- Usuário inexistente;
- Senha incorreta;
- Conta bloqueada;
- Conta inativa;
- Recuperação;
- E-mail;
- Código;
- Nova senha;
- Sessões anteriores;
- Rate limiting;
- CAPTCHA, se ativado;
- Mensagens genéricas.

==================================================
13. TESTES DO 2FA
==================================================

Testar:

- Ativação TOTP;
- QR Code;
- Chave manual;
- Código válido;
- Código inválido;
- Expiração;
- Recovery codes;
- Uso único;
- Novos códigos;
- Troca de dispositivo;
- Desativação;
- Política obrigatória;
- Dispositivo confiável;
- Sessões;
- Auditoria;
- Alertas.

Confirmar ausência de segredos em logs.

==================================================
14. TESTES DO PORTAL DO ASSOCIADO
==================================================

Validar:

- Dashboard;
- Carteirinha;
- Meus dados;
- Solicitação de correção;
- Dependentes;
- Documentos;
- Benefícios;
- Clínicas;
- Parceiros;
- Solicitações;
- Eventos;
- Financeiro autorizado;
- Informe;
- Perfil;
- Segurança;
- LGPD;
- Atendimento;
- Tutoriais.

Confirmar:

- Ownership;
- Dados mascarados;
- Dados oficiais somente leitura;
- Downloads seguros;
- Rotas protegidas;
- Mobile;
- PWA.

==================================================
15. TESTES DO PORTAL DO DEPENDENTE
==================================================

Validar:

- Dashboard próprio;
- Titular mascarado;
- Carteirinha;
- Meus dados;
- Documentos;
- Solicitações;
- Clínicas;
- Eventos;
- Atendimento;
- Perfil;
- Segurança;
- LGPD.

Confirmar ausência de:

- Dados financeiros;
- Dados do titular;
- Dependentes;
- Informações administrativas;
- Conteúdo não autorizado.

==================================================
16. TESTES DA CENTRAL DE RELACIONAMENTO
==================================================

Validar:

- Busca;
- Abrir solicitação;
- Protocolo;
- Timeline;
- Upload;
- FAQ;
- Tutoriais;
- Downloads;
- Contatos;
- Notícias;
- Avisos;
- Feedback;
- Notificações;
- Permissões;
- Mobile;
- PWA.

==================================================
17. TESTES DE DOCUMENTOS
==================================================

Testar:

- Listagem;
- Busca;
- Filtro;
- Paginação;
- Visualização;
- Download;
- Impressão;
- URL temporária;
- Expiração;
- Ownership;
- Documento inexistente;
- Documento indisponível;
- Auditoria;
- Mobile;
- PDF grande.

==================================================
18. TESTES DE SOLICITAÇÕES
==================================================

Testar:

- Nova solicitação;
- Categoria;
- Assunto;
- Descrição;
- Anexo;
- Revisão;
- Protocolo;
- Status;
- Timeline;
- Resposta;
- Pendência;
- Cancelamento;
- Permissões;
- Exportação;
- Notificação;
- Realtime.

==================================================
19. TESTES DE PERFIL E DADOS
==================================================

Validar:

- Dados oficiais;
- Dados editáveis;
- E-mail;
- Telefone;
- Foto;
- Preferências;
- Solicitar correção;
- Auditoria;
- Sincronização;
- Mensagens;
- Responsividade.

==================================================
20. TESTES DE LGPD
==================================================

Testar:

- Consentimentos;
- Revogação;
- Histórico;
- Termos;
- Solicitações;
- Protocolo;
- Exportação;
- Download;
- Expiração;
- Ownership;
- Retenção;
- Auditoria;
- Perfil associado;
- Perfil dependente.

==================================================
21. TESTES DE PERMISSÕES
==================================================

Criar matriz:

- Rota;
- Associado;
- Dependente;
- Visitante;
- Administrador;
- Usuário bloqueado;
- Usuário inativo.

Validar:

- Menu;
- Rota;
- Consulta;
- Download;
- Ação;
- RLS;
- Backend;
- Frontend.

Não considerar suficiente esconder o menu.

==================================================
22. TESTES DE OWNERSHIP
==================================================

Tentar acessar:

- Solicitação de outro usuário;
- Documento de outro usuário;
- Dependente de outro associado;
- Sessão de outro usuário;
- Histórico de outro usuário;
- Exportação de outro usuário;
- Perfil de outro usuário;
- Protocolo de outro usuário.

Resultado esperado:

- Acesso negado;
- Dados não carregados;
- Evento auditado quando necessário;
- Sem exposição de existência.

==================================================
23. AUDITORIA DE RLS
==================================================

Revisar todas as tabelas acessíveis pelo portal externo.

Confirmar:

- RLS ativa;
- Policies específicas;
- Ownership;
- Perfil;
- Organização;
- Tenant;
- Dados sensíveis;
- Storage;
- RPC;
- Views;
- Edge Functions.

Não depender de anon access inadequado.

==================================================
24. AUDITORIA DO STORAGE
==================================================

Verificar buckets:

- Avatares;
- Documentos;
- Anexos;
- Carteirinhas;
- Exportações;
- Tutoriais;
- Imagens públicas.

Classificar:

- Público;
- Privado;
- Temporário.

Confirmar:

- URLs assinadas;
- Expiração;
- Ownership;
- Upload seguro;
- Nome seguro;
- MIME;
- Tamanho;
- Exclusão;
- Retenção.

==================================================
25. AUDITORIA DE SECRETS
==================================================

Verificar se não existem secrets em:

- Frontend;
- Git;
- Logs;
- Banco;
- LocalStorage;
- Config público;
- Código;
- Screenshots;
- Mensagens.

Revisar:

- API keys;
- E-mail;
- Supabase service role;
- Integrações;
- Webhooks;
- Tokens.

Rotacionar secrets expostos.

==================================================
26. AUDITORIA DE LOGS
==================================================

Confirmar ausência de:

- Senha;
- OTP;
- Recovery code;
- Token;
- CPF completo;
- E-mail completo desnecessário;
- Documento;
- Dados médicos;
- Conteúdo sensível.

Verificar:

- Estrutura;
- Correlation ID;
- Ambiente;
- Retenção;
- Acesso;
- Integridade.

==================================================
27. TESTES DE SEGURANÇA
==================================================

Executar testes controlados para:

- Enumeração;
- Brute force;
- Rate limiting;
- Sessão expirada;
- Fixação de sessão;
- CSRF quando aplicável;
- XSS;
- Upload malicioso;
- IDOR;
- Acesso direto;
- URL previsível;
- Manipulação de IDs;
- Ação duplicada;
- Injection;
- Headers;
- CORS;
- Secrets;
- Cache.

Não realizar testes destrutivos em produção.

==================================================
28. TESTES DE RESPONSIVIDADE
==================================================

Executar matriz completa:

- 320x568;
- 360x800;
- 375x812;
- 390x844;
- 412x915;
- 430x932;
- 768x1024;
- 800x1280;
- 820x1180;
- 1024x768;
- 1280x800;
- 1366x768;
- 1440x900;
- 1536x864;
- 1920x1080;
- 2560x1080;
- 2560x1440;
- 3440x1440.

Validar:

- Scroll;
- Overflow;
- Header;
- Menu;
- Footer;
- Modais;
- Drawers;
- Tabelas;
- Formulários;
- Teclado;
- Safe areas;
- PWA;
- Landscape.

==================================================
29. TESTES DE ACESSIBILIDADE
==================================================

Executar:

- Teclado;
- NVDA;
- VoiceOver;
- TalkBack;
- Zoom 200%;
- Zoom 400%;
- Alto contraste;
- Fonte ampliada;
- Reduced motion;
- axe;
- Lighthouse;
- JSX a11y.

Validar:

- Headings;
- Foco;
- Labels;
- Erros;
- Modais;
- Drawers;
- Tabelas;
- OTP;
- 2FA;
- QR Code;
- Tutoriais;
- PDF alternativo.

==================================================
30. TESTES DE PERFORMANCE
==================================================

Medir:

- FCP;
- LCP;
- INP;
- CLS;
- TTFB;
- Bundle;
- Requests;
- Consultas;
- Realtime;
- Imagens;
- PWA;
- Rotas;
- Mobile.

Comparar com a Fase 12.

Corrigir regressões.

==================================================
31. TESTES DE REDE E INDISPONIBILIDADE
==================================================

Simular:

- Rede lenta;
- Offline;
- Timeout;
- Banco indisponível;
- E-mail indisponível;
- Storage indisponível;
- Realtime desconectado;
- Edge Function falhando;
- Integração indisponível.

Validar:

- Mensagem;
- Retry;
- Preservação de dados;
- Não duplicidade;
- Não sucesso falso;
- Recuperação.

==================================================
32. TESTES DO PWA
==================================================

Validar:

- Instalação;
- Ícones;
- Manifest;
- Splash;
- Standalone;
- Safe areas;
- Offline;
- Atualização;
- Cache;
- Logout;
- Dados privados;
- Navegação inferior;
- Orientação;
- Background.

Confirmar que dados sensíveis não permanecem após logout.

==================================================
33. TESTES DE E-MAIL
==================================================

Validar:

- Primeiro acesso;
- Código;
- Recuperação;
- Segurança;
- Pré-cadastro;
- Protocolo;
- LGPD;
- Alertas.

Verificar:

- Remetente;
- Assunto;
- Entrega;
- Expiração;
- Links;
- Responsividade;
- Dados sensíveis;
- Logs;
- Ambiente mock;
- Ambiente real.

==================================================
34. TESTES DE NOTIFICAÇÕES
==================================================

Validar:

- Criação;
- Realtime;
- Badge;
- Marcar como lida;
- Filtros;
- Perfil;
- Link;
- Ownership;
- Mobile;
- PWA;
- Duplicidade.

==================================================
35. TESTES DE EXPORTAÇÃO
==================================================

Validar:

- PDF;
- XLSX;
- CSV;
- Filtros;
- Permissões;
- Mascaramento;
- Auditoria;
- Link temporário;
- Expiração;
- Fórmula maliciosa;
- Volume;
- Cancelamento;
- Falha.

==================================================
36. AUDITORIA DOS DADOS MOCK
==================================================

Confirmar que:

- Mock aparece somente em ambiente permitido;
- Dados fictícios são identificados;
- Produção não usa registros fictícios;
- E-mail mock não envia;
- Integração mock não mistura dados;
- Exportações mock possuem marcação;
- Usuários não confundem demonstração com produção.

==================================================
37. FEATURE FLAGS
==================================================

Revisar:

- Flags ativas;
- Flags antigas;
- Flags de testes;
- Flags sem documentação;
- Flags em produção.

Remover flags obsoletas após segurança.

Manter rollback para mudanças recentes.

==================================================
38. TRATAMENTO DE ROTAS ANTIGAS
==================================================

Criar redirecionamentos.

Verificar:

- Links antigos;
- Favoritos;
- Tutoriais;
- Notificações;
- E-mails;
- QR Codes;
- Busca;
- Breadcrumbs.

Evitar:

- 404 desnecessário;
- Loop;
- Rota sem permissão;
- Redirecionamento para página errada.

==================================================
39. CONTEÚDOS E TEXTOS
==================================================

Revisar:

- Ortografia;
- Pontuação;
- Termos;
- Siglas;
- Tom institucional;
- Consistência;
- Mensagens;
- Botões;
- Empty states;
- Erros;
- Alertas;
- Tutoriais;
- FAQ.

Padronizar:

- SBPM;
- Associado;
- Dependente;
- Portal;
- Solicitação;
- Protocolo;
- SAEB;
- Previdência;
- Assistência à Saúde.

==================================================
40. TERMOS TÉCNICOS
==================================================

Remover da interface externa:

- Nome de tabela;
- RPC;
- RLS;
- Edge Function;
- Stack;
- API;
- Provider;
- MockProvider;
- Status HTTP;
- Query.

Usar mensagens amigáveis.

==================================================
41. AUDITORIA DOS TUTORIAIS
==================================================

Verificar se:

- Rotas existem;
- Passos correspondem à interface;
- Imagens estão atualizadas;
- Status está correto;
- Conteúdo não inventa função;
- Perfil está correto;
- Vídeos possuem legenda;
- Links funcionam;
- “Limite disponível” foi removido.

Criar fila:

- Atualizado;
- Revisar;
- Arquivar;
- Aguardando integração.

==================================================
42. AUDITORIA DO FAQ
==================================================

Verificar:

- Duplicidade;
- Respostas desatualizadas;
- Perguntas sem resposta;
- Links quebrados;
- Conteúdo técnico;
- Conteúdo não autorizado;
- Perfil;
- Busca;
- Acessibilidade.

==================================================
43. AUDITORIA DE NOTÍCIAS E AVISOS
==================================================

Confirmar:

- Data;
- Autor;
- Publicação;
- Expiração;
- Perfil;
- Prioridade;
- Conteúdo;
- Imagem;
- Acessibilidade;
- Status.

Não exibir aviso expirado.

==================================================
44. DOCUMENTAÇÃO TÉCNICA
==================================================

Consolidar documentação de:

- Arquitetura;
- Design System;
- Componentes;
- Rotas;
- Perfis;
- Permissões;
- RLS;
- Banco;
- Storage;
- Auth;
- 2FA;
- E-mail;
- PWA;
- Performance;
- Acessibilidade;
- Logs;
- Monitoramento;
- Integração;
- Feature flags;
- Ambientes;
- Rollback.

==================================================
45. DOCUMENTAÇÃO OPERACIONAL
==================================================

Criar documentação para:

- Suporte;
- Segurança;
- Recuperação;
- LGPD;
- Publicação;
- Atualização;
- Incidente;
- Falha de e-mail;
- Falha de integração;
- Falha de integração;
- Falha de autenticação;
- Restore;
- Rollback.

==================================================
46. CHECKLIST DE HOMOLOGAÇÃO
==================================================

Criar checklist assinado ou validado por:

- Desenvolvimento;
- TI;
- Segurança;
- Área de negócio;
- Atendimento;
- LGPD;
- Responsável institucional.

Itens:

- Fluxos;
- Dados;
- Permissões;
- Conteúdo;
- Responsividade;
- Acessibilidade;
- Performance;
- Backup;
- Segurança;
- Treinamento;
- Suporte.

==================================================
47. AMBIENTE DE HOMOLOGAÇÃO
==================================================

Confirmar separação entre:

- Desenvolvimento;
- Homologação;
- Produção.

Homologação deve possuir:

- Banco próprio;
- Storage próprio;
- Chaves próprias;
- E-mail controlado;
- Dados fictícios;
- URL própria;
- Logs;
- Monitoramento.

Não usar dados reais sem base legal e controle.

==================================================
48. BACKUP
==================================================

Antes de produção, confirmar:

- Backup automático;
- Retenção;
- Banco;
- Storage;
- Configurações;
- Secrets;
- Código;
- Migrações.

Executar teste de restauração.

Backup não testado não deve ser considerado garantia.

==================================================
49. ROLLBACK
==================================================

Criar plano de rollback para:

- Frontend;
- Banco;
- Migration;
- Auth;
- E-mail;
- Integração;
- PWA;
- Feature flag;
- Storage.

Definir:

- Quem executa;
- Quando;
- Critério;
- Tempo estimado;
- Validação.

==================================================
50. OBSERVABILIDADE
==================================================

Confirmar:

- Monitoramento;
- Alertas;
- Erros;
- Latência;
- E-mail;
- Storage;
- Auth;
- 2FA;
- Realtime;
- PWA;
- Integração;
- Banco.

Configurar alertas para responsáveis.

==================================================
51. PAINEL DE SAÚDE
==================================================

Criar ou revisar painel administrativo restrito com:

- Frontend;
- Banco;
- Auth;
- Storage;
- E-mail;
- Realtime;
- Funções;
- Integrações;
- Último backup;
- Última sincronização;
- Erros recentes.

Não exibir secrets.

==================================================
52. PLANO DE INCIDENTE
==================================================

Criar procedimento para:

- Indisponibilidade;
- Vazamento;
- Conta comprometida;
- E-mail falhando;
- Integração parada;
- Banco indisponível;
- Documento incorreto;
- Acesso indevido;
- Erro de permissão;
- Falha de backup.

Definir:

- Detecção;
- Contenção;
- Correção;
- Comunicação;
- Auditoria;
- Pós-incidente.

==================================================
53. TREINAMENTO
==================================================

Preparar treinamento para:

- Administradores;
- Atendimento;
- Segurança;
- LGPD;
- Gestores;
- Suporte técnico;
- Usuários externos.

Utilizar:

- Tutoriais;
- Vídeos;
- FAQ;
- Ambiente de homologação;
- Exercícios.

==================================================
54. PUBLICAÇÃO GRADUAL
==================================================

Não liberar imediatamente para todos os usuários.

Criar estratégia:

1. Equipe interna;
2. Grupo piloto;
3. Associados selecionados;
4. Dependentes selecionados;
5. Expansão gradual;
6. Produção completa.

Monitorar:

- Erros;
- Suporte;
- Performance;
- Dúvidas;
- Conversão;
- Bloqueios;
- Recuperações.

==================================================
55. COMUNICAÇÃO DE LANÇAMENTO
==================================================

Preparar:

- Aviso;
- E-mail;
- Tutorial;
- FAQ;
- Canal de suporte;
- Orientações de primeiro acesso;
- Segurança;
- 2FA;
- Recuperação.

Não comunicar funções ainda indisponíveis.

==================================================
56. CRITÉRIOS DE GO/NO-GO
==================================================

GO somente se:

- Fluxos críticos passarem;
- RLS estiver validada;
- Ownership estiver validado;
- Backup estiver testado;
- Rollback estiver documentado;
- Logs estiverem seguros;
- E-mail funcionar;
- Autenticação funcionar;
- 2FA possuir recuperação;
- Mobile funcionar;
- Acessibilidade crítica passar;
- Monitoramento estiver ativo;
- Suporte estiver preparado.

NO-GO se houver:

- Exposição de dados;
- Rota sem proteção;
- Falha de ownership;
- Recovery impossível;
- Backup não testado;
- E-mail crítico indisponível;
- Erro grave em mobile;
- Falha de autenticação;
- Instabilidade;
- Bug crítico.

==================================================
57. RELATÓRIO FINAL
==================================================

Criar relatório com:

- Fases concluídas;
- Alterações;
- Testes;
- Resultados;
- Métricas;
- Pendências;
- Riscos;
- Exceções;
- Itens adiados;
- Recomendações;
- Go/No-Go;
- Plano pós-produção.

==================================================
58. CRITÉRIOS DE ACEITE
==================================================

Considerar a Fase 15 concluída somente quando:

- Todas as rotas estiverem inventariadas;
- Componentes obsoletos tiverem sido analisados;
- Design System estiver consolidado;
- Menus estiverem corretos;
- “Limite disponível” estiver completamente ausente;
- Primeiro acesso estiver validado;
- Validação por perguntas estiver segura;
- Pré-cadastro estiver funcional;
- Login e recuperação estiverem seguros;
- 2FA possuir ativação e recuperação;
- Portal do associado estiver funcional;
- Portal do dependente estiver restrito corretamente;
- Central de Relacionamento estiver funcional;
- Documentos utilizarem acesso seguro;
- Solicitações possuírem protocolo e timeline;
- LGPD estiver funcional;
- Permissões e ownership estiverem testados;
- RLS estiver validada;
- Storage estiver protegido;
- Secrets estiverem seguros;
- Logs não possuírem dados sensíveis;
- Responsividade estiver aprovada;
- Acessibilidade estiver validada;
- Performance estiver dentro das metas;
- PWA estiver seguro;
- E-mails estiverem testados;
- Backups e restauração estiverem testados;
- Rollback estiver documentado;
- Monitoramento estiver ativo;
- Tutoriais estiverem atualizados;
- Homologação estiver aprovada;
- Plano de publicação gradual estiver definido;
- Relatório final estiver concluído.

RESULTADO ESPERADO

Ao final da Fase 15, o Portal da SBPM deverá estar consolidado como uma plataforma institucional moderna, segura, acessível, responsiva e preparada para produção.

A plataforma deverá possuir:

- Experiência consistente;
- Perfis separados;
- Fluxos seguros;
- Dados protegidos;
- Permissões validadas;
- Auditoria;
- Performance;
- Acessibilidade;
- Observabilidade;
- Backup;
- Rollback;
- Documentação;
- Treinamento;
- Estratégia de implantação.

A entrada em produção deverá ocorrer apenas após o atendimento dos critérios de Go/No-Go e a aprovação formal da homologação.`}
      </pre>
    </div>
  );
}
