import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Loader2, Paperclip, FileDown, Wrench } from 'lucide-react';
import { brl, dataBR, uploadAnexos, abrirAnexo, exportarPDF } from '@/lib/patrimonio';

const TIPOS = [
  { value: 'preventiva', label: 'Preventiva' },
  { value: 'corretiva', label: 'Corretiva' },
  { value: 'calibracao', label: 'Calibração' },
  { value: 'garantia', label: 'Garantia' },
];

const STATUS: Record<string, { label: string; className: string }> = {
  aberta: { label: 'Aberta', className: 'bg-yellow-500 text-white' },
  em_execucao: { label: 'Em execução', className: 'bg-blue-600 text-white' },
  concluida: { label: 'Concluída', className: 'bg-green-600 text-white' },
  cancelada: { label: 'Cancelada', className: 'bg-gray-500 text-white' },
};

const vazio = {
  id: '', bem_id: '', tipo: 'corretiva', descricao: '', fornecedor_nome: '', custo: '',
  data_abertura: new Date().toISOString().slice(0, 10), data_prevista: '', data_conclusao: '',
  status: 'aberta', observacoes: '', anexos: [] as any[],
};

export default function ManutencoesTab() {
  const [bens, setBens] = useState<any[]>([]);
  const [itens, setItens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState<any>(vazio);
  const [filtro, setFiltro] = useState('todas');
  const fileRef = useRef<HTMLInputElement>(null);

  const carregar = async () => {
    setLoading(true);
    const [b, m] = await Promise.all([
      supabase.from('pat_bens').select('id,numero_patrimonial,descricao').neq('status', 'baixado').order('numero_patrimonial'),
      supabase.from('pat_manutencoes').select('*').order('data_abertura', { ascending: false }),
    ]);
    setBens(b.data || []);
    setItens(m.data || []);
    setLoading(false);
  };

  useEffect(() => { void carregar(); }, []);

  const bemDe = (id: string) => bens.find((b) => b.id === id);

  const anexar = async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      const novos = await uploadAnexos('manutencoes', files);
      setForm((f: any) => ({ ...f, anexos: [...(f.anexos ?? []), ...novos] }));
      toast.success('Anexo adicionado.');
    } catch (e: any) { toast.error(e?.message ?? 'Falha no upload.'); }
  };

  const salvar = async () => {
    if (!form.bem_id) return toast.error('Selecione o bem.');
    if (!form.descricao.trim()) return toast.error('Descreva o serviço.');
    setSalvando(true);
    const { data: sess } = await supabase.auth.getSession();
    const payload: any = {
      bem_id: form.bem_id, tipo: form.tipo, descricao: form.descricao.trim(),
      fornecedor_nome: form.fornecedor_nome || null, custo: Number(form.custo || 0),
      data_abertura: form.data_abertura, data_prevista: form.data_prevista || null,
      data_conclusao: form.data_conclusao || null, status: form.status,
      observacoes: form.observacoes || null, anexos: form.anexos ?? [],
    };
    if (!form.id) payload.criado_por = sess.session?.user.id ?? null;
    const { error } = form.id
      ? await supabase.from('pat_manutencoes').update(payload).eq('id', form.id)
      : await supabase.from('pat_manutencoes').insert(payload);
    if (!error && form.status === 'aberta') {
      await supabase.from('pat_bens').update({ status: 'em_manutencao' as any }).eq('id', form.bem_id);
    }
    if (!error && form.status === 'concluida') {
      await supabase.from('pat_bens').update({ status: 'em_uso' as any }).eq('id', form.bem_id);
    }
    setSalvando(false);
    if (error) return toast.error(error.message);
    toast.success('Ordem de manutenção salva.');
    setOpen(false);
    void carregar();
  };

  const filtradas = itens.filter((m) => filtro === 'todas' || m.status === filtro);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={filtro} onValueChange={setFiltro}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            {Object.entries(STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="ml-auto flex gap-2">
          <Button size="sm" variant="outline" onClick={() => exportarPDF('Manutenções',
            ['Abertura', 'Bem', 'Tipo', 'Descrição', 'Custo', 'Situação'],
            filtradas.map((m) => [dataBR(m.data_abertura), bemDe(m.bem_id)?.numero_patrimonial ?? '—',
              TIPOS.find((t) => t.value === m.tipo)?.label ?? m.tipo, m.descricao, brl(Number(m.custo || 0)), STATUS[m.status]?.label ?? m.status]))}>
            <FileDown className="mr-1 h-4 w-4" /> PDF
          </Button>
          <Button size="sm" onClick={() => { setForm(vazio); setOpen(true); }}><Plus className="mr-1 h-4 w-4" /> Nova manutenção</Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : filtradas.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">Nenhuma manutenção registrada.</CardContent></Card>
      ) : (
        <div className="grid gap-2">
          {filtradas.map((m) => (
            <Card key={m.id}>
              <CardContent className="flex flex-wrap items-center gap-3 p-4">
                <Wrench className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{bemDe(m.bem_id)?.numero_patrimonial ?? '—'}</span>
                    <p className="truncate font-medium">{m.descricao}</p>
                    <Badge className={STATUS[m.status]?.className}>{STATUS[m.status]?.label ?? m.status}</Badge>
                    <Badge variant="outline">{TIPOS.find((t) => t.value === m.tipo)?.label ?? m.tipo}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Abertura {dataBR(m.data_abertura)}
                    {m.data_prevista ? ` • Previsão ${dataBR(m.data_prevista)}` : ''}
                    {m.data_conclusao ? ` • Conclusão ${dataBR(m.data_conclusao)}` : ''}
                    {' • '}{brl(Number(m.custo || 0))}{m.fornecedor_nome ? ` • ${m.fornecedor_nome}` : ''}
                  </p>
                  {(m.anexos ?? []).length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-2">
                      {m.anexos.map((a: any) => (
                        <button key={a.path} className="text-xs underline" onClick={() => abrirAnexo(a.path).catch(() => toast.error('Falha ao abrir.'))}>{a.nome}</button>
                      ))}
                    </div>
                  )}
                </div>
                <Button size="sm" variant="outline" onClick={() => { setForm({ ...vazio, ...m, custo: String(m.custo ?? '') }); setOpen(true); }}>Editar</Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>{form.id ? 'Editar' : 'Nova'} manutenção</DialogTitle></DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Bem *</Label>
              <Select value={form.bem_id} onValueChange={(v) => setForm({ ...form, bem_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione o bem" /></SelectTrigger>
                <SelectContent>
                  {bens.map((b) => <SelectItem key={b.id} value={b.id}>{b.numero_patrimonial} — {b.descricao}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{TIPOS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label>Situação</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{Object.entries(STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2"><Label>Descrição do serviço *</Label><Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></div>
            <div><Label>Fornecedor / oficina</Label><Input value={form.fornecedor_nome} onChange={(e) => setForm({ ...form, fornecedor_nome: e.target.value })} /></div>
            <div><Label>Custo (R$)</Label><Input type="number" step="0.01" value={form.custo} onChange={(e) => setForm({ ...form, custo: e.target.value })} /></div>
            <div><Label>Abertura</Label><Input type="date" value={form.data_abertura} onChange={(e) => setForm({ ...form, data_abertura: e.target.value })} /></div>
            <div><Label>Previsão</Label><Input type="date" value={form.data_prevista ?? ''} onChange={(e) => setForm({ ...form, data_prevista: e.target.value })} /></div>
            <div><Label>Conclusão</Label><Input type="date" value={form.data_conclusao ?? ''} onChange={(e) => setForm({ ...form, data_conclusao: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Observações</Label><Textarea rows={2} value={form.observacoes ?? ''} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} /></div>
            <div className="md:col-span-2 flex items-center justify-between rounded-md border p-3">
              <span className="text-sm">{(form.anexos ?? []).length} anexo(s)</span>
              <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}><Paperclip className="mr-1 h-4 w-4" /> Anexar</Button>
              <input ref={fileRef} type="file" multiple hidden onChange={(e) => anexar(e.target.files)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={salvar} disabled={salvando}>{salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
