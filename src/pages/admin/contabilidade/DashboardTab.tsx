import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import AvisoEstrutura from './AvisoEstrutura';
import { brl, competenciaLabel, getConfig, LANC_STATUS, SITUACOES_PERIODO } from '@/lib/contabilidade';
import { BookOpen, FileSpreadsheet, Layers, Lock, ArrowRight } from 'lucide-react';

type Resumo = {
  contas: number;
  contasAnaliticas: number;
  lancamentos: number;
  efetivados: number;
  simulados: number;
  valorEfetivado: number;
  valorSimulado: number;
  periodosAbertos: number;
  lotesAbertos: number;
};

export default function DashboardTab({ onIrPara }: { onIrPara: (aba: string) => void }) {
  const [r, setR] = useState<Resumo | null>(null);
  const [config, setConfigState] = useState<Record<string, string>>({});
  const [periodos, setPeriodos] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      const [contas, lanc, per, lotes, cfg] = await Promise.all([
        supabase.from('ctb_plano_contas').select('id,aceita_lancamento,ativa'),
        supabase.from('ctb_lancamentos').select('id,status,valor'),
        supabase.from('ctb_periodos').select('id,competencia,situacao').order('competencia', { ascending: false }).limit(6),
        supabase.from('ctb_lotes').select('id,status'),
        getConfig(),
      ]);
      const ls = lanc.data ?? [];
      setR({
        contas: (contas.data ?? []).length,
        contasAnaliticas: (contas.data ?? []).filter((c) => c.aceita_lancamento).length,
        lancamentos: ls.length,
        efetivados: ls.filter((l) => l.status === 'efetivado').length,
        simulados: ls.filter((l) => l.status === 'simulado').length,
        valorEfetivado: ls.filter((l) => l.status === 'efetivado').reduce((s, l) => s + Number(l.valor || 0), 0),
        valorSimulado: ls.filter((l) => l.status === 'simulado').reduce((s, l) => s + Number(l.valor || 0), 0),
        periodosAbertos: (per.data ?? []).filter((p) => p.situacao === 'aberto').length,
        lotesAbertos: (lotes.data ?? []).filter((l) => l.status !== 'efetivado' && l.status !== 'cancelado').length,
      });
      setPeriodos(per.data ?? []);
      setConfigState(cfg);
    })();
  }, []);

  const cards = useMemo(
    () => [
      { titulo: 'Contas cadastradas', valor: r ? `${r.contas}` : '—', sub: r ? `${r.contasAnaliticas} analíticas` : '', icon: BookOpen, aba: 'plano' },
      { titulo: 'Lançamentos', valor: r ? `${r.lancamentos}` : '—', sub: r ? `${r.efetivados} efetivados · ${r.simulados} simulados` : '', icon: FileSpreadsheet, aba: 'lancamentos' },
      { titulo: 'Lotes em aberto', valor: r ? `${r.lotesAbertos}` : '—', sub: 'Aguardando conferência ou efetivação', icon: Layers, aba: 'lotes' },
      { titulo: 'Períodos abertos', valor: r ? `${r.periodosAbertos}` : '—', sub: 'Disponíveis para escrituração', icon: Lock, aba: 'periodos' },
    ],
    [r],
  );

  const automatica = config.contabilizacao_automatica === 'true';

  return (
    <div className="space-y-6">
      <AvisoEstrutura />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Card key={c.titulo} className="cursor-pointer transition hover:border-primary/50" onClick={() => onIrPara(c.aba)}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>{c.titulo}</CardDescription>
                <c.icon className="h-4 w-4 text-primary" aria-hidden="true" />
              </div>
              <CardTitle className="text-2xl">{c.valor}</CardTitle>
            </CardHeader>
            <CardContent className="pt-0 text-xs text-muted-foreground">{c.sub}</CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Movimento registrado</CardTitle>
            <CardDescription>Valores acumulados por situação do lançamento.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="flex items-center gap-2">
                <Badge className={LANC_STATUS.efetivado.className}>{LANC_STATUS.efetivado.label}</Badge>
              </span>
              <strong>{brl(r?.valorEfetivado ?? 0)}</strong>
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <span className="flex items-center gap-2">
                <Badge className={LANC_STATUS.simulado.className}>{LANC_STATUS.simulado.label}</Badge>
              </span>
              <strong>{brl(r?.valorSimulado ?? 0)}</strong>
            </div>
            <p className="text-xs text-muted-foreground">
              Contabilização automática a partir do Financeiro e do Patrimônio:{' '}
              <strong>{automatica ? 'ativa' : 'desativada'}</strong>. Enquanto o mapeamento não for validado pelo setor
              contábil, os eventos apenas geram prévias no modo de simulação.
            </p>
            <Button variant="outline" size="sm" onClick={() => onIrPara('integracoes')}>
              Ver integrações <ArrowRight className="ml-1 h-3.5 w-3.5" aria-hidden="true" />
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Períodos recentes</CardTitle>
            <CardDescription>Situação das competências abertas para escrituração.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {periodos.length === 0 && (
              <p className="text-muted-foreground">Nenhum período cadastrado. Crie um exercício e gere as competências.</p>
            )}
            {periodos.map((p) => {
              const s = SITUACOES_PERIODO[p.situacao as keyof typeof SITUACOES_PERIODO];
              return (
                <div key={p.id} className="flex items-center justify-between rounded-md border p-2.5">
                  <span>{competenciaLabel(p.competencia)}</span>
                  <Badge className={s?.className}>{s?.label ?? p.situacao}</Badge>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
