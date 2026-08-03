// Abstração do provedor de identidade institucional.
// Troque EXTERNAL_IDENTITY_PROVIDER para mudar a origem sem alterar a interface.

export type PersonType = 'associate' | 'dependent';

export type ValidationStatus =
  | 'matched'
  | 'not_matched'
  | 'inactive'
  | 'blocked'
  | 'deceased'
  | 'already_linked'
  | 'duplicate_record'
  | 'unavailable'
  | 'manual_review_required';

export interface IdentityValidationInput {
  cpf: string; // somente números
  birthDate: string; // YYYY-MM-DD
  personType: PersonType;
  registration?: string;
  fullName?: string;
  motherName?: string;
}

export interface IdentityValidationResult {
  success: boolean;
  status: ValidationStatus;
  externalPersonId?: string;
  personType?: PersonType;
  registration?: string | null;
  maskedName?: string;
  accountEligibility?: 'eligible' | 'not_eligible';
  errorCode?: string;
}

export interface PersonStatusResult {
  status: ValidationStatus;
  active: boolean;
}

export interface LinkResult {
  success: boolean;
}

export interface ExternalIdentityProvider {
  readonly name: string;
  validateIdentity(input: IdentityValidationInput): Promise<IdentityValidationResult>;
  getPersonStatus(externalPersonId: string): Promise<PersonStatusResult>;
  confirmAccountLink(externalPersonId: string, userId: string): Promise<LinkResult>;
}

export const soNumeros = (v?: string | null) => (v || '').replace(/\D+/g, '');

export const maskName = (nome: string) =>
  nome
    .trim()
    .split(/\s+/)
    .map((p) => (p.length <= 1 ? p : `${p[0]}${'*'.repeat(Math.min(p.length - 1, 4))}`))
    .join(' ');

const normalizeNome = (v?: string | null) =>
  (v || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

/** Provedor fictício — ambiente de demonstração. */
export class MockExternalIdentityProvider implements ExternalIdentityProvider {
  readonly name = 'mock';
  constructor(private admin: any) {}

  async validateIdentity(input: IdentityValidationInput): Promise<IdentityValidationResult> {
    const { data, error } = await this.admin
      .from('external_identity_mock_records')
      .select('*')
      .is('deleted_at', null)
      .eq('cpf_reference', soNumeros(input.cpf))
      .maybeSingle();

    if (error) return { success: false, status: 'unavailable', errorCode: 'PROVIDER_UNAVAILABLE' };
    if (!data) return { success: false, status: 'not_matched', errorCode: 'GENERIC_VALIDATION_FAILED' };

    if (data.person_type !== input.personType || data.birth_date !== input.birthDate) {
      return { success: false, status: 'not_matched', errorCode: 'GENERIC_VALIDATION_FAILED' };
    }

    if (input.personType === 'associate') {
      const esperado = soNumeros(data.registration_number || '').padStart(9, '0').slice(-9);
      const informado = soNumeros(input.registration || '').padStart(9, '0').slice(-9);
      if (!informado || esperado !== informado) {
        return { success: false, status: 'not_matched', errorCode: 'GENERIC_VALIDATION_FAILED' };
      }
    } else {
      const ok =
        normalizeNome(input.fullName) === normalizeNome(data.full_name) ||
        (!!input.motherName && normalizeNome(input.motherName) === normalizeNome(data.mother_name));
      if (!ok) return { success: false, status: 'not_matched', errorCode: 'GENERIC_VALIDATION_FAILED' };
    }

    if (data.status !== 'matched') {
      return { success: false, status: data.status as ValidationStatus, errorCode: 'IDENTITY_NOT_ELIGIBLE' };
    }
    if (data.status !== 'regular') return { success: false, status: data.status as ValidationStatus, errorCode: 'IDENTITY_NOT_ELIGIBLE' };
    if (data.already_registered) return { success: false, status: 'already_linked', errorCode: 'ALREADY_LINKED' };

    return {
      success: true,
      status: 'matched',
      externalPersonId: data.external_person_id,
      personType: data.person_type,
      registration: data.registration_number,
      maskedName: maskName(data.full_name),
      accountEligibility: 'eligible',
    };
  }

  async getPersonStatus(externalPersonId: string): Promise<PersonStatusResult> {
    const { data } = await this.admin
      .from('external_identity_mock_records')
      .select('status, is_active')
      .eq('external_person_id', externalPersonId)
      .maybeSingle();
    return { status: (data?.status as ValidationStatus) ?? 'unavailable', active: !!data?.is_active };
  }

  async confirmAccountLink(externalPersonId: string): Promise<LinkResult> {
    await this.admin
      .from('external_identity_mock_records')
      .update({ already_registered: true })
      .eq('external_person_id', externalPersonId);
    return { success: true };
  }
}

/** Integração institucional real — a ser implementada pelo time de integração. */
export class InstitutionalApiIdentityProvider implements ExternalIdentityProvider {
  readonly name = 'institutional_api';
  async validateIdentity(): Promise<IdentityValidationResult> {
    return { success: false, status: 'unavailable', errorCode: 'PROVIDER_NOT_IMPLEMENTED' };
  }
  async getPersonStatus(): Promise<PersonStatusResult> {
    return { status: 'unavailable', active: false };
  }
  async confirmAccountLink(): Promise<LinkResult> {
    return { success: false };
  }
}

class DisabledIdentityProvider implements ExternalIdentityProvider {
  readonly name = 'disabled';
  async validateIdentity(): Promise<IdentityValidationResult> {
    return { success: false, status: 'unavailable', errorCode: 'PROVIDER_DISABLED' };
  }
  async getPersonStatus(): Promise<PersonStatusResult> {
    return { status: 'unavailable', active: false };
  }
  async confirmAccountLink(): Promise<LinkResult> {
    return { success: false };
  }
}

export function getIdentityProvider(admin: any): ExternalIdentityProvider {
  const cfg = (Deno.env.get('EXTERNAL_IDENTITY_PROVIDER') || 'mock').toLowerCase();
  if (cfg === 'institutional_api') return new InstitutionalApiIdentityProvider();
  if (cfg === 'disabled') return new DisabledIdentityProvider();
  return new MockExternalIdentityProvider(admin);
}
