import { supabase } from '@/integrations/supabase/client';
import { TERMS_VERSION, PRIVACY_VERSION } from '@/lib/portalAcesso';

export interface PostoGraduacao {
  id: string;
  nome: string;
  ordem: number;
  permite_complemento: boolean;
}

/** Catálogo administrável de postos e graduações (nunca fixo no componente). */
export async function listarPostos(): Promise<PostoGraduacao[]> {
  const { data, error } = await supabase
    .from('association_ranks')
    .select('id, nome, ordem, permite_complemento')
    .eq('ativo', true)
    .order('ordem');
  if (error) return [];
  return data ?? [];
}

export interface PreCadastroInput {
  fullName: string;
  cpf: string;
  registration?: string;
  rankId?: string;
  rankOther?: string;
  functionalStatus: 'regular' | 'inativo';
  email: string;
  phone: string;
}

export async function enviarPreCadastro(input: PreCadastroInput) {
  const { data, error } = await supabase.functions.invoke('associacao-pre-cadastro', {
    body: { ...input, consent: true, termsVersion: TERMS_VERSION, privacyVersion: PRIVACY_VERSION },
  });

  if (error) {
    const ctx: any = (error as any).context;
    try {
      const body = await ctx?.json?.();
      if (body) return body as { success: boolean; message?: string; protocol?: string };
    } catch {
      /* ignora */
    }
    return { success: false, message: 'Serviço temporariamente indisponível. Tente novamente.' };
  }
  return data as { success: boolean; message?: string; protocol?: string; duplicado?: boolean };
}

/** Máscara de telefone brasileiro: (71) 98549-6972 */
export const mascararTelefone = (v: string) => {
  const d = v.replace(/\D/g, '').slice(0, 11);
  if (d.length <= 2) return d;
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
};

export const telefoneValido = (v: string) => {
  const d = v.replace(/\D/g, '');
  return (d.length === 10 || d.length === 11) && Number(d.slice(0, 2)) >= 11;
};

export const STATUS_PRE_CADASTRO: { valor: string; rotulo: string }[] = [
  { valor: 'recebido', rotulo: 'Recebido' },
  { valor: 'aguardando_analise', rotulo: 'Aguardando análise' },
  { valor: 'em_analise', rotulo: 'Em análise' },
  { valor: 'contato_pendente', rotulo: 'Contato pendente' },
  { valor: 'contato_realizado', rotulo: 'Contato realizado' },
  { valor: 'aguardando_documentos', rotulo: 'Aguardando documentos' },
  { valor: 'documentacao_recebida', rotulo: 'Documentação recebida' },
  { valor: 'aguardando_saeb', rotulo: 'Aguardando envio à SAEB' },
  { valor: 'enviado_saeb', rotulo: 'Enviado à SAEB' },
  { valor: 'com_pendencia', rotulo: 'Com pendência' },
  { valor: 'aprovado', rotulo: 'Aprovado' },
  { valor: 'rejeitado', rotulo: 'Rejeitado' },
  { valor: 'cancelado', rotulo: 'Cancelado' },
  { valor: 'concluido', rotulo: 'Concluído' },
];

export const rotuloStatus = (v: string) =>
  STATUS_PRE_CADASTRO.find((s) => s.valor === v)?.rotulo ?? v;
