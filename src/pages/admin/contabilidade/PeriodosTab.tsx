import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import AvisoEstrutura from './AvisoEstrutura';
import { SITUACOES_PERIODO, competenciaLabel, dataBR } from '@/lib/contabilidade';

type Periodo = {
  id: string; competencia: string; data_inicio: string; data_fim: string; situacao: string;
  ctb_exercicios: { ano: number } | null;
};

export default function PeriodosTab() {
  const [itens, setItens] = useState<Periodo[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('todos');

  const carregar = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('ctb_periodos')
      .select('id,competencia,data_inicio,data_fim,situacao,ctb_exercicios(ano)')
      .order('competencia', { ascending: false });
    setItens((data ?? []) as any as Periodo[]);
    setLoading(false);
  };
  useEffect(() => { void carregar(); }, []);

  const alterar = async (p: Periodo, situacao: string) => {
    const { error } = await supabase.from('ctb_periodos').update({ situacao: situacao as any }).eq('id', p.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Situação do período atualizada.');
    await carregar();
  };

  const lista = filtro === 'todos' ? itens : itens.filter((i) => i.situacao === filtro);

  return (
    <div className="space-y-4">
      <AvisoEstrutura />

      <div className="flex justify-end">
        <Select value={filtro} onValueChange={setFiltro}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as situações</SelectItem>
            {Object.entries(SITUACOES_PERIODO).map(([k, v]) => (
              <SelectItem key={k} value={k}>{v.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Carregando períodos...</p>}
      {!loading && lista.length === 0 && (
        <Card><CardContent className="p-6 text-sm text-muted-foreground">
          Nenhum período encontrado. Gere as competências a partir de um exercício.
        </CardContent></Card>
      )}

      <div className="grid gap-2 md:grid-cols-2">
        {lista.map((p) => {
          const s = SITUACOES_PERIODO[p.situacao as keyof typeof SITUACOES_PERIODO];
          return (
            <Card key={p.id}>
              <CardContent className="flex items-center justify-between gap-3 p-3">
                <div>
                  <p className="font-medium">
                    {competenciaLabel(p.competencia)}
                    {p.ctb_exercicios?.ano ? ` · Exercício ${p.ctb_exercicios.ano}` : ''}
                  </p>
                  <p className="text-xs text-muted-foreground">{dataBR(p.data_inicio)} a {dataBR(p.data_fim)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={s?.className}>{s?.label ?? p.situacao}</Badge>
                  <Select value={p.situacao} onValueChange={(v) => alterar(p, v)}>
                    <SelectTrigger className="h-8 w-[150px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(SITUACOES_PERIODO).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
