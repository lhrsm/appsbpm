import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

const LABEL_TABELA: Record<string, string> = {
  rh_colaboradores: 'Colaborador',
  rh_vinculos: 'Vínculo',
  rh_unidades: 'Unidade',
  rh_setores: 'Setor',
  rh_cargos: 'Cargo',
  rh_documentos: 'Documento',
  rh_dados_bancarios: 'Dados bancários',
  rh_remuneracoes: 'Remuneração',
};

const LABEL_OP: Record<string, string> = {
  INSERT: 'Criação',
  UPDATE: 'Alteração',
  DELETE: 'Exclusão',
};

export default function HistoricoTab() {
  const [itens, setItens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from('rh_historico')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(200);
      setItens(data ?? []);
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-8 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando histórico...
      </div>
    );
  }

  if (itens.length === 0) {
    return (
      <Card>
        <CardContent className="p-8 text-center text-sm text-muted-foreground">
          Nenhum registro no histórico ainda.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs text-muted-foreground">
        Registros imutáveis das últimas 200 operações do módulo. Dados bancários não são armazenados no
        histórico.
      </p>
      {itens.map((h) => (
        <Card key={h.id}>
          <CardContent className="flex flex-wrap items-center justify-between gap-2 p-3">
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {LABEL_TABELA[h.tabela] ?? h.tabela} —{' '}
                {(h.valor_novo?.nome as string) ?? (h.valor_anterior?.nome as string) ?? h.registro_id}
              </p>
              <p className="text-xs text-muted-foreground">
                {new Date(h.created_at).toLocaleString('pt-BR')}
              </p>
            </div>
            <Badge variant={h.operacao === 'DELETE' ? 'destructive' : 'secondary'} className="text-[10px]">
              {LABEL_OP[h.operacao] ?? h.operacao}
            </Badge>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
