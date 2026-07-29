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
import { Plus, Loader2, Paperclip, Check, X, FileDown, ArchiveX } from 'lucide-react';
import { APROVACAO, MOTIVOS_BAIXA, brl, dataBR, uploadAnexos, abrirAnexo, exportarPDF } from '@/lib/patrimonio';

const vazio = {
  bem_id: '', motivo: MOTIVOS_BAIXA[0], justificativa: '', valor_residual: '',
  data_baixa: new Date().toISOString().slice(0, 10), documentos: [] as any[],
};

export default function BaixasTab() {
  const [bens, setBens] = useState<any[]>([]);
  const [baixas, setBaixas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState<any>(vazio);
  const fileRef = useRef<HTMLInputElement>(null);

  const carregar = async () => {
    setLoading(true);
    const [b, x] = await Promise.all([
      supabase.from('pat_bens').select('id,numero_patrimonial,descricao,valor,status').order('numero_patrimonial'),
      supabase.from('pat_baixas').select('*').order('created_at', { ascending: false }),
    ]);
    setBens(b.data || []);
    setBaixas(x.data || []);
    setLoading(false);
  };

  useEffect(() => { void carregar(); }, []);

  const bemDe = (id: string) => bens.find((b) => b.id === id);

  const anexar = async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      const novos = await uploadAnexos('baixas', files);
      setForm((f: any) => ({ ...f, documentos: [...f.documentos, ...novos] }));
      toast.success('Documento anexado.');
    } catch (e: any) { toast.error(e?.message ?? 'Falha no upload.'); }
  };

  const salvar = async () => {
    if (!form.bem_id) return toast.error('Selecione o bem.');
    if (form.justificativa.trim().length < 10) return toast.error('Descreva a justificativa (mínimo de 10 caracteres).');
    setSalvando(true);
    const { data: sess } = await supabase.auth.getSession();
    const { error } = await supabase.from('pat_baixas').insert({
      bem_id: form.bem_id, motivo: form.motivo, justificativa: form.justificativa.trim(),
      valor_residual: Number(form.valor_residual || 0), data_baixa: form.data_baixa,
      documentos: form.documentos,
      criado_por: sess.session?.user.id ?? null,
      criado_por_email: sess.session?.user.email ?? null,
    });
    setSalvando(false);
    if (error) return toast.error(error.message);
    toast.success('Baixa registrada e enviada para aprovação.');
    setOpen(false);
    setForm(vazio);
    void carregar();
  };

  const decidir = async (b: any, aprovacao: 'aprovado' | 'reprovado') => {
    if (aprovacao === 'aprovado' && !confirm('Aprovar a baixa? O bem passará à situação "Baixado" e não poderá mais ser movimentado.')) return;
    const { data: sess } = await supabase.auth.getSession();
    const { error } = await supabase.from('pat_baixas')
      .update({ aprovacao, aprovado_por: sess.session?.user.id ?? null, aprovado_em: new Date().toISOString() })
      .eq('id', b.id);
    if (error) return toast.error(error.message);
    toast.success(aprovacao === 'aprovado' ? 'Baixa aprovada.' : 'Baixa reprovada.');
    void carregar();
  };

  return (
    <div className="space-y-4">
      <Card className="border-primary/30 bg-primary/5">
        <CardContent className="p-4 text-sm">
          Bens com histórico nunca são excluídos do sistema. A retirada do patrimônio é feita por
          <strong> baixa patrimonial</strong>, sempre com motivo, justificativa, documentação e aprovação.
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <Button size="sm" variant="outline" onClick={() => exportarPDF('Baixas patrimoniais',
          ['Data', 'Bem', 'Motivo', 'Valor residual', 'Situação'],
          baixas.map((b) => [dataBR(b.data_baixa), bemDe(b.bem_id)?.numero_patrimonial ?? '—', b.motivo,
            brl(Number(b.valor_residual || 0)), APROVACAO[b.aprovacao].label]))}>
          <FileDown className="mr-1 h-4 w-4" /> PDF
        </Button>
        <Button size="sm" onClick={() => { setForm(vazio); setOpen(true); }}><Plus className="mr-1 h-4 w-4" /> Nova baixa</Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : baixas.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">Nenhuma baixa registrada.</CardContent></Card>
      ) : (
        <div className="grid gap-2">
          {baixas.map((b) => (
            <Card key={b.id}>
              <CardContent className="flex flex-wrap items-center gap-3 p-4">
                <ArchiveX className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{bemDe(b.bem_id)?.numero_patrimonial ?? '—'}</span>
                    <p className="truncate font-medium">{bemDe(b.bem_id)?.descricao ?? '—'}</p>
                    <Badge variant="outline">{b.motivo}</Badge>
                    <Badge className={APROVACAO[b.aprovacao].className}>{APROVACAO[b.aprovacao].label}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {dataBR(b.data_baixa)} • Valor residual {brl(Number(b.valor_residual || 0))} • {b.justificativa}
                  </p>
                  {(b.documentos ?? []).length > 0 && (
                    <div className="mt-1 flex flex-wrap gap-2">
                      {b.documentos.map((a: any) => (
                        <button key={a.path} className="text-xs underline" onClick={() => abrirAnexo(a.path).catch(() => toast.error('Falha ao abrir.'))}>{a.nome}</button>
                      ))}
                    </div>
                  )}
                </div>
                {b.aprovacao === 'pendente' && (
                  <>
                    <Button size="sm" onClick={() => decidir(b, 'aprovado')}><Check className="mr-1 h-4 w-4" /> Aprovar</Button>
                    <Button size="sm" variant="outline" onClick={() => decidir(b, 'reprovado')}><X className="h-4 w-4" /></Button>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader><DialogTitle>Nova baixa patrimonial</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label>Bem *</Label>
              <Select value={form.bem_id} onValueChange={(v) => setForm({ ...form, bem_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione o bem" /></SelectTrigger>
                <SelectContent>
                  {bens.filter((b) => b.status !== 'baixado').map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.numero_patrimonial} — {b.descricao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Motivo *</Label>
              <Select value={form.motivo} onValueChange={(v) => setForm({ ...form, motivo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{MOTIVOS_BAIXA.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Justificativa *</Label><Textarea rows={3} value={form.justificativa} onChange={(e) => setForm({ ...form, justificativa: e.target.value })} /></div>
            <div className="grid gap-3 md:grid-cols-2">
              <div><Label>Data da baixa</Label><Input type="date" value={form.data_baixa} onChange={(e) => setForm({ ...form, data_baixa: e.target.value })} /></div>
              <div><Label>Valor residual (R$)</Label><Input type="number" step="0.01" value={form.valor_residual} onChange={(e) => setForm({ ...form, valor_residual: e.target.value })} /></div>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="text-sm">{form.documentos.length} documento(s)</span>
              <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}><Paperclip className="mr-1 h-4 w-4" /> Anexar</Button>
              <input ref={fileRef} type="file" multiple hidden onChange={(e) => anexar(e.target.files)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={salvar} disabled={salvando}>{salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Registrar baixa</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
