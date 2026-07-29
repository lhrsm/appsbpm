import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from 'recharts';
import { format, parseISO, subMonths } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ArrowDownCircle, ArrowUpCircle, Scale, Clock, AlertTriangle } from 'lucide-react';
import PageSkeleton from '@/components/PageSkeleton';
import { brl, FIN_STATUS, type FinStatus } from '@/lib/financeiro';

const CORES = ['hsl(var(--primary))', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#14b8a6', '#ec4899', '#64748b'];
const hoje = () => new Date().toISOString().slice(0, 10);

export default function DashboardTab({ onIrPara }: { onIrPara?: (aba: string) => void }) {
  const [loading, setLoading] = useState(true);
  const [lancamentos, setLancamentos] = useState<any[]>([]);
  const [meses, setMeses] = useState('6');

  useEffect(() => {
    (async () => {
      setLoading(true);
      const desde = subMonths(new Date(), 12).toISOString().slice(0, 10);
      const { data } = await supabase
        .from('fin_lancamentos')
        .select('*, fin_categorias(nome), fin_centros_custo(nome, codigo)')
        .gte('competencia', desde)
        .order('vencimento', { ascending: false });
      setLancamentos(data || []);
      setLoading(false);
    })();
  }, []);

  const validos = useMemo(
    () => lancamentos.filter((l) => !['cancelado', 'estornado'].includes(l.status)),
    [lancamentos],
  );

  const kpis = useMemo(() => {
    const soma = (fn: (l: any) => boolean) => validos.filter(fn).reduce((a, b) => a + Number(b.valor), 0);
    const receitas = soma((l) => l.natureza === 'receita' && l.status === 'pago');
    const despesas = soma((l) => l.natureza === 'despesa' && l.status === 'pago');
    return {
      receitas,
      despesas,
      saldo: receitas - despesas,
      aReceber: soma((l) => l.natureza === 'receita' && ['pendente', 'aprovado'].includes(l.status)),
      aPagar: soma((l) => l.natureza === 'despesa' && ['pendente', 'aprovado'].includes(l.status)),
      vencidos: validos.filter((l) => ['pendente', 'aprovado'].includes(l.status) && l.vencimento < hoje()).length,
      aprovacoes: validos.filter((l) => l.status === 'pendente'),
    };
  }, [validos]);

  const serieMensal = useMemo(() => {
    const n = Number(meses);
    const base: Record<string, { mes: string; Receitas: number; Despesas: number }> = {};
    for (let i = n - 1; i >= 0; i--) {
      const d = subMonths(new Date(), i);
      const k = d.toISOString().slice(0, 7);
      base[k] = { mes: format(d, 'MMM/yy', { locale: ptBR }), Receitas: 0, Despesas: 0 };
    }
    validos.forEach((l) => {
      const k = String(l.competencia).slice(0, 7);
      if (!base[k]) return;
      if (l.natureza === 'receita') base[k].Receitas += Number(l.valor);
      else base[k].Despesas += Number(l.valor);
    });
    return Object.values(base);
  }, [validos, meses]);

  const porCentro = useMemo(() => {
    const map: Record<string, number> = {};
    validos.filter((l) => l.natureza === 'despesa').forEach((l) => {
      const k = l.fin_centros_custo?.nome ?? 'Sem centro de custo';
      map[k] = (map[k] ?? 0) + Number(l.valor);
    });
    return Object.entries(map).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 8);
  }, [validos]);

  if (loading) return <PageSkeleton rows={4} />;

  const semDados = lancamentos.length === 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Painel financeiro</h2>
          <p className="text-sm text-muted-foreground">Consolidado dos lançamentos institucionais (cancelados e estornados são desconsiderados).</p>
        </div>
        <Select value={meses} onValueChange={setMeses}>
          <SelectTrigger className="w-44"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="3">Últimos 3 meses</SelectItem>
            <SelectItem value="6">Últimos 6 meses</SelectItem>
            <SelectItem value="12">Últimos 12 meses</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {semDados && (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center text-muted-foreground">
            Aguardando lançamentos. Cadastre receitas e despesas ou importe os dados institucionais para ver os indicadores.
          </CardContent>
        </Card>
      )}

      <div className="grid gap-3 grid-cols-2 lg:grid-cols-5">
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><ArrowUpCircle className="h-3 w-3 text-green-600" /> Receitas liquidadas</p>
          <p className="text-xl font-bold text-green-600">{brl(kpis.receitas)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><ArrowDownCircle className="h-3 w-3 text-destructive" /> Despesas liquidadas</p>
          <p className="text-xl font-bold text-destructive">{brl(kpis.despesas)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Scale className="h-3 w-3" /> Resultado</p>
          <p className={`text-xl font-bold ${kpis.saldo >= 0 ? 'text-green-600' : 'text-destructive'}`}>{brl(kpis.saldo)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> A receber</p>
          <p className="text-xl font-bold">{brl(kpis.aReceber)}</p>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <p className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="h-3 w-3" /> A pagar</p>
          <p className="text-xl font-bold">{brl(kpis.aPagar)}</p>
        </CardContent></Card>
      </div>

      {kpis.vencidos > 0 && (
        <div className="flex items-center gap-2 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-destructive" aria-hidden="true" />
          {kpis.vencidos} lançamento(s) em aberto já vencidos.
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Evolução mensal</CardTitle></CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={serieMensal}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="mes" fontSize={12} />
                <YAxis fontSize={12} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                <Tooltip formatter={(v: any) => brl(Number(v))} />
                <Legend />
                <Bar dataKey="Receitas" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Despesas" fill="#ef4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Despesas por centro de custo</CardTitle></CardHeader>
          <CardContent className="h-72">
            {porCentro.length === 0 ? (
              <p className="pt-16 text-center text-sm text-muted-foreground">Sem despesas registradas.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={porCentro} dataKey="value" nameKey="name" outerRadius={90} label={(e: any) => e.name}>
                    {porCentro.map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
                  </Pie>
                  <Tooltip formatter={(v: any) => brl(Number(v))} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Pendências de aprovação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {kpis.aprovacoes.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum lançamento aguardando aprovação.</p>
          ) : (
            kpis.aprovacoes.slice(0, 8).map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => onIrPara?.(l.natureza === 'receita' ? 'receitas' : 'despesas')}
                className="flex w-full flex-wrap items-center justify-between gap-2 rounded-md border p-3 text-left hover:bg-muted/50"
              >
                <div className="min-w-0">
                  <p className="truncate font-medium">{l.descricao}</p>
                  <p className="text-xs text-muted-foreground">
                    Venc. {format(parseISO(l.vencimento), 'dd/MM/yyyy')} • {l.fin_categorias?.nome ?? 'Sem categoria'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={FIN_STATUS[l.status as FinStatus].className}>{FIN_STATUS[l.status as FinStatus].label}</Badge>
                  <span className="font-semibold">{brl(Number(l.valor))}</span>
                </div>
              </button>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
