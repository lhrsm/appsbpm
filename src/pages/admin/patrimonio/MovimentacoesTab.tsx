import { useEffect, useMemo, useRef, useState } from 'react';
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
import { Plus, Check, X, Paperclip, FileSignature, Loader2, FileDown } from 'lucide-react';
import {
  MOV_TIPOS, APROVACAO, dataBR, uploadAnexos, abrirAnexo, gerarTermoPDF, exportarPDF,
} from '@/lib/patrimonio';
import { usePatRefs, nomeDe } from './usePatRefs';

const vazio = {
  bem_id: '', tipo: 'transferencia', origem_unidade_id: '', origem_setor_id: '', origem_local: '',
  destino_unidade_id: '', destino_setor_id: '', destino_local: '', responsavel_anterior_id: '',
  responsavel_novo_id: '', data_movimentacao: new Date().toISOString().slice(0, 10),
  motivo: '', observacoes: '', evidencias: [] as any[],
};

export default function MovimentacoesTab() {
  const refs = usePatRefs();
  const [bens, setBens] = useState<any[]>([]);
  const [movs, setMovs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState<any>(vazio);
  const [filtro, setFiltro] = useState('todas');
  const fileRef = useRef<HTMLInputElement>(null);

  const carregar = async () => {
    setLoading(true);
    const [b, m] = await Promise.all([
      supabase.from('pat_bens').select('id,numero_patrimonial,descricao,unidade_id,setor_id,localizacao,responsavel_id,marca,modelo,numero_serie,valor').neq('status', 'baixado').order('numero_patrimonial'),
      supabase.from('pat_movimentacoes').select('*').order('created_at', { ascending: false }).limit(300),
    ]);
    setBens(b.data || []);
    setMovs(m.data || []);
    setLoading(false);
  };

  useEffect(() => { void carregar(); }, []);

  const bemDe = (id: string) => bens.find((b) => b.id === id);

  const escolherBem = (id: string) => {
    const b = bemDe(id);
    setForm((f: any) => ({
      ...f, bem_id: id,
      origem_unidade_id: b?.unidade_id ?? '', origem_setor_id: b?.setor_id ?? '',
      origem_local: b?.localizacao ?? '', responsavel_anterior_id: b?.responsavel_id ?? '',
    }));
  };

  const anexar = async (files: FileList | null) => {
    if (!files?.length) return;
    try {
      const novos = await uploadAnexos('movimentacoes', files);
      setForm((f: any) => ({ ...f, evidencias: [...f.evidencias, ...novos] }));
      toast.success('Evidência anexada.');
    } catch (e: any) { toast.error(e?.message ?? 'Falha no upload.'); }
  };

  const salvar = async () => {
    if (!form.bem_id) return toast.error('Selecione o bem.');
    if (!form.motivo.trim()) return toast.error('Informe o motivo da movimentação.');
    setSalvando(true);
    const { data: sess } = await supabase.auth.getSession();
    const { error } = await supabase.from('pat_movimentacoes').insert({
      bem_id: form.bem_id,
      tipo: form.tipo,
      origem_unidade_id: form.origem_unidade_id || null,
      origem_setor_id: form.origem_setor_id || null,
      origem_local: form.origem_local || null,
      destino_unidade_id: form.destino_unidade_id || null,
      destino_setor_id: form.destino_setor_id || null,
      destino_local: form.destino_local || null,
      responsavel_anterior_id: form.responsavel_anterior_id || null,
      responsavel_novo_id: form.responsavel_novo_id || null,
      data_movimentacao: form.data_movimentacao,
      motivo: form.motivo.trim(),
      observacoes: form.observacoes || null,
      evidencias: form.evidencias,
      criado_por: sess.session?.user.id ?? null,
      criado_por_email: sess.session?.user.email ?? null,
    });
    setSalvando(false);
    if (error) return toast.error(error.message);
    toast.success('Movimentação registrada e enviada para aprovação.');
    setOpen(false);
    setForm(vazio);
    void carregar();
  };

  const decidir = async (m: any, aprovacao: 'aprovado' | 'reprovado') => {
    if (aprovacao === 'reprovado' && !confirm('Reprovar esta movimentação?')) return;
    const { data: sess } = await supabase.auth.getSession();
    const { error } = await supabase.from('pat_movimentacoes')
      .update({ aprovacao, aprovado_por: sess.session?.user.id ?? null, aprovado_em: new Date().toISOString() })
      .eq('id', m.id);
    if (error) return toast.error(error.message);
    toast.success(aprovacao === 'aprovado' ? 'Movimentação aprovada e aplicada ao bem.' : 'Movimentação reprovada.');
    void carregar();
  };

  const gerarTermo = async (m: any) => {
    const b = bemDe(m.bem_id);
    if (!b) return toast.error('Bem não encontrado.');
    gerarTermoPDF({
      bem: b,
      responsavel: nomeDe(refs.responsaveis, m.responsavel_novo_id),
      unidade: nomeDe(refs.unidades, m.destino_unidade_id),
      setor: nomeDe(refs.setores, m.destino_setor_id),
      observacoes: m.motivo,
    });
    const { data: sess } = await supabase.auth.getSession();
    await supabase.from('pat_movimentacoes').update({ termo_gerado: true }).eq('id', m.id);
    await supabase.from('pat_termos').insert({
      bem_id: m.bem_id, movimentacao_id: m.id, responsavel_id: m.responsavel_novo_id,
      tipo: 'responsabilidade', conteudo: m.motivo, criado_por: sess.session?.user.id ?? null,
    });
    void carregar();
  };

  const filtradas = useMemo(
    () => movs.filter((m) => filtro === 'todas' || m.aprovacao === filtro),
    [movs, filtro],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={filtro} onValueChange={setFiltro}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas</SelectItem>
            <SelectItem value="pendente">Aguardando aprovação</SelectItem>
            <SelectItem value="aprovado">Aprovadas</SelectItem>
            <SelectItem value="reprovado">Reprovadas</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex gap-2">
          <Button
            size="sm" variant="outline"
            onClick={() => exportarPDF('Movimentações patrimoniais',
              ['Data', 'Bem', 'Tipo', 'Destino', 'Novo responsável', 'Situação'],
              filtradas.map((m) => [
                dataBR(m.data_movimentacao),
                bemDe(m.bem_id)?.numero_patrimonial ?? '—',
                MOV_TIPOS.find((t) => t.value === m.tipo)?.label ?? m.tipo,
                [nomeDe(refs.unidades, m.destino_unidade_id), nomeDe(refs.setores, m.destino_setor_id), m.destino_local].filter(Boolean).join(' / ') || '—',
                nomeDe(refs.responsaveis, m.responsavel_novo_id) ?? '—',
                APROVACAO[m.aprovacao].label,
              ]))}
          >
            <FileDown className="mr-1 h-4 w-4" /> PDF
          </Button>
          <Button size="sm" onClick={() => { setForm(vazio); setOpen(true); }}>
            <Plus className="mr-1 h-4 w-4" /> Nova movimentação
          </Button>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : filtradas.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">Nenhuma movimentação registrada.</CardContent></Card>
      ) : (
        <div className="grid gap-2">
          {filtradas.map((m) => {
            const b = bemDe(m.bem_id);
            return (
              <Card key={m.id}>
                <CardContent className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{MOV_TIPOS.find((t) => t.value === m.tipo)?.label}</Badge>
                      <span className="font-mono text-xs text-muted-foreground">{b?.numero_patrimonial ?? '—'}</span>
                      <p className="truncate font-medium">{b?.descricao ?? 'Bem removido da listagem'}</p>
                      <Badge className={APROVACAO[m.aprovacao].className}>{APROVACAO[m.aprovacao].label}</Badge>
                      {m.termo_gerado && <Badge variant="outline">Termo gerado</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {dataBR(m.data_movimentacao)} • De {[nomeDe(refs.unidades, m.origem_unidade_id), nomeDe(refs.setores, m.origem_setor_id), m.origem_local].filter(Boolean).join(' / ') || '—'}
                      {' → '}Para {[nomeDe(refs.unidades, m.destino_unidade_id), nomeDe(refs.setores, m.destino_setor_id), m.destino_local].filter(Boolean).join(' / ') || '—'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Responsável: {nomeDe(refs.responsaveis, m.responsavel_anterior_id) ?? '—'} → {nomeDe(refs.responsaveis, m.responsavel_novo_id) ?? '—'} • Motivo: {m.motivo}
                    </p>
                    {(m.evidencias ?? []).length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-2">
                        {m.evidencias.map((a: any) => (
                          <button key={a.path} className="text-xs underline" onClick={() => abrirAnexo(a.path).catch(() => toast.error('Falha ao abrir.'))}>
                            {a.nome}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {m.aprovacao === 'pendente' && (
                    <>
                      <Button size="sm" onClick={() => decidir(m, 'aprovado')}><Check className="mr-1 h-4 w-4" /> Aprovar</Button>
                      <Button size="sm" variant="outline" onClick={() => decidir(m, 'reprovado')}><X className="h-4 w-4" /></Button>
                    </>
                  )}
                  {m.aprovacao === 'aprovado' && (
                    <Button size="sm" variant="outline" onClick={() => gerarTermo(m)}>
                      <FileSignature className="mr-1 h-4 w-4" /> Termo
                    </Button>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] max-w-2xl overflow-y-auto">
          <DialogHeader><DialogTitle>Nova movimentação</DialogTitle></DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Bem *</Label>
              <Select value={form.bem_id} onValueChange={escolherBem}>
                <SelectTrigger><SelectValue placeholder="Selecione o bem" /></SelectTrigger>
                <SelectContent>
                  {bens.map((b) => (
                    <SelectItem key={b.id} value={b.id}>{b.numero_patrimonial} — {b.descricao}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{MOV_TIPOS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div><Label>Data</Label><Input type="date" value={form.data_movimentacao} onChange={(e) => setForm({ ...form, data_movimentacao: e.target.value })} /></div>

            <div>
              <Label>Unidade de destino</Label>
              <Select value={form.destino_unidade_id || 'nenhum'} onValueChange={(v) => setForm({ ...form, destino_unidade_id: v === 'nenhum' ? '' : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Manter atual</SelectItem>
                  {refs.unidades.map((u) => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Setor de destino</Label>
              <Select value={form.destino_setor_id || 'nenhum'} onValueChange={(v) => setForm({ ...form, destino_setor_id: v === 'nenhum' ? '' : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Manter atual</SelectItem>
                  {refs.setores.map((s) => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2"><Label>Local de destino</Label><Input value={form.destino_local} onChange={(e) => setForm({ ...form, destino_local: e.target.value })} /></div>
            <div>
              <Label>Novo responsável</Label>
              <Select value={form.responsavel_novo_id || 'nenhum'} onValueChange={(v) => setForm({ ...form, responsavel_novo_id: v === 'nenhum' ? '' : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Manter atual</SelectItem>
                  {refs.responsaveis.map((r) => <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Responsável anterior</Label>
              <Input readOnly value={nomeDe(refs.responsaveis, form.responsavel_anterior_id) ?? 'Não informado'} />
            </div>
            <div className="md:col-span-2"><Label>Motivo *</Label><Input value={form.motivo} onChange={(e) => setForm({ ...form, motivo: e.target.value })} /></div>
            <div className="md:col-span-2"><Label>Observações</Label><Textarea rows={2} value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} /></div>
            <div className="md:col-span-2">
              <div className="flex items-center justify-between">
                <Label>Evidências</Label>
                <Button size="sm" variant="outline" onClick={() => fileRef.current?.click()}><Paperclip className="mr-1 h-4 w-4" /> Anexar</Button>
              </div>
              <p className="text-xs text-muted-foreground">{form.evidencias.length} arquivo(s) anexado(s).</p>
              <input ref={fileRef} type="file" multiple hidden onChange={(e) => anexar(e.target.files)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={salvar} disabled={salvando}>
              {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Registrar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
