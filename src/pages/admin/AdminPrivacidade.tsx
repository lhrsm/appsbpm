import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ShieldCheck, Search, Download, Clock, CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

const TIPO_META: Record<string, string> = {
  acesso: 'Acesso aos dados',
  correcao: 'Correção',
  exclusao: 'Exclusão',
  portabilidade: 'Portabilidade',
  revogacao: 'Revogação de consentimento',
  oposicao: 'Oposição ao tratamento',
  outros: 'Outros',
};

const STATUS_META: Record<string, { label: string; color: string; icon: any }> = {
  pendente: { label: 'Pendente', color: 'bg-yellow-500', icon: Clock },
  em_analise: { label: 'Em análise', color: 'bg-blue-600', icon: AlertTriangle },
  concluida: { label: 'Concluída', color: 'bg-green-600', icon: CheckCircle2 },
  rejeitada: { label: 'Rejeitada', color: 'bg-red-600', icon: XCircle },
};

const SLA_DIAS = 15;

export default function AdminPrivacidade() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusF, setStatusF] = useState('todos');
  const [tipoF, setTipoF] = useState('todos');
  const [current, setCurrent] = useState<any>(null);
  const [resposta, setResposta] = useState('');
  const [novoStatus, setNovoStatus] = useState('em_analise');
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('solicitacoes_privacidade')
      .select('*, associados(nome, matricula), dependentes(nome)')
      .order('created_at', { ascending: false });
    if (error) toast.error('Erro ao carregar solicitações');
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const abrir = (s: any) => {
    setCurrent(s);
    setResposta(s.resposta || '');
    setNovoStatus(s.status === 'pendente' ? 'em_analise' : s.status);
  };

  const salvar = async () => {
    if (!current) return;
    setSaving(true);
    const { error } = await supabase
      .from('solicitacoes_privacidade')
      .update({ status: novoStatus, resposta: resposta || null })
      .eq('id', current.id);
    setSaving(false);
    if (error) return toast.error('Erro ao salvar');
    toast.success('Solicitação atualizada');
    setCurrent(null);
    load();
  };

  const exportCSV = () => {
    const rows = [['Data', 'Tipo', 'Status', 'Solicitante', 'Documento', 'E-mail', 'Associado', 'Matrícula', 'Descrição', 'Resposta']];
    filtered.forEach((s) => rows.push([
      format(parseISO(s.created_at), 'dd/MM/yyyy HH:mm'),
      TIPO_META[s.tipo] || s.tipo,
      STATUS_META[s.status]?.label || s.status,
      s.solicitante_nome || '',
      s.solicitante_documento || '',
      s.solicitante_email || '',
      s.associados?.nome || '',
      s.associados?.matricula || '',
      (s.descricao || '').replace(/\n/g, ' '),
      (s.resposta || '').replace(/\n/g, ' '),
    ]));
    const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(';')).join('\n');
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lgpd_solicitacoes_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filtered = items.filter((s) => {
    if (statusF !== 'todos' && s.status !== statusF) return false;
    if (tipoF !== 'todos' && s.tipo !== tipoF) return false;
    if (search) {
      const q = search.toLowerCase();
      const hay = `${s.solicitante_nome} ${s.solicitante_email} ${s.solicitante_documento} ${s.associados?.nome} ${s.associados?.matricula} ${s.descricao}`.toLowerCase();
      if (!hay.includes(q)) return false;
    }
    return true;
  });

  const stats = useMemo(() => ({
    total: items.length,
    pendentes: items.filter((i) => i.status === 'pendente' || i.status === 'em_analise').length,
    concluidas: items.filter((i) => i.status === 'concluida').length,
    vencidas: items.filter((i) => (i.status === 'pendente' || i.status === 'em_analise') && differenceInDays(new Date(), parseISO(i.created_at)) > SLA_DIAS).length,
  }), [items]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><ShieldCheck className="w-6 h-6" /> Privacidade & LGPD</h1>
          <p className="text-muted-foreground text-sm">Gestão de solicitações do titular dos dados (SLA de {SLA_DIAS} dias)</p>
        </div>
        <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-2" /> CSV</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total</p><p className="text-xl font-bold">{stats.total}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Em aberto</p><p className="text-xl font-bold text-yellow-600">{stats.pendentes}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Concluídas</p><p className="text-xl font-bold text-green-600">{stats.concluidas}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">SLA vencido</p><p className="text-xl font-bold text-red-600">{stats.vencidas}</p></CardContent></Card>
      </div>

      <Card><CardContent className="p-4 grid md:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input placeholder="Buscar nome, e-mail, CPF, matrícula..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={statusF} onValueChange={setStatusF}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os status</SelectItem>
            {Object.entries(STATUS_META).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={tipoF} onValueChange={setTipoF}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os tipos</SelectItem>
            {Object.entries(TIPO_META).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}
          </SelectContent>
        </Select>
      </CardContent></Card>

      {loading ? <p>Carregando...</p> : (
        <div className="grid gap-2">
          {filtered.map((s) => {
            const meta = STATUS_META[s.status] || STATUS_META.pendente;
            const Icon = meta.icon;
            const dias = differenceInDays(new Date(), parseISO(s.created_at));
            const vencido = (s.status === 'pendente' || s.status === 'em_analise') && dias > SLA_DIAS;
            return (
              <Card key={s.id} className={vencido ? 'border-red-500' : ''}>
                <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap cursor-pointer" onClick={() => abrir(s)}>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`${meta.color} text-white`}><Icon className="w-3 h-3 mr-1" />{meta.label}</Badge>
                      <Badge variant="outline">{TIPO_META[s.tipo] || s.tipo}</Badge>
                      {vencido && <Badge className="bg-red-600 text-white">SLA vencido ({dias}d)</Badge>}
                    </div>
                    <p className="font-semibold mt-1">{s.solicitante_nome}</p>
                    <p className="text-xs text-muted-foreground">
                      {s.solicitante_email} • {s.solicitante_documento}
                      {s.associados && ` • ${s.associados.matricula} - ${s.associados.nome}`}
                    </p>
                    <p className="text-sm mt-1 line-clamp-2">{s.descricao}</p>
                  </div>
                  <div className="text-right text-xs text-muted-foreground">
                    {format(parseISO(s.created_at), 'dd/MM/yyyy HH:mm')}
                  </div>
                </CardContent>
              </Card>
            );
          })}
          {filtered.length === 0 && <p className="text-muted-foreground text-center py-8">Nenhuma solicitação.</p>}
        </div>
      )}

      <Dialog open={!!current} onOpenChange={(o) => !o && setCurrent(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Solicitação LGPD</DialogTitle></DialogHeader>
          {current && (
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Tipo:</span> <strong>{TIPO_META[current.tipo] || current.tipo}</strong></div>
                <div><span className="text-muted-foreground">Data:</span> <strong>{format(parseISO(current.created_at), 'dd/MM/yyyy HH:mm')}</strong></div>
                <div className="col-span-2"><span className="text-muted-foreground">Solicitante:</span> <strong>{current.solicitante_nome}</strong></div>
                <div><span className="text-muted-foreground">Documento:</span> {current.solicitante_documento}</div>
                <div><span className="text-muted-foreground">E-mail:</span> {current.solicitante_email}</div>
                {current.associados && (
                  <div className="col-span-2"><span className="text-muted-foreground">Associado:</span> {current.associados.matricula} - {current.associados.nome}</div>
                )}
                {current.ip && <div className="col-span-2"><span className="text-muted-foreground">IP:</span> <code className="text-xs">{current.ip}</code></div>}
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Descrição</p>
                <p className="text-sm bg-muted p-3 rounded whitespace-pre-wrap">{current.descricao}</p>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Status</p>
                <Select value={novoStatus} onValueChange={setNovoStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_META).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <p className="text-sm font-medium mb-1">Resposta ao titular</p>
                <Textarea rows={5} value={resposta} onChange={(e) => setResposta(e.target.value)} placeholder="Descreva as ações tomadas..." />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setCurrent(null)}>Fechar</Button>
            <Button onClick={salvar} disabled={saving}>{saving ? 'Salvando...' : 'Salvar'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
