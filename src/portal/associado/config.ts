/**
 * Configuração central do Portal do Associado (Fase 7).
 *
 * REGRA: categorias, setores e classificação de campos ficam aqui — nunca fixados
 * dentro de componentes. Quando o backend passar a fornecer esses catálogos,
 * substitua apenas as funções de leitura abaixo.
 */
import { icons, type LucideIcon } from "@/design-system/icons";

/* ------------------------------------------------- Solicitações */

export interface CategoriaSolicitacao {
  value: string;
  label: string;
  /** Prazo institucional em dias úteis. */
  sla: number;
  descricao: string;
  /** Assuntos sugeridos ao associado. */
  assuntos: string[];
  exigeDocumento?: boolean;
}

export const categoriasSolicitacao: CategoriaSolicitacao[] = [
  {
    value: "alteracao_cadastral",
    label: "Correção cadastral",
    sla: 5,
    descricao: "Correção de informações oriundas da base institucional.",
    assuntos: ["Correção de nome", "Correção de data de nascimento", "Correção de posto/graduação", "Outros dados"],
    exigeDocumento: true,
  },
  {
    value: "segunda_via_carteirinha",
    label: "2ª via de carteirinha",
    sla: 3,
    descricao: "Emissão de nova via da identificação digital.",
    assuntos: ["2ª via do titular", "2ª via de dependente"],
  },
  {
    value: "duvida",
    label: "Dúvida geral",
    sla: 2,
    descricao: "Dúvidas sobre serviços, benefícios e o próprio portal.",
    assuntos: ["Dúvida sobre benefícios", "Dúvida sobre o portal", "Outra dúvida"],
  },
  {
    value: "financeiro",
    label: "Financeiro / Mensalidade",
    sla: 5,
    descricao: "Mensalidades, comprovantes e informe de rendimentos.",
    assuntos: ["Comprovante de pagamento", "Divergência de mensalidade", "Informe de rendimentos"],
  },
  {
    value: "atendimento_medico",
    label: "Assistência à saúde",
    sla: 3,
    descricao: "Orientações sobre a rede credenciada e atendimentos.",
    assuntos: ["Orientação sobre rede credenciada", "Dificuldade de atendimento"],
  },
  {
    value: "reclamacao",
    label: "Reclamação",
    sla: 7,
    descricao: "Registro formal de insatisfação com serviço ou parceiro.",
    assuntos: ["Atendimento em parceiro", "Atendimento da SBPM", "Outro"],
  },
  {
    value: "sugestao",
    label: "Sugestão",
    sla: 10,
    descricao: "Sugestões de melhoria para a SBPM e para o portal.",
    assuntos: ["Sugestão de parceiro", "Sugestão de melhoria"],
  },
  {
    value: "outro",
    label: "Outro assunto",
    sla: 5,
    descricao: "Assuntos não contemplados nas demais categorias.",
    assuntos: ["Outro assunto"],
  },
];

export const getCategoriaSolicitacao = (value?: string | null) =>
  categoriasSolicitacao.find((c) => c.value === value);

/** Etapas institucionais de uma solicitação — usadas na timeline de acompanhamento. */
export const etapasSolicitacao = [
  { key: "aberto", label: "Recebida", description: "Sua solicitação foi registrada e possui protocolo." },
  { key: "em_andamento", label: "Em análise", description: "A equipe responsável está avaliando o pedido." },
  { key: "concluido", label: "Concluída", description: "A solicitação foi finalizada pela SBPM." },
] as const;

/* ------------------------------------------------- Campos cadastrais */

export type OrigemCampo = "oficial" | "editavel";

export interface CampoCadastral {
  id: string;
  label: string;
  origem: OrigemCampo;
  grupo: "pessoais" | "contato" | "funcionais" | "endereco" | "vinculo";
  /** Texto de apoio exibido junto ao valor. */
  ajuda?: string;
}

