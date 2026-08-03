
/**
 * Normaliza CPF removendo pontuação e espaços.
 * Garante 11 dígitos com zeros à esquerda.
 */
export function normalizeCpf(cpf: string | null | undefined): string | null {
  if (!cpf) return null;
  const digits = cpf.replace(/\D/g, '');
  if (digits.length === 0) return null;
  return digits.padStart(11, '0').slice(0, 11);
}

/**
 * Normaliza Matrícula removendo espaços e tratando hífens.
 * Mantém zeros à esquerda e o dígito verificador se existir.
 */
export function normalizeRegistrationNumber(reg: string | null | undefined): string | null {
  if (!reg) return null;
  return reg.trim().toUpperCase();
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
  membership_status: string;
  functional_status: string | null;
  portal_access_level: 'full' | 'read_only' | 'blocked' | 'manual_review';
  holder_member_id?: string | null; // Para dependentes
}
