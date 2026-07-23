import { useEffect, useState, useMemo } from 'react';
import { useAssociado } from '@/contexts/AssociadoContext';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { format, parseISO, differenceInDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Wallet, Download, Copy, AlertCircle, CheckCircle2, Clock } from 'lucide-react';

const STATUS_META: Record<string, { label: string; color: string; icon: any }> = {
  pago: { label: 'Pago', color: 'bg-green-600', icon: CheckCircle2 },
  pendente: { label: 'Pendente', color: 'bg-yellow-500', icon: Clock },
  atrasado: { label: 'Atrasado', color: 'bg-red-600', icon: AlertCircle },
  cancelado: { label: 'Cancelado', color: 'bg-gray-500', icon: AlertCircle },
};

const TIPO_LABEL: Record<string, string> = {
  mensalidade: 'Mensalidade',
  coparticipacao: 'Coparticipação',
  taxa: 'Taxa',
  outros: 'Outros',
};

const brl = (v: number) => v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

export default function Financeiro() {
  const { associado, isDependente } = useAssociado();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('todos');
  const [ano, setAno] = useState('todos');

  useEffect(() => {
    if (!associado || isDependente) return;
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('mensalidades')
        .select('*')
        .eq('associado_id', associado.id)
        .order('vencimento', { ascending: false });
      const now = new Date();
      const upd = (data || []).map((m: any) => {
        if (m.status === 'pendente' && new Date(m.vencimento) < now) return { ...m, status: 'atrasado' };
        return m;
      });
      setItems(upd);
      setLoading(false);
    })();
  }, [associado?.id]);

  const stats = useMemo(() => {
    const pendente = items.filter(i => i.status === 'pendente' || i.status === 'atrasado');
    const totalPendente = pendente.reduce((a, b) => a + Number(b.valor), 0);
    const proximo = pendente.sort((a, b) => a.vencimento.localeCompare(b.vencimento))[0];
    const emDia = items.some(i => i.status === 'atrasado') ? false : true;
    return { totalPendente, proximo, emDia, qtdPendente: pendente.length };
  }, [items]);

  const anos = useMemo(() => Array.from(new Set(items.map(i => i.vencimento.slice(0, 4)))).sort().reverse(), [items]);

  const filtered = items.filter(i => {
    if (statusFilter !== 'todos' && i.status !== statusFilter) return false;
    if (ano !== 'todos' && !i.vencimento.startsWith(ano)) return false;
    return true;
  });

  const copiar = (linha: string) => {
    navigator.clipboard.writeText(linha);
    toast.success('Linha digitável copiada');
  };

  const baixarBoleto = (m: any) => {
    if (m.boleto_url) window.open(m.boleto_url, '_blank');
    else toast.info('Boleto não disponível. Fale com o setor Financeiro.');
  };

  if (isDependente) {
    return <Card><CardContent className="p-8 text-center text-muted-foreground">Área disponível apenas para o titular.</CardContent></Card>;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Wallet className="w-6 h-6 text-primary" /> Financeiro</h1>
        <p className="text-muted-foreground text-sm">Mensalidades, coparticipações e histórico de pagamentos</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Situação</p>
          <p className={`text-lg font-bold ${stats.emDia ? 'text-green-600' : 'text-red-600'}`}>
            {stats.emDia ? 'Em dia' : 'Pendências'}
          </p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Total pendente</p>
          <p className="text-lg font-bold">{brl(stats.totalPendente)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Qtd. pendente</p>
          <p className="text-lg font-bold">{stats.qtdPendente}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground">Próximo vencimento</p>
          <p className="text-lg font-bold">
            {stats.proximo ? format(parseISO(stats.proximo.vencimento), 'dd/MM/yyyy') : '—'}
          </p>
        </CardContent></Card>
      </div>

      {stats.proximo && (
        <Card className="border-primary/40 bg-primary/5">
          <CardHeader className="pb-2"><CardTitle className="text-base">Próximo vencimento</CardTitle></CardHeader>
          <CardContent className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-semibold">{TIPO_LABEL[stats.proximo.tipo]} — {stats.proximo.referencia}</p>
              <p className="text-sm text-muted-foreground">
                Vence em {format(parseISO(stats.proximo.vencimento), "dd 'de' MMMM", { locale: ptBR })}
                {' '}({differenceInDays(parseISO(stats.proximo.vencimento), new Date())} dias)
              </p>
              <p className="text-2xl font-bold text-primary mt-1">{brl(Number(stats.proximo.valor))}</p>
            </div>
            <div className="flex gap-2">
              {stats.proximo.linha_digitavel && (
                <Button variant="outline" onClick={() => copiar(stats.proximo.linha_digitavel)}>
                  <Copy className="w-4 h-4 mr-1" /> Copiar código
                </Button>
              )}
              <Button onClick={() => baixarBoleto(stats.proximo)}>
                <Download className="w-4 h-4 mr-1" /> 2ª via
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="p-4 grid md:grid-cols-2 gap-3">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os status</SelectItem>
              {Object.entries(STATUS_META).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={ano} onValueChange={setAno}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os anos</SelectItem>
              {anos.map(a => <SelectItem key={a} value={a}>{a}</SelectItem>)}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {loading ? <p>Carregando...</p> : filtered.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">Nenhum lançamento encontrado.</CardContent></Card>
      ) : (
        <div className="grid gap-2">
          {filtered.map(m => {
            const meta = STATUS_META[m.status];
            const Icon = meta.icon;
            return (
              <Card key={m.id}>
                <CardContent className="p-4 flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="outline">{TIPO_LABEL[m.tipo]}</Badge>
                      <Badge className={`${meta.color} text-white`}><Icon className="w-3 h-3 mr-1" />{meta.label}</Badge>
                    </div>
                    <p className="font-semibold mt-1">{m.referencia} {m.descricao && `— ${m.descricao}`}</p>
                    <p className="text-xs text-muted-foreground">
                      Venc.: {format(parseISO(m.vencimento), 'dd/MM/yyyy')}
                      {m.pago_em && ` • Pago em ${format(parseISO(m.pago_em), 'dd/MM/yyyy')} (${m.forma_pagamento || '-'})`}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <p className="font-bold text-lg">{brl(Number(m.valor))}</p>
                    {m.status !== 'pago' && m.status !== 'cancelado' && (
                      <Button size="sm" variant="outline" onClick={() => baixarBoleto(m)}>
                        <Download className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
