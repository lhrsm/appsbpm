import { useEffect, useState } from 'react';
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
import { Plus, Loader2, FileSignature, Printer, Check } from 'lucide-react';
import { dataBR, gerarTermoPDF } from '@/lib/patrimonio';
import { usePatRefs, nomeDe } from './usePatRefs';

export default function TermosTab() {
  const refs = usePatRefs();
  const [bens, setBens] = useState<any[]>([]);
  const [termos, setTermos] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState<any>({ bem_id: '', responsavel_id: '', numero: '', conteudo: '' });

  const carregar = async () => {
    setLoading(true);
    const [b, t] = await Promise.all([
      supabase.from('pat_bens').select('id,numero_patrimonial,descricao,marca,modelo,numero_serie,valor,unidade_id,setor_id').neq('status', 'baixado').order('numero_patrimonial'),
      supabase.from('pat_termos').select('*').order('created_at', { ascending: false }),
    ]);
    setBens(b.data || []);
    setTermos(t.data || []);
    setLoading(false);
  };

  useEffect(() => { void carregar(); }, []);

  const bemDe = (id: string) => bens.find((b) => b.id === id);

  const criar = async () => {
    if (!form.bem_id) return toast.error('Selecione o bem.');
    if (!form.responsavel_id) return toast.error('Selecione o responsável.');
    setSalvando(true);
    const { data: sess } = await supabase.auth.getSession();
    const { error } = await supabase.from('pat_termos').insert({
      bem_id: form.bem_id, responsavel_id: form.responsavel_id,
      numero: form.numero || null, conteudo: form.conteudo || null,
      tipo: 'responsabilidade', criado_por: sess.session?.user.id ?? null,
    });
    setSalvando(false);
    if (error) return toast.error(error.message);
    toast.success('Termo emitido.');
    setOpen(false);
    setForm({ bem_id: '', responsavel_id: '', numero: '', conteudo: '' });
    void carregar();
  };

  const imprimir = (t: any) => {
    const b = bemDe(t.bem_id);
    if (!b) return toast.error('Bem não encontrado.');
    gerarTermoPDF({
      numero: t.numero, bem: b,
      responsavel: nomeDe(refs.responsaveis, t.responsavel_id),
      unidade: nomeDe(refs.unidades, b.unidade_id),
      setor: nomeDe(refs.setores, b.setor_id),
      observacoes: t.conteudo,
    });
  };

  const assinar = async (t: any) => {
    const { error } = await supabase.from('pat_termos')
      .update({ assinado: true, assinado_em: new Date().toISOString() }).eq('id', t.id);
    if (error) return toast.error(error.message);
    toast.success('Termo marcado como assinado.');
    void carregar();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Termos de responsabilidade emitidos para guarda e uso dos bens.</p>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="mr-1 h-4 w-4" /> Emitir termo</Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : termos.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">Nenhum termo emitido.</CardContent></Card>
      ) : (
        <div className="grid gap-2">
          {termos.map((t) => (
            <Card key={t.id}>
              <CardContent className="flex flex-wrap items-center gap-3 p-4">
                <FileSignature className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-medium">
                      {t.numero ? `Termo ${t.numero} — ` : ''}{bemDe(t.bem_id)?.numero_patrimonial ?? '—'} {bemDe(t.bem_id)?.descricao ?? ''}
                    </p>
                    {t.assinado
                      ? <Badge className="bg-green-600 text-white">Assinado</Badge>
                      : <Badge variant="outline">Aguardando assinatura</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Responsável: {nomeDe(refs.responsaveis, t.responsavel_id) ?? '—'} • Emitido em {dataBR(t.created_at)}
                    {t.assinado_em ? ` • Assinado em ${dataBR(t.assinado_em)}` : ''}
                  </p>
                </div>
                <Button size="sm" variant="outline" onClick={() => imprimir(t)}><Printer className="mr-1 h-4 w-4" /> Imprimir</Button>
                {!t.assinado && <Button size="sm" onClick={() => assinar(t)}><Check className="mr-1 h-4 w-4" /> Assinado</Button>}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Emitir termo de responsabilidade</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div>
              <Label>Bem *</Label>
              <Select value={form.bem_id} onValueChange={(v) => setForm({ ...form, bem_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione o bem" /></SelectTrigger>
                <SelectContent>
                  {bens.map((b) => <SelectItem key={b.id} value={b.id}>{b.numero_patrimonial} — {b.descricao}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Responsável *</Label>
              <Select value={form.responsavel_id} onValueChange={(v) => setForm({ ...form, responsavel_id: v })}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {refs.responsaveis.map((r) => <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Número do termo</Label><Input value={form.numero} onChange={(e) => setForm({ ...form, numero: e.target.value })} /></div>
            <div><Label>Observações do termo</Label><Textarea rows={3} value={form.conteudo} onChange={(e) => setForm({ ...form, conteudo: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={criar} disabled={salvando}>{salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Emitir</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
