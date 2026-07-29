import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, CalendarRange, Loader2 } from 'lucide-react';
import AvisoEstrutura from './AvisoEstrutura';
import { SITUACOES_PERIODO, dataBR } from '@/lib/contabilidade';

type Exercicio = {
  id: string; ano: number; data_inicio: string; data_fim: string; situacao: string; observacoes: string | null;
};

export default function ExerciciosTab() {
  const [itens, setItens] = useState<Exercicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const ano = new Date().getFullYear();
  const [form, setForm] = useState({ ano, data_inicio: `${ano}-01-01`, data_fim: `${ano}-12-31`, observacoes: '' });

  const carregar = async () => {
    setLoading(true);
    const { data } = await supabase.from('ctb_exercicios').select('*').order('ano', { ascending: false });
    setItens((data ?? []) as Exercicio[]);
    setLoading(false);
  };
  useEffect(() => { void carregar(); }, []);

  const salvar = async () => {
    setSalvando(true);
    const { error } = await supabase.from('ctb_exercicios').insert({
      ano: Number(form.ano),
      data_inicio: form.data_inicio,
      data_fim: form.data_fim,
      observacoes: form.observacoes || null,
    });
    setSalvando(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Exercício criado.');
    setAberto(false);
    await carregar();
  };

  const alterarSituacao = async (e: Exercicio, situacao: string) => {
    const { error } = await supabase.from('ctb_exercicios').update({ situacao: situacao as any }).eq('id', e.id);
    if (error) { toast.error(error.message); return; }
    await carregar();
  };

  const gerarPeriodos = async (e: Exercicio) => {
    const linhas = Array.from({ length: 12 }, (_, i) => {
      const mes = String(i + 1).padStart(2, '0');
      const fim = new Date(e.ano, i + 1, 0).getDate();
      return {
        exercicio_id: e.id,
        competencia: `${e.ano}-${mes}-01`,
        data_inicio: `${e.ano}-${mes}-01`,
        data_fim: `${e.ano}-${mes}-${String(fim).padStart(2, '0')}`,
      };
    });
    const { error } = await supabase.from('ctb_periodos').upsert(linhas, { onConflict: 'exercicio_id,competencia' });
    if (error) { toast.error(error.message); return; }
    toast.success('Competências mensais geradas para o exercício.');
  };

  return (
    <div className="space-y-4">
      <AvisoEstrutura />

      <div className="flex justify-end">
        <Button onClick={() => setAberto(true)}>
          <Plus className="mr-1 h-4 w-4" aria-hidden="true" /> Novo exercício
        </Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Carregando exercícios...</p>}
      {!loading && itens.length === 0 && (
        <Card><CardContent className="p-6 text-sm text-muted-foreground">
          Nenhum exercício contábil cadastrado.
        </CardContent></Card>
      )}

      <div className="space-y-2">
        {itens.map((e) => {
          const s = SITUACOES_PERIODO[e.situacao as keyof typeof SITUACOES_PERIODO];
          return (
            <Card key={e.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">Exercício {e.ano}</p>
                  <p className="text-xs text-muted-foreground">
                    {dataBR(e.data_inicio)} a {dataBR(e.data_fim)}
                    {e.observacoes ? ` · ${e.observacoes}` : ''}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Badge className={s?.className}>{s?.label ?? e.situacao}</Badge>
                  <Select value={e.situacao} onValueChange={(v) => alterarSituacao(e, v)}>
                    <SelectTrigger className="h-8 w-[170px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(SITUACOES_PERIODO).map(([k, v]) => (
                        <SelectItem key={k} value={k}>{v.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={() => gerarPeriodos(e)}>
                    <CalendarRange className="mr-1 h-4 w-4" aria-hidden="true" /> Gerar competências
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo exercício contábil</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Ano</Label>
              <Input type="number" value={form.ano} onChange={(ev) => setForm({ ...form, ano: Number(ev.target.value) })} />
            </div>
            <div />
            <div>
              <Label>Início</Label>
              <Input type="date" value={form.data_inicio} onChange={(ev) => setForm({ ...form, data_inicio: ev.target.value })} />
            </div>
            <div>
              <Label>Fim</Label>
              <Input type="date" value={form.data_fim} onChange={(ev) => setForm({ ...form, data_fim: ev.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Observações</Label>
              <Textarea value={form.observacoes} onChange={(ev) => setForm({ ...form, observacoes: ev.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAberto(false)}>Cancelar</Button>
            <Button onClick={salvar} disabled={salvando}>
              {salvando && <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden="true" />} Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
