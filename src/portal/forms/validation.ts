/**
 * Fase 5 — mensagens e validadores padronizados do portal externo.
 *
 * Regra: nenhuma página deve escrever a sua própria mensagem de validação.
 * Toda validação local é apenas apoio de UX — o backend continua sendo a
 * fonte de verdade (ver seção 44 do plano da Fase 5).
 */
import { isValidCPF, isValidEmail } from "@/lib/validate";

/** Catálogo central de mensagens. Objetivas, amigáveis e sem detalhe técnico. */
export const validationMessages = {
  obrigatorio: "Este campo é obrigatório.",
  nomeCompleto: "Informe seu nome completo.",
  cpf: "Informe um CPF válido.",
  matricula: "Informe uma matrícula válida.",
  email: "Informe um e-mail válido.",
  emailIndisponivel: "Não foi possível utilizar este e-mail.",
  emailConfirmacao: "Os e-mails informados não são iguais.",
  telefone: "Informe um telefone válido com DDD.",
  senhaFraca: "Crie uma senha que atenda a todos os requisitos.",
  senhaConfirmacao: "As senhas não são iguais.",
  data: "Informe uma data válida.",
  dataFutura: "A data não pode ser futura.",
  selecione: "Selecione uma opção.",
  consentimento: "É necessário aceitar para continuar.",
  arquivoTipo: "Formato de arquivo não permitido.",
  arquivoTamanho: "Arquivo maior que o tamanho permitido.",
  arquivoQuantidade: "Quantidade de arquivos acima do permitido.",
  codigo: "Informe o código de 6 dígitos.",
  falhaEnvio: "Não foi possível concluir. Tente novamente.",
} as const;

export type ValidationMessageKey = keyof typeof validationMessages;

/** Somente dígitos. */
export const onlyDigits = (value: string) => value.replace(/\D/g, "");

/** Normaliza matrícula: remove espaços e caixa alta, mantendo letras e números. */
export const normalizeRegistration = (value: string) =>
  value.replace(/\s+/g, "").replace(/[^0-9A-Za-z.\-/]/g, "").toUpperCase();

/** Normaliza e-mail: minúsculas e sem espaços. */
export const normalizeEmail = (value: string) => value.trim().toLowerCase();

/** Valida telefone brasileiro (10 ou 11 dígitos com DDD). */
export function isValidPhone(value?: string | null): boolean {
  const d = onlyDigits(value ?? "");
  if (d.length !== 10 && d.length !== 11) return false;
  if (Number(d[0]) < 1 || Number(d[1]) < 1) return false;
  return true;
}

/** Valida matrícula: 3 a 20 caracteres alfanuméricos (militar ou institucional). */
export function isValidRegistration(value?: string | null): boolean {
  const v = normalizeRegistration(value ?? "");
  return v.length >= 3 && v.length <= 20;
}

/** Converte dd/mm/aaaa em Date (ou null). */
export function parseBrDate(value?: string | null): Date | null {
  const d = onlyDigits(value ?? "");
  if (d.length !== 8) return null;
  const day = Number(d.slice(0, 2));
  const month = Number(d.slice(2, 4));
  const year = Number(d.slice(4));
  const date = new Date(year, month - 1, day);
  if (date.getDate() !== day || date.getMonth() !== month - 1 || date.getFullYear() !== year) return null;
  return date;
}

/** dd/mm/aaaa → aaaa-mm-dd (formato de armazenamento). */
export function brDateToISO(value?: string | null): string | null {
  const date = parseBrDate(value);
  if (!date) return null;
  const p = (n: number) => String(n).padStart(2, "0");
  return `${date.getFullYear()}-${p(date.getMonth() + 1)}-${p(date.getDate())}`;
}

/** aaaa-mm-dd → dd/mm/aaaa. */
export function isoToBrDate(value?: string | null): string {
  if (!value) return "";
  const [y, m, d] = value.split("T")[0].split("-");
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
}

export interface PasswordPolicy {
  minLength: number;
  maiuscula: boolean;
  minuscula: boolean;
  numero: boolean;
  especial: boolean;
}

export const defaultPasswordPolicy: PasswordPolicy = {
  minLength: 8,
  maiuscula: true,
  minuscula: true,
  numero: true,
  especial: false,
};

export interface PasswordRequirement {
  id: string;
  label: string;
  ok: boolean;
}

/** Avalia a senha contra a política configurada. Nunca registrar o valor em log. */
export function evaluatePassword(value: string, policy: PasswordPolicy = defaultPasswordPolicy) {
  const requirements: PasswordRequirement[] = [
    { id: "len", label: `Mínimo de ${policy.minLength} caracteres`, ok: value.length >= policy.minLength },
  ];
  if (policy.maiuscula) requirements.push({ id: "upper", label: "Uma letra maiúscula", ok: /[A-Z]/.test(value) });
  if (policy.minuscula) requirements.push({ id: "lower", label: "Uma letra minúscula", ok: /[a-z]/.test(value) });
  if (policy.numero) requirements.push({ id: "digit", label: "Um número", ok: /\d/.test(value) });
  if (policy.especial) requirements.push({ id: "special", label: "Um caractere especial", ok: /[^A-Za-z0-9]/.test(value) });

  const atendidos = requirements.filter((r) => r.ok).length;
  const score = requirements.length ? atendidos / requirements.length : 0;
  const nivel: "fraca" | "media" | "forte" = score >= 1 ? "forte" : score >= 0.6 ? "media" : "fraca";
  return { requirements, score, nivel, valid: atendidos === requirements.length };
}

export const validators = {
  isValidCPF,
  isValidEmail,
  isValidPhone,
  isValidRegistration,
};
