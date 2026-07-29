/**
 * Módulo Contábil — estrutura inicial.
 * As regras contábeis definitivas serão validadas com o setor responsável.
 */
import { supabase } from '@/integrations/supabase/client';

export const AVISO_ESTRUTURA =
  'Estrutura inicial. As regras contábeis e integrações deverão ser validadas com o setor responsável antes da entrada em produção.';

export type CtbContaTipo =
  | 'ativo' | 'passivo' | 'patrimonio_liquido' | 'receita' | 'despesa' | 'resultado' | 'compensacao';
export type CtbNatureza = 'devedora' | 'credora';
export type CtbSituacaoPeriodo = 'aberto' | 'em_fechamento' | 'fechado' | 'reaberto';
export type CtbLoteStatus = 'rascunho' | 'simulado' | 'conferido' | 'efetivado' | 'cancelado';
export type CtbLancStatus = 'rascunho' | 'simulado' | 'efetivado' | 'estornado' | 'cancelado';
export type CtbOrigem =
  | 'manual' | 'financeiro_receita' | 'financeiro_despesa' | 'financeiro_pagamento'
  | 'financeiro_recebimento' | 'patrimonio_aquisicao' | 'patrimonio_depreciacao'
  | 'patrimonio_baixa' | 'importacao' | 'integracao';

export const CONTA_TIPOS: { value: CtbContaTipo; label: string }[] = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'passivo', label: 'Passivo' },
  { value: 'patrimonio_liquido', label: 'Patrimônio líquido' },
  { value: 'receita', label: 'Receita' },
  { value: 'despesa', label: 'Despesa' },
  { value: 'resultado', label: 'Resultado' },
  { value: 'compensacao', label: 'Compensação' },
];

export const NATUREZAS: { value: CtbNatureza; label: string }[] = [
  { value: 'devedora', label: 'Devedora' },
  { value: 'credora', label: 'Credora' },
];

export const SITUACOES_PERIODO: Record<CtbSituacaoPeriodo, { label: string; className: string }> = {
  aberto: { label: 'Aberto', className: 'bg-green-600 text-white' },
  em_fechamento: { label: 'Em fechamento', className: 'bg-yellow-500 text-white' },
  fechado: { label: 'Fechado', className: 'bg-gray-600 text-white' },
  reaberto: { label: 'Reaberto', className: 'bg-orange-600 text-white' },
};

export const LANC_STATUS: Record<CtbLancStatus, { label: string; className: string }> = {
  rascunho: { label: 'Rascunho', className: 'bg-muted text-muted-foreground' },
  simulado: { label: 'Simulado', className: 'bg-blue-600 text-white' },
  efetivado: { label: 'Efetivado', className: 'bg-green-600 text-white' },
  estornado: { label: 'Estornado', className: 'bg-orange-600 text-white' },
  cancelado: { label: 'Cancelado', className: 'bg-gray-500 text-white' },
};

export const LOTE_STATUS: Record<CtbLoteStatus, { label: string; className: string }> = {
  rascunho: { label: 'Rascunho', className: 'bg-muted text-muted-foreground' },
  simulado: { label: 'Simulado', className: 'bg-blue-600 text-white' },
  conferido: { label: 'Conferido', className: 'bg-yellow-500 text-white' },
  efetivado: { label: 'Efetivado', className: 'bg-green-600 text-white' },
  cancelado: { label: 'Cancelado', className: 'bg-gray-500 text-white' },
};

export const ORIGENS: { value: CtbOrigem; label: string; grupo: 'Manual' | 'Financeiro' | 'Patrimônio' | 'Outros' }[] = [
  { value: 'manual', label: 'Lançamento manual', grupo: 'Manual' },
  { value: 'financeiro_receita', label: 'Financeiro — receitas', grupo: 'Financeiro' },
  { value: 'financeiro_despesa', label: 'Financeiro — despesas', grupo: 'Financeiro' },
  { value: 'financeiro_pagamento', label: 'Financeiro — pagamentos', grupo: 'Financeiro' },
  { value: 'financeiro_recebimento', label: 'Financeiro — recebimentos', grupo: 'Financeiro' },
  { value: 'patrimonio_aquisicao', label: 'Patrimônio — aquisições', grupo: 'Patrimônio' },
  { value: 'patrimonio_depreciacao', label: 'Patrimônio — depreciações', grupo: 'Patrimônio' },
  { value: 'patrimonio_baixa', label: 'Patrimônio — baixas', grupo: 'Patrimônio' },
  { value: 'importacao', label: 'Importação', grupo: 'Outros' },
  { value: 'integracao', label: 'Integração externa', grupo: 'Outros' },
];

export const labelOrigem = (o: string) => ORIGENS.find((x) => x.value === o)?.label ?? o;

/** Competência (aaaa-mm-01) formatada como mm/aaaa. */
export const competenciaLabel = (d?: string | null) => {
  if (!d) return '—';
  const [a, m] = d.split('-');
  return `${m}/${a}`;
};

export const dataBR = (d?: string | null) =>
  d ? new Date(`${d}T12:00:00`).toLocaleDateString('pt-BR') : '—';

/** Nível sugerido a partir do código contábil (1.1.01 -> 3). */
export const nivelPorCodigo = (codigo: string) =>
  Math.max(1, String(codigo || '').split('.').filter(Boolean).length);

export const getConfig = async () => {
  const { data } = await supabase.from('ctb_config').select('chave,valor');
  const map: Record<string, string> = {};
  (data ?? []).forEach((r) => { map[r.chave] = r.valor ?? ''; });
  return map;
};

export const setConfig = async (chave: string, valor: string) => {
  const { error } = await supabase
    .from('ctb_config')
    .upsert({ chave, valor, updated_at: new Date().toISOString() }, { onConflict: 'chave' });
  if (error) throw error;
};

export { brl, exportarCSV, exportarXLSX, exportarPDF } from '@/lib/financeiro';
