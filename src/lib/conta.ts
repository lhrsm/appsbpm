import { supabase } from "@/integrations/supabase/client";
import { clearPortalToken, getPortalToken } from "@/lib/portal";

/**
 * Chamadas de Conta, Segurança, 2FA e Privacidade (Fase 10).
 *
 * Todas as operações passam pela edge function `portal-conta`. O cliente nunca
 * grava direto nas tabelas de segurança e nunca guarda segredos de 2FA.
 */
export async function contaCall<T = any>(
  action: string,
  payload: Record<string, unknown> = {},
): Promise<T> {
  const token = getPortalToken();
  if (!token) throw new Error("Sessão expirada");

  const { data, error } = await supabase.functions.invoke("portal-conta", {
    body: { action, token, ...payload },
  });

  if (error) {
    let msg = "Não foi possível concluir a operação.";
    const ctx: any = (error as any).context;
    try {
      const body = await ctx?.json?.();
      if (body?.error) msg = body.error;
      if (ctx?.status === 401 && msg === "Sessão expirada") clearPortalToken();
    } catch {
      /* mantém mensagem genérica */
    }
    throw new Error(msg);
  }
  if ((data as any)?.error) throw new Error((data as any).error);
  return data as T;
}

export interface ResumoSeguranca {
  mfa_enabled: boolean;
  mfa_required: boolean;
  preferred_mfa_method: string;
  trusted_device_policy: string;
  email_verified: boolean;
  phone_verified: boolean;
  last_password_change_at: string | null;
  recovery_codes_disponiveis: boolean;
  sessoes_ativas: number;
  dispositivos_confiaveis: number;
  email_mascarado: string;
  ultimo_acesso: { created_at: string; device_summary: string; location_summary: string } | null;
  nivel: "basico" | "intermediario" | "reforcado";
  pontos: number;
  total: number;
  criterios: { id: string; ok: boolean; label: string }[];
}

export const NIVEL_SEGURANCA: Record<string, { label: string; tone: "danger" | "warning" | "success" }> = {
  basico: { label: "Proteção básica", tone: "danger" },
  intermediario: { label: "Proteção intermediária", tone: "warning" },
  reforcado: { label: "Proteção reforçada", tone: "success" },
};

export const rotuloEvento = (tipo: string) =>
  ({
    login: "Acesso realizado",
    logout: "Sessão encerrada",
    password_change: "Senha alterada",
    email_change: "E-mail alterado",
    phone_change: "Telefone alterado",
    mfa_enabled: "2FA ativado",
    mfa_disabled: "2FA desativado",
    mfa_enroll: "Configuração de 2FA",
    recovery_codes_generated: "Códigos de recuperação gerados",
    recovery_code_used: "Código de recuperação utilizado",
    session_revoked: "Sessão encerrada pelo usuário",
    sessions_revoked: "Sessões encerradas",
    trusted_device_revoked: "Dispositivo confiável removido",
    consent_granted: "Consentimento concedido",
    consent_revoked: "Consentimento revogado",
    privacy_request: "Solicitação de privacidade",
    data_export: "Exportação de dados",
    suspicious_access_reported: "Acesso suspeito reportado",
  })[tipo] ?? "Atividade na conta";

export const dataHoraBR = (v?: string | null) =>
  v
    ? new Date(v).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";
