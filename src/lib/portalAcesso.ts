import { supabase } from '@/integrations/supabase/client';

export type PersonType = 'associate' | 'dependent';

/**
 * Configuração central dos campos exigidos na validação institucional.
 * Alterar aqui (e no provedor do backend) muda a regra sem tocar nas telas.
 */
export const CAMPOS_VALIDACAO: Record<
  PersonType,
  { key: 'registration' | 'fullName' | 'motherName'; label: string; help?: string }[]
> = {
  associate: [{ key: 'registration', label: 'Matrícula', help: 'Como consta no cadastro da SBPM.' }],
  dependent: [{ key: 'fullName', label: 'Nome completo', help: 'Exatamente como consta no cadastro.' }],
};

export const TERMS_VERSION = '2026-07';
export const PRIVACY_VERSION = '2026-07';

async function call<T = any>(action: string, payload: Record<string, unknown> = {}): Promise<T> {
  const { data, error } = await supabase.functions.invoke('portal-acesso', {
    body: { action, ...payload },
  });

  if (error) {
    const ctx: any = (error as any).context;
    try {
      const body = await ctx?.json?.();
      if (body) return body as T;
    } catch {
      /* ignora */
    }
    return { success: false, message: 'Serviço temporariamente indisponível. Tente novamente.' } as T;
  }
  return data as T;
}

export interface ValidationResponse {
  success: boolean;
  status?: string;
  message?: string;
  sessionId?: string;
  validationToken?: string;
  personType?: PersonType;
  maskedName?: string;
  registrationTail?: string | null;
  expiresAt?: string;
  demoMode?: boolean;
}

export const validarIdentidade = (input: {
  cpf: string;
  birthDate: string;
  personType: PersonType;
  registration?: string;
  fullName?: string;
  motherName?: string;
}) => call<ValidationResponse>('validate_identity', { ...input, user_agent: navigator.userAgent.slice(0, 300) });

export const enviarCodigo = (input: {
  sessionId: string;
  validationToken: string;
  email: string;
  resend?: boolean;
}) => call<{ success: boolean; message?: string; maskedEmail?: string; demoMode?: boolean }>('email_start', input);

export const confirmarCodigo = (input: { sessionId: string; validationToken: string; code: string }) =>
  call<{ success: boolean; message?: string }>('email_verify', input);

export const criarConta = (input: { sessionId: string; validationToken: string; password: string }) =>
  call<{ success: boolean; message?: string; portal?: any; maskedEmail?: string }>('create_account', {
    ...input,
    acceptTerms: true,
    acceptPrivacy: true,
    user_agent: navigator.userAgent.slice(0, 300),
  });

export const loginComSenha = (credential: string, password: string) =>
  call<{ success: boolean; message?: string; portal?: any; firstLogin?: boolean }>('login', {
    credential,
    password,
    user_agent: navigator.userAgent.slice(0, 300),
  });

export const recuperarAcesso = (credential: string) =>
  call<{ success: boolean; message?: string }>('recover_start', { credential });

/** Força da senha (0 a 4). */
export function forcaSenha(senha: string) {
  let score = 0;
  if (senha.length >= 10) score++;
  if (/[a-z]/.test(senha) && /[A-Z]/.test(senha)) score++;
  if (/\d/.test(senha)) score++;
  if (/[^A-Za-z0-9]/.test(senha)) score++;
  const rotulos = ['Muito fraca', 'Fraca', 'Regular', 'Boa', 'Forte'];
  return { score, label: rotulos[score] };
}

export const senhaValida = (s: string) =>
  s.length >= 10 && /[a-z]/.test(s) && /[A-Z]/.test(s) && /\d/.test(s) && /[^A-Za-z0-9]/.test(s);

export const mascararCpf = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  return d
    .replace(/^(\d{3})(\d)/, '$1.$2')
    .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, '$1.$2.$3-$4');
};
