import { useCallback, useEffect, useRef, useState } from "react";
import { portalCall } from "@/lib/portal";
import { supabase } from "@/integrations/supabase/client";
import type { SectionState } from "./types";

const ERRO_PADRAO = "Não foi possível carregar esta informação.";

/** Executa uma consulta isolada, com estado próprio de carregamento e erro. */
function useSection<T>(key: string, fetcher: () => Promise<T>, initial: T, enabled: boolean): SectionState<T> {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(enabled);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setData(await fetcherRef.current());
    } catch {
      setError(ERRO_PADRAO);
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, key]);

  useEffect(() => {
    void run();
  }, [run]);

  return { data, loading, error, reload: () => void run() };
}

export interface DashboardSolicitacao {
  id: string;
  protocolo?: string | null;
  assunto?: string | null;
  status?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface DashboardDocumento {
  id: string;
  titulo?: string | null;
  categoria?: string | null;
  created_at?: string | null;
}

export interface DashboardEvento {
  id: string;
  titulo: string;
  data_inicio: string;
  local?: string | null;
  categoria?: string | null;
}

/** Dados reais consumidos pela home do portal, cada bloco falhando isoladamente. */
export function usePortalDashboardData(enabled: boolean) {
  const solicitacoes = useSection<DashboardSolicitacao[]>(
    "solicitacoes",
    async () => {
      const res = await portalCall<any>("solicitacoes_listar");
      const list = res?.itens || res?.payload || (Array.isArray(res) ? res : []);
      return list as DashboardSolicitacao[];
    },
    [],
    enabled,
  );

  const documentos = useSection<DashboardDocumento[]>(
    "documentos",
    async () => {
      const res = await portalCall<{ itens: DashboardDocumento[] }>("documentos");
      return res?.itens ?? [];
    },
    [],
    enabled,
  );

  const eventos = useSection<DashboardEvento[]>(
    "eventos",
    async () => {
      const { data, error } = await supabase
        .from("eventos")
        .select("id,titulo,data_inicio,local,categoria")
        .eq("ativo", true)
        .gte("data_inicio", new Date().toISOString())
        .order("data_inicio", { ascending: true })
        .limit(1);
      if (error) throw error;
      return (data as DashboardEvento[]) ?? [];
    },
    [],
    enabled,
  );

  const parceiros = useSection<{ total: number; cidades: number }>(
    "parceiros",
    async () => {
      const { data, error } = await supabase.from("clinicas_parceiros").select("cidade").eq("ativo", true);
      if (error) throw error;
      const linhas = data ?? [];
      return {
        total: linhas.length,
        cidades: new Set(linhas.map((c: { cidade: string | null }) => c.cidade).filter(Boolean)).size,
      };
    },
    { total: 0, cidades: 0 },
    enabled,
  );

  return { solicitacoes, documentos, eventos, parceiros };
}
