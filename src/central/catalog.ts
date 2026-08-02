/**
 * Catálogos institucionais da Central de Relacionamento (Fase 9).
 *
 * REGRA: módulos, assuntos, categorias e setores NÃO podem ser fixados dentro de
 * componentes. Quando o SBPMSanitas passar a fornecer esses catálogos, basta
 * trocar as funções de leitura do serviço (`src/central/service`) — as telas
 * consomem sempre pelas funções abaixo.
 */
import { icons, type LucideIcon } from "@/design-system/icons";
import type { CentralContato } from "./types";

/* ---------------------------------------------------------- Módulos */

export interface CentralModulo {
  value: string;
  label: string;
  descricao: string;
  icon: LucideIcon;
  /** Prazo institucional de retorno em dias úteis. */
  sla: number;
  /** Perfis autorizados a abrir solicitação neste módulo. */
  perfis: Array<"associate" | "dependent">;
  exigeDocumento?: boolean;
}

export const modulosCentral: CentralModulo[] = [
  { value: "previdencia", label: "Previdência", descricao: "Pecúlio, benefícios previdenciários e vínculo.", icon: icons.previdencia, sla: 5, perfis: ["associate", "dependent"] },
  { value: "saude", label: "Saúde", descricao: "Assistência à saúde e rede credenciada.", icon: icons.saude, sla: 3, perfis: ["associate", "dependent"] },
  { value: "financeiro", label: "Financeiro", descricao: "Mensalidades, comprovantes e cobranças.", icon: icons.financeiro, sla: 5, perfis: ["associate"] },
  { value: "patrimonio", label: "Patrimônio", descricao: "Bens, sedes e estruturas da SBPM.", icon: icons.patrimonio, sla: 10, perfis: ["associate"] },
  { value: "contabilidade", label: "Contabilidade", descricao: "Informe de rendimentos e prestação de contas.", icon: icons.contabilidade, sla: 7, perfis: ["associate"] },
  { value: "rh", label: "Recursos Humanos", descricao: "Assuntos funcionais e de pessoal.", icon: icons.rh, sla: 7, perfis: ["associate"] },
  { value: "juridico", label: "Jurídico", descricao: "Orientações e demandas jurídicas institucionais.", icon: icons.contabilidade, sla: 10, perfis: ["associate"] },
  { value: "cadastro", label: "Cadastro", descricao: "Correção de dados oficiais e documentos.", icon: icons.perfil, sla: 5, perfis: ["associate", "dependent"], exigeDocumento: true },
  { value: "centro_medico", label: "Centro Médico", descricao: "Agendamentos e atendimentos no Centro Médico.", icon: icons.saude, sla: 3, perfis: ["associate", "dependent"] },
  { value: "odontologia", label: "Odontologia", descricao: "Atendimento odontológico e autorizações.", icon: icons.saude, sla: 3, perfis: ["associate", "dependent"] },
  { value: "suporte", label: "Suporte Técnico", descricao: "Acesso ao portal, senha e falhas no aplicativo.", icon: icons.configuracoes, sla: 2, perfis: ["associate", "dependent"] },
  { value: "outros", label: "Outros", descricao: "Assuntos não contemplados nos demais módulos.", icon: icons.solicitacao, sla: 5, perfis: ["associate", "dependent"] },
];

export const getModulo = (value?: string | null) =>
  modulosCentral.find((m) => m.value === value) ?? modulosCentral[modulosCentral.length - 1];

export const modulosPorPerfil = (perfil: "associate" | "dependent") =>
  modulosCentral.filter((m) => m.perfis.includes(perfil));

/**
 * Assuntos padrão por módulo.
 * Fonte temporária: quando o backend expuser o catálogo, o serviço substitui
 * este mapa sem alterar o wizard (§4 — "não fixar no componente").
 */
