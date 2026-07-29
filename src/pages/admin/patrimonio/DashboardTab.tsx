import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Boxes, Wrench, ArchiveX, AlertTriangle, TrendingDown, ClipboardList } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { PAT_STATUS, PatStatus, brl, depreciacao, dataBR } from '@/lib/patrimonio';
import { usePatRefs, nomeDe } from './usePatRefs';

const CORES = ['hsl(var(--primary))', '#2563eb', '#f59e0b', '#7c3aed', '#0891b2', '#ea580c', '#6b7280', '#dc2626'];

export default function DashboardTab({ onIrPara }: { onIrPara: (aba: string) => void }) {
  const refs = usePatRefs();
  const [bens, setBens] = useState<any[]>([]);
  const [manutencoes, setManutencoes] = useState<any[]>([]);
  const [pendencias, setPendencias] = useState({ movs: 0, baixas: 0, ocorrencias: 0, inventarios: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [b, m, mov, bx, oc, inv] = await Promise.all([
        supabase.from('pat_bens').select('*'),
        supabase.from('pat_manutencoes').select('*').neq('status', 'concluida'),
        supabase.from('pat_movimentacoes').select('id', { count: 'exact', head: true }).eq('aprovacao', 'pendente'),
        supabase.from('pat_baixas').select('id', { count: 'exact', head: true }).eq('aprovacao', 'pendente'),
        supabase.from('pat_ocorrencias').select('id', { count: 'exact', head: true }).eq('status', 'aberta'),
        supabase.from('pat_inventarios').select('id', { count: 'exact', head: true }).eq('status', 'em_andamento'),
      ]);
      setBens(b.data || []);
      setManutencoes(m.data || []);
      setPendencias({
        movs: mov.count ?? 0, baixas: bx.count ?? 0,
        ocorrencias: oc.count ?? 0, inventarios: inv.count ?? 0,
      });
      setLoading(false);
    })();
  }, []);

  const ativos = bens.filter((b) => b.status !== 'baixado');
  const valorTotal = ativos.reduce((s, b) => s + Number(b.valor || 0), 0);
  const valorContabil = ativos.reduce((s, b) => s + depreciacao(b).atual, 0);

  const porStatus = (Object.keys(PAT_STATUS) as PatStatus[])
    .map((s) => ({ nome: PAT_STATUS[s].label, valor: bens.filter((b) => b.status === s).length }))
    .filter((x) => x.valor > 0);

  const porUnidade = refs.unidades.map((u) => ({
    nome: u.nome,
    bens: ativos.filter((b) => b.unidade_id === u.id).length,
    valor: ativos.filter((b) => b.unidade_id === u.id).reduce((s, b) => s + Number(b.valor || 0), 0),
  })).filter((x) => x.bens > 0);

  const KPIS = [
    { icon: Boxes, label: 'Bens ativos', valor: String(ativos.length), sub: `${bens.length} cadastrados no total` },
    { icon: TrendingDown, label: 'Valor de aquisição', valor: brl(valorTotal), sub: `Valor contábil ${brl(valorContabil)}` },
    { icon: Wrench, label: 'Em manutenção', valor: String(manutencoes.length), sub: 'Ordens em aberto' },
    { icon: ArchiveX, label: 'Baixados', valor: String(bens.filter((b) => b.status === 'baixado').length), sub: 'Retirados do patrimônio' },
  ];

  if (loading) return <p className="text-sm text-muted-foreground">Carregando indicadores...</p>;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {KPIS.map((k) => (
          <Card key={k.label}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <k.icon className="h-4 w-4" aria-hidden="true" />
                <span className="text-xs">{k.label}</span>
              </div>
              <p className="mt-1 text-xl font-bold">{k.valor}</p>
              <p className="text-xs text-muted-foreground">{k.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {(pendencias.movs + pendencias.baixas + pendencias.ocorrencias + pendencias.inventarios) > 0 && (
        <Card className="border-yellow-500/40">
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-yellow-600" aria-hidden="true" /> Pendências
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {pendencias.movs > 0 && <Button size="sm" variant="outline" onClick={() => onIrPara('movimentacoes')}>{pendencias.movs} movimentação(ões) aguardando aprovação</Button>}
            {pendencias.baixas > 0 && <Button size="sm" variant="outline" onClick={() => onIrPara('baixas')}>{pendencias.baixas} baixa(s) aguardando aprovação</Button>}
            {pendencias.ocorrencias > 0 && <Button size="sm" variant="outline" onClick={() => onIrPara('ocorrencias')}>{pendencias.ocorrencias} ocorrência(s) aberta(s)</Button>}
            {pendencias.inventarios > 0 && <Button size="sm" variant="outline" onClick={() => onIrPara('inventarios')}>{pendencias.inventarios} inventário(s) em andamento</Button>}
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Bens por situação</CardTitle></CardHeader>
          <CardContent className="h-72">
            {porStatus.length === 0 ? (
              <p className="text-sm text-muted-foreground">Nenhum bem cadastrado.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={porStatus} dataKey="valor" nameKey="nome" outerRadius={90} label>
                    {porStatus.map((_, i) => <Cell key={i} fill={CORES[i % CORES.length]} />)}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2"><CardTitle className="text-base">Bens por unidade</CardTitle></CardHeader>
          <CardContent className="h-72">
            {porUnidade.length === 0 ? (
              <p className="text-sm text-muted-foreground">Cadastre unidades e vincule os bens para ver a distribuição.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={porUnidade}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="nome" fontSize={11} />
                  <YAxis fontSize={11} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="bens" name="Bens" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4" aria-hidden="true" /> Últimos bens cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {bens.slice(0, 6).map((b) => (
            <div key={b.id} className="flex flex-wrap items-center gap-2 border-b pb-2 text-sm last:border-0">
              <span className="font-mono text-xs text-muted-foreground">{b.numero_patrimonial}</span>
              <span className="flex-1 truncate">{b.descricao}</span>
              <span className="text-xs text-muted-foreground">{nomeDe(refs.unidades, b.unidade_id) ?? 'Sem unidade'}</span>
              <span className="text-xs text-muted-foreground">{dataBR(b.created_at)}</span>
              <Badge className={PAT_STATUS[b.status as PatStatus].className}>{PAT_STATUS[b.status as PatStatus].label}</Badge>
            </div>
          ))}
          {bens.length === 0 && <p className="text-sm text-muted-foreground">Nenhum bem cadastrado ainda.</p>}
        </CardContent>
      </Card>
    </div>
  );
}
