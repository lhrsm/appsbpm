import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type Conta = {
  id: string;
  codigo: string;
  nome: string;
  tipo: string;
  natureza: string;
  nivel: number;
  parent_id: string | null;
  aceita_lancamento: boolean;
  ativa: boolean;
  vigencia_inicio: string | null;
  vigencia_fim: string | null;
};

export type Periodo = {
  id: string;
  exercicio_id: string;
  competencia: string;
  data_inicio: string;
  data_fim: string;
  situacao: string;
};

export type Lote = { id: string; numero: string | null; descricao: string; competencia: string; status: string };
export type CentroCusto = { id: string; codigo: string; nome: string };

export function useCtbRefs() {
  const [contas, setContas] = useState<Conta[]>([]);
  const [periodos, setPeriodos] = useState<Periodo[]>([]);
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [centros, setCentros] = useState<CentroCusto[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    setLoading(true);
    const [c, p, l, cc] = await Promise.all([
      supabase.from('ctb_plano_contas').select('*').order('codigo'),
      supabase.from('ctb_periodos').select('*').order('competencia', { ascending: false }),
      supabase.from('ctb_lotes').select('id,numero,descricao,competencia,status').order('created_at', { ascending: false }),
      supabase.from('fin_centros_custo').select('id,codigo,nome').eq('ativo', true).order('codigo'),
    ]);
    setContas((c.data ?? []) as Conta[]);
    setPeriodos((p.data ?? []) as Periodo[]);
    setLotes((l.data ?? []) as Lote[]);
    setCentros((cc.data ?? []) as CentroCusto[]);
    setLoading(false);
  };

  useEffect(() => { void carregar(); }, []);

  return { contas, periodos, lotes, centros, loading, recarregar: carregar };
}
