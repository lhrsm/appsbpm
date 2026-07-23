import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Ticket, MessageSquare, Filter, LayoutGrid, List, Sparkles, Plus, Pencil, Trash2 } from 'lucide-react';

const STATUS_ORDER = ['aberto', 'em_andamento', 'concluido', 'cancelado'] as const;
type Status = typeof STATUS_ORDER[number];

const STATUS_META: Record<Status, { label: string; color: string; column: string }> = {
  aberto: { label: 'Aberto', color: 'bg-blue-500', column: 'border-blue-500' },
  em_andamento: { label: 'Em andamento', color: 'bg-yellow-500', column: 'border-yellow-500' },
  concluido: { label: 'Concluído', color: 'bg-green-600', column: 'border-green-600' },
  cancelado: { label: 'Cancelado', color: 'bg-gray-500', column: 'border-gray-500' },
};

const CATEGORIA_LABEL: Record<string, string> = {
  segunda_via_carteirinha: '2ª via de carteirinha',
  alteracao_cadastral: 'Alteração cadastral',
  duvida: 'Dúvida geral',
  financeiro: 'Financeiro',
  atendimento_medico: 'Atendimento médico',
  reclamacao: 'Reclamação',
  sugestao: 'Sugestão',
  outro: 'Outro',
};

type Template = {
  id: string;
  categoria: string | null;
  titulo: string;
  conteudo: string;
  ativo: boolean;
};

