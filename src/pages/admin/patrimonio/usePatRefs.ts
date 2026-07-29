import { useCallback, useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type RefItem = { id: string; nome: string; unidade_id?: string | null };

export type PatRefs = {
  categorias: RefItem[];
  unidades: RefItem[];
  setores: RefItem[];
  responsaveis: RefItem[];
  fornecedores: RefItem[];
  loading: boolean;
  recarregar: () => Promise<void>;
};

export function usePatRefs(): PatRefs {
  const [state, setState] = useState<Omit<PatRefs, 'recarregar'>>({
    categorias: [], unidades: [], setores: [], responsaveis: [], fornecedores: [], loading: true,
  });

  const recarregar = useCallback(async () => {
    const [cat, uni, set, res, forn] = await Promise.all([
      supabase.from('pat_categorias').select('id,nome').eq('ativo', true).order('nome'),
      supabase.from('pat_unidades').select('id,nome').eq('ativo', true).order('nome'),
      supabase.from('pat_setores').select('id,nome,unidade_id').eq('ativo', true).order('nome'),
      supabase.from('pat_responsaveis').select('id,nome').eq('ativo', true).order('nome'),
      supabase.from('fin_fornecedores').select('id,nome').eq('ativo', true).order('nome'),
    ]);
    setState({
      categorias: cat.data || [],
      unidades: uni.data || [],
      setores: set.data || [],
      responsaveis: res.data || [],
      fornecedores: forn.data || [],
      loading: false,
    });
  }, []);

  useEffect(() => { void recarregar(); }, [recarregar]);

  return { ...state, recarregar };
}

export const nomeDe = (lista: RefItem[], id?: string | null) =>
  (id && lista.find((i) => i.id === id)?.nome) || null;
