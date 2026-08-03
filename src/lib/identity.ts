
/**
 * Normaliza CPF removendo pontuação e espaços.
 */
export function normalizeCpf(cpf: string | null | undefined): string | null {
  if (!cpf) return null;
  return cpf.replace(/\D/g, '');
}

/**
 * Garante que o CPF tenha 11 dígitos, preenchendo com zeros à esquerda se necessário.
 * Deve ser usado apenas no momento de salvar ou comparar no banco de dados.
 */
export function padCpf(cpf: string | null | undefined): string | null {
  const normalized = normalizeCpf(cpf);
  if (!normalized) return null;
  return normalized.padStart(11, '0').slice(-11);
}

/**
 * Formata CPF para o padrão 000.000.000-00.
 */
export function formatCpf(cpf: string | null | undefined): string {
  if (!cpf) return "";
  const digits = cpf.replace(/\D/g, '').slice(0, 11);
  
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return digits.replace(/(\d{3})(\d{0,3})/, "$1.$2");
  if (digits.length <= 9) return digits.replace(/(\d{3})(\d{3})(\d{0,3})/, "$1.$2.$3");
  return digits.replace(/(\d{3})(\d{3})(\d{3})(\d{0,2})/, "$1.$2.$3-$4");
}

/**
 * Valida o formato e os dígitos verificadores do CPF.
 */
export function validateCpf(cpf: string | null | undefined): boolean {
  const normalized = padCpf(cpf);
  if (!normalized || normalized.length !== 11) return false;
  
  // Rejeitar sequências repetidas
  if (/^(\d)\1{10}$/.test(normalized)) return false;

  let sum = 0;
  let remainder;

  for (let i = 1; i <= 9; i++) sum = sum + parseInt(normalized.substring(i - 1, i)) * (11 - i);
  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(normalized.substring(9, 10))) return false;

  sum = 0;
  for (let i = 1; i <= 10; i++) sum = sum + parseInt(normalized.substring(i - 1, i)) * (12 - i);
  remainder = (sum * 10) % 11;

  if (remainder === 10 || remainder === 11) remainder = 0;
  if (remainder !== parseInt(normalized.substring(10, 11))) return false;

  return true;
}

/**
 * Normaliza Matrícula removendo espaços e tratando hífens.
 */
export function normalizeRegistrationNumber(reg: string | null | undefined): string | null {
  if (!reg) return null;
  return reg.replace(/\D/g, '');
}

/**
 * Garante que a matrícula tenha 9 dígitos, preenchendo com zeros à esquerda se necessário.
 * Deve ser usado apenas no momento de salvar ou comparar no banco de dados.
 */
export function padRegistrationNumber(reg: string | null | undefined): string | null {
  const normalized = normalizeRegistrationNumber(reg);
  if (!normalized) return null;
  return normalized.padStart(9, '0').slice(-9);
}

/**
 * Formata Matrícula para o padrão 00000000-0.
 */
export function formatRegistrationNumber(reg: string | null | undefined): string {
  if (!reg) return "";
  const digits = reg.replace(/\D/g, '').slice(0, 9);
  
  if (digits.length <= 8) return digits;
  return digits.replace(/(\d{8})(\d{0,1})/, "$1-$2");
}

/**
 * Valida se a matrícula possui o formato institucional (9 dígitos no total).
 */
export function validateRegistrationNumberFormat(reg: string | null | undefined): boolean {
  if (!reg) return false;
  const digits = normalizeRegistrationNumber(reg);
  return digits?.length === 9;
}

/**
 * Status da Associação unificado.
 */
export type AssociadoStatus = 'regular' | 'inativo' | 'suspenso' | 'em_analise' | 'aguardando_reativacao' | 'falecido';

export const AssociadoStatusLabels: Record<AssociadoStatus, string> = {
  regular: 'Regular',
  inativo: 'Inativo',
  suspenso: 'Suspenso',
  em_analise: 'Em análise',
  aguardando_reativacao: 'Aguardando reativação',
  falecido: 'Falecido'
};

/**
 * Mapeia os status institucionais para o padrão do sistema.
 */
export function mapInstitutionalStatus(status: string | null | undefined): AssociadoStatus {
  if (!status) return 'inativo';
  const s = status.trim().toLowerCase();
  
  const map: Record<string, AssociadoStatus> = {
    'regular': 'regular',
    'ativo': 'regular',
    'inativo': 'inativo',
    'excluido': 'inativo',
    'licenciado': 'inativo',
    'suspenso': 'suspenso',
    'em_analise': 'em_analise',
    'em análise': 'em_analise',
    'aguardando_reativacao': 'aguardando_reativacao',
    'aguardando reativação': 'aguardando_reativacao',
    'falecido': 'falecido'
  };

  return map[s] || 'inativo';
}

/**
 * Verifica se o status permite acesso básico ao portal.
 * Regra: somente 'regular' tem acesso completo.
 */
export function isStatusAtivo(status: AssociadoStatus | string | null | undefined): boolean {
  if (!status) return false;
  return status === 'regular';
}

/**
 * Define o nível de acesso baseado no status da associação.
 */
export function getAccessLevel(status: AssociadoStatus | string | null | undefined): PortalIdentity['portal_access_level'] {
  const s = status as AssociadoStatus;
  if (s === 'regular') return 'full';
  if (s === 'inativo' || s === 'aguardando_reativacao') return 'read_only';
  if (s === 'suspenso' || s === 'em_analise') return 'blocked';
  return 'blocked'; // Falecido ou desconhecido
}

/**
 * Interface unificada de identidade do portal para associados e dependentes.
 */
export interface PortalIdentity {
  auth_user_id: string;
  person_id: string;
  membership_id: string | null; // Associado.id
  dependent_id: string | null;  // Dependente.id
  profile_type: 'associate' | 'dependent';
  cpf_normalized: string;
  registration_number: string | null;
  membership_status: AssociadoStatus;
  functional_status: string | null;
  portal_access_level: 'full' | 'read_only' | 'blocked' | 'manual_review';
  holder_member_id?: string | null; // Para dependentes
}

/**
 * Converte data ISO (YYYY-MM-DD) para formato de exibição (DD/MM/YYYY).
 */
export function formatDateForDisplay(isoDate: string | null | undefined): string {
  if (!isoDate) return "";
  // Extrai apenas a parte da data caso venha com tempo
  const dateStr = isoDate.split('T')[0];
  const parts = dateStr.split('-');
  if (parts.length !== 3) return isoDate; // Fallback
  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
}

/**
 * Normaliza data do formato DD/MM/YYYY para ISO (YYYY-MM-DD).
 * Aceita também ISO e retorna sem alteração.
 */
export function normalizeBirthDate(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  
  // Se já estiver no formato ISO YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.split('T')[0];
  }

  // Tenta formato DD/MM/YYYY
  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

/**
 * Valida se a data no formato DD/MM/YYYY é uma data civil real e não futura.
 */
export function validateBirthDate(input: string | null | undefined): boolean {
  const iso = normalizeBirthDate(input);
  if (!iso) return false;

  const [year, month, day] = iso.split('-').map(Number);
  
  // Verificação básica de limites
  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) return false;

  // Verifica dias no mês (considerando bissexto)
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) return false;

  // Não permitir datas futuras
  const inputDate = new Date(year, month - 1, day);
  const now = new Date();
  if (inputDate > now) return false;

  return true;
}