export default function AdminSolicitacoes() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('todos');
  const [categoriaFilter, setCategoriaFilter] = useState('todos');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [resposta, setResposta] = useState('');
  const [novoStatus, setNovoStatus] = useState<Status>('em_andamento');
  const [saving, setSaving] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [manageOpen, setManageOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    const [{ data: s }, { data: t }] = await Promise.all([
      supabase.from('solicitacoes').select('*, associados(nome, matricula)').order('created_at', { ascending: false }),
      supabase.from('resposta_templates').select('*').order('titulo'),
    ]);
    setItems(s || []);
    setTemplates((t as Template[]) || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const openResponse = (s: any) => {
    setSelected(s);
    setResposta(s.resposta || '');
    setNovoStatus(s.status === 'aberto' ? 'em_andamento' : s.status);
  };

  const salvar = async () => {
    if (!selected) return;
    setSaving(true);
    const { data: sess } = await supabase.auth.getSession();
    const { error } = await supabase.from('solicitacoes').update({
      resposta: resposta || null,
      status: novoStatus,
      respondido_por: sess.session?.user.id || null,
      respondido_em: resposta ? new Date().toISOString() : null,
    }).eq('id', selected.id);
    setSaving(false);
    if (error) return toast.error('Erro ao salvar');
    toast.success('Solicitação atualizada');
    setSelected(null);
    load();
  };

  const moveStatus = async (id: string, next: Status) => {
    const prev = items;
    setItems((cur) => cur.map((i) => (i.id === id ? { ...i, status: next } : i)));
    const { error } = await supabase.from('solicitacoes').update({ status: next }).eq('id', id);
    if (error) {
      setItems(prev);
      toast.error('Não foi possível mover');
    } else {
      toast.success(`Movido para ${STATUS_META[next].label}`);
    }
  };

  const filtered = items.filter((s) => {
    if (statusFilter !== 'todos' && s.status !== statusFilter) return false;
    if (categoriaFilter !== 'todos' && s.categoria !== categoriaFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${s.assunto} ${s.solicitante_nome} ${s.associados?.matricula || ''}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const stats = {
    abertos: items.filter((i) => i.status === 'aberto').length,
    andamento: items.filter((i) => i.status === 'em_andamento').length,
    concluidos: items.filter((i) => i.status === 'concluido').length,
    vencidos: items.filter((i) => i.sla_prazo && i.status !== 'concluido' && new Date(i.sla_prazo) < new Date()).length,
  };

  const templatesDaCategoria = useMemo(() => {
    if (!selected) return [] as Template[];
    return templates.filter((t) => t.ativo && (!t.categoria || t.categoria === selected.categoria));
  }, [templates, selected]);

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Ticket className="w-6 h-6" /> Solicitações / Chamados</h1>
          <p className="text-muted-foreground text-sm">Atenda as solicitações abertas pelos associados e dependentes</p>
        </div>
        <Button variant="outline" onClick={() => setManageOpen(true)}>
          <Sparkles className="w-4 h-4 mr-2" /> Templates de resposta
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Abertos</p><p className="text-2xl font-bold text-blue-600">{stats.abertos}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Em andamento</p><p className="text-2xl font-bold text-yellow-600">{stats.andamento}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Concluídos</p><p className="text-2xl font-bold text-green-600">{stats.concluidos}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">SLA vencido</p><p className="text-2xl font-bold text-red-600">{stats.vencidos}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><Filter className="w-4 h-4" /> Filtros</CardTitle></CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-3">
          <Input placeholder="Buscar por assunto, nome ou matrícula..." value={search} onChange={(e) => setSearch(e.target.value)} />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              {STATUS_ORDER.map((k) => <SelectItem key={k} value={k}>{STATUS_META[k].label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={categoriaFilter} onValueChange={setCategoriaFilter}>
            <SelectTrigger><SelectValue placeholder="Categoria" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as categorias</SelectItem>
              {Object.entries(CATEGORIA_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Tabs defaultValue="kanban">
        <TabsList>
          <TabsTrigger value="kanban"><LayoutGrid className="w-4 h-4 mr-2" /> Kanban</TabsTrigger>
          <TabsTrigger value="lista"><List className="w-4 h-4 mr-2" /> Lista</TabsTrigger>
        </TabsList>

        <TabsContent value="kanban" className="mt-4">
          {loading ? <p>Carregando...</p> : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {STATUS_ORDER.map((col) => {
                const list = filtered.filter((s) => s.status === col);
                return (
                  <div
                    key={col}
                    className={`rounded-lg border-t-4 ${STATUS_META[col].column} bg-muted/40 p-2 min-h-[300px]`}
                    onDragOver={(e) => { e.preventDefault(); }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const id = dragId || e.dataTransfer.getData('text/plain');
                      if (id) moveStatus(id, col);
                      setDragId(null);
                    }}
                  >
                    <div className="flex items-center justify-between px-2 pb-2">
                      <p className="font-semibold text-sm">{STATUS_META[col].label}</p>
                      <Badge variant="secondary">{list.length}</Badge>
                    </div>
                    <div className="space-y-2">
                      {list.map((s) => {
                        const atrasado = s.sla_prazo && s.status !== 'concluido' && new Date(s.sla_prazo) < new Date();
                        return (
                          <div
                            key={s.id}
                            draggable
                            onDragStart={(e) => { setDragId(s.id); e.dataTransfer.setData('text/plain', s.id); e.dataTransfer.effectAllowed = 'move'; }}
                            onDragEnd={() => setDragId(null)}
                            onClick={() => openResponse(s)}
                            className="bg-card border rounded-md p-3 cursor-grab active:cursor-grabbing hover:shadow-md transition"
                          >
                            <p className="text-sm font-medium line-clamp-2">{s.assunto}</p>
                            <p className="text-[11px] text-muted-foreground mt-1 truncate">
                              {s.solicitante_nome} • {CATEGORIA_LABEL[s.categoria] || s.categoria}
                            </p>
                            <div className="flex items-center gap-1 mt-2 flex-wrap">
                              {s.prioridade && s.prioridade !== 'normal' && (
                                <Badge variant="outline" className="text-[10px] py-0">{s.prioridade}</Badge>
                              )}
                              {atrasado && <Badge variant="destructive" className="text-[10px] py-0">Vencido</Badge>}
                              <span className="text-[10px] text-muted-foreground ml-auto">
                                {format(new Date(s.created_at), 'dd/MM', { locale: ptBR })}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                      {list.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-6">Solte aqui</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="lista" className="mt-4">
          {loading ? <p>Carregando...</p> : (
            <div className="grid gap-3">
              {filtered.map((s) => {
                const meta = STATUS_META[s.status as Status] || STATUS_META.aberto;
                const atrasado = s.sla_prazo && s.status !== 'concluido' && new Date(s.sla_prazo) < new Date();
                return (
                  <Card key={s.id} className="hover:shadow-md transition cursor-pointer" onClick={() => openResponse(s)}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-3 flex-wrap">
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold">{s.assunto}</p>
                          <p className="text-xs text-muted-foreground">
                            {s.solicitante_nome} ({s.solicitante_tipo}) • Matr. {s.associados?.matricula} • {CATEGORIA_LABEL[s.categoria]}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Aberto em {format(new Date(s.created_at), 'dd/MM/yyyy HH:mm', { locale: ptBR })}
                            {s.sla_prazo && ` • SLA: ${format(new Date(s.sla_prazo), 'dd/MM/yyyy', { locale: ptBR })}`}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-wrap">
                          <Badge className={`${meta.color} text-white`}>{meta.label}</Badge>
                          {s.prioridade !== 'normal' && <Badge variant="outline">{s.prioridade}</Badge>}
                          {atrasado && <Badge variant="destructive">Vencido</Badge>}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              {filtered.length === 0 && <p className="text-muted-foreground text-center py-8">Nenhuma solicitação encontrada.</p>}
            </div>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{selected?.assunto}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">
                {selected.solicitante_nome} • {CATEGORIA_LABEL[selected.categoria]} • #{selected.id.slice(0, 8)}
              </div>
              <div className="bg-muted p-3 rounded whitespace-pre-wrap text-sm">{selected.descricao}</div>
              <div>
                <Label>Status</Label>
                <Select value={novoStatus} onValueChange={(v) => setNovoStatus(v as Status)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_ORDER.map((k) => <SelectItem key={k} value={k}>{STATUS_META[k].label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              {templatesDaCategoria.length > 0 && (
                <div>
                  <Label className="flex items-center gap-1 mb-1"><Sparkles className="w-3.5 h-3.5" /> Aplicar template</Label>
                  <Select onValueChange={(id) => {
                    const t = templates.find((x) => x.id === id);
                    if (t) setResposta(t.conteudo);
                  }}>
                    <SelectTrigger><SelectValue placeholder="Selecione um template..." /></SelectTrigger>
                    <SelectContent>
                      {templatesDaCategoria.map((t) => (
                        <SelectItem key={t.id} value={t.id}>{t.titulo}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div>
                <Label className="flex items-center gap-1"><MessageSquare className="w-4 h-4" /> Resposta ao associado</Label>
                <Textarea rows={6} value={resposta} onChange={(e) => setResposta(e.target.value)} placeholder="Escreva a resposta..." />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Fechar</Button>
            <Button onClick={salvar} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <TemplatesDialog
        open={manageOpen}
        onOpenChange={setManageOpen}
        templates={templates}
        onChanged={load}
      />
    </div>
  );
}

function TemplatesDialog({ open, onOpenChange, templates, onChanged }: {
  open: boolean; onOpenChange: (o: boolean) => void; templates: Template[]; onChanged: () => void;
}) {
  const [editing, setEditing] = useState<Partial<Template> | null>(null);
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!editing?.titulo || !editing?.conteudo) return toast.error('Preencha título e conteúdo');
    setSaving(true);
    const payload = {
      titulo: editing.titulo,
      conteudo: editing.conteudo,
      categoria: editing.categoria || null,
      ativo: editing.ativo ?? true,
    };
    const { error } = editing.id
      ? await supabase.from('resposta_templates').update(payload).eq('id', editing.id)
      : await supabase.from('resposta_templates').insert(payload);
    setSaving(false);
    if (error) return toast.error('Erro ao salvar');
    toast.success('Template salvo');
    setEditing(null);
    onChanged();
  };

  const remove = async (id: string) => {
    if (!confirm('Excluir este template?')) return;
    const { error } = await supabase.from('resposta_templates').delete().eq('id', id);
    if (error) return toast.error('Erro ao excluir');
    toast.success('Template excluído');
    onChanged();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Sparkles className="w-5 h-5" /> Templates de resposta</DialogTitle>
        </DialogHeader>

        {!editing ? (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => setEditing({ ativo: true })}>
                <Plus className="w-4 h-4 mr-1" /> Novo template
              </Button>
            </div>
            <div className="space-y-2 max-h-[60vh] overflow-y-auto">
              {templates.map((t) => (
                <div key={t.id} className="border rounded-md p-3 flex items-start gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{t.titulo}</p>
                      {t.categoria && <Badge variant="outline" className="text-[10px]">{CATEGORIA_LABEL[t.categoria] || t.categoria}</Badge>}
                      {!t.ativo && <Badge variant="secondary" className="text-[10px]">inativo</Badge>}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{t.conteudo}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => setEditing(t)}><Pencil className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => remove(t.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
              {templates.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">Nenhum template ainda.</p>}
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label>Título</Label>
              <Input value={editing.titulo || ''} onChange={(e) => setEditing({ ...editing, titulo: e.target.value })} />
            </div>
            <div>
              <Label>Categoria (opcional — restringe onde o template aparece)</Label>
              <Select value={editing.categoria || 'todas'} onValueChange={(v) => setEditing({ ...editing, categoria: v === 'todas' ? null : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as categorias</SelectItem>
                  {Object.entries(CATEGORIA_LABEL).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Conteúdo</Label>
              <Textarea rows={6} value={editing.conteudo || ''} onChange={(e) => setEditing({ ...editing, conteudo: e.target.value })} />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={editing.ativo ?? true} onCheckedChange={(v) => setEditing({ ...editing, ativo: v })} />
              <Label>Ativo</Label>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)}>Voltar</Button>
              <Button onClick={save} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
            </DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
