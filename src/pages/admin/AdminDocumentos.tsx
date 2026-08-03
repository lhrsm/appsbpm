import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Trash2, Download, FileText, FolderOpen } from 'lucide-react';

const CATEGORIA_LABEL: Record<string, string> = {
  contratual: 'Contratual',
  financeiro: 'Financeiro',
  medico: 'Médico',
  declaracao: 'Declaração',
  comprovante: 'Comprovante',
  outros: 'Outros',
};

export default function AdminDocumentos() {
  const [items, setItems] = useState<any[]>([]);
  const [associados, setAssociados] = useState<any[]>([]);
  const [dependentes, setDependentes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    associado_id: '',
    dependente_id: '',
    visibilidade: 'todos',
    categoria: 'outros',
    titulo: '',
    descricao: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const [search, setSearch] = useState('');

  const load = async () => {
    setLoading(true);
    const [{ data: docs }, { data: assocs }] = await Promise.all([
      supabase.from('documentos_associado').select('*, associados(nome, matricula)').order('publicado_em', { ascending: false }),
      supabase.from('associados').select('id, nome, matricula').order('nome'),
    ]);
    setItems(docs || []);
    setAssociados(assocs || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!form.associado_id) { setDependentes([]); return; }
    supabase.from('dependentes').select('id, nome').eq('associado_id', form.associado_id).eq('status', 'regular')
      .then(({ data }) => setDependentes(data || []));
  }, [form.associado_id]);

  const submit = async () => {
    if (!form.associado_id || !form.titulo.trim() || !file) return toast.error('Preencha associado, título e arquivo');
    setSaving(true);
    const path = `${form.associado_id}/${Date.now()}_${file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const up = await supabase.storage.from('documentos').upload(path, file, { contentType: file.type });
    if (up.error) { setSaving(false); return toast.error('Falha no upload'); }
    const { error } = await supabase.from('documentos_associado').insert({
      associado_id: form.associado_id,
      dependente_id: form.visibilidade === 'dependente' ? form.dependente_id : null,
      visibilidade: form.visibilidade,
      categoria: form.categoria,
      titulo: form.titulo.trim(),
      descricao: form.descricao.trim() || null,
      arquivo_path: path,
      arquivo_nome: file.name,
      arquivo_tipo: file.type,
      arquivo_tamanho: file.size,
    });
    setSaving(false);
    if (error) return toast.error('Erro ao salvar');
    toast.success('Documento publicado');
    setOpen(false);
    setForm({ associado_id: '', dependente_id: '', visibilidade: 'todos', categoria: 'outros', titulo: '', descricao: '' });
    setFile(null);
    load();
  };

  const remover = async (doc: any) => {
    if (!confirm('Remover este documento?')) return;
    await supabase.storage.from('documentos').remove([doc.arquivo_path]);
    await supabase.from('documentos_associado').delete().eq('id', doc.id);
    toast.success('Removido');
    load();
  };

  const baixar = async (doc: any) => {
    const { data } = await supabase.storage.from('documentos').createSignedUrl(doc.arquivo_path, 60);
    if (data?.signedUrl) window.open(data.signedUrl, '_blank');
  };

  const filtered = items.filter(d => {
    if (!search) return true;
    const q = search.toLowerCase();
    return `${d.titulo} ${d.associados?.nome || ''} ${d.associados?.matricula || ''}`.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><FolderOpen className="w-6 h-6" /> Documentos dos Associados</h1>
          <p className="text-muted-foreground text-sm">Publique contratos, declarações e comprovantes</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Novo documento</Button></DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Publicar documento</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Associado *</Label>
                <Select value={form.associado_id} onValueChange={v => setForm({ ...form, associado_id: v, dependente_id: '' })}>
                  <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                  <SelectContent>
                    {associados.map(a => <SelectItem key={a.id} value={a.id}>{a.matricula} - {a.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Visibilidade</Label>
                <Select value={form.visibilidade} onValueChange={v => setForm({ ...form, visibilidade: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos (titular + dependentes)</SelectItem>
                    <SelectItem value="titular">Apenas titular</SelectItem>
                    <SelectItem value="dependente">Dependente específico</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.visibilidade === 'dependente' && (
                <div>
                  <Label>Dependente</Label>
                  <Select value={form.dependente_id} onValueChange={v => setForm({ ...form, dependente_id: v })}>
                    <SelectTrigger><SelectValue placeholder="Selecione..." /></SelectTrigger>
                    <SelectContent>
                      {dependentes.map(d => <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label>Categoria</Label>
                <Select value={form.categoria} onValueChange={v => setForm({ ...form, categoria: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(CATEGORIA_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Título *</Label><Input value={form.titulo} onChange={e => setForm({ ...form, titulo: e.target.value })} /></div>
              <div><Label>Descrição</Label><Textarea rows={3} value={form.descricao} onChange={e => setForm({ ...form, descricao: e.target.value })} /></div>
              <div><Label>Arquivo *</Label><Input type="file" onChange={e => setFile(e.target.files?.[0] || null)} /></div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={submit} disabled={saving}>{saving ? 'Enviando...' : 'Publicar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Input placeholder="Buscar por título, nome ou matrícula..." value={search} onChange={e => setSearch(e.target.value)} />

      {loading ? <p>Carregando...</p> : (
        <div className="grid gap-3">
          {filtered.map(d => (
            <Card key={d.id}>
              <CardContent className="p-4 flex items-start justify-between gap-3 flex-wrap">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <Badge>{CATEGORIA_LABEL[d.categoria]}</Badge>
                    <Badge variant="outline">{d.visibilidade}</Badge>
                  </div>
                  <p className="font-semibold">{d.titulo}</p>
                  <p className="text-xs text-muted-foreground">
                    {d.associados?.matricula} - {d.associados?.nome} • {format(new Date(d.publicado_em), 'dd/MM/yyyy', { locale: ptBR })}
                  </p>
                  {d.descricao && <p className="text-sm mt-1">{d.descricao}</p>}
                </div>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => baixar(d)}><Download className="w-4 h-4" /></Button>
                  <Button size="sm" variant="destructive" onClick={() => remover(d)}><Trash2 className="w-4 h-4" /></Button>
                </div>
              </CardContent>
            </Card>
          ))}
          {filtered.length === 0 && <p className="text-muted-foreground text-center py-8">Nenhum documento publicado.</p>}
        </div>
      )}
    </div>
  );
}
