import { useEffect, useState } from 'react';
import { useAssociado } from '@/contexts/AssociadoContext';
import { portalCall } from '@/lib/portal';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Plus, Ticket, Clock, CheckCircle2, AlertCircle, MessageSquare } from 'lucide-react';
import PageSkeleton from '@/components/PageSkeleton';

const CATEGORIAS = [
  { value: 'segunda_via_carteirinha', label: '2ª via de carteirinha', sla: 3 },
  { value: 'alteracao_cadastral', label: 'Alteração cadastral', sla: 5 },
  { value: 'duvida', label: 'Dúvida geral', sla: 2 },
  { value: 'financeiro', label: 'Financeiro / Mensalidade', sla: 5 },
  { value: 'atendimento_medico', label: 'Atendimento médico', sla: 3 },
  { value: 'reclamacao', label: 'Reclamação', sla: 7 },
  { value: 'sugestao', label: 'Sugestão', sla: 10 },
  { value: 'outro', label: 'Outro', sla: 5 },
];

const STATUS_META: Record<string, { label: string; color: string; icon: any }> = {
  aberto: { label: 'Aberto', color: 'bg-blue-500', icon: AlertCircle },
  em_andamento: { label: 'Em andamento', color: 'bg-yellow-500', icon: Clock },
  concluido: { label: 'Concluído', color: 'bg-green-600', icon: CheckCircle2 },
  cancelado: { label: 'Cancelado', color: 'bg-gray-500', icon: AlertCircle },
};

interface Solicitacao {
  id: string;
  categoria: string;
  assunto: string;
  descricao: string;
  status: string;
  prioridade: string;
  sla_prazo: string | null;
  resposta: string | null;
  respondido_em: string | null;
  created_at: string;
  solicitante_nome: string;
}

export default function Solicitacoes() {
  const { associado, isDependente, dependenteLogado } = useAssociado();
  const [items, setItems] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const [categoria, setCategoria] = useState('duvida');
  const [assunto, setAssunto] = useState('');
  const [descricao, setDescricao] = useState('');
  const [prioridade, setPrioridade] = useState('normal');

  const load = async () => {
    if (!associado) return;
    setLoading(true);
    const { itens } = await portalCall<{ itens: any[] }>('solicitacoes_listar').catch(() => ({ itens: [] }));
    setItems((itens as any) || []);
    setLoading(false);

  };

  useEffect(() => { load(); }, [associado?.id]);

  const submit = async () => {
    if (!associado || !assunto.trim() || !descricao.trim()) {
      toast.error('Preencha assunto e descrição');
      return;
    }
    setSaving(true);
    const cat = CATEGORIAS.find(c => c.value === categoria)!;
    const sla = new Date();
    sla.setDate(sla.getDate() + cat.sla);
    try {
      await portalCall('solicitacoes_criar', {
        categoria,
        assunto: assunto.trim(),
        descricao: descricao.trim(),
        prioridade,
        sla_prazo: sla.toISOString(),
      });
    } catch {
      setSaving(false);
      return toast.error('Erro ao abrir solicitação');
    }
    setSaving(false);

    toast.success('Solicitação enviada com sucesso!');
    setOpen(false);
    setAssunto(''); setDescricao(''); setCategoria('duvida'); setPrioridade('normal');
    load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Ticket className="w-6 h-6 text-primary" /> Minhas Solicitações</h1>
          <p className="text-muted-foreground text-sm">Abra chamados e acompanhe respostas do SBPM</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" /> Nova solicitação</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>Nova solicitação</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Categoria</Label>
                <Select value={categoria} onValueChange={setCategoria}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIAS.map(c => <SelectItem key={c.value} value={c.value}>{c.label} (SLA {c.sla}d)</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Prioridade</Label>
                <Select value={prioridade} onValueChange={setPrioridade}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="baixa">Baixa</SelectItem>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="alta">Alta</SelectItem>
                    <SelectItem value="urgente">Urgente</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Assunto</Label>
                <Input value={assunto} onChange={e => setAssunto(e.target.value)} maxLength={120} placeholder="Ex: Solicitar 2ª via da carteirinha" />
              </div>
              <div>
                <Label>Descrição</Label>
                <Textarea value={descricao} onChange={e => setDescricao(e.target.value)} rows={5} placeholder="Descreva sua solicitação com detalhes" />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={submit} disabled={saving}>{saving ? 'Enviando...' : 'Enviar'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {loading ? (
        <PageSkeleton rows={4} variant="list" showHeader={false} />
      ) : items.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">
          <Ticket className="w-10 h-10 mx-auto mb-2 opacity-40" />
          Você ainda não abriu nenhuma solicitação.
        </CardContent></Card>
      ) : (
        <div className="grid gap-3">
          {items.map(s => {
            const meta = STATUS_META[s.status] || STATUS_META.aberto;
            const Icon = meta.icon;
            const cat = CATEGORIAS.find(c => c.value === s.categoria);
            const atrasado = s.sla_prazo && s.status !== 'concluido' && new Date(s.sla_prazo) < new Date();
            return (
              <Card key={s.id} className="hover:shadow-md transition">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <CardTitle className="text-base">{s.assunto}</CardTitle>
                      <p className="text-xs text-muted-foreground mt-1">
                        {cat?.label} • #{s.id.slice(0, 8)} • {format(new Date(s.created_at), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Badge className={`${meta.color} text-white`}><Icon className="w-3 h-3 mr-1" />{meta.label}</Badge>
                      {atrasado && <Badge variant="destructive">SLA vencido</Badge>}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="text-sm space-y-2">
                  <p className="whitespace-pre-wrap">{s.descricao}</p>
                  {s.resposta && (
                    <div className="bg-muted rounded-md p-3 border-l-4 border-primary">
                      <p className="text-xs font-semibold text-primary mb-1 flex items-center gap-1"><MessageSquare className="w-3 h-3" /> Resposta SBPM</p>
                      <p className="whitespace-pre-wrap">{s.resposta}</p>
                      {s.respondido_em && <p className="text-xs text-muted-foreground mt-2">{format(new Date(s.respondido_em), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}</p>}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
