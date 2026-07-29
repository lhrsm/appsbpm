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
import { Plus, Loader2 } from 'lucide-react';
import AvisoEstrutura from './AvisoEstrutura';
import { LOTE_STATUS, ORIGENS, brl, competenciaLabel } from '@/lib/contabilidade';

type Lote = {
  id: string; numero: string | null; descricao: string; competencia: string;
  origem: string; status: string; simulacao: boolean; observacoes: string | null;
};

const compAtual = () => `${new Date().toISOString().slice(0, 7)}-01`;

export default function LotesTab() {
  const [itens, setItens] = useState<Lote[]>([]);
  const [totais, setTotais] = useState<Record<string, { qtd: number; valor: number }>>({});
  const [loading, setLoading] = useState(true);
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({ numero: '', descricao: '', competencia: compAtual().slice(0, 7), origem: 'manual', observacoes: '' });

  const carregar = async () => {
    setLoading(true);
    const [l, lanc] = await Promise.all([
      supabase.from('ctb_lotes').select('*').order('created_at', { ascending: false }),
      supabase.from('ctb_lancamentos').select('lote_id,valor'),
    ]);
    const acc: Record<string, { qtd: number; valor: number }> = {};
    (lanc.data ?? []).forEach((x: any) => {
      if (!x.lote_id) return;
      acc[x.lote_id] = acc[x.lote_id] ?? { qtd: 0, valor: 0 };
      acc[x.lote_id].qtd += 1;
      acc[x.lote_id].valor += Number(x.valor || 0);
    });
    setTotais(acc);
    setItens((l.data ?? []) as any as Lote[]);
    setLoading(false);
  };
  useEffect(() => { void carregar(); }, []);

  const salvar = async () => {
    if (!form.descricao.trim()) { toast.error('Informe a descrição do lote.'); return; }
    setSalvando(true);
    const { data: sess } = await supabase.auth.getUser();
    const { error } = await supabase.from('ctb_lotes').insert({
      numero: form.numero || null,
      descricao: form.descricao.trim(),
      competencia: `${form.competencia}-01`,
      origem: form.origem as any,
      observacoes: form.observacoes || null,
      criado_por: sess.user?.id ?? null,
      criado_por_email: sess.user?.email ?? null,
    });
    setSalvando(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Lote criado.');
    setAberto(false);
    await carregar();
  };

  const alterar = async (l: Lote, status: string) => {
    const { error } = await supabase.from('ctb_lotes')
      .update({ status: status as any, simulacao: status !== 'efetivado' }).eq('id', l.id);
    if (error) { toast.error(error.message); return; }
    await carregar();
  };

  return (
    <div className="space-y-4">
      <AvisoEstrutura />

      <div className="flex justify-end">
        <Button onClick={() => setAberto(true)}>
          <Plus className="mr-1 h-4 w-4" aria-hidden="true" /> Novo lote
        </Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Carregando lotes...</p>}
      {!loading && itens.length === 0 && (
        <Card><CardContent className="p-6 text-sm text-muted-foreground">
          Nenhum lote criado. Os lotes agrupam lançamentos de uma mesma origem e competência.
        </CardContent></Card>
      )}

      <div className="space-y-2">
        {itens.map((l) => {
          const s = LOTE_STATUS[l.status as keyof typeof LOTE_STATUS];
          const t = totais[l.id] ?? { qtd: 0, valor: 0 };
          return (
            <Card key={l.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">{l.numero ? `${l.numero} — ` : ''}{l.descricao}</p>
                  <p className="text-xs text-muted-foreground">
                    Competência {competenciaLabel(l.competencia)} · {ORIGENS.find((o) => o.value === l.origem)?.label ?? l.origem} ·
                    {' '}{t.qtd} lançamento(s) · {brl(t.valor)}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={s?.className}>{s?.label ?? l.status}</Badge>
                  <Select value={l.status} onValueChange={(v) => alterar(l, v)}>
                    <SelectTrigger className="h-8 w-[150px]"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {Object.entries(LOTE_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader><DialogTitle>Novo lote contábil</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Número</Label>
              <Input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} />
            </div>
            <div>
              <Label>Competência</Label>
              <Input type="month" value={form.competencia} onChange={(e) => setForm({ ...form, competencia: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Descrição</Label>
              <Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Origem</Label>
              <Select value={form.origem} onValueChange={(v) => setForm({ ...form, origem: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ORIGENS.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Observações</Label>
              <Textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
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
