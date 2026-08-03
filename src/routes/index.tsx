export default function RoutesIndex() {
  return (
    <div className="p-8 max-w-4xl mx-auto bg-white shadow-sm border rounded-lg">
      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800">
        {`SBPM PORTAL UI/UX REFACTORING V2.0

FASE 14 — IMPLEMENTAR MICROINTERAÇÕES, ANIMAÇÕES, TRANSIÇÕES E FEEDBACK VISUAL REFINADO

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
- Acessibilidade segundo WCAG 2.2 AA.

Agora a Fase 14 deverá refinar a experiência visual e interativa da plataforma por meio de microinterações consistentes, feedbacks claros e transições suaves.

OBJETIVO

Tornar o Portal da SBPM mais agradável, moderno e previsível sem comprometer:

- Performance;
- Acessibilidade;
- Clareza;
- Segurança;
- Usabilidade;
- Compatibilidade com mobile e PWA.

As animações deverão orientar o usuário, reforçar ações e melhorar a percepção de fluidez.

Elas não deverão servir apenas como decoração.

IMPORTANTE

Nesta fase:

- Não alterar regras de negócio;
- Não alterar autenticação;
- Não alterar integrações;
- Não alterar banco de dados;
- Não alterar permissões;
- Não reintroduzir “Limite disponível”;
- Não criar animações excessivas;
- Não utilizar efeitos que prejudiquem usuários com sensibilidade a movimento;
- Não esconder atrasos reais com animações;
- Não alterar layouts já validados;
- Reutilizar tokens e componentes do Design System;
- Respeitar prefers-reduced-motion;
- Manter todos os fluxos acessíveis por teclado e leitor de tela.

==================================================
1. VARREDURA INICIAL
==================================================

Antes de implementar, auditar:

- Botões;
- Cards;
- Menus;
- Dropdowns;
- Modais;
- Drawers;
- Tabs;
- Accordions;
- Tabelas;
- Filtros;
- Paginação;
- Formulários;
- Inputs;
- Uploads;
- OTP;
- 2FA;
- Notificações;
- Toasts;
- Skeletons;
- Dashboards;
- Timelines;
- Empty states;
- Navegação entre rotas;
- Carregamento de páginas;
- PWA;
- Estados offline;
- Estados de erro;
- Estados de sucesso.

Identificar:

- Transições inconsistentes;
- Elementos sem feedback;
- Hover excessivo;
- Componentes que mudam de tamanho;
- Layout shifts;
- Animações repetidas;
- Elementos que piscam;
- Modais abruptas;
- Drawers bruscos;
- Foco perdido;
- Feedback lento;
- Botões sem resposta visual;
- Cards que parecem clicáveis sem ser;
- Toasts rápidos demais;
- Loading sem contexto;
- Atualizações abruptas;
- Mudança de rota sem indicação;
- Animações que não respeitam reduced motion.

Criar inventário interno com:

- Componente;
- Estado atual;
- Problema;
- Interação proposta;
- Duração;
- Easing;
- Comportamento reduzido;
- Status.

==================================================
2. PRINCÍPIOS DAS MICROINTERAÇÕES
==================================================

Toda microinteração deve cumprir pelo menos uma função:

- Confirmar ação;
- Mostrar mudança de estado;
- Indicar carregamento;
- Orientar navegação;
- Destacar atualização;
- Demonstrar relação entre elementos;
- Prevenir erro;
- Reforçar hierarquia;
- Comunicar sucesso;
- Comunicar falha.

Não implementar animação sem propósito claro.

==================================================
3. TOKENS DE MOVIMENTO
==================================================

Criar ou consolidar tokens:

duration-instant
duration-fast
duration-normal
duration-slow

Sugestão:

- instant: 80ms;
- fast: 140ms;
- normal: 220ms;
- slow: 320ms.

Criar easings:

- ease-standard;
- ease-enter;
- ease-exit;
- ease-emphasized.

Não espalhar durações arbitrárias pelo projeto.

==================================================
4. PREFERS-REDUCED-MOTION
==================================================

Respeitar:

prefers-reduced-motion: reduce

Quando ativo:

- Remover deslocamentos;
- Remover zoom;
- Reduzir fade;
- Desativar parallax;
- Desativar skeleton shimmer agressivo;
- Evitar scroll animado;
- Manter apenas feedback instantâneo.

Não remover informações essenciais.

==================================================
5. BOTÕES
==================================================

Aplicar microinterações em:

- Hover;
- Focus;
- Press;
- Loading;
- Success;
- Error;
- Disabled.

Comportamento sugerido:

Hover:

- Mudança discreta de fundo;
- Sombra leve;
- Sem deslocamento exagerado.

Press:

- Redução muito sutil;
- Sem alterar layout.

Loading:

- Spinner pequeno;
- Texto contextual;
- Largura preservada;
- Botão desabilitado.

Success temporário:

- Ícone de confirmação;
- Texto “Concluído” quando apropriado;
- Retorno ao estado normal.

Não usar bounce.

==================================================
6. ICON BUTTONS
==================================================

Aplicar:

- Hover discreto;
- Tooltip;
- Press;
- Focus;
- Loading;
- Badge animado apenas na chegada de nova informação.

Não girar ícones sem significado.

==================================================
7. CARDS INTERATIVOS
==================================================

Somente cards realmente clicáveis devem possuir:

- Hover;
- Focus;
- Mudança de borda;
- Elevação discreta;
- Cursor;
- Transição.

Cards estáticos não devem parecer clicáveis.

Evitar elevar todos os cards no hover.

==================================================
8. AÇÕES RÁPIDAS
==================================================

Ao interagir:

- Destacar o item;
- Mostrar estado pressionado;
- Navegar sem atraso artificial;
- Exibir skeleton da próxima rota;
- Preservar foco.

Não exibir animações longas antes da navegação.

==================================================
9. SIDEBAR
==================================================

Ao expandir ou recolher:

- Transição suave de largura;
- Ícones permanecem alinhados;
- Textos aparecem sem saltos;
- Tooltips apenas no estado recolhido;
- Conteúdo principal não deve tremer.

No reduced motion:

- Alteração instantânea.

==================================================
10. DRAWER MOBILE
==================================================

Ao abrir:

- Overlay com fade curto;
- Drawer com slide controlado;
- Focus trap;
- Conteúdo de fundo bloqueado.

Ao fechar:

- Transição inversa;
- Retorno de foco.

Não usar efeito elástico.

==================================================
11. MENUS E DROPDOWNS
==================================================

Aplicar:

- Fade curto;
- Scale mínimo;
- Origem coerente;
- Posicionamento estável;
- Foco no primeiro item;
- Fechamento por Escape.

Não animar cada item separadamente de forma exagerada.

==================================================
12. MODAIS
==================================================

Entrada:

- Fade do overlay;
- Scale muito sutil;
- Duração curta.

Saída:

- Fade;
- Sem atraso.

Modal de sucesso:

- Ícone discreto;
- Não usar confete;
- Não bloquear a tela mais tempo que o necessário.

==================================================
13. ABAS
==================================================

Ao trocar:

- Indicador desliza;
- Conteúdo muda com fade curto;
- Altura deve permanecer estável quando possível.

Não usar carrossel horizontal agressivo.

Preservar navegação por teclado.

==================================================
14. ACCORDIONS
==================================================

Ao expandir:

- Altura animada ou técnica equivalente;
- Ícone rotaciona discretamente;
- Foco preservado.

No reduced motion:

- Abrir imediatamente.

Não esconder o conteúdo de forma brusca.

==================================================
15. FORMULÁRIOS
==================================================

Ao focar campo:

- Borda;
- Sombra de foco;
- Label consistente.

Ao validar:

- Erro aparece sem deslocamento abrupto;
- Mensagem com fade curto;
- Sucesso discreto;
- Não usar tremor de campo.

Campos com erro não devem piscar.

==================================================
16. CAMPO DE SENHA
==================================================

Ao atender requisitos:

- Marcar item;
- Alterar ícone;
- Alterar texto;
- Não animar continuamente.

Indicador de força deve atualizar suavemente.

==================================================
17. OTP E 2FA
==================================================

Ao digitar código:

- Avanço visual;
- Campo ativo destacado;
- Erro anunciado;
- Sem tremor;
- Sem zoom.

Ao validar:

- Loading no botão;
- Mensagem de sucesso;
- Redirecionamento curto e previsível.

==================================================
18. UPLOADS
==================================================

Exibir:

- Progresso real;
- Percentual;
- Estado;
- Cancelamento;
- Retry;
- Sucesso.

Ao concluir:

- Ícone de confirmação;
- Nome do arquivo;
- Ações.

Não simular progresso falso.

==================================================
19. TOASTS
==================================================

Entrada:

- Fade e deslocamento mínimo.

Saída:

- Fade.

Duração:

- Sucesso simples: curta;
- Informação: média;
- Erro: mais longa;
- Crítico: persistente até ação.

Evitar vários toasts empilhados.

Agrupar mensagens repetidas.

==================================================
20. ALERTAS INLINE
==================================================

Ao aparecer:

- Fade curto;
- Sem empurrar a página abruptamente;
- Preservar leitura.

Alertas persistentes não devem desaparecer automaticamente.

==================================================
21. SKELETONS
==================================================

Padronizar shimmer suave.

Respeitar reduced motion.

Skeleton deve:

- Manter formato do conteúdo;
- Evitar layout shift;
- Sumir com fade curto;
- Não ficar ativo indefinidamente.

Não usar shimmer muito contrastante.

==================================================
22. CARREGAMENTO DE PÁGINAS
==================================================

Ao navegar:

- Exibir skeleton específico;
- Não usar tela branca;
- Não bloquear o header;
- Manter estrutura;
- Preservar posição quando apropriado.

Não mostrar spinner central genérico em todas as rotas.

==================================================
23. TRANSIÇÕES ENTRE ROTAS
==================================================

Aplicar transição mínima:

- Fade curto no conteúdo;
- Sem deslocamento lateral exagerado;
- Foco no h1;
- Title atualizado.

Não animar o layout inteiro.

==================================================
24. DASHBOARDS
==================================================

Ao carregar:

- Hero primeiro;
- Indicadores em seguida;
- Seções secundárias depois.

Os cards podem aparecer com fade escalonado muito leve, desde que:

- Não atrase leitura;
- Não prejudique reduced motion;
- Não dure mais que alguns centenas de milissegundos.

==================================================
25. INDICADORES
==================================================

Ao atualizar valores:

- Transição numérica opcional apenas se útil;
- Sem rolagem de números longa;
- Destacar atualização com borda ou badge;
- Informar última atualização.

Não animar dados críticos de forma que dificultem leitura.

==================================================
26. NOTIFICAÇÕES
==================================================

Quando chegar nova notificação:

- Badge atualiza;
- Ícone recebe destaque breve;
- Sem som automático;
- Sem animação contínua.

Ao marcar como lida:

- Estado muda suavemente;
- Item permanece visível;
- Não desaparecer abruptamente, salvo filtro específico.

==================================================
27. TIMELINES
==================================================

Ao adicionar novo evento:

- Inserção suave;
- Indicador “Novo”;
- Sem reposicionar toda a página.

Ao expandir detalhes:

- Accordion acessível;
- Estado preservado.

==================================================
28. TABELAS
==================================================

Ao ordenar:

- Indicador muda;
- Linhas atualizam sem fade excessivo.

Ao filtrar:

- Loading local;
- Manter cabeçalho;
- Resultados trocados de forma suave.

Ao selecionar linha:

- Fundo;
- Checkbox;
- Barra de ações.

Não animar linhas individualmente em massa.

==================================================
29. PAGINAÇÃO
==================================================

Ao trocar página:

- Manter toolbar;
- Loading local;
- Mover foco para início da lista;
- Preservar filtros.

Scroll deve ser instantâneo ou respeitar reduced motion.

==================================================
30. FILTROS
==================================================

Ao aplicar:

- Chips aparecem suavemente;
- Contador atualiza;
- Drawer fecha;
- Resultado anunciado.

Ao remover:

- Chip desaparece;
- Lista atualiza;
- Sem salto brusco.

==================================================
31. ESTADOS VAZIOS
==================================================

Empty states podem possuir:

- Ilustração discreta;
- Fade curto;
- Ação clara.

Não utilizar animação em loop.

==================================================
32. ERROS
==================================================

Ao ocorrer erro:

- Exibir mensagem claramente;
- Preservar dados;
- Destacar ação de retry;
- Não piscar;
- Não tremer a tela.

Erros críticos podem usar ícone e cor, sem animação excessiva.

==================================================
33. SUCESSOS
==================================================

Após:

- Envio;
- Salvamento;
- Criação de solicitação;
- Alteração de senha;
- Ativação de 2FA;
- Pré-cadastro;

exibir:

- Ícone;
- Mensagem;
- Protocolo quando aplicável;
- Próxima ação.

Não usar confete ou celebração inadequada.

==================================================
34. CONFIRMAÇÕES
==================================================

Ao concluir ação crítica:

- Fechar modal;
- Exibir feedback;
- Atualizar tela;
- Manter contexto.

Não deixar a interface em estado intermediário sem explicação.

==================================================
35. CARTEIRINHA DIGITAL
==================================================

Ao abrir:

- Fade curto;
- QR Code carregado com placeholder;
- Sem flip automático.

Pode permitir frente e verso somente se houver conteúdo real.

Não usar animação 3D exagerada.

==================================================
36. CLÍNICAS E PARCEIROS
==================================================

Ao trocar filtros:

- Cards atualizam com loading local;
- Manter altura;
- Evitar reorganização excessiva.

Ao abrir detalhes:

- Página ou drawer com transição leve.

==================================================
37. MAPAS
==================================================

Se houver mapa:

- Carregar sob ação;
- Placeholder antes;
- Zoom controlado;
- Não mover automaticamente;
- Não disparar geolocalização sem consentimento.

==================================================
38. FAQ
==================================================

Ao abrir pergunta:

- Accordion;
- Ícone;
- Altura suave;
- Foco preservado.

Não fechar outras perguntas automaticamente sem necessidade.

==================================================
39. TUTORIAIS GUIADOS
==================================================

Ao avançar etapa:

- Conteúdo substituído com fade curto;
- Progresso atualizado;
- Foco no título da etapa.

Não usar slide lateral forte.

==================================================
40. PWA
==================================================

Ao detectar nova versão:

- Banner discreto;
- Botão atualizar;
- Botão depois.

Ao ficar offline:

- Banner;
- Ícone;
- Sem animação contínua.

Ao reconectar:

- Feedback breve;
- Retry controlado.

==================================================
41. FEEDBACK DE COPIAR
==================================================

Para:

- Protocolo;
- Matrícula mascarada;
- Chave manual;
- Recovery code;
- Endereço;

ao copiar:

- Ícone muda;
- Texto “Copiado”;
- Retorno ao estado original.

Não usar toast em excesso para cada cópia pequena.

==================================================
42. TOOLTIP
==================================================

Aplicar:

- Atraso curto;
- Fade;
- Posicionamento;
- Teclado;
- Foco;
- Conteúdo curto.

Não esconder informação essencial apenas em tooltip.

==================================================
43. HOVERS
==================================================

Hover deve ser discreto.

Não mover elementos de forma significativa.

Não usar hover como única indicação.

Em touch devices:

- Não depender de hover.

==================================================
44. FOCUS TRANSITIONS
==================================================

O foco deve aparecer imediatamente.

Pode usar transição curta de cor, mas nunca atrasar.

Não usar animação que dificulte localizar o foco.

==================================================
45. SCROLL
==================================================

Evitar scroll automático.

Usar apenas quando necessário:

- Primeiro erro;
- Nova etapa;
- Título da rota;
- Resultado de ação.

Respeitar reduced motion.

Não reposicionar o usuário após atualizações pequenas.

==================================================
46. COUNTERS
==================================================

Contadores podem atualizar com fade discreto.

Não animar dígitos por longos períodos.

Exemplos:

- Notificações;
- Solicitações;
- Documentos;
- Resultados.

==================================================
47. BADGES
==================================================

Ao mudar status:

- Badge muda cor e texto;
- Transição curta;
- Estado anunciado.

Não pulsar badges continuamente.

==================================================
48. BLOQUEIOS E PROCESSAMENTO
==================================================

Durante operação crítica:

- Botão em loading;
- Demais ações relevantes desabilitadas;
- Mensagem contextual;
- Sem bloqueio global desnecessário.

==================================================
49. ESTADO DE CONEXÃO
==================================================

Quando a conexão estiver instável:

- Exibir aviso;
- Não repetir animação;
- Permitir retry;
- Manter dados existentes.

==================================================
50. ANIMAÇÕES EM MOBILE
==================================================

Em dispositivos móveis:

- Durações menores;
- Menos deslocamento;
- Menos sombras;
- Evitar efeitos pesados;
- Priorizar resposta imediata.

==================================================
51. PERFORMANCE
==================================================

As animações devem usar propriedades eficientes:

- transform;
- opacity.

Evitar animar:

- width;
- height;
- top;
- left;
- box-shadow pesado;
- filtros caros;

quando houver alternativa.

Usar will-change somente quando necessário.

==================================================
52. ACESSIBILIDADE
==================================================

Garantir:

- Reduced motion;
- Foco;
- ARIA;
- Estados anunciados;
- Loading anunciado;
- Sucesso anunciado;
- Erro anunciado;
- Animação não essencial;
- Nenhuma informação apenas visual.

==================================================
53. SEGURANÇA
==================================================

Não animar ou exibir temporariamente:

- Senha;
- OTP;
- Recovery code;
- Tokens;
- Dados sensíveis;
- Conteúdo restrito.

Não permitir que o conteúdo apareça antes da validação de permissão.

==================================================
54. COMPONENTES SUGERIDOS
==================================================

Criar ou consolidar:

MotionProvider

AnimatedPresence

RouteTransition

ButtonFeedback

StatusTransition

LoadingTransition

SuccessFeedback

ErrorFeedback

CopyFeedback

ConnectionStatus

UpdateAvailableBanner

AnimatedCounter

ExpandableContent

ProgressTransition

NotificationPulse

Respeitar a arquitetura e as bibliotecas já existentes.

Não adicionar biblioteca pesada sem necessidade.

==================================================
55. BIBLIOTECA DE ANIMAÇÃO
==================================================

Antes de adicionar dependência:

- Verificar se CSS resolve;
- Verificar se o projeto já possui biblioteca;
- Avaliar peso;
- Avaliar acessibilidade;
- Avaliar manutenção.

Se usar biblioteca:

- Importar somente o necessário;
- Aplicar lazy loading quando apropriado;
- Centralizar padrões.

==================================================
56. DOCUMENTAÇÃO
==================================================

Documentar:

- Durações;
- Easings;
- Estados;
- Reduced motion;
- Padrões por componente;
- Animações permitidas;
- Animações proibidas;
- Exemplos;
- Acessibilidade;
- Performance.

Criar tabela:

Componente | Interação | Duração | Easing | Reduced Motion

==================================================
57. TESTES
==================================================

Criar ou atualizar testes para:

- Botões;
- Menus;
- Modal;
- Drawer;
- Tabs;
- Accordion;
- Formulários;
- OTP;
- Upload;
- Toast;
- Skeleton;
- Dashboard;
- Timeline;
- Tabela;
- Filtros;
- PWA;
- Offline;
- Reduced motion;
- Teclado;
- Leitor de tela;
- Performance.

==================================================
58. TESTES VISUAIS
==================================================

Executar testes de regressão visual em:

- Desktop;
- Tablet;
- Mobile;
- PWA;
- Ultrawide;
- Tema claro;
- Tema escuro, se existir;
- Alto contraste;
- Reduced motion.

==================================================
59. CRITÉRIOS DE ACEITE
==================================================

Considerar a Fase 14 concluída somente quando:

- Existirem tokens de movimento;
- Botões possuírem feedback consistente;
- Modais e drawers abrirem suavemente;
- Menus e dropdowns estiverem refinados;
- Formulários possuírem feedback claro;
- Uploads mostrarem progresso real;
- Toasts estiverem padronizados;
- Skeletons estiverem suaves;
- Navegação entre rotas não for abrupta;
- Dashboards carregarem progressivamente;
- Notificações tiverem destaque discreto;
- Tabelas atualizarem sem saltos;
- Paginação preservar contexto;
- Sucessos e erros estiverem claros;
- Reduced motion estiver totalmente respeitado;
- Nenhuma animação bloquear o usuário;
- Nenhuma animação prejudicar performance;
- Nenhuma animação depender exclusivamente de cor;
- Nenhum dado sensível aparecer durante transições;
- Desktop, tablet, mobile, PWA e ultrawide estiverem consistentes;
- “Limite disponível” permanecer completamente ausente.

RESULTADO ESPERADO

Ao final da Fase 14, o Portal da SBPM deverá transmitir uma sensação de fluidez, qualidade e previsibilidade.

O usuário deverá perceber imediatamente:

- Quando uma ação foi reconhecida;
- Quando o sistema está carregando;
- Quando um dado foi atualizado;
- Quando uma operação foi concluída;
- Quando ocorreu um erro;
- Quando há uma nova notificação;
- Quando uma seção foi aberta;
- Quando uma página foi alterada.

As microinterações deverão tornar a plataforma mais clara e agradável sem transformar o portal em uma interface excessivamente animada ou cansativa.`}
      </pre>
    </div>
  );
}
