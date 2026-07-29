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
import { Plus, Loader2, CheckCircle2 } from 'lucide-react';
import AvisoEstrutura from './AvisoEstrutura';
import { useCtbRefs } from './useCtbRefs';
import { brl, competenciaLabel } from '@/lib/contabilidade';

type Conc = {
  id: string; periodo_id: string | null; conta_id: string | null; referencia: string | null;
  saldo_contabil: number; saldo_externo: number; diferenca: number; status: string; observacoes: string | null;
};

export default function ConciliacaoTab() {
  const { contas, periodos } = useCtbRefs();
  const [itens, setItens] = useState<Conc[]>([]);
  const [loading, setLoading] = useState(true);
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({ periodo_id: '', conta_id: '', referencia: '', saldo_contabil: '', saldo_externo: '', observacoes: '' });

  const carregar = async () => {
    setLoading(true);
    const { data } = await supabase.from('ctb_conciliacoes').select('*').order('created_at', { ascending: false });
    setItens((data ?? []) as any as Conc[]);
    setLoading(false);
  };
  useEffect(() => { void carregar(); }, []);

  const salvar = async () => {
    setSalvando(true);
    const contabil = Number(form.saldo_contabil || 0);
    const externo = Number(form.saldo_externo || 0);
    const { error } = await supabase.from('ctb_conciliacoes').insert({
      periodo_id: form.periodo_id || null,
      conta_id: form.conta_id || null,
      referencia: form.referencia || null,
      saldo_contabil: contabil,
      saldo_externo: externo,
      diferenca: Number((contabil - externo).toFixed(2)),
      observacoes: form.observacoes || null,
    });
    setSalvando(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Conciliação registrada.');
    setAberto(false);
    await carregar();
  };

  const concluir = async (c: Conc) => {
    const { data: sess } = await supabase.auth.getUser();
    const { error } = await supabase.from('ctb_conciliacoes').update({
      status: 'conciliado', conciliado_por: sess.user?.id ?? null, conciliado_em: new Date().toISOString(),
    }).eq('id', c.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Conciliação concluída.');
    await carregar();
  };

  const contaLabel = (id: string | null) => {
    const c = contas.find((x) => x.id === id);
    return c ? `${c.codigo} — ${c.nome}` : 'Conta não informada';
  };
  const periodoLabel = (id: string | null) => {
    const p = periodos.find((x) => x.id === id);
    return p ? competenciaLabel(p.competencia) : '—';
  };

  return (
    <div className="space-y-4">
      <AvisoEstrutura />

      <div className="flex justify-end">
        <Button onClick={() => setAberto(true)}>
          <Plus className="mr-1 h-4 w-4" aria-hidden="true" /> Nova conciliação
        </Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Carregando conciliações...</p>}
      {!loading && itens.length === 0 && (
        <Card><CardContent className="p-6 text-sm text-muted-foreground">
          Nenhuma conciliação registrada. A rotina definitiva será definida com o setor contábil, integrando saldos do
          Financeiro e extratos bancários.
        </CardContent></Card>
      )}

      <div className="space-y-2">
        {itens.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
              <div>
                <p className="font-medium">{contaLabel(c.conta_id)}</p>
                <p className="text-xs text-muted-foreground">
                  Competência {periodoLabel(c.periodo_id)}{c.referencia ? ` · ${c.referencia}` : ''} ·
                  Contábil {brl(Number(c.saldo_contabil))} · Externo {brl(Number(c.saldo_externo))}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={Number(c.diferenca) === 0 ? 'default' : 'destructive'}>
                  Diferença {brl(Number(c.diferenca))}
                </Badge>
                <Badge variant="outline">{c.status === 'conciliado' ? 'Conciliado' : 'Pendente'}</Badge>
                {c.status !== 'conciliado' && (
                  <Button size="sm" variant="outline" onClick={() => concluir(c)}>
                    <CheckCircle2 className="mr-1 h-4 w-4" aria-hidden="true" /> Concluir
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader><DialogTitle>Nova conciliação</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <Label>Conta contábil</Label>
              <Select value={form.conta_id} onValueChange={(v) => setForm({ ...form, conta_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {contas.map((c) => <SelectItem key={c.id} value={c.id}>{c.codigo} — {c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Período</Label>
              <Select value={form.periodo_id} onValueChange={(v) => setForm({ ...form, periodo_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {periodos.map((p) => <SelectItem key={p.id} value={p.id}>{competenciaLabel(p.competencia)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Referência</Label>
              <Input value={form.referencia} onChange={(e) => setForm({ ...form, referencia: e.target.value })} placeholder="Extrato, conta bancária..." />
            </div>
            <div>
              <Label>Saldo contábil (R$)</Label>
              <Input type="number" step="0.01" value={form.saldo_contabil} onChange={(e) => setForm({ ...form, saldo_contabil: e.target.value })} />
            </div>
            <div>
              <Label>Saldo externo (R$)</Label>
              <Input type="number" step="0.01" value={form.saldo_externo} onChange={(e) => setForm({ ...form, saldo_externo: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Observações</Label>
              <Textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAberto(false)}>Cancelar</Button>
            <Button onClick={salvar} disabled={salvando}>
              {salvando && <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden="true" />} Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