export const assuntosPadrao: Record<string, string[]> = {
  previdencia: ["Dúvida sobre pecúlio", "Indicação de beneficiários", "Solicitação de benefício", "Situação do vínculo"],
  saude: ["Autorização de exame", "Dificuldade de atendimento", "Rede credenciada", "Reembolso"],
  financeiro: ["Divergência de mensalidade", "Comprovante de pagamento", "Negociação de débito", "Alteração de forma de pagamento"],
  patrimonio: ["Uso de espaço institucional", "Ocorrência em unidade", "Outros assuntos patrimoniais"],
  contabilidade: ["Informe de rendimentos", "Declaração de contribuição", "Prestação de contas"],
  rh: ["Dúvida funcional", "Documentação de pessoal", "Outros assuntos de RH"],
  juridico: ["Orientação jurídica", "Documentação processual", "Outros assuntos jurídicos"],
  cadastro: ["Correção de nome", "Correção de data de nascimento", "Correção de posto/graduação", "Inclusão de dependente", "Atualização de endereço"],
  centro_medico: ["Agendamento de consulta", "Remarcação", "Resultado de exame"],
  odontologia: ["Agendamento odontológico", "Autorização de procedimento", "Dúvida sobre cobertura"],
  suporte: ["Não consigo acessar o portal", "Erro no aplicativo", "Redefinição de senha", "Sugestão de melhoria"],
  outros: ["Elogio", "Reclamação", "Sugestão", "Outro assunto"],
};

export const getAssuntos = (modulo: string) => assuntosPadrao[modulo] ?? assuntosPadrao.outros;

/* ---------------------------------------------------------- Upload */

