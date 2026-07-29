import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Loader2, FlaskConical, CheckCircle2, Undo2, Search, History } from 'lucide-react';
import AvisoEstrutura from './AvisoEstrutura';
import { useCtbRefs } from './useCtbRefs';
import { LANC_STATUS, ORIGENS, brl, competenciaLabel, dataBR, labelOrigem } from '@/lib/contabilidade';

type Lanc = {
  id: string; data: string; competencia: string; historico: string; documento: string | null;
  conta_debito_id: string | null; conta_credito_id: string | null; valor: number;
  centro_custo_id: string | null; origem: string; lote_id: string | null; status: string;
  simulacao: boolean; criado_por_email: string | null; justificativa: string | null;
};

const hoje = () => new Date().toISOString().slice(0, 10);
const compAtual = () => `${hoje().slice(0, 7)}-01`;

const vazio = {
  data: hoje(), competencia: compAtual(), historico: '', documento: '',
  conta_debito_id: '', conta_credito_id: '', valor: '', centro_custo_id: '', lote_id: '',
};

export default function LancamentosTab() {
  const { contas, centros, lotes, loading: refsLoading, recarregar: recarregarRefs } = useCtbRefs();
  const [itens, setItens] = useState<Lanc[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [status, setStatus] = useState('todos');
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState<any>(vazio);
  const [historico, setHistorico] = useState<any[] | null>(null);

  const analiticas = useMemo(() => contas.filter((c) => c.aceita_lancamento && c.ativa), [contas]);
  const contaLabel = (id: string | null) => {
    const c = contas.find((x) => x.id === id);
    return c ? `${c.codigo} — ${c.nome}` : '—';
  };

  const carregar = async () => {
    setLoading(true);
    const { data } = await supabase.from('ctb_lancamentos').select('*').order('data', { ascending: false }).limit(300);
    setItens((data ?? []) as any as Lanc[]);
    setLoading(false);
  };
  useEffect(() => { void carregar(); }, []);

  const lista = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return itens.filter((l) => {
      if (status !== 'todos' && l.status !== status) return false;
      if (!q) return true;
      return `${l.historico} ${l.documento ?? ''}`.toLowerCase().includes(q);
    });
  }, [itens, busca, status]);

  const previa = useMemo(() => {
    if (!form.conta_debito_id || !form.conta_credito_id || !Number(form.valor)) return null;
    return {
      debito: contaLabel(form.conta_debito_id),
      credito: contaLabel(form.conta_credito_id),
      valor: Number(form.valor),
    };
  }, [form, contas]);

  const salvar = async (simular: boolean) => {
    if (!form.historico.trim()) { toast.error('Informe o histórico do lançamento.'); return; }
    if (!form.conta_debito_id || !form.conta_credito_id) { toast.error('Selecione as contas de débito e crédito.'); return; }
    if (form.conta_debito_id === form.conta_credito_id) { toast.error('As contas de débito e crédito devem ser diferentes.'); return; }
    if (!Number(form.valor)) { toast.error('Informe um valor maior que zero.'); return; }

    setSalvando(true);
    const { data: sess } = await supabase.auth.getUser();
    const { error } = await supabase.from('ctb_lancamentos').insert({
      data: form.data,
      competencia: form.competencia,
      historico: form.historico.trim(),
      documento: form.documento || null,
      conta_debito_id: form.conta_debito_id,
      conta_credito_id: form.conta_credito_id,
      valor: Number(form.valor),
      centro_custo_id: form.centro_custo_id || null,
      lote_id: form.lote_id || null,
      origem: 'manual',
      status: simular ? 'simulado' : 'rascunho',
      simulacao: simular,
      criado_por: sess.user?.id ?? null,
      criado_por_email: sess.user?.email ?? null,
    });
    setSalvando(false);
    if (error) { toast.error(error.message); return; }
    toast.success(simular ? 'Lançamento registrado em simulação.' : 'Rascunho salvo.');
    setAberto(false);
    setForm(vazio);
    await carregar();
  };

  const efetivar = async (l: Lanc) => {
    if (!confirm('Efetivar este lançamento? Após a efetivação ele não poderá ser excluído, apenas estornado.')) return;
    const { error } = await supabase.from('ctb_lancamentos')
      .update({ status: 'efetivado', simulacao: false }).eq('id', l.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Lançamento efetivado.');
    await carregar();
  };

  const estornar = async (l: Lanc) => {
    const justificativa = prompt('Justificativa do estorno:');
    if (!justificativa) return;
    const { data: sess } = await supabase.auth.getUser();
    const { error: e1 } = await supabase.from('ctb_lancamentos').insert({
      data: hoje(), competencia: l.competencia,
      historico: `Estorno — ${l.historico}`, documento: l.documento,
      conta_debito_id: l.conta_credito_id, conta_credito_id: l.conta_debito_id,
      valor: l.valor, centro_custo_id: l.centro_custo_id, origem: l.origem as any,
      status: 'efetivado', simulacao: false, estorno_de: l.id, justificativa,
      criado_por: sess.user?.id ?? null, criado_por_email: sess.user?.email ?? null,
    });
    if (e1) { toast.error(e1.message); return; }
    const { error: e2 } = await supabase.from('ctb_lancamentos')
      .update({ status: 'estornado', justificativa }).eq('id', l.id);
    if (e2) { toast.error(e2.message); return; }
    toast.success('Lançamento estornado com partida inversa.');
    await carregar();
  };

  const verHistorico = async (l: Lanc) => {
    const { data } = await supabase.from('ctb_lancamento_historico')
      .select('*').eq('lancamento_id', l.id).order('created_at', { ascending: false });
    setHistorico(data ?? []);
  };

  return (
    <div className="space-y-4">
      <AvisoEstrutura />

      <Alert>
        <FlaskConical className="h-4 w-4" aria-hidden="true" />
        <AlertDescription>
          Modo de simulação: novos lançamentos nascem como prévia e só passam a compor a escrituração após a efetivação
          manual, com o mapeamento validado pelo setor contábil.
        </AlertDescription>
      </Alert>

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input className="pl-8" placeholder="Buscar por histórico ou documento" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <Select value={status} onValueChange={setStatus}>
          <SelectTrigger className="w-[170px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {Object.entries(LANC_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button onClick={() => { void recarregarRefs(); setAberto(true); }}>
          <Plus className="mr-1 h-4 w-4" aria-hidden="true" /> Novo lançamento
        </Button>
      </div>

      {(loading || refsLoading) && <p className="text-sm text-muted-foreground">Carregando lançamentos...</p>}
      {!loading && lista.length === 0 && (
        <Card><CardContent className="p-6 text-sm text-muted-foreground">Nenhum lançamento registrado.</CardContent></Card>
      )}

      <div className="space-y-2">
        {lista.map((l) => {
          const s = LANC_STATUS[l.status as keyof typeof LANC_STATUS];
          return (
            <Card key={l.id}>
              <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div className="min-w-[240px] flex-1">
                  <p className="font-medium">{l.historico}</p>
                  <p className="text-xs text-muted-foreground">
                    {dataBR(l.data)} · Competência {competenciaLabel(l.competencia)} · {labelOrigem(l.origem)}
                    {l.documento ? ` · Doc. ${l.documento}` : ''}
                  </p>
                  <p className="mt-1 text-xs">
                    <span className="text-muted-foreground">D:</span> {contaLabel(l.conta_debito_id)}{' '}
                    <span className="text-muted-foreground">| C:</span> {contaLabel(l.conta_credito_id)}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <strong>{brl(Number(l.valor))}</strong>
                  <Badge className={s?.className}>{s?.label ?? l.status}</Badge>
                  <Button size="sm" variant="ghost" onClick={() => verHistorico(l)}>
                    <History className="mr-1 h-4 w-4" aria-hidden="true" /> Histórico
                  </Button>
                  {['rascunho', 'simulado'].includes(l.status) && (
                    <Button size="sm" variant="outline" onClick={() => efetivar(l)}>
                      <CheckCircle2 className="mr-1 h-4 w-4" aria-hidden="true" /> Efetivar
                    </Button>
                  )}
                  {l.status === 'efetivado' && (
                    <Button size="sm" variant="outline" onClick={() => estornar(l)}>
                      <Undo2 className="mr-1 h-4 w-4" aria-hidden="true" /> Estornar
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>Novo lançamento contábil</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Data</Label>
              <Input type="date" value={form.data} onChange={(e) => setForm({ ...form, data: e.target.value })} />
            </div>
            <div>
              <Label>Competência</Label>
              <Input type="month" value={form.competencia.slice(0, 7)}
                onChange={(e) => setForm({ ...form, competencia: `${e.target.value}-01` })} />
            </div>
            <div className="sm:col-span-2">
              <Label>Histórico</Label>
              <Textarea value={form.historico} onChange={(e) => setForm({ ...form, historico: e.target.value })} />
            </div>
            <div>
              <Label>Documento</Label>
              <Input value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} />
            </div>
            <div>
              <Label>Valor (R$)</Label>
              <Input type="number" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
            </div>
            <div>
              <Label>Conta de débito</Label>
              <Select value={form.conta_debito_id} onValueChange={(v) => setForm({ ...form, conta_debito_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {analiticas.map((c) => <SelectItem key={c.id} value={c.id}>{c.codigo} — {c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Conta de crédito</Label>
              <Select value={form.conta_credito_id} onValueChange={(v) => setForm({ ...form, conta_credito_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {analiticas.map((c) => <SelectItem key={c.id} value={c.id}>{c.codigo} — {c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Centro de custo</Label>
              <Select value={form.centro_custo_id || 'nenhum'} onValueChange={(v) => setForm({ ...form, centro_custo_id: v === 'nenhum' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Nenhum</SelectItem>
                  {centros.map((c) => <SelectItem key={c.id} value={c.id}>{c.codigo} — {c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Lote</Label>
              <Select value={form.lote_id || 'nenhum'} onValueChange={(v) => setForm({ ...form, lote_id: v === 'nenhum' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Nenhum" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Nenhum</SelectItem>
                  {lotes.map((l) => <SelectItem key={l.id} value={l.id}>{l.numero ?? l.descricao}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {analiticas.length === 0 && (
            <p className="text-xs text-destructive">
              Nenhuma conta analítica cadastrada. Cadastre contas que aceitam lançamento no plano de contas.
            </p>
          )}

          {previa && (
            <div className="rounded-md border bg-muted/40 p-3 text-sm">
              <p className="mb-1 font-medium">Prévia da partida</p>
              <p>D — {previa.debito}: <strong>{brl(previa.valor)}</strong></p>
              <p>C — {previa.credito}: <strong>{brl(previa.valor)}</strong></p>
            </div>
          )}

          <DialogFooter className="flex-wrap gap-2">
            <Button variant="outline" onClick={() => setAberto(false)}>Cancelar</Button>
            <Button variant="secondary" onClick={() => salvar(false)} disabled={salvando}>Salvar rascunho</Button>
            <Button onClick={() => salvar(true)} disabled={salvando}>
              {salvando && <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden="true" />}
              <FlaskConical className="mr-1 h-4 w-4" aria-hidden="true" /> Simular lançamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={historico !== null} onOpenChange={() => setHistorico(null)}>
        <DialogContent className="max-w-xl">
          <DialogHeader><DialogTitle>Histórico do lançamento</DialogTitle></DialogHeader>
          <div className="max-h-[60vh] space-y-2 overflow-auto text-sm">
            {(historico ?? []).length === 0 && <p className="text-muted-foreground">Sem registros.</p>}
            {(historico ?? []).map((h) => (
              <div key={h.id} className="rounded-md border p-2.5">
                <p className="font-medium">{h.acao}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(h.created_at).toLocaleString('pt-BR')}
                  {h.ator_email ? ` · ${h.ator_email}` : ''}
                </p>
                {h.justificativa && <p className="mt-1 text-xs">Justificativa: {h.justificativa}</p>}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
