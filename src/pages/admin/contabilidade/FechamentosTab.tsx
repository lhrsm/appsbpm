import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Loader2, Lock, Unlock } from 'lucide-react';
import AvisoEstrutura from './AvisoEstrutura';
import { useCtbRefs } from './useCtbRefs';
import { SITUACOES_PERIODO, competenciaLabel } from '@/lib/contabilidade';

type Fechamento = {
  id: string; periodo_id: string; tipo: string; situacao: string; observacoes: string | null;
  responsavel_email: string | null; fechado_em: string | null; reaberto_em: string | null;
};

export default function FechamentosTab() {
  const { periodos, recarregar: recarregarRefs } = useCtbRefs();
  const [itens, setItens] = useState<Fechamento[]>([]);
  const [loading, setLoading] = useState(true);
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({ periodo_id: '', tipo: 'mensal', observacoes: '' });

  const carregar = async () => {
    setLoading(true);
    const { data } = await supabase.from('ctb_fechamentos').select('*').order('created_at', { ascending: false });
    setItens((data ?? []) as any as Fechamento[]);
    setLoading(false);
  };
  useEffect(() => { void carregar(); }, []);

  const abrirProcesso = async () => {
    if (!form.periodo_id) { toast.error('Selecione o período.'); return; }
    setSalvando(true);
    const { data: sess } = await supabase.auth.getUser();
    const { error } = await supabase.from('ctb_fechamentos').insert({
      periodo_id: form.periodo_id,
      tipo: form.tipo,
      observacoes: form.observacoes || null,
      responsavel_user_id: sess.user?.id ?? null,
      responsavel_email: sess.user?.email ?? null,
    });
    setSalvando(false);
    if (error) { toast.error(error.message); return; }
    await supabase.from('ctb_periodos').update({ situacao: 'em_fechamento' }).eq('id', form.periodo_id);
    toast.success('Processo de fechamento iniciado.');
    setAberto(false);
    await Promise.all([carregar(), recarregarRefs()]);
  };

  const concluir = async (f: Fechamento) => {
    if (!confirm('Concluir o fechamento deste período? Novos lançamentos deverão ser bloqueados pela rotina definitiva.')) return;
    const { error } = await supabase.from('ctb_fechamentos')
      .update({ situacao: 'fechado', fechado_em: new Date().toISOString() }).eq('id', f.id);
    if (error) { toast.error(error.message); return; }
    await supabase.from('ctb_periodos').update({ situacao: 'fechado' }).eq('id', f.periodo_id);
    toast.success('Período fechado.');
    await Promise.all([carregar(), recarregarRefs()]);
  };

  const reabrir = async (f: Fechamento) => {
    const justificativa = prompt('Justificativa da reabertura:');
    if (!justificativa) return;
    const { error } = await supabase.from('ctb_fechamentos').update({
      situacao: 'reaberto', reaberto_em: new Date().toISOString(), reaberto_justificativa: justificativa,
    }).eq('id', f.id);
    if (error) { toast.error(error.message); return; }
    await supabase.from('ctb_periodos').update({ situacao: 'reaberto' }).eq('id', f.periodo_id);
    toast.success('Período reaberto com justificativa registrada.');
    await Promise.all([carregar(), recarregarRefs()]);
  };

  const periodoLabel = (id: string) => {
    const p = periodos.find((x) => x.id === id);
    return p ? competenciaLabel(p.competencia) : '—';
  };

  return (
    <div className="space-y-4">
      <AvisoEstrutura />

      <div className="flex justify-end">
        <Button onClick={() => setAberto(true)}>
          <Plus className="mr-1 h-4 w-4" aria-hidden="true" /> Iniciar fechamento
        </Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Carregando fechamentos...</p>}
      {!loading && itens.length === 0 && (
        <Card><CardContent className="p-6 text-sm text-muted-foreground">
          Nenhum fechamento registrado.
        </CardContent></Card>
      )}

      <div className="space-y-2">
        {itens.map((f) => {
          const s = SITUACOES_PERIODO[f.situacao as keyof typeof SITUACOES_PERIODO];
          return (
            <Card key={f.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="font-medium">
                    Fechamento {f.tipo} — {periodoLabel(f.periodo_id)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {f.responsavel_email ?? 'Responsável não informado'}
                    {f.fechado_em ? ` · Fechado em ${new Date(f.fechado_em).toLocaleString('pt-BR')}` : ''}
                    {f.reaberto_em ? ` · Reaberto em ${new Date(f.reaberto_em).toLocaleString('pt-BR')}` : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={s?.className}>{s?.label ?? f.situacao}</Badge>
                  {f.situacao !== 'fechado' ? (
                    <Button size="sm" variant="outline" onClick={() => concluir(f)}>
                      <Lock className="mr-1 h-4 w-4" aria-hidden="true" /> Concluir
                    </Button>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => reabrir(f)}>
                      <Unlock className="mr-1 h-4 w-4" aria-hidden="true" /> Reabrir
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent>
          <DialogHeader><DialogTitle>Iniciar fechamento</DialogTitle></DialogHeader>
          <div className="grid gap-3">
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
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensal">Mensal</SelectItem>
                  <SelectItem value="trimestral">Trimestral</SelectItem>
                  <SelectItem value="anual">Anual</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Observações</Label>
              <Textarea value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAberto(false)}>Cancelar</Button>
            <Button onClick={abrirProcesso} disabled={salvando}>
              {salvando && <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden="true" />} Iniciar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
