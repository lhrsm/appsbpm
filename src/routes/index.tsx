export default function RoutesIndex() {
  return (
    <div className="p-8 max-w-4xl mx-auto bg-white shadow-sm border rounded-lg">
      <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-slate-800">
        {`IMPLEMENTAR GESTÃO E IMPRESSÃO DE CHEQUES NO MÓDULO FINANCEIRO DA SBPM

CONTEXTO

O Portal da SBPM possui ou receberá um Módulo Financeiro responsável pelo controle de receitas, despesas, contas a pagar, contas a receber, movimentações bancárias, documentos e relatórios.

Implementar dentro desse módulo uma funcionalidade completa para:

- Cadastro de cheques;
- Emissão de cheques;
- Impressão em folha de cheque;
- Impressão de cópia administrativa;
- Controle da numeração;
- Vinculação com contas a pagar;
- Aprovação;
- Cancelamento;
- Compensação;
- Auditoria;
- Histórico;
- Conciliação bancária futura.

A funcionalidade deverá atender inicialmente aos cheques emitidos pela instituição.

A arquitetura deve ficar preparada para futura gestão de cheques recebidos, mas não misturar os dois fluxos nesta primeira implementação.

IMPORTANTE

Antes de implementar:

- Fazer uma varredura completa no Módulo Financeiro;
- Identificar contas bancárias já cadastradas;
- Identificar contas a pagar;
- Identificar fornecedores e favorecidos;
- Identificar centro de custo;
- Identificar plano de contas;
- Identificar fluxos de aprovação;
- Identificar permissões financeiras;
- Identificar lançamentos contábeis;
- Identificar documentos anexados;
- Identificar relatórios;
- Identificar estruturas de auditoria;
- Identificar se já existe controle de pagamentos em dinheiro, PIX, transferência, boleto ou outros meios.

Preservar integralmente:

- Regras financeiras existentes;
- Contas a pagar;
- Contas a receber;
- Fluxo de caixa;
- Centros de custo;
- Plano de contas;
- Aprovações;
- Permissões;
- Relatórios;
- Auditoria;
- Integrações;
- Lançamentos contábeis.

Não substituir toda a estrutura financeira.

Implementar o cheque como um novo meio de pagamento integrado ao fluxo existente.

Não considerar um cheque como pago apenas porque foi cadastrado ou impresso.

==================================================
1. NOVO MENU “CHEQUES”
==================================================

Adicionar ao Módulo Financeiro:

FINANCEIRO
├── Visão Geral
├── Contas a Pagar
├── Contas a Receber
├── Movimentações
├── Contas Bancárias
├── Cheques
│   ├── Visão Geral
│   ├── Emitir Cheque
│   ├── Cheques Emitidos
│   ├── Talões
│   ├── Modelos de Impressão
│   ├── Aprovações
│   └── Relatórios
└── Configurações

Exibir os itens conforme permissão.

Não disponibilizar emissão de cheque para perfis sem autorização financeira.

==================================================
2. DASHBOARD DE CHEQUES
==================================================

Criar a página:

/admin/financeiro/cheques

Exibir indicadores:

- Cheques em preparação;
- Aguardando aprovação;
- Aprovados;
- Impressos;
- Entregues;
- A compensar;
- Compensados;
- Cancelados;
- Sustados;
- Valor total emitido no período;
- Valor ainda não compensado.

Adicionar filtros rápidos:

- Hoje;
- Esta semana;
- Este mês;
- Período personalizado;
- Conta bancária;
- Status;
- Favorecido;
- Centro de custo.

Não exibir valores fictícios.

Utilizar somente dados reais cadastrados.

==================================================
3. EMISSÃO DE CHEQUE
==================================================

Criar a rota:

/admin/financeiro/cheques/novo

Criar formulário em etapas.

ETAPA 1 — ORIGEM DO PAGAMENTO

Campos:

- Conta a pagar vinculada;
- Pagamento avulso;
- Reembolso;
- Adiantamento;
- Outra finalidade autorizada.

Ao selecionar uma conta a pagar, preencher automaticamente quando disponível:

- Favorecido;
- CPF ou CNPJ;
- Valor;
- Vencimento;
- Centro de custo;
- Categoria financeira;
- Descrição;
- Documento;
- Unidade;
- Projeto;
- Observações.

Permitir edição somente dos campos autorizados.

Não duplicar a conta a pagar.

==================================================
4. DADOS DO CHEQUE
==================================================

Campos obrigatórios:

- Conta bancária;
- Banco;
- Agência;
- Número da conta;
- Talão;
- Número do cheque;
- Favorecido;
- CPF ou CNPJ do favorecido, quando existente;
- Valor numérico;
- Valor por extenso;
- Data de emissão;
- Data para apresentação ou data do cheque;
- Praça de emissão;
- Finalidade;
- Centro de custo;
- Categoria;
- Conta a pagar vinculada;
- Observação;
- Responsável pela emissão.

Campos opcionais:

- Projeto;
- Unidade;
- Contrato;
- Nota fiscal;
- Número do documento;
- Anexos;
- Texto complementar;
- Restrição;
- Cheque nominal;
- Cheque cruzado;
- Cheque pré-datado;
- “Não à ordem”, quando permitido pela política institucional.

O campo “valor por extenso” deverá ser gerado automaticamente a partir do valor numérico.

Permitir conferência e correção manual controlada, registrando auditoria quando o texto for alterado.

==================================================
5. VALOR POR EXTENSO
==================================================

Criar serviço central para converter valores em reais para texto.

Exemplo:

R$ 1.250,40

Resultado:

“mil duzentos e cinquenta reais e quarenta centavos”

Regras:

- Tratar singular e plural;
- Tratar centavos;
- Tratar valores exatos;
- Tratar milhões;
- Evitar ambiguidade;
- Não utilizar abreviações;
- Validar limite máximo configurado.

Não implementar a conversão apenas visualmente no frontend.

Validar também no backend.

==================================================
6. FAVORECIDO
==================================================

Permitir selecionar o favorecido entre:

- Fornecedores;
- Prestadores;
- Funcionários;
- Associados, quando aplicável;
- Beneficiários;
- Outros favorecidos autorizados.

Disponibilizar pesquisa por:

- Nome;
- CPF;
- CNPJ;
- Código;
- Documento.

Não expor documentos completos em listagens gerais.

Permitir cadastro rápido de favorecido somente para perfis autorizados.

==================================================
7. CONTAS BANCÁRIAS
==================================================

O cheque deverá estar obrigatoriamente vinculado a uma conta bancária institucional.

Cada conta poderá possuir:

- Banco;
- Código do banco;
- Agência;
- Conta;
- Tipo;
- Titular;
- CNPJ;
- Situação;
- Permite cheque;
- Próximo número;
- Talões;
- Modelo de impressão;
- Assinaturas necessárias;
- Limite de emissão;
- Faixa de numeração.

Não permitir emissão em conta inativa ou sem permissão para cheque.

==================================================
8. GESTÃO DE TALÕES
==================================================

Criar a rota:

/admin/financeiro/cheques/taloes

Permitir cadastrar:

- Conta bancária;
- Série;
- Número inicial;
- Número final;
- Data de recebimento;
- Responsável pelo recebimento;
- Local de armazenamento;
- Situação;
- Observação.

Status do talão:

- Disponível;
- Em uso;
- Esgotado;
- Bloqueado;
- Extraviado;
- Cancelado;
- Arquivado.

Para cada folha, controlar:

- Número;
- Disponível;
- Reservada;
- Emitida;
- Impressa;
- Cancelada;
- Inutilizada;
- Extraviada.

Não permitir duplicidade do número do cheque dentro da mesma conta e série.

==================================================
9. RESERVA DO NÚMERO DO CHEQUE
==================================================

Ao iniciar uma emissão:

- Reservar temporariamente o número;
- Definir validade da reserva;
- Liberar se o usuário abandonar o fluxo;
- Impedir emissão simultânea com o mesmo número;
- Registrar quem reservou;
- Registrar data e hora.

Não consumir definitivamente a numeração antes da confirmação.

Aplicar controle transacional no backend.

==================================================
10. NUMERAÇÃO MANUAL E AUTOMÁTICA
==================================================

Permitir configuração por conta bancária:

- Número automático;
- Número manual;
- Automático com confirmação.

No modo automático:

- Selecionar o próximo cheque disponível;
- Pular números cancelados ou bloqueados;
- Impedir concorrência;
- Registrar reserva.

No modo manual:

- Validar faixa do talão;
- Verificar duplicidade;
- Verificar situação da folha;
- Exigir justificativa quando estiver fora da sequência.

==================================================
11. CHEQUE NOMINAL
==================================================

Todos os cheques deverão ser nominais, salvo exceção expressamente autorizada.

Campo:

“Nominal a”

Preencher com o favorecido.

Se o usuário alterar o nome:

- Exigir justificativa;
- Registrar valor anterior;
- Registrar valor novo;
- Registrar responsável;
- Submeter novamente à aprovação quando necessário.

==================================================
12. CHEQUE CRUZADO
==================================================

Adicionar opção:

- Não cruzado;
- Cruzado em branco;
- Cruzado especial, se a instituição utilizar.

Exibir visualmente duas linhas paralelas na impressão quando o cheque for cruzado.

Não permitir que o cruzamento cubra:

- Banco;
- Valor;
- Favorecido;
- Data;
- Assinaturas;
- Código magnético inferior.

==================================================
13. CHEQUE PRÉ-DATADO
==================================================

Permitir definir:

- Data de emissão;
- Data prevista para apresentação.

Exibir alerta:

“Cheque pré-datado não altera automaticamente a data legal de emissão. Utilize esta informação conforme a política financeira da instituição.”

Manter as duas datas separadas.

Não alterar a data de emissão para simular pré-datação sem registro.

==================================================
14. DATA E PRAÇA
==================================================

Gerar o texto de data conforme configuração.

Exemplo:

“Salvador, 2 de agosto de 2026”

Permitir configurar:

- Cidade padrão;
- Estado;
- Formato;
- Uso de zero à esquerda;
- Texto automático;
- Ajuste manual controlado.

==================================================
15. APROVAÇÃO DO CHEQUE
==================================================

Criar fluxo de aprovação configurável.

Exemplo:

1. Preparado;
2. Revisado;
3. Aprovado pelo financeiro;
4. Autorizado pelo gestor;
5. Liberado para impressão;
6. Impresso;
7. Assinado;
8. Entregue;
9. Compensado.

A quantidade de aprovadores deverá depender de:

- Valor;
- Conta;
- Centro de custo;
- Categoria;
- Unidade;
- Tipo de despesa;
- Regra institucional.

Não permitir que o mesmo usuário execute etapas incompatíveis quando houver segregação de funções.

==================================================
16. ALÇADAS DE APROVAÇÃO
==================================================

Criar regras configuráveis.

Exemplo:

Até R$ 1.000:

- 1 aprovação.

De R$ 1.000,01 a R$ 10.000:

- 2 aprovações.

Acima de R$ 10.000:

- aprovação especial.

Esses valores são apenas exemplos.

Não fixar os limites sem configuração administrativa.

Campos:

- Nome da regra;
- Valor mínimo;
- Valor máximo;
- Quantidade de aprovadores;
- Perfis;
- Ordem;
- Centro de custo;
- Conta;
- Categoria;
- Ativa/inativa.

==================================================
17. SEGREGAÇÃO DE FUNÇÕES
==================================================

Criar permissões distintas:

- Visualizar;
- Preparar;
- Revisar;
- Aprovar;
- Autorizar;
- Imprimir;
- Confirmar assinatura;
- Confirmar entrega;
- Registrar compensação;
- Cancelar;
- Sustar;
- Reimprimir;
- Administrar talões;
- Administrar modelos;
- Consultar auditoria.

Quando configurado, impedir que o mesmo usuário:

- Prepare e aprove;
- Aprove e confirme compensação;
- Cancele sem autorização;
- Reimprima sem aprovação.

==================================================
18. PRÉ-VISUALIZAÇÃO DO CHEQUE
==================================================

Antes de imprimir, exibir uma pré-visualização fiel.

Mostrar:

- Valor numérico;
- Valor por extenso;
- Favorecido;
- Data;
- Praça;
- Cruzamento;
- Textos adicionais;
- Posição de cada campo;
- Limites de impressão;
- Margens;
- Área não imprimível;
- Dimensão do papel.

Adicionar régua visual em:

- Milímetros;
- Centímetros;
- Pixels apenas para referência.

A unidade oficial de configuração deverá ser milímetro.

==================================================
19. MODELOS DE IMPRESSÃO
==================================================

Criar a rota:

/admin/financeiro/cheques/modelos

Cada conta bancária poderá ter um modelo próprio.

Campos:

- Nome do modelo;
- Banco;
- Conta;
- Tipo de folha;
- Largura;
- Altura;
- Orientação;
- Margens;
- Posição do favorecido;
- Posição do valor;
- Posição do valor por extenso;
- Posição da data;
- Posição da praça;
- Posição do cruzamento;
- Posição de textos adicionais;
- Fonte;
- Tamanho;
- Peso;
- Espaçamento;
- Quantidade de linhas;
- Limite por campo.

Permitir:

- Criar;
- Duplicar;
- Editar;
- Inativar;
- Testar;
- Vincular à conta.

==================================================
20. EDITOR VISUAL DO MODELO
==================================================

Criar editor visual com uma representação do cheque.

Permitir arrastar campos:

- Favorecido;
- Valor numérico;
- Valor por extenso;
- Data;
- Praça;
- Cruzamento;
- Texto complementar.

O editor deverá possuir:

- Grade;
- Régua;
- Zoom;
- Snap;
- Coordenadas;
- Bloqueio de campo;
- Reset;
- Desfazer;
- Refazer;
- Duplicar modelo;
- Pré-visualização.

Não permitir que a posição visual seja salva apenas em pixels dependentes da tela.

Converter e armazenar coordenadas em milímetros.

==================================================
21. CALIBRAÇÃO DA IMPRESSORA
==================================================

Criar assistente de calibração.

Etapas:

1. Selecionar impressora ou formato;
2. Imprimir folha de teste;
3. Medir deslocamento;
4. Informar ajuste horizontal;
5. Informar ajuste vertical;
6. Reimprimir teste;
7. Salvar calibração.

Permitir configurações por:

- Usuário;
- Computador;
- Impressora;
- Conta bancária;
- Modelo.

Campos:

- Offset X;
- Offset Y;
- Escala horizontal;
- Escala vertical;
- Margem;
- Orientação.

Não depender do nome da impressora quando o navegador não o disponibilizar.

==================================================
22. FOLHA DE TESTE
==================================================

Criar impressão de teste sem dados reais.

Utilizar textos como:

- TESTE DE IMPRESSÃO;
- FAVORECIDO DE TESTE;
- R$ 0,00;
- VALOR DE TESTE.

Não consumir número de cheque.

Não registrar como cheque emitido.

Exibir marca d’água:

“TESTE — SEM VALIDADE”

==================================================
23. FORMATO DE IMPRESSÃO
==================================================

Criar CSS específico com:

@media print

Aplicar:

- Tamanho exato;
- Margens zeradas ou configuradas;
- Background necessário;
- Sem header do portal;
- Sem sidebar;
- Sem botões;
- Sem URL;
- Sem rodapé do navegador quando possível por orientação ao usuário;
- Posicionamento absoluto apenas dentro da área de impressão;
- Unidades em milímetros.

Não utilizar screenshot do cheque como solução principal.

O conteúdo deve permanecer textual e nítido.

==================================================
24. IMPRESSÃO SEGURA
==================================================

Somente permitir impressão quando o cheque estiver:

- Aprovado;
- Autorizado;
- Com número válido;
- Vinculado a uma conta ativa;
- Vinculado a folha disponível;
- Sem bloqueios;
- Dentro das alçadas.

Ao clicar em “Imprimir cheque”:

1. Revalidar status no backend;
2. Gerar token temporário de impressão;
3. Abrir visualização;
4. Registrar tentativa;
5. Solicitar confirmação do resultado.

==================================================
25. CONFIRMAÇÃO APÓS IMPRESSÃO
==================================================

Depois da janela de impressão, perguntar:

“A impressão foi concluída corretamente?”

Opções:

- Sim, foi impressa corretamente;
- Não, a impressão falhou;
- Foi impressa com desalinhamento;
- A folha foi inutilizada;
- Cancelar confirmação.

Não marcar automaticamente como impresso apenas porque window.print() foi acionado.

==================================================
26. IMPRESSÃO COM SUCESSO
==================================================

Ao confirmar:

- Marcar como impresso;
- Registrar data e hora;
- Registrar usuário;
- Registrar modelo;
- Registrar versão;
- Registrar calibração;
- Marcar folha como utilizada;
- Gerar cópia administrativa;
- Atualizar histórico.

Não permitir edição simples depois da impressão.

Qualquer alteração deverá exigir cancelamento ou nova emissão.

==================================================
27. FALHA DE IMPRESSÃO
==================================================

Quando a impressão falhar:

- Manter status apropriado;
- Não consumir outra folha automaticamente;
- Permitir nova tentativa;
- Registrar motivo;
- Registrar usuário;
- Registrar data;
- Definir se a folha física continua utilizável.

Opções:

- Reimprimir na mesma folha;
- Inutilizar folha;
- Cancelar cheque;
- Emitir novo cheque.

==================================================
28. REIMPRESSÃO
==================================================

A reimpressão deve ser excepcional.

Exigir:

- Permissão;
- Justificativa;
- Aprovação, conforme política;
- Confirmação da situação da folha anterior;
- Auditoria.

A cópia reimpressa deverá possuir, quando apropriado:

- Marca d’água;
- Identificação de reimpressão;
- Número da tentativa.

Não permitir reimpressão silenciosa.

==================================================
29. CÓPIA ADMINISTRATIVA
==================================================

Além do cheque físico, gerar uma cópia administrativa em PDF.

A cópia deverá conter:

- Representação do cheque;
- Número;
- Conta bancária mascarada;
- Favorecido;
- Valor;
- Valor por extenso;
- Datas;
- Finalidade;
- Conta a pagar;
- Centro de custo;
- Aprovações;
- Responsáveis;
- Histórico resumido;
- Código de verificação;
- Data de geração.

Adicionar marca:

“CÓPIA ADMINISTRATIVA — NÃO NEGOCIÁVEL”

A cópia não deve ser confundida com a folha física.

==================================================
30. ASSINATURAS
==================================================

Inicialmente, controlar somente a confirmação de assinatura física.

Campos:

- Quantidade de assinaturas necessárias;
- Signatários previstos;
- Assinado por;
- Data;
- Confirmação;
- Observação.

Não imprimir assinatura digitalizada automaticamente sem aprovação jurídica e institucional específica.

Preparar arquitetura para assinatura eletrônica futura, mas não implementar imagem de assinatura como padrão.

==================================================
31. ENTREGA DO CHEQUE
==================================================

Criar fluxo para registrar a entrega.

Campos:

- Data;
- Hora;
- Entregue a;
- Documento do recebedor mascarado;
- Responsável pela entrega;
- Meio;
- Protocolo;
- Recibo;
- Anexo;
- Observação.

Status:

- Aguardando retirada;
- Entregue;
- Enviado;
- Devolvido;
- Não retirado.

==================================================
32. RECIBO DE ENTREGA
==================================================

Permitir gerar recibo contendo:

- Número do cheque;
- Valor;
- Favorecido;
- Data;
- Finalidade resumida;
- Pessoa que recebeu;
- Documento mascarado;
- Assinatura do recebedor em campo físico;
- Responsável da instituição;
- Protocolo.

Não incluir conta bancária completa desnecessariamente.

==================================================
33. COMPENSAÇÃO
==================================================

Não considerar a despesa efetivamente quitada apenas com a emissão ou impressão.

Criar status:

- Emitido;
- A entregar;
- Entregue;
- Apresentado;
- A compensar;
- Compensado;
- Devolvido;
- Sustado;
- Cancelado;
- Prescrito, quando aplicável à política institucional.

Ao registrar compensação:

- Informar data;
- Conta bancária;
- Valor;
- Extrato ou documento;
- Responsável;
- Observação;
- Conciliação.

Somente após compensação ou regra financeira definida, atualizar a baixa definitiva da conta a pagar.

==================================================
34. VINCULAÇÃO COM CONTA A PAGAR
==================================================

Ao emitir o cheque:

- Vincular à conta a pagar;
- Registrar forma de pagamento como cheque;
- Não criar duplicidade;
- Não baixar definitivamente antes do evento configurado.

Criar estados da conta a pagar:

- Pagamento em preparação;
- Cheque emitido;
- Cheque entregue;
- Aguardando compensação;
- Pago;
- Pagamento devolvido;
- Pagamento cancelado.

Não marcar como pago apenas ao imprimir.

==================================================
35. LANÇAMENTO FINANCEIRO
==================================================

A integração com o fluxo de caixa deverá respeitar a política configurada:

Opção 1:

Registrar saída na data da compensação.

Opção 2:

Registrar compromisso na emissão e saída na compensação.

Não duplicar o valor.

Criar configuração institucional e documentar o comportamento.

==================================================
36. LANÇAMENTO CONTÁBIL FUTURO
==================================================

Preparar eventos:

- Cheque emitido;
- Cheque entregue;
- Cheque compensado;
- Cheque devolvido;
- Cheque cancelado;
- Cheque sustado.

Não criar lançamentos contábeis definitivos sem briefing do setor contábil.

Criar apenas eventos e interface de integração.

==================================================
37. CHEQUE DEVOLVIDO
==================================================

Permitir registrar:

- Data;
- Motivo;
- Código de devolução;
- Documento;
- Valor;
- Responsável;
- Observação.

Ao devolver:

- Reabrir ou atualizar conta a pagar;
- Reverter baixa quando necessário;
- Criar pendência;
- Notificar financeiro;
- Registrar auditoria.

Não emitir automaticamente outro cheque.

==================================================
38. CANCELAMENTO
==================================================

Permitir cancelar antes ou depois da impressão conforme regras distintas.

Antes da impressão:

- Cancelar reserva;
- Liberar ou inutilizar número conforme política;
- Registrar motivo.

Depois da impressão:

- Exigir permissão;
- Exigir justificativa;
- Marcar folha como cancelada;
- Registrar destino físico da folha;
- Atualizar conta a pagar;
- Auditar.

Não apagar o cheque.

==================================================
39. SUSTAÇÃO
==================================================

Criar fluxo:

- Motivo;
- Data;
- Solicitação ao banco;
- Protocolo bancário;
- Documento;
- Responsável;
- Aprovação;
- Observação.

Status:

- Sustação solicitada;
- Sustado;
- Sustação recusada;
- Em acompanhamento.

Não considerar sustado sem confirmação registrada.

==================================================
40. EXTRAVIO
==================================================

Permitir registrar extravio de:

- Cheque individual;
- Folha;
- Talão.

Exigir:

- Data;
- Circunstância;
- Responsável;
- Comunicação;
- Sustação;
- Documento;
- Providências.

Bloquear imediatamente os números envolvidos.

==================================================
41. INUTILIZAÇÃO DA FOLHA
==================================================

Registrar:

- Número;
- Motivo;
- Data;
- Responsável;
- Evidência;
- Destino físico;
- Aprovação.

Motivos:

- Erro de impressão;
- Rasura;
- Danificação;
- Problema na folha;
- Outro.

Não reutilizar folha inutilizada.

==================================================
42. EDIÇÃO APÓS APROVAÇÃO
==================================================

Campos críticos:

- Conta;
- Número;
- Favorecido;
- Valor;
- Data;
- Centro de custo;
- Finalidade.

Ao alterar depois da aprovação:

- Invalidar aprovações;
- Retornar status;
- Registrar histórico;
- Exigir nova aprovação.

Depois da impressão:

- Não editar;
- Cancelar e emitir novo cheque.

==================================================
43. LISTAGEM DE CHEQUES
==================================================

Criar:

/admin/financeiro/cheques/emitidos

Colunas:

- Número;
- Conta;
- Favorecido;
- CPF/CNPJ mascarado;
- Valor;
- Emissão;
- Apresentação;
- Status;
- Conta a pagar;
- Centro de custo;
- Responsável;
- Ações.

Filtros:

- Período;
- Status;
- Conta;
- Talão;
- Favorecido;
- Centro de custo;
- Valor;
- Responsável.

Ações:

- Visualizar;
- Aprovar;
- Imprimir;
- Confirmar impressão;
- Registrar assinatura;
- Registrar entrega;
- Registrar compensação;
- Reimprimir;
- Cancelar;
- Sustar;
- Registrar devolução;
- Ver histórico;
- Baixar cópia administrativa.

==================================================
44. DETALHES DO CHEQUE
==================================================

Criar:

/admin/financeiro/cheques/:id

Organizar em abas:

- Resumo;
- Dados;
- Conta a pagar;
- Aprovações;
- Impressões;
- Assinaturas;
- Entrega;
- Compensação;
- Documentos;
- Histórico;
- Auditoria.

Exibir timeline completa.

==================================================
45. RELATÓRIOS
==================================================

Criar relatórios:

- Cheques emitidos;
- Cheques por conta;
- Cheques por favorecido;
- Cheques por centro de custo;
- Cheques por período;
- Aguardando aprovação;
- Aguardando impressão;
- Aguardando assinatura;
- Aguardando entrega;
- A compensar;
- Compensados;
- Cancelados;
- Sustados;
- Devolvidos;
- Folhas inutilizadas;
- Talões;
- Reimpressões;
- Cheques em atraso de compensação.

Permitir exportar:

- PDF;
- XLSX;
- CSV;

conforme permissão.

==================================================
46. ALERTAS
==================================================

Criar alertas para:

- Talão próximo do fim;
- Cheque aguardando aprovação;
- Cheque aprovado não impresso;
- Cheque impresso não assinado;
- Cheque assinado não entregue;
- Cheque entregue não compensado;
- Cheque pré-datado próximo da data;
- Cheque devolvido;
- Cheque sustado;
- Divergência;
- Numeração fora da sequência;
- Reimpressão;
- Conta inativa;
- Falta de modelo.

==================================================
47. NOTIFICAÇÕES
==================================================

Enviar notificações internas para:

- Responsável pela revisão;
- Aprovadores;
- Responsável pela impressão;
- Responsável pela assinatura;
- Tesouraria;
- Financeiro;
- Gestor;
- Auditoria, quando necessário.

Não enviar dados bancários completos em notificações.

==================================================
48. AUDITORIA
==================================================

Registrar:

- Criação;
- Reserva do número;
- Alteração;
- Revisão;
- Aprovação;
- Rejeição;
- Autorização;
- Impressão solicitada;
- Impressão confirmada;
- Falha;
- Reimpressão;
- Assinatura;
- Entrega;
- Compensação;
- Devolução;
- Cancelamento;
- Sustação;
- Extravio;
- Inutilização;
- Download;
- Exportação;
- Visualização de dados sensíveis.

Registrar:

- Usuário;
- Data;
- Hora;
- IP protegido;
- Dispositivo resumido;
- Valor anterior;
- Valor novo;
- Motivo;
- Correlation ID.

==================================================
49. PERMISSÕES
==================================================

Criar permissões granulares:

finance.cheques.view
finance.cheques.create
finance.cheques.edit
finance.cheques.review
finance.cheques.approve
finance.cheques.authorize
finance.cheques.print
finance.cheques.reprint
finance.cheques.sign
finance.cheques.deliver
finance.cheques.compensate
finance.cheques.cancel
finance.cheques.stop
finance.cheques.return
finance.cheques.manage_checkbooks
finance.cheques.manage_templates
finance.cheques.view_audit
finance.cheques.export

Não depender apenas do menu.

Validar no backend.

==================================================
50. TABELAS SUGERIDAS
==================================================

Criar ou adaptar estruturas equivalentes a:

bank_checkbooks

- id;
- bank_account_id;
- series;
- start_number;
- end_number;
- next_number;
- received_at;
- received_by;
- storage_location;
- status;
- notes;
- created_at;
- updated_at.

bank_check_leaves

- id;
- checkbook_id;
- check_number;
- status;
- reserved_by;
- reserved_at;
- reservation_expires_at;
- used_at;
- canceled_at;
- cancellation_reason;
- created_at;
- updated_at.

bank_checks

- id;
- bank_account_id;
- checkbook_id;
- check_leaf_id;
- check_number;
- series;
- payee_id;
- payee_name;
- payee_document_reference;
- amount;
- amount_in_words;
- issue_date;
- presentation_date;
- issue_city;
- purpose;
- cost_center_id;
- financial_category_id;
- payable_id;
- project_id;
- unit_id;
- is_nominal;
- is_crossed;
- crossing_type;
- is_post_dated;
- status;
- created_by;
- reviewed_by;
- approved_at;
- authorized_at;
- printed_at;
- signed_at;
- delivered_at;
- compensated_at;
- canceled_at;
- created_at;
- updated_at.

bank_check_approvals

- id;
- check_id;
- approval_level;
- required_role;
- approver_id;
- decision;
- reason;
- decided_at;
- created_at.

bank_check_print_models

- id;
- name;
- bank_account_id;
- bank_code;
- paper_width_mm;
- paper_height_mm;
- orientation;
- field_positions_json;
- font_settings_json;
- active;
- version;
- created_by;
- created_at;
- updated_at.

bank_check_print_calibrations

- id;
- user_id;
- print_model_id;
- device_reference;
- printer_reference;
- offset_x_mm;
- offset_y_mm;
- scale_x;
- scale_y;
- created_at;
- updated_at.

bank_check_print_jobs

- id;
- check_id;
- print_model_id;
- model_version;
- calibration_id;
- requested_by;
- status;
- attempt_number;
- result;
- failure_reason;
- requested_at;
- confirmed_at;
- created_at.

bank_check_signatures

- id;
- check_id;
- signer_id;
- signer_name;
- signature_order;
- confirmed_by;
- confirmed_at;
- notes;
- created_at.

bank_check_deliveries

- id;
- check_id;
- recipient_name;
- recipient_document_reference;
- delivery_method;
- delivered_by;
- delivered_at;
- receipt_file_path;
- notes;
- created_at.

bank_check_settlements

- id;
- check_id;
- settlement_type;
- settlement_date;
- amount;
- bank_reference;
- statement_file_path;
- recorded_by;
- notes;
- created_at.

bank_check_status_history

- id;
- check_id;
- previous_status;
- new_status;
- changed_by;
- reason;
- metadata_safe;
- created_at.

bank_check_documents

- id;
- check_id;
- document_type;
- file_path;
- file_name_safe;
- uploaded_by;
- created_at.

bank_check_audit_logs

- id;
- check_id;
- event_type;
- user_id;
- result;
- metadata_safe;
- correlation_id;
- created_at.

Não duplicar tabelas já existentes.

Aplicar migrations seguras.

==================================================
51. RLS E SEGURANÇA
==================================================

Aplicar:

- RLS;
- Permissões;
- Segregação;
- Ownership institucional;
- Controle por unidade;
- Controle por conta;
- Auditoria;
- Mascaramento;
- Links temporários;
- Criptografia;
- Rate limiting;
- Validação backend.

Não expor:

- Número completo da conta para perfis sem permissão;
- Dados completos do favorecido;
- Documentos;
- Assinaturas;
- Tokens de impressão;
- Logs internos.

==================================================
52. INTEGRIDADE E TRANSAÇÕES
==================================================

Operações críticas devem ser transacionais:

- Reservar folha;
- Confirmar emissão;
- Aprovar;
- Confirmar impressão;
- Consumir folha;
- Cancelar;
- Compensar;
- Reverter conta a pagar.

Evitar estados parciais.

Exemplo:

Não permitir cheque marcado como impresso enquanto a folha continua disponível.

==================================================
53. IDPOTÊNCIA
==================================================

Aplicar idempotência em:

- Emissão;
- Aprovação;
- Impressão;
- Confirmação;
- Compensação;
- Cancelamento;
- Notificações;
- Integrações.

Impedir duplo clique e repetição no backend.

==================================================
54. RESPONSIVIDADE
==================================================

Desktop:

- Editor visual amplo;
- Tabelas;
- Pré-visualização;
- Painéis laterais.

Tablet:

- Listagens adaptadas;
- Editor simplificado;
- Formulários em uma coluna ou duas.

Mobile/PWA:

- Permitir consulta;
- Aprovação, quando autorizado;
- Visualização;
- Histórico;
- Alertas.

Não recomendar impressão física pelo celular.

No mobile, exibir:

“Para melhor precisão, realize a impressão em um computador conectado à impressora configurada.”

==================================================
55. ACESSIBILIDADE
==================================================

Garantir:

- Labels;
- Teclado;
- Foco;
- Contraste;
- Tabelas semânticas;
- Valores lidos corretamente;
- Status textual;
- Editor com alternativa numérica;
- Pré-visualização acessível;
- Confirmações;
- Leitores de tela;
- Zoom.

O editor visual por arraste deverá possuir alternativa por campos numéricos em milímetros.

==================================================
56. IMPRESSÃO E NAVEGADOR
==================================================

Como o navegador normalmente não permite selecionar impressora ou remover automaticamente cabeçalhos e rodapés, exibir orientações antes da primeira impressão:

- Selecionar escala de 100%;
- Desativar “Ajustar à página”;
- Desativar cabeçalhos e rodapés;
- Usar margens definidas pelo modelo;
- Confirmar orientação;
- Realizar impressão de teste.

Criar tutorial específico por navegador:

- Chrome;
- Edge;
- Firefox;
- Safari, se aplicável.

==================================================
57. TUTORIAIS
==================================================

Adicionar na Central de Tutoriais:

- Como cadastrar conta para emissão de cheque;
- Como cadastrar talão;
- Como criar modelo;
- Como calibrar;
- Como emitir;
- Como aprovar;
- Como imprimir folha de teste;
- Como imprimir cheque;
- Como confirmar impressão;
- Como registrar assinatura;
- Como registrar entrega;
- Como registrar compensação;
- Como cancelar;
- Como sustar;
- Como inutilizar folha;
- Como registrar devolução;
- Como reimprimir;
- Como consultar auditoria;
- Como corrigir desalinhamento.

==================================================
58. IMPLEMENTAÇÃO POR ETAPAS
==================================================

ETAPA 1 — FUNDAÇÃO

- Tabelas;
- Permissões;
- Status;
- Talões;
- Folhas;
- Contas bancárias;
- Numeração.

ETAPA 2 — EMISSÃO

- Formulário;
- Conta a pagar;
- Favorecido;
- Valor por extenso;
- Reserva;
- Aprovações.

ETAPA 3 — IMPRESSÃO

- Modelos;
- Editor;
- Calibração;
- Teste;
- Pré-visualização;
- Impressão;
- Confirmação.

ETAPA 4 — CICLO DE VIDA

- Assinatura;
- Entrega;
- Compensação;
- Devolução;
- Cancelamento;
- Sustação;
- Extravio.

ETAPA 5 — GESTÃO

- Dashboard;
- Relatórios;
- Alertas;
- Auditoria;
- Tutoriais;
- Testes.

Não implementar tudo em uma única alteração.

==================================================
59. TESTES
==================================================

Criar testes para:

- Conta bancária;
- Talão;
- Folha;
- Sequência;
- Reserva;
- Concorrência;
- Emissão;
- Valor por extenso;
- Favorecido;
- Conta a pagar;
- Aprovação;
- Alçada;
- Segregação;
- Modelo;
- Coordenadas;
- Calibração;
- Folha de teste;
- Impressão;
- Confirmação;
- Falha;
- Reimpressão;
- Assinatura;
- Entrega;
- Compensação;
- Devolução;
- Cancelamento;
- Sustação;
- Extravio;
- Auditoria;
- RLS;
- Permissões;
- Responsividade;
- Acessibilidade.

==================================================
60. CRITÉRIOS DE ACEITE
==================================================

Considerar concluído somente quando:

- O menu Cheques estiver integrado ao Financeiro;
- Contas bancárias puderem habilitar cheque;
- Talões forem controlados;
- Folhas tiverem status individual;
- Não houver numeração duplicada;
- Reservas concorrentes forem impedidas;
- O cheque puder ser vinculado a uma conta a pagar;
- O valor por extenso for gerado corretamente;
- O fluxo de aprovação funcionar;
- Alçadas forem configuráveis;
- Segregação de funções estiver aplicada;
- Modelos forem configuráveis por conta;
- Coordenadas forem armazenadas em milímetros;
- O editor possuir alternativa numérica;
- A calibração funcionar;
- A folha de teste não consumir numeração;
- A pré-visualização corresponder à impressão;
- A impressão exigir aprovação;
- O sistema não marcar como impresso automaticamente;
- Falhas de impressão forem tratadas;
- Reimpressões forem auditadas;
- A cópia administrativa possuir marca de não negociável;
- Assinatura física puder ser confirmada;
- Entrega puder ser registrada;
- Compensação puder ser registrada;
- Conta a pagar não for baixada indevidamente na impressão;
- Cancelamentos não excluírem registros;
- Sustação e devolução possuírem fluxos;
- Auditoria estiver completa;
- RLS e permissões estiverem testadas;
- Relatórios estiverem disponíveis;
- Tutoriais estiverem atualizados;
- Nenhuma funcionalidade financeira existente tiver sido quebrada.

RESULTADO ESPERADO

Ao final da implementação, o Módulo Financeiro da SBPM deverá possuir um sistema completo e seguro de emissão e impressão de cheques.

O sistema deverá controlar todo o ciclo:

1. Origem da obrigação;
2. Conta bancária;
3. Talão;
4. Número;
5. Favorecido;
6. Valor;
7. Aprovação;
8. Modelo;
9. Calibração;
10. Impressão;
11. Assinatura;
12. Entrega;
13. Compensação;
14. Cancelamento ou devolução;
15. Auditoria.

A impressão do cheque deverá ser tratada como uma etapa operacional do pagamento, e não como a quitação automática da obrigação financeira.`}
      </pre>
    </div>
  );
}
