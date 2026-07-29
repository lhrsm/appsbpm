import { supabase } from '@/integrations/supabase/client';

const TOKEN_KEY = 'sbpm_portal_token';

export const getPortalToken = () => localStorage.getItem(TOKEN_KEY);
export const setPortalToken = (token: string) => localStorage.setItem(TOKEN_KEY, token);
export const clearPortalToken = () => localStorage.removeItem(TOKEN_KEY);

/**
 * Chama a função segura do portal do associado.
 * Todos os dados pessoais passam por essa função — o cliente nunca lê as tabelas direto.
 */
export async function portalCall<T = any>(
  action: string,
  payload: Record<string, unknown> = {},
): Promise<T> {
  const token = action === 'login' ? undefined : getPortalToken() ?? undefined;
  if (action !== 'login' && !token) throw new Error('Sessão expirada');

  const { data, error } = await supabase.functions.invoke('portal-associado', {
    body: { action, token, ...payload },
  });

  if (error) {
    let msg = 'Não foi possível concluir a operação.';
    const ctx: any = (error as any).context;
    try {
      const body = await ctx?.json?.();
      if (body?.error) msg = body.error;
      if (ctx?.status === 401) clearPortalToken();
    } catch {
      /* ignora */
    }
    throw new Error(msg);
  }

  return data as T;
}
