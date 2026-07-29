import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileDown } from 'lucide-react';
import { PAT_STATUS, PatStatus, brl, dataBR, depreciacao, exportarCSV, exportarPDF, exportarXLSX } from '@/lib/patrimonio';
import { usePatRefs, nomeDe } from './usePatRefs';

type Relatorio = 'inventario' | 'depreciacao' | 'movimentacoes' | 'manutencoes' | 'baixas' | 'por_responsavel';

const OPCOES: { value: Relatorio; label: string }[] = [
  { value: 'inventario', label: 'Inventário analítico de bens' },
  { value: 'depreciacao', label: 'Depreciação e valor contábil' },
  { value: 'movimentacoes', label: 'Movimentações' },
  { value: 'manutencoes', label: 'Manutenções e custos' },
  { value: 'baixas', label: 'Baixas patrimoniais' },
  { value: 'por_responsavel', label: 'Bens por responsável' },
];

export default function RelatoriosTab() {
  const refs = usePatRefs();
  const [tipo, setTipo] = useState<Relatorio>('inventario');
  const [unidade, setUnidade] = useState('todas');
  const [dados, setDados] = useState<any>({ bens: [], movs: [], manut: [], baixas: [] });

  useEffect(() => {
    (async () => {
      const [b, m, mn, bx] = await Promise.all([
        supabase.from('pat_bens').select('*'),
        supabase.from('pat_movimentacoes').select('*').order('data_movimentacao', { ascending: false }),
        supabase.from('pat_manutencoes').select('*').order('data_abertura', { ascending: false }),
        supabase.from('pat_baixas').select('*').order('data_baixa', { ascending: false }),
      ]);
      setDados({ bens: b.data || [], movs: m.data || [], manut: mn.data || [], baixas: bx.data || [] });
    })();
  }, []);

  const bensFiltrados = dados.bens.filter((b: any) => unidade === 'todas' || b.unidade_id === unidade);
  const bemDe = (id: string) => dados.bens.find((b: any) => b.id === id);

  const { head, rows, titulo } = useMemo(() => {
    switch (tipo) {
      case 'depreciacao':
        return {
          titulo: 'Depreciação patrimonial',
          head: ['Nº patrimonial', 'Descrição', 'Aquisição', 'Valor', 'Meses', 'Depreciação acumulada', 'Valor contábil'],
          rows: bensFiltrados.map((b: any) => {
            const d = depreciacao(b);
            return [b.numero_patrimonial, b.descricao, dataBR(b.data_aquisicao), brl(Number(b.valor || 0)),
              d.meses, brl(d.acumulada), brl(d.atual)];
          }),
        };
      case 'movimentacoes':
        return {
          titulo: 'Movimentações patrimoniais',
          head: ['Data', 'Bem', 'Tipo', 'Origem', 'Destino', 'Motivo', 'Aprovação'],
          rows: dados.movs.map((m: any) => [dataBR(m.data_movimentacao),
            bemDe(m.bem_id)?.numero_patrimonial ?? '—', m.tipo,
            [nomeDe(refs.unidades, m.origem_unidade_id), m.origem_local].filter(Boolean).join(' / ') || '—',
            [nomeDe(refs.unidades, m.destino_unidade_id), m.destino_local].filter(Boolean).join(' / ') || '—',
            m.motivo, m.aprovacao]),
        };
      case 'manutencoes':
        return {
          titulo: 'Manutenções e custos',
          head: ['Abertura', 'Bem', 'Tipo', 'Descrição', 'Fornecedor', 'Custo', 'Situação'],
          rows: dados.manut.map((m: any) => [dataBR(m.data_abertura), bemDe(m.bem_id)?.numero_patrimonial ?? '—',
            m.tipo, m.descricao, m.fornecedor_nome ?? '—', brl(Number(m.custo || 0)), m.status]),
        };
      case 'baixas':
        return {
          titulo: 'Baixas patrimoniais',
          head: ['Data', 'Bem', 'Motivo', 'Justificativa', 'Valor residual', 'Aprovação'],
          rows: dados.baixas.map((b: any) => [dataBR(b.data_baixa), bemDe(b.bem_id)?.numero_patrimonial ?? '—',
            b.motivo, b.justificativa, brl(Number(b.valor_residual || 0)), b.aprovacao]),
        };
      case 'por_responsavel':
        return {
          titulo: 'Bens por responsável',
          head: ['Responsável', 'Nº patrimonial', 'Descrição', 'Unidade', 'Setor', 'Situação', 'Valor'],
          rows: bensFiltrados
            .slice()
            .sort((a: any, b: any) => (nomeDe(refs.responsaveis, a.responsavel_id) ?? 'zzz')
              .localeCompare(nomeDe(refs.responsaveis, b.responsavel_id) ?? 'zzz'))
            .map((b: any) => [nomeDe(refs.responsaveis, b.responsavel_id) ?? 'Sem responsável',
              b.numero_patrimonial, b.descricao, nomeDe(refs.unidades, b.unidade_id) ?? '—',
              nomeDe(refs.setores, b.setor_id) ?? '—', PAT_STATUS[b.status as PatStatus].label, brl(Number(b.valor || 0))]),
        };
      default:
        return {
          titulo: 'Inventário analítico de bens',
          head: ['Nº patrimonial', 'Código interno', 'Descrição', 'Categoria', 'Marca/modelo', 'Série', 'Unidade', 'Setor', 'Responsável', 'Situação', 'Conservação', 'Aquisição', 'Valor'],
          rows: bensFiltrados.map((b: any) => [b.numero_patrimonial, b.codigo_interno ?? '—', b.descricao,
            nomeDe(refs.categorias, b.categoria_id) ?? '—', [b.marca, b.modelo].filter(Boolean).join(' ') || '—',
            b.numero_serie ?? '—', nomeDe(refs.unidades, b.unidade_id) ?? '—', nomeDe(refs.setores, b.setor_id) ?? '—',
            nomeDe(refs.responsaveis, b.responsavel_id) ?? '—', PAT_STATUS[b.status as PatStatus].label,
            b.estado_conservacao, dataBR(b.data_aquisicao), brl(Number(b.valor || 0))]),
        };
    }
  }, [tipo, bensFiltrados, dados, refs]);

  const nomeArquivo = titulo.toLowerCase().replace(/\s+/g, '-');
  const sub = unidade === 'todas' ? 'Todas as unidades' : `Unidade: ${nomeDe(refs.unidades, unidade)}`;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Relatórios patrimoniais</CardTitle></CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div>
            <Label>Relatório</Label>
            <Select value={tipo} onValueChange={(v) => setTipo(v as Relatorio)}>
              <SelectTrigger className="w-[280px]"><SelectValue /></SelectTrigger>
              <SelectContent>{OPCOES.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div>
            <Label>Unidade</Label>
            <Select value={unidade} onValueChange={setUnidade}>
              <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todas">Todas as unidades</SelectItem>
                {refs.unidades.map((u) => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto flex gap-2">
            <Button size="sm" onClick={() => exportarPDF(titulo, head, rows, sub)}><FileDown className="mr-1 h-4 w-4" /> PDF</Button>
            <Button size="sm" variant="outline" onClick={() => exportarXLSX(nomeArquivo, head, rows)}>XLSX</Button>
            <Button size="sm" variant="outline" onClick={() => exportarCSV(nomeArquivo, head, rows)}>CSV</Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>{head.map((h) => <th key={h} className="p-2 text-left text-xs font-semibold">{h}</th>)}</tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={head.length} className="p-8 text-center text-muted-foreground">Sem dados para o relatório selecionado.</td></tr>
              ) : rows.slice(0, 200).map((r: any[], i: number) => (
                <tr key={i} className="border-t">
                  {r.map((c, j) => <td key={j} className="p-2 text-xs">{String(c ?? '')}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      {rows.length > 200 && (
        <p className="text-xs text-muted-foreground">Exibindo as 200 primeiras linhas. A exportação inclui todos os {rows.length} registros.</p>
      )}
    </div>
  );
}