export const camposCadastrais: CampoCadastral[] = [
  { id: "nome", label: "Nome completo", origem: "oficial", grupo: "pessoais" },
  { id: "cpf", label: "CPF", origem: "oficial", grupo: "pessoais", ajuda: "Exibido parcialmente por segurança." },
  { id: "data_nascimento", label: "Data de nascimento", origem: "oficial", grupo: "pessoais" },
  { id: "matricula", label: "Matrícula", origem: "oficial", grupo: "funcionais", ajuda: "Exibida parcialmente por segurança." },
  { id: "patente", label: "Posto / graduação", origem: "oficial", grupo: "funcionais" },
  { id: "situacao", label: "Situação funcional", origem: "oficial", grupo: "funcionais" },
  { id: "data_admissao", label: "Data de associação", origem: "oficial", grupo: "vinculo" },
  { id: "email", label: "E-mail", origem: "editavel", grupo: "contato" },
  { id: "telefone", label: "Telefone / WhatsApp", origem: "editavel", grupo: "contato" },
  { id: "endereco", label: "Endereço", origem: "editavel", grupo: "endereco" },
  { id: "foto_url", label: "Foto do perfil", origem: "editavel", grupo: "pessoais" },
];

export const camposOficiais = camposCadastrais.filter((c) => c.origem === "oficial");
export const camposEditaveis = camposCadastrais.filter((c) => c.origem === "editavel");

export const AVISO_DADO_OFICIAL = "Esta informação é proveniente da base institucional.";

/* ------------------------------------------------- Atendimento */

export interface CanalAtendimento {
  id: string;
  setor: string;
  descricao: string;
  icon: LucideIcon;
  telefone?: string;
  whatsapp?: string;
  email?: string;
  horario: string;
  orientacoes?: string;
}

/** Somente canais institucionais confirmados. Nunca incluir telefone pessoal. */
export const canaisAtendimento: CanalAtendimento[] = [
  {
    id: "previdencia",
    setor: "Previdência",
    descricao: "Pecúlio, dependentes, vínculo associativo e cadastro.",
    icon: icons.previdencia,
    whatsapp: "5571985496972",
    telefone: "71 98549-6972",
    email: "previdencia@sbpmbahia.com.br",
    horario: "Segunda a sexta, das 8h às 17h",
  },
  {
    id: "saude",
    setor: "Assistência à Saúde",
    descricao: "Rede credenciada, clínicas, exames e orientações de atendimento.",
    icon: icons.saude,
    whatsapp: "5571987943414",
    telefone: "71 98794-3414",
    horario: "Segunda a sexta, das 8h às 17h",
  },
  {
    id: "cadastro",
    setor: "Cadastro",
    descricao: "Atualização e correção de dados cadastrais.",
    icon: icons.perfil,
    email: "contato@sbpmbahia.com.br",
    horario: "Segunda a sexta, das 8h às 17h",
    orientacoes: "Correções de dados oficiais são registradas como solicitação e analisadas pela SBPM.",
  },
  {
    id: "financeiro",
    setor: "Financeiro",
    descricao: "Mensalidades, comprovantes e informe de rendimentos.",
    icon: icons.financeiro,
    email: "contato@sbpmbahia.com.br",
    horario: "Segunda a sexta, das 8h às 17h",
  },
  {
    id: "suporte",
    setor: "Suporte do Portal",
    descricao: "Dificuldades de acesso, primeiro acesso e uso do aplicativo.",
    icon: icons.configuracoes,
    email: "contato@sbpmbahia.com.br",
    horario: "Segunda a sexta, das 8h às 17h",
    orientacoes: "Para problemas de acesso, tenha em mãos a matrícula ou o CPF do titular.",
  },
];

export const linkWhatsApp = (numero: string, mensagem: string) =>
  `https://wa.me/${numero}?text=${encodeURIComponent(mensagem.slice(0, 400))}`;
