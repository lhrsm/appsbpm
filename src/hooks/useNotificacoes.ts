import { useEffect, useState, useCallback } from 'react';
import { portalCall } from '@/lib/portal';
import { useAssociado } from '@/contexts/AssociadoContext';

export interface Notificacao {
  id: string;
  associado_id: string | null;
  dependente_id: string | null;
  titulo: string;
  corpo: string;
  categoria: string;
  url: string | null;
  lida: boolean;
  read_at: string | null;
  created_at: string;
}

export function useNotificacoes() {
  const { associado, isDependente, dependenteLogado } = useAssociado();
  const [items, setItems] = useState<Notificacao[]>([]);
  const [loading, setLoading] = useState(false);

  const targetAssociadoId = associado?.id ?? null;
  const targetDependenteId = isDependente ? dependenteLogado?.id ?? null : null;

  const load = useCallback(async () => {
    if (!targetAssociadoId && !targetDependenteId) return;
    setLoading(true);
    try {
      const res = await portalCall<{ itens: Notificacao[] }>('notificacoes_listar');
      setItems(res?.itens ?? []);
    } catch {
      setItems([]);
    }
    setLoading(false);
  }, [targetAssociadoId, targetDependenteId, isDependente]);

  useEffect(() => {
    load();
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, [load]);

  const marcarLida = async (id: string) => {
    try {
      await portalCall('notificacoes_marcar', { ids: [id] });
    } catch {
      /* silencioso */
    }
    setItems((prev) => prev.map((n) => (n.id === id ? { ...n, lida: true } : n)));
  };

  const marcarTodasLidas = async () => {
    const ids = items.filter((n) => !n.lida).map((n) => n.id);
    if (!ids.length) return;
    try {
      await portalCall('notificacoes_marcar', { ids });
    } catch {
      /* silencioso */
    }
    setItems((prev) => prev.map((n) => ({ ...n, lida: true })));
  };

  const naoLidas = items.filter((n) => !n.lida).length;

  return { items, loading, naoLidas, marcarLida, marcarTodasLidas, reload: load };
}
