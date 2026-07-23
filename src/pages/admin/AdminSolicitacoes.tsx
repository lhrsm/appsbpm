import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Ticket, MessageSquare, Filter } from 'lucide-react';

const STATUS_META: Record<string, { label: string; color: string }> = {
  aberto: { label: 'Aberto', color: 'bg-blue-500' },
  em_andamento: { label: 'Em andamento', color: 'bg-yellow-500' },
  concluido: { label: 'Concluído', color: 'bg-green-600' },
  cancelado: { label: 'Cancelado', color: 'bg-gray-500' },
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

export default function AdminSolicitacoes() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('todos');
  const [categoriaFilter, setCategoriaFilter] = useState('todos');
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<any>(null);
  const [resposta, setResposta] = useState('');
  const [novoStatus, setNovoStatus] = useState('em_andamento');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('solicitacoes')
      .select('*, associados(nome, matricula)')
      .order('created_at', { ascending: false });
    setItems(data || []);
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

  const filtered = items.filter(s => {
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
    abertos: items.filter(i => i.status === 'aberto').length,
    andamento: items.filter(i => i.status === 'em_andamento').length,
    concluidos: items.filter(i => i.status === 'concluido').length,
    vencidos: items.filter(i => i.sla_prazo && i.status !== 'concluido' && new Date(i.sla_prazo) < new Date()).length,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Ticket className="w-6 h-6" /> Solicitações / Chamados</h1>
        <p className="text-muted-foreground text-sm">Atenda as solicitações abertas pelos associados e dependentes</p>
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
          <Input placeholder="Buscar por assunto, nome ou matrícula..." value={search} onChange={e => setSearch(e.target.value)} />
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              {Object.entries(STATUS_META).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
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

      {loading ? <p>Carregando...</p> : (
        <div className="grid gap-3">
          {filtered.map(s => {
            const meta = STATUS_META[s.status] || STATUS_META.aberto;
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
                        Aberto em {format(new Date(s.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
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

      <Dialog open={!!selected} onOpenChange={o => !o && setSelected(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{selected?.assunto}</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3">
              <div className="text-xs text-muted-foreground">
                {selected.solicitante_nome} • {CATEGORIA_LABEL[selected.categoria]} • #{selected.id.slice(0, 8)}
              </div>
              <div className="bg-muted p-3 rounded whitespace-pre-wrap text-sm">{selected.descricao}</div>
              <div>
                <label className="text-sm font-medium">Status</label>
                <Select value={novoStatus} onValueChange={setNovoStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_META).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium flex items-center gap-1"><MessageSquare className="w-4 h-4" /> Resposta ao associado</label>
                <Textarea rows={6} value={resposta} onChange={e => setResposta(e.target.value)} placeholder="Escreva a resposta..." />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Fechar</Button>
            <Button onClick={salvar} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
