import { useEffect, useState, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { Wallet, Plus, Trash2, Edit, CheckCircle2, Layers, Download } from 'lucide-react';

const STATUS_META: Record<string, { label: string; color: string }> = {
  pago: { label: 'Pago', color: 'bg-green-600' },
  pendente: { label: 'Pendente', color: 'bg-yellow-500' },
  atrasado: { label: 'Atrasado', color: 'bg-red-600' },
  cancelado: { label: 'Cancelado', color: 'bg-gray-500' },
};

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const emptyForm = {
  id: '', associado_id: '', referencia: '', tipo: 'mensalidade',
  descricao: '', valor: '', vencimento: '', status: 'pendente',
  pago_em: '', forma_pagamento: '', boleto_url: '', linha_digitavel: '',
};

export default function MensalidadesTab() {
  const [items, setItems] = useState<any[]>([]);
  const [associados, setAssociados] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('todos');
  const [loteOpen, setLoteOpen] = useState(false);
  const [lote, setLote] = useState({ referencia: '', vencimento: '', valor: '', descricao: 'Mensalidade' });
  const [gerando, setGerando] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: m }, { data: a }] = await Promise.all([
      supabase.from('mensalidades').select('*, associados(nome, matricula)').order('vencimento', { ascending: false }),
      supabase.from('associados').select('id, nome, matricula').order('nome'),
    ]);
    setItems(m || []);
    setAssociados(a || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const abrir = (m?: any) => {
    if (m) setForm({
      ...emptyForm, ...m, valor: String(m.valor),
      pago_em: m.pago_em || '', descricao: m.descricao || '',
      forma_pagamento: m.forma_pagamento || '', boleto_url: m.boleto_url || '',
      linha_digitavel: m.linha_digitavel || '',
    });
    else setForm(emptyForm);
    setOpen(true);
  };

  const salvar = async () => {
    if (!form.associado_id || !form.referencia || !form.valor || !form.vencimento) return toast.error('Preencha os campos obrigatórios');
    setSaving(true);
    const payload: any = {
      associado_id: form.associado_id,
      referencia: form.referencia,
      tipo: form.tipo,
      descricao: form.descricao || null,
      valor: Number(form.valor),
      vencimento: form.vencimento,
      status: form.status,
      pago_em: form.pago_em || null,
      forma_pagamento: form.forma_pagamento || null,
      boleto_url: form.boleto_url || null,
      linha_digitavel: form.linha_digitavel || null,
    };
    const q = form.id
      ? supabase.from('mensalidades').update(payload).eq('id', form.id)
      : supabase.from('mensalidades').insert(payload);
    const { error } = await q;
    setSaving(false);
    if (error) return toast.error('Erro ao salvar');
    toast.success('Salvo');
    setOpen(false);
    load();
  };

  const remover = async (id: string) => {
    if (!confirm('Remover este lançamento?')) return;
    await supabase.from('mensalidades').delete().eq('id', id);
    toast.success('Removido');
    load();
  };

  const marcarPago = async (m: any) => {
    await supabase.from('mensalidades').update({
      status: 'pago', pago_em: new Date().toISOString().slice(0, 10),
    }).eq('id', m.id);
    toast.success('Marcado como pago');
    load();
  };

  const gerarLote = async () => {
    if (!lote.referencia || !lote.vencimento || !lote.valor) return toast.error('Preencha referência, vencimento e valor');
    setGerando(true);
    const { data: existentes } = await supabase.from('mensalidades').select('associado_id').eq('referencia', lote.referencia);
    const jaTem = new Set((existentes || []).map((e: any) => e.associado_id));
    const novos = associados.filter(a => !jaTem.has(a.id)).map(a => ({
      associado_id: a.id,
      referencia: lote.referencia,
      tipo: 'mensalidade',
      descricao: lote.descricao || null,
      valor: Number(lote.valor),
      vencimento: lote.vencimento,
      status: 'pendente',
    }));
    if (novos.length === 0) { setGerando(false); toast.info('Todos os associados já possuem lançamento nesta referência'); return; }
    const { error } = await supabase.from('mensalidades').insert(novos);
    setGerando(false);
    if (error) return toast.error('Erro ao gerar lote');
    toast.success(`${novos.length} lançamento(s) gerado(s)`);
    setLoteOpen(false);
    setLote({ referencia: '', vencimento: '', valor: '', descricao: 'Mensalidade' });
    load();
  };

  const exportarCSV = () => {
    const rows = [['Matrícula', 'Associado', 'Referência', 'Tipo', 'Valor', 'Vencimento', 'Status', 'Pago em', 'Forma pagamento']];
    filtered.forEach(m => rows.push([
      m.associados?.matricula || '', m.associados?.nome || '', m.referencia, m.tipo,
      String(m.valor), m.vencimento, m.status, m.pago_em || '', m.forma_pagamento || '',
    ]));
    const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `financeiro_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = items.filter(m => {
    if (statusF !== 'todos' && m.status !== statusF) return false;
    if (search) {
      const q = search.toLowerCase();
      if (!`${m.associados?.nome} ${m.associados?.matricula} ${m.referencia}`.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const stats = useMemo(() => ({
    total: items.reduce((a, b) => a + Number(b.valor), 0),
    pago: items.filter(i => i.status === 'pago').reduce((a, b) => a + Number(b.valor), 0),
    pendente: items.filter(i => i.status === 'pendente' || i.status === 'atrasado').reduce((a, b) => a + Number(b.valor), 0),
    atrasados: items.filter(i => i.status === 'atrasado' || (i.status === 'pendente' && new Date(i.vencimento) < new Date())).length,
  }), [items]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-semibold flex items-center gap-2"><Wallet className="w-5 h-5" /> Mensalidades dos associados</h2>
          <p className="text-muted-foreground text-sm">Mensalidades, coparticipações e taxas cobradas do quadro associativo</p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={exportarCSV}><Download className="w-4 h-4 mr-2" /> CSV</Button>
          <Button variant="outline" onClick={() => setLoteOpen(true)}><Layers className="w-4 h-4 mr-2" /> Gerar lote mensal</Button>
          <Button onClick={() => abrir()}><Plus className="w-4 h-4 mr-2" /> Novo lançamento</Button>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total geral</p><p className="text-xl font-bold">{brl(stats.total)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Recebido</p><p className="text-xl font-bold text-green-600">{brl(stats.pago)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Pendente</p><p className="text-xl font-bold text-yellow-600">{brl(stats.pendente)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Atrasados</p><p className="text-xl font-bold text-red-600">{stats.atrasados}</p></CardContent></Card>
      </div>

      <Card><CardContent className="p-4 grid md:grid-cols-2 gap-3">
        <Input placeholder="Buscar por nome, matrícula ou referência..." value={search} onChange={e => setSearch(e.target.value)} />
        <Select value={statusF} onValueChange={setStatusF}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos</SelectItem>
            {Object.entries(STATUS_META).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
      </CardContent></Card>

      {loading ? <p>Carregando...</p> : (
        <div className="grid gap-2">
          {filtered.map(m => {
            const meta = STATUS_META[m.status];
            return (
              <Card key={m.id}>
                <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`${meta.color} text-white`}>{meta.label}</Badge>
                      <Badge variant="outline">{m.tipo}</Badge>
                    </div>
                    <p className="font-semibold mt-1">
                      {m.associados?.matricula} - {m.associados?.nome} • {m.referencia}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Venc.: {format(parseISO(m.vencimento), 'dd/MM/yyyy')}
                      {m.pago_em && ` • Pago em ${format(parseISO(m.pago_em), 'dd/MM/yyyy')}`}
                    </p>
                  </div>
                  <p className="font-bold text-lg">{brl(Number(m.valor))}</p>
                  <div className="flex gap-1">
                    {m.status !== 'pago' && (
                      <Button size="sm" variant="outline" onClick={() => marcarPago(m)} title="Marcar como pago"><CheckCircle2 className="w-4 h-4" /></Button>
                    )}
                    <Button size="sm" variant="outline" onClick={() => abrir(m)}><Edit className="w-4 h-4" /></Button>
                    <Button size="sm" variant="destructive" onClick={() => remover(m.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filtered.length === 0 && <p className="text-muted-foreground text-center py-8">Nenhum lançamento.</p>}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{form.id ? 'Editar' : 'Novo'} lançamento</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Associado *</Label>
              <Select value={form.associado_id} onValueChange={v => setForm({ ...form, associado_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                <SelectContent>
                  {associados.map(a => <SelectItem key={a.id} value={a.id}>{a.matricula} - {a.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Referência *</Label><Input placeholder="Ex: 01/2026" value={form.referencia} onChange={e => setForm({ ...form, referencia: e.target.value })} /></div>
              <div>
                <Label>Tipo</Label>
                <Select value={form.tipo} onValueChange={v => setForm({ ...form, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mensalidade">Mensalidade</SelectItem>
                    <SelectItem value="coparticipacao">Coparticipação</SelectItem>
                    <SelectItem value="taxa">Taxa</SelectItem>
                    <SelectItem value="outros">Outros</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div><Label>Descrição</Label><Input value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Valor *</Label><Input type="number" step="0.01" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })} /></div>
              <div><Label>Vencimento *</Label><Input type="date" value={form.vencimento} onChange={e => setForm({ ...form, vencimento: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Status</Label>
                <Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_META).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Pago em</Label><Input type="date" value={form.pago_em} onChange={e => setForm({ ...form, pago_em: e.target.value })} /></div>
            </div>
            <div><Label>Forma de pagamento</Label><Input placeholder="Ex: PIX / Boleto / Débito" value={form.forma_pagamento} onChange={e => setForm({ ...form, forma_pagamento: e.target.value })} /></div>
            <div><Label>URL do boleto (opcional)</Label><Input value={form.boleto_url} onChange={e => setForm({ ...form, boleto_url: e.target.value })} /></div>
            <div><Label>Linha digitável (opcional)</Label><Input value={form.linha_digitavel} onChange={e => setForm({ ...form, linha_digitavel: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={salvar} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={loteOpen} onOpenChange={setLoteOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Gerar lote mensal</DialogTitle></DialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Cria um lançamento pendente para todos os {associados.length} associados que ainda não possuem lançamento nesta referência.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div><Label>Referência *</Label><Input placeholder="Ex: 02/2026" value={lote.referencia} onChange={e => setLote({ ...lote, referencia: e.target.value })} /></div>
              <div><Label>Vencimento *</Label><Input type="date" value={lote.vencimento} onChange={e => setLote({ ...lote, vencimento: e.target.value })} /></div>
            </div>
            <div><Label>Valor *</Label><Input type="number" step="0.01" value={lote.valor} onChange={e => setLote({ ...lote, valor: e.target.value })} /></div>
            <div><Label>Descrição</Label><Input value={lote.descricao} onChange={e => setLote({ ...lote, descricao: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLoteOpen(false)}>Cancelar</Button>
            <Button onClick={gerarLote} disabled={gerando}>{gerando ? 'Gerando...' : 'Gerar lote'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
