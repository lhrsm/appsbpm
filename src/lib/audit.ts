import { supabase } from "@/integrations/supabase/client";

/** Tipos de ação auditáveis no portal */
export const AUDIT_ACOES = [
  { value: "login", label: "Login", criticidade: "baixa" },
  { value: "logout", label: "Logout", criticidade: "baixa" },
  { value: "acesso_negado", label: "Tentativa de acesso negado", criticidade: "alta" },
  { value: "criacao", label: "Criação", criticidade: "media" },
  { value: "edicao", label: "Edição", criticidade: "media" },
  { value: "exclusao_logica", label: "Exclusão lógica", criticidade: "alta" },
  { value: "cancelamento", label: "Cancelamento", criticidade: "alta" },
  { value: "aprovacao", label: "Aprovação", criticidade: "alta" },
  { value: "rejeicao", label: "Rejeição", criticidade: "alta" },
  { value: "importacao", label: "Importação", criticidade: "alta" },
  { value: "exportacao", label: "Exportação", criticidade: "media" },
  { value: "sincronizacao", label: "Sincronização", criticidade: "media" },
  { value: "alteracao_perfil", label: "Alteração de perfil", criticidade: "critica" },
  { value: "alteracao_permissao", label: "Alteração de permissão", criticidade: "critica" },
  { value: "mudanca_financeira", label: "Mudança financeira", criticidade: "critica" },
  { value: "movimentacao_patrimonial", label: "Movimentação patrimonial", criticidade: "alta" },
  { value: "resolucao_inconsistencia", label: "Resolução de inconsistência", criticidade: "alta" },
  { value: "alteracao_dado_importado", label: "Alteração manual em dado importado", criticidade: "critica" },
] as const;

export type AuditAcao = (typeof AUDIT_ACOES)[number]["value"] | (string & {});

export const AUDIT_MODULOS = [
  "acesso",
  "associados",
  "dependentes",
  "previdencia",
  "saude",
  "financeiro",
  "contabilidade",
  "patrimonio",
  "integracoes",
  "comunicacao",
  "documentos",
  "usuarios",
  "configuracoes",
  "auditoria",
  "outro",
] as const;

export const AUDIT_CRITICIDADES = ["baixa", "media", "alta", "critica"] as const;
export type AuditCriticidade = (typeof AUDIT_CRITICIDADES)[number];

export const acaoLabel = (v?: string | null) =>
  AUDIT_ACOES.find((a) => a.value === v)?.label ?? (v ?? "—");

const criticidadePadrao = (acao: string): AuditCriticidade =>
  (AUDIT_ACOES.find((a) => a.value === acao)?.criticidade as AuditCriticidade) ?? "baixa";

/** Chaves nunca gravadas nos logs (defesa em profundidade — o banco também remove) */
const CHAVES_SENSIVEIS =
  /(password|senha|token|secret|api[_-]?key|authorization|service_role|credencial|jwt|chave)/i;

function sanitizar<T>(valor: T): T | null {
  if (!valor || typeof valor !== "object" || Array.isArray(valor)) return valor ?? null;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(valor as Record<string, unknown>)) {
    if (CHAVES_SENSIVEIS.test(k)) continue;
    out[k] = v;
  }
  return out as T;
}

export interface AuditOptions {
  modulo?: string;
  criticidade?: AuditCriticidade;
  justificativa?: string | null;
  origem?: string;
  operacaoId?: string | null;
  antes?: unknown;
  depois?: unknown;
  detalhes?: unknown;
}

/**
 * Registra uma ação no trilho de auditoria.
 * Compatível com a assinatura antiga: logAudit(action, entity, entityId, details)
 */
export async function logAudit(
  action: AuditAcao,
  entity: string,
  entity_id?: string | null,
  detailsOrOptions?: unknown | AuditOptions,
  options?: AuditOptions,
) {
  try {
    const isOptions =
      !!detailsOrOptions &&
      typeof detailsOrOptions === "object" &&
      !Array.isArray(detailsOrOptions) &&
      ["modulo", "criticidade", "justificativa", "origem", "operacaoId", "antes", "depois", "detalhes"].some(
        (k) => k in (detailsOrOptions as Record<string, unknown>),
      );

    const opts: AuditOptions = { ...(isOptions ? (detailsOrOptions as AuditOptions) : {}), ...(options ?? {}) };
    const legacyDetails = isOptions ? opts.detalhes : detailsOrOptions;

    const { data: sess } = await supabase.auth.getSession();
    const user = sess.session?.user;

    const antes = sanitizar(opts.antes ?? (legacyDetails as any)?.before ?? null);
    const depois = sanitizar(opts.depois ?? (legacyDetails as any)?.after ?? null);

    await supabase.from("audit_logs").insert({
      user_id: user?.id ?? null,
      user_email: user?.email ?? null,
      action,
      entity,
      entity_id: entity_id ? String(entity_id) : null,
      details: (sanitizar(legacyDetails) as any) ?? null,
      modulo: opts.modulo ?? entity,
      criticidade: opts.criticidade ?? criticidadePadrao(String(action)),
      justificativa: opts.justificativa ?? null,
      origem: opts.origem ?? (typeof window !== "undefined" && window.location.pathname.startsWith("/admin") ? "portal_admin" : "portal_associado"),
      operacao_id: opts.operacaoId ?? (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : null),
      valor_anterior: antes as any,
      valor_posterior: depois as any,
      user_agent: typeof navigator !== "undefined" ? navigator.userAgent : null,
    });
  } catch (e) {
    console.warn("audit log failed", e);
  }
}