/** Configuração de anexos — ajustável sem tocar no componente de upload. */
export const uploadConfig = {
  maxArquivos: 5,
  maxTamanhoMb: 10,
  formatos: [".pdf", ".jpg", ".jpeg", ".png", ".webp", ".doc", ".docx"],
  accept: "application/pdf,image/jpeg,image/png,image/webp,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

/* ---------------------------------------------------------- FAQ */

export const categoriasFaq = [
  { value: "previdencia", label: "Previdência", icon: icons.previdencia },
  { value: "saude", label: "Saúde", icon: icons.saude },
  { value: "financeiro", label: "Financeiro", icon: icons.financeiro },
  { value: "patrimonio", label: "Patrimônio", icon: icons.patrimonio },
  { value: "rh", label: "Recursos Humanos", icon: icons.rh },
  { value: "cadastro", label: "Cadastro", icon: icons.perfil },
  { value: "seguranca", label: "Segurança", icon: icons.senha },
  { value: "portal", label: "Portal", icon: icons.dashboard },
  { value: "beneficios", label: "Benefícios", icon: icons.avaliacao },
  { value: "eventos", label: "Eventos", icon: icons.agenda },
];

/** Aproxima categorias livres do banco às categorias canônicas da Central. */
export function normalizarCategoriaFaq(valor?: string | null): string {
  const texto = (valor ?? "").toLowerCase();
  const encontrada = categoriasFaq.find((c) => texto.includes(c.value) || texto.includes(c.label.toLowerCase()));
  if (encontrada) return encontrada.value;
  if (/senha|acesso|login|2fa/.test(texto)) return "seguranca";
  if (/mensalidade|pagamento|boleto/.test(texto)) return "financeiro";
  if (/clinica|exame|consulta|médic/.test(texto)) return "saude";
  if (/dependente|cadastr|documento/.test(texto)) return "cadastro";
  return "portal";
}

/* ---------------------------------------------------------- Downloads */

export const categoriasDownload = [
  { value: "formularios", label: "Formulários", icon: icons.documento },
  { value: "cartilhas", label: "Cartilhas", icon: icons.tutorial },
  { value: "regulamentos", label: "Regulamentos", icon: icons.contabilidade },
  { value: "leis", label: "Leis e normas", icon: icons.lgpd },
  { value: "modelos", label: "Modelos", icon: icons.pasta },
  { value: "declaracoes", label: "Declarações", icon: icons.documento },
  { value: "institucionais", label: "Arquivos institucionais", icon: icons.previdencia },
];

/* ---------------------------------------------------------- Contatos */

export const setoresContato: CentralContato[] = [
  {
    id: "previdencia",
    setor: "Previdência",
    descricao: "Pecúlio, benefícios, vínculo associativo e dependentes.",
    telefone: "(71) 98549-6972",
    whatsapp: "5571985496972",
    email: "previdencia@sbpmbahia.com.br",
    horario: "Segunda a sexta, 8h às 17h",
    localizacao: "Sede SBPM — Salvador/BA",
    icon: icons.previdencia,
  },
  {
    id: "saude",
    setor: "Assistência à Saúde",
    descricao: "Rede credenciada, autorizações e orientações assistenciais.",
    telefone: "(71) 98794-3414",
    whatsapp: "5571987943414",
    email: "saude@sbpmbahia.com.br",
    horario: "Segunda a sexta, 8h às 17h",
    localizacao: "Sede SBPM — Salvador/BA",
    icon: icons.saude,
  },
  {
    id: "financeiro",
    setor: "Financeiro",
    descricao: "Mensalidades, comprovantes e negociações.",
    email: "financeiro@sbpmbahia.com.br",
    horario: "Segunda a sexta, 8h às 17h",
    localizacao: "Sede SBPM — Salvador/BA",
    icon: icons.financeiro,
  },
  {
    id: "atendimento",
    setor: "Atendimento Geral",
    descricao: "Primeiro contato, protocolos e encaminhamentos.",
    email: "contato@sbpmbahia.com.br",
    horario: "Segunda a sexta, 8h às 17h",
    localizacao: "Sede SBPM — Salvador/BA",
    icon: icons.comunicado,
  },
];

/** Monta o link do WhatsApp já com a mensagem institucional codificada. */
export function linkWhatsAppCentral(numero: string, mensagem: string) {
  return `https://wa.me/${numero.replace(/\D/g, "")}?text=${encodeURIComponent(mensagem.slice(0, 400))}`;
}

/* ---------------------------------------------------------- Módulos da Central */

export interface CentralModuloNav {
  id: string;
  label: string;
  descricao: string;
  route: string;
  icon: LucideIcon;
}

/** Os 11 módulos da Central (§1) — usados no hub e na navegação interna. */
export const modulosNavegacao: CentralModuloNav[] = [
  { id: "abrir", label: "Abrir solicitação", descricao: "Registre um pedido e receba um protocolo.", route: "/dashboard/central/abrir", icon: icons.adicionar },
  { id: "minhas", label: "Minhas solicitações", descricao: "Acompanhe tudo o que você já abriu.", route: "/dashboard/central/solicitacoes", icon: icons.solicitacao },
  { id: "protocolos", label: "Consultar protocolo", descricao: "Busque pelo número do protocolo.", route: "/dashboard/central/protocolos", icon: icons.buscar },
  { id: "tutoriais", label: "Tutoriais", descricao: "Passo a passo de cada funcionalidade.", route: "/dashboard/central/tutoriais", icon: icons.tutorial },
  { id: "faq", label: "Perguntas frequentes", descricao: "Respostas rápidas por categoria.", route: "/dashboard/central/faq", icon: icons.ajuda },
  { id: "atendimento", label: "Atendimento", descricao: "Fale com a SBPM pelos canais oficiais.", route: "/dashboard/central/atendimento", icon: icons.whatsapp },
  { id: "contatos", label: "Contatos por setor", descricao: "Telefones, e-mails e horários.", route: "/dashboard/central/contatos", icon: icons.telefone },
  { id: "noticias", label: "Notícias institucionais", descricao: "Novidades e comunicados da SBPM.", route: "/dashboard/central/noticias", icon: icons.comunicado },
  { id: "avisos", label: "Avisos", descricao: "Comunicações urgentes e prazos.", route: "/dashboard/central/avisos", icon: icons.alerta },
  { id: "downloads", label: "Downloads", descricao: "Formulários, cartilhas e regulamentos.", route: "/dashboard/central/downloads", icon: icons.baixar },
  { id: "feedback", label: "Feedback", descricao: "Avalie o atendimento recebido.", route: "/dashboard/central/feedback", icon: icons.avaliacao },
];
