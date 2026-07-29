import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDown } from 'lucide-react';
import { format, parseISO, startOfYear } from 'date-fns';
import { brl, exportarCSV, exportarPDF, exportarXLSX, FIN_STATUS, type FinStatus } from '@/lib/financeiro';

type Agrupamento = 'categoria' | 'centro' | 'natureza' | 'competencia';

export default function RelatoriosTab() {
  const [lancamentos, setLancamentos] = useState<any[]>([]);
  const [de, setDe] = useState(startOfYear(new Date()).toISOString().slice(0, 10));
  const [ate, setAte] = useState(new Date().toISOString().slice(0, 10));
  const [natureza, setNatureza] = useState('todas');
  const [status, setStatus] = useState('todos');
  const [agrupar, setAgrupar] = useState<Agrupamento>('categoria');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await supabase
        .from('fin_lancamentos')
        .select('*, fin_categorias(nome), fin_centros_custo(nome, codigo), fin_fornecedores(nome)')
        .order('vencimento');
      setLancamentos(data || []);
      setLoading(false);
    })();
  }, []);

  const filtrados = useMemo(() => lancamentos.filter((l) => {
    if (l.competencia < de || l.competencia > ate) return false;
    if (natureza !== 'todas' && l.natureza !== natureza) return false;
    if (status !== 'todos' && l.status !== status) return false;
    return true;
  }), [lancamentos, de, ate, natureza, status]);

  const chave = (l: any) => {
    if (agrupar === 'categoria') return l.fin_categorias?.nome ?? 'Sem categoria';
    if (agrupar === 'centro') return l.fin_centros_custo?.nome ?? 'Sem centro de custo';
    if (agrupar === 'natureza') return l.natureza === 'receita' ? 'Receitas' : 'Despesas';
    return format(parseISO(l.competencia), 'MM/yyyy');
  };

  const agrupado = useMemo(() => {
    const map: Record<string, { receita: number; despesa: number; qtd: number }> = {};
    filtrados.forEach((l) => {
      const k = chave(l);
      map[k] = map[k] ?? { receita: 0, despesa: 0, qtd: 0 };
      map[k].qtd += 1;
      if (['cancelado', 'estornado'].includes(l.status)) return;
      if (l.natureza === 'receita') map[k].receita += Number(l.valor);
      else map[k].despesa += Number(l.valor);
    });
    return Object.entries(map)
      .map(([nome, v]) => ({ nome, ...v, saldo: v.receita - v.despesa }))
      .sort((a, b) => b.receita + b.despesa - (a.receita + a.despesa));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtrados, agrupar]);

  const totais = useMemo(() => ({
    receita: agrupado.reduce((a, b) => a + b.receita, 0),
    despesa: agrupado.reduce((a, b) => a + b.despesa, 0),
  }), [agrupado]);

  const headResumo = ['Agrupamento', 'Lançamentos', 'Receitas', 'Despesas', 'Saldo'];
  const rowsResumo = agrupado.map((r) => [r.nome, r.qtd, r.receita, r.despesa, r.saldo] as (string | number)[]);

  const headDetalhe = ['Natureza', 'Descrição', 'Categoria', 'Centro de custo', 'Favorecido', 'Competência', 'Vencimento', 'Situação', 'Valor'];
  const rowsDetalhe = filtrados.map((l) => [
    l.natureza === 'receita' ? 'Receita' : 'Despesa', l.descricao,
    l.fin_categorias?.nome ?? '', l.fin_centros_custo?.nome ?? '', l.fin_fornecedores?.nome ?? '',
    l.competencia, l.vencimento, FIN_STATUS[l.status as FinStatus]?.label ?? l.status, Number(l.valor),
  ] as (string | number)[]);

  const periodo = `Período de competência: ${format(parseISO(de), 'dd/MM/yyyy')} a ${format(parseISO(ate), 'dd/MM/yyyy')}`;
  const resumoPdf = [periodo, `Receitas: ${brl(totais.receita)}`, `Despesas: ${brl(totais.despesa)}`, `Resultado: ${brl(totais.receita - totais.despesa)}`];

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Relatórios financeiros</h2>
        <p className="text-sm text-muted-foreground">Filtre por período de competência e exporte em PDF, XLSX ou CSV.</p>
      </div>

      <Card>
        <CardContent className="grid gap-3 p-4 md:grid-cols-5">
          <div><Label>Competência de</Label><Input type="date" value={de} onChange={(e) => setDe(e.target.value)} /></div>
          <div><Label>até</Label><Input type="date" value={ate} onChange={(e) => setAte(e.target.value)} /></div>
          <div>
            <Label>Natureza</Label>
            <Select value={natureza} onValueChange={setNatureza}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Receitas e despesas</SelectItem>
                <SelectItem value="receita">Somente receitas</SelectItem>
                <SelectItem value="despesa">Somente despesas</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Situação</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas</SelectItem>
                {Object.entries(FIN_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Agrupar por</Label>
            <Select value={agrupar} onValueChange={(v) => setAgrupar(v as Agrupamento)}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="categoria">Categoria</SelectItem>
                <SelectItem value="centro">Centro de custo</SelectItem>
                <SelectItem value="natureza">Natureza</SelectItem>
                <SelectItem value="competencia">Mês de competência</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-3">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Receitas no período</p><p className="text-xl font-bold text-green-600">{brl(totais.receita)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Despesas no período</p><p className="text-xl font-bold text-destructive">{brl(totais.despesa)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Resultado</p><p className="text-xl font-bold">{brl(totais.receita - totais.despesa)}</p></CardContent></Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 pb-2">
          <CardTitle className="text-base">Resumo agrupado</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => exportarPDF('resumo-financeiro', 'Resumo financeiro', headResumo, rowsResumo.map((r) => r.map((c, i) => (i > 1 ? brl(Number(c)) : c))), resumoPdf)}>
              <FileDown className="mr-1 h-4 w-4" /> PDF
            </Button>
            <Button size="sm" variant="outline" onClick={() => exportarXLSX('resumo-financeiro', headResumo, rowsResumo)}>
              <FileDown className="mr-1 h-4 w-4" /> XLSX
            </Button>
            <Button size="sm" variant="outline" onClick={() => exportarCSV('resumo-financeiro', headResumo, rowsResumo)}>
              <FileDown className="mr-1 h-4 w-4" /> CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground">Carregando...</p>
          ) : agrupado.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum lançamento no período selecionado.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left text-muted-foreground">
                    <th className="py-2">Agrupamento</th>
                    <th className="py-2 text-right">Lanç.</th>
                    <th className="py-2 text-right">Receitas</th>
                    <th className="py-2 text-right">Despesas</th>
                    <th className="py-2 text-right">Saldo</th>
                  </tr>
                </thead>
                <tbody>
                  {agrupado.map((r) => (
                    <tr key={r.nome} className="border-b last:border-0">
                      <td className="py-2">{r.nome}</td>
                      <td className="py-2 text-right">{r.qtd}</td>
                      <td className="py-2 text-right text-green-600">{brl(r.receita)}</td>
                      <td className="py-2 text-right text-destructive">{brl(r.despesa)}</td>
                      <td className="py-2 text-right font-medium">{brl(r.saldo)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 pb-2">
          <CardTitle className="text-base">Razão detalhado ({filtrados.length} lançamentos)</CardTitle>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={() => exportarPDF('razao-financeiro', 'Razão financeiro', headDetalhe, rowsDetalhe.map((r) => r.map((c, i) => (i === 8 ? brl(Number(c)) : c))), resumoPdf)}>
              <FileDown className="mr-1 h-4 w-4" /> PDF
            </Button>
            <Button size="sm" variant="outline" onClick={() => exportarXLSX('razao-financeiro', headDetalhe, rowsDetalhe)}>
              <FileDown className="mr-1 h-4 w-4" /> XLSX
            </Button>
            <Button size="sm" variant="outline" onClick={() => exportarCSV('razao-financeiro', headDetalhe, rowsDetalhe)}>
              <FileDown className="mr-1 h-4 w-4" /> CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          {periodo}. Lançamentos cancelados e estornados aparecem no detalhamento, mas não somam nos totais.
        </CardContent>
      </Card>
    </div>
  );
}
