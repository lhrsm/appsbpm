import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileText, FileSpreadsheet, FileDown } from 'lucide-react';
import AvisoEstrutura from './AvisoEstrutura';
import { brl, competenciaLabel, dataBR, exportarCSV, exportarPDF, exportarXLSX, labelOrigem, LANC_STATUS } from '@/lib/contabilidade';

type Relatorio = {
  chave: string;
  titulo: string;
  descricao: string;
  carregar: () => Promise<{ head: string[]; rows: (string | number)[][] }>;
};

const RELATORIOS: Relatorio[] = [
  {
    chave: 'plano',
    titulo: 'Plano de contas',
    descricao: 'Relação completa das contas com tipo, natureza, nível e vigência.',
    carregar: async () => {
      const { data } = await supabase.from('ctb_plano_contas').select('*').order('codigo');
      return {
        head: ['Código', 'Nome', 'Tipo', 'Natureza', 'Nível', 'Aceita lançamento', 'Ativa', 'Vigência início', 'Vigência fim'],
        rows: (data ?? []).map((c: any) => [
          c.codigo, c.nome, c.tipo, c.natureza, c.nivel,
          c.aceita_lancamento ? 'Sim' : 'Não', c.ativa ? 'Sim' : 'Não',
          dataBR(c.vigencia_inicio), c.vigencia_fim ? dataBR(c.vigencia_fim) : '—',
        ]),
      };
    },
  },
  {
    chave: 'diario',
    titulo: 'Livro diário (prévia)',
    descricao: 'Lançamentos por data, com partidas de débito e crédito.',
    carregar: async () => {
      const [{ data: l }, { data: c }] = await Promise.all([
        supabase.from('ctb_lancamentos').select('*').order('data'),
        supabase.from('ctb_plano_contas').select('id,codigo,nome'),
      ]);
      const map = new Map((c ?? []).map((x: any) => [x.id, `${x.codigo} — ${x.nome}`]));
      return {
        head: ['Data', 'Competência', 'Histórico', 'Documento', 'Débito', 'Crédito', 'Valor', 'Origem', 'Status'],
        rows: (l ?? []).map((x: any) => [
          dataBR(x.data), competenciaLabel(x.competencia), x.historico, x.documento ?? '—',
          map.get(x.conta_debito_id) ?? '—', map.get(x.conta_credito_id) ?? '—',
          brl(Number(x.valor)), labelOrigem(x.origem),
          LANC_STATUS[x.status as keyof typeof LANC_STATUS]?.label ?? x.status,
        ]),
      };
    },
  },
  {
    chave: 'razao',
    titulo: 'Razão por conta (prévia)',
    descricao: 'Totais de débito e crédito acumulados por conta contábil.',
    carregar: async () => {
      const [{ data: l }, { data: c }] = await Promise.all([
        supabase.from('ctb_lancamentos').select('conta_debito_id,conta_credito_id,valor,status'),
        supabase.from('ctb_plano_contas').select('id,codigo,nome').order('codigo'),
      ]);
      const acc = new Map<string, { d: number; c: number }>();
      (l ?? []).forEach((x: any) => {
        if (x.status !== 'efetivado') return;
        const v = Number(x.valor || 0);
        if (x.conta_debito_id) {
          const a = acc.get(x.conta_debito_id) ?? { d: 0, c: 0 }; a.d += v; acc.set(x.conta_debito_id, a);
        }
        if (x.conta_credito_id) {
          const a = acc.get(x.conta_credito_id) ?? { d: 0, c: 0 }; a.c += v; acc.set(x.conta_credito_id, a);
        }
      });
      return {
        head: ['Conta', 'Débitos', 'Créditos', 'Saldo'],
        rows: (c ?? []).map((x: any) => {
          const a = acc.get(x.id) ?? { d: 0, c: 0 };
          return [`${x.codigo} — ${x.nome}`, brl(a.d), brl(a.c), brl(a.d - a.c)];
        }),
      };
    },
  },
  {
    chave: 'balancete',
    titulo: 'Balancete de verificação (prévia)',
    descricao: 'Totalização de débitos e créditos efetivados para conferência.',
    carregar: async () => {
      const { data } = await supabase.from('ctb_lancamentos').select('valor,status,competencia');
      const porComp = new Map<string, { d: number; c: number }>();
      (data ?? []).forEach((x: any) => {
        if (x.status !== 'efetivado') return;
        const k = x.competencia;
        const a = porComp.get(k) ?? { d: 0, c: 0 };
        a.d += Number(x.valor || 0); a.c += Number(x.valor || 0);
        porComp.set(k, a);
      });
      return {
        head: ['Competência', 'Total débitos', 'Total créditos', 'Diferença'],
        rows: [...porComp.entries()].sort().map(([k, v]) => [competenciaLabel(k), brl(v.d), brl(v.c), brl(v.d - v.c)]),
      };
    },
  },
];

export default function RelatoriosTab() {
  const [carregando, setCarregando] = useState<string | null>(null);

  const exportar = async (r: Relatorio, formato: 'pdf' | 'xlsx' | 'csv') => {
    setCarregando(`${r.chave}-${formato}`);
    try {
      const { head, rows } = await r.carregar();
      if (rows.length === 0) { toast.info('Não há dados para este relatório.'); return; }
      const nome = `contabil-${r.chave}`;
      if (formato === 'csv') exportarCSV(nome, head, rows);
      else if (formato === 'xlsx') exportarXLSX(nome, head, rows);
      else exportarPDF(nome, r.titulo, head, rows, ['Documento gerado a partir da estrutura inicial do módulo contábil.']);
    } catch (e: any) {
      toast.error(e.message ?? 'Não foi possível gerar o relatório.');
    } finally {
      setCarregando(null);
    }
  };

  return (
    <div className="space-y-4">
      <AvisoEstrutura />

      <div className="grid gap-4 md:grid-cols-2">
        {RELATORIOS.map((r) => (
          <Card key={r.chave}>
            <CardHeader>
              <CardTitle className="text-base">{r.titulo}</CardTitle>
              <CardDescription>{r.descricao}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button size="sm" variant="outline" disabled={!!carregando} onClick={() => exportar(r, 'pdf')}>
                <FileText className="mr-1 h-4 w-4" aria-hidden="true" /> PDF
              </Button>
              <Button size="sm" variant="outline" disabled={!!carregando} onClick={() => exportar(r, 'xlsx')}>
                <FileSpreadsheet className="mr-1 h-4 w-4" aria-hidden="true" /> XLSX
              </Button>
              <Button size="sm" variant="outline" disabled={!!carregando} onClick={() => exportar(r, 'csv')}>
                <FileDown className="mr-1 h-4 w-4" aria-hidden="true" /> CSV
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
