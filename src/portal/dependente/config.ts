/**
 * Configuração central do Portal do Dependente (Fase 8).
 *
 * O dependente possui identidade própria: catálogo reduzido de solicitações,
 * campos cadastrais próprios e canais de atendimento específicos.
 *
 * REGRA: nada financeiro, nada administrativo e nenhum dado sensível do titular.
 */
import { icons, type LucideIcon } from "@/design-system/icons";
import { categoriasSolicitacao, type CategoriaSolicitacao, type CanalAtendimento } from "@/portal/associado/config";

/* ------------------------------------------------- Solicitações */

/** Categorias permitidas ao dependente (financeiro/mensalidade fica fora). */
export const categoriasPermitidasDependente = [
  "alteracao_cadastral",
  "segunda_via_carteirinha",
  "duvida",
  "atendimento_medico",
  "reclamacao",
  "sugestao",
  "outro",
] as const;

export const categoriasSolicitacaoDependente: CategoriaSolicitacao[] = categoriasSolicitacao
  .filter((c) => (categoriasPermitidasDependente as readonly string[]).includes(c.value))
  .map((c) =>
    c.value === "segunda_via_carteirinha"
      ? { ...c, assuntos: ["2ª via da minha carteirinha"] }
      : c.value === "alteracao_cadastral"
        ? { ...c, assuntos: ["Correção de nome", "Correção de data de nascimento", "Correção de parentesco", "Outros dados"] }
        : c,
  );

/** Catálogo de categorias conforme o perfil autenticado. */
export const getCategoriasPorPerfil = (isDependente: boolean) =>
  isDependente ? categoriasSolicitacaoDependente : categoriasSolicitacao;

/* ------------------------------------------------- Campos cadastrais */

export interface CampoDependente {
  id: string;
  label: string;
  origem: "oficial" | "editavel";
  ajuda?: string;
}

export const camposDependente: CampoDependente[] = [
  { id: "nome", label: "Nome completo", origem: "oficial" },
  { id: "cpf", label: "CPF", origem: "oficial", ajuda: "Exibido parcialmente por segurança." },
  { id: "data_nascimento", label: "Data de nascimento", origem: "oficial" },
  { id: "tipo", label: "Grau de parentesco", origem: "oficial" },
  { id: "situacao", label: "Situação do vínculo", origem: "oficial" },
  { id: "email", label: "E-mail", origem: "editavel" },
  { id: "telefone", label: "Telefone / WhatsApp", origem: "editavel" },
  { id: "endereco", label: "Endereço", origem: "editavel" },
  { id: "foto_url", label: "Foto do perfil", origem: "editavel" },
];

export const camposOficiaisDependente = camposDependente.filter((c) => c.origem === "oficial");

export const AVISO_DADO_OFICIAL_DEPENDENTE =
  "Esta informação vem da base institucional da SBPM e não pode ser alterada diretamente pelo portal.";

/* ------------------------------------------------- Parentesco */

export const parentescoLabel: Record<string, string> = {
  conjuge: "Cônjuge",
  filho: "Filho(a)",
  pai_mae: "Pai / Mãe",
  outro: "Outro",
};

/* ------------------------------------------------- Atendimento */

/** Canais institucionais disponíveis ao dependente. Nunca contatos pessoais. */
export const canaisAtendimentoDependente: CanalAtendimento[] = [
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
    id: "previdencia",
    setor: "Previdência",
    descricao: "Vínculo de dependência e documentos previdenciários.",
    icon: icons.previdencia,
    whatsapp: "5571985496972",
    telefone: "71 98549-6972",
    email: "previdencia@sbpmbahia.com.br",
    horario: "Segunda a sexta, das 8h às 17h",
  },
  {
    id: "odontologia",
    setor: "Odontologia",
    descricao: "Atendimento odontológico da rede conveniada.",
    icon: icons.saude,
    whatsapp: "5571987943414",
    telefone: "71 98794-3414",
    horario: "Segunda a sexta, das 8h às 17h",
  },
  {
    id: "centro_medico",
    setor: "Centro Médico",
    descricao: "Agendamentos e informações do centro médico da SBPM.",
    icon: icons.saude,
    whatsapp: "5571987943414",
    telefone: "71 98794-3414",
    horario: "Segunda a sexta, das 8h às 17h",
  },
  {
    id: "cadastro",
    setor: "Cadastro",
    descricao: "Correção de dados cadastrais e atualização de contato.",
    icon: icons.perfil,
    email: "contato@sbpmbahia.com.br",
    horario: "Segunda a sexta, das 8h às 17h",
    orientacoes: "Correções de dados oficiais são registradas como solicitação com protocolo.",
  },
  {
    id: "suporte",
    setor: "Suporte do Portal",
    descricao: "Dificuldades de acesso, senha e uso do aplicativo.",
    icon: icons.configuracoes,
    email: "contato@sbpmbahia.com.br",
    horario: "Segunda a sexta, das 8h às 17h",
    orientacoes: "Tenha em mãos seu CPF ou a matrícula do titular responsável.",
  },
];

/* ------------------------------------------------- Documentos */

export interface CategoriaDocumentoDependente {
  value: string;
  label: string;
  icon: LucideIcon;
  /** Categorias equivalentes vindas da base. */
  origens: string[];
}

export const categoriasDocumentoDependente: CategoriaDocumentoDependente[] = [
  { value: "carteirinha", label: "Carteirinha", icon: icons.carteirinha, origens: ["carteirinha", "identificacao"] },
  { value: "declaracao", label: "Declarações", icon: icons.documento, origens: ["declaracao"] },
  { value: "documento", label: "Documentos", icon: icons.pasta, origens: ["documento", "contratual", "medico"] },
  { value: "comprovante", label: "Comprovantes", icon: icons.documento, origens: ["comprovante"] },
  { value: "outros", label: "Outros", icon: icons.pasta, origens: ["outros"] },
];

/** Converte a categoria bruta da base na categoria exibida ao dependente. */
export function categoriaDocumentoDependente(bruta?: string | null): string {
  const alvo = (bruta ?? "").toLowerCase();
  const achou = categoriasDocumentoDependente.find((c) => c.origens.includes(alvo));
  return achou?.value ?? "outros";
}
