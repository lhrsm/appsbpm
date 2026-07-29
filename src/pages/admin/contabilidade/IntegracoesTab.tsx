import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { FlaskConical, Loader2, Link2, ShieldCheck } from 'lucide-react';
import AvisoEstrutura from './AvisoEstrutura';
import { useCtbRefs } from './useCtbRefs';
import { brl, getConfig, labelOrigem, type CtbOrigem } from '@/lib/contabilidade';

type Mapeamento = {
  id: string; evento: string; descricao: string; conta_debito_id: string | null; conta_credito_id: string | null;
  historico_padrao: string | null; ativo: boolean; validado: boolean;
};

type Previa = { referencia: string; historico: string; valor: number };

export default function IntegracoesTab() {
  const { contas } = useCtbRefs();
  const [itens, setItens] = useState<Mapeamento[]>([]);
  const [config, setConfigState] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState<Mapeamento | null>(null);
  const [salvando, setSalvando] = useState(false);
  const [previa, setPrevia] = useState<{ mapa: Mapeamento; linhas: Previa[] } | null>(null);
  const [simulando, setSimulando] = useState<string | null>(null);

  const analiticas = useMemo(() => contas.filter((c) => c.aceita_lancamento && c.ativa), [contas]);

  const carregar = async () => {
    setLoading(true);
    const [m, cfg] = await Promise.all([
      supabase.from('ctb_integracao_mapeamentos').select('*').order('evento'),
      getConfig(),
    ]);
    setItens((m.data ?? []) as any as Mapeamento[]);
    setConfigState(cfg);
    setLoading(false);
  };
  useEffect(() => { void carregar(); }, []);

  const contaLabel = (id: string | null) => {
    const c = contas.find((x) => x.id === id);
    return c ? `${c.codigo} — ${c.nome}` : 'Não mapeada';
  };

  const salvar = async () => {
    if (!edit) return;
    setSalvando(true);
    const { error } = await supabase.from('ctb_integracao_mapeamentos').update({
      conta_debito_id: edit.conta_debito_id || null,
      conta_credito_id: edit.conta_credito_id || null,
      historico_padrao: edit.historico_padrao || null,
      ativo: edit.ativo,
      validado: edit.validado,
    }).eq('id', edit.id);
    setSalvando(false);
    if (error) { toast.error(error.message); return; }
    toast.success('Mapeamento atualizado.');
    setEdit(null);
    await carregar();
  };

  /** Busca origens reais e monta as prévias sem gravar nada. */
  const simular = async (m: Mapeamento) => {
    setSimulando(m.id);
    try {
      let linhas: Previa[] = [];
      if (m.evento.startsWith('financeiro_')) {
        const natureza = m.evento.includes('receita') || m.evento.includes('recebimento') ? 'receita' : 'despesa';
        const q = supabase.from('fin_lancamentos').select('id,descricao,valor,status').eq('natureza', natureza).limit(5);
        const { data } = m.evento.includes('pagamento') || m.evento.includes('recebimento')
          ? await q.eq('status', 'pago')
          : await q;
        linhas = (data ?? []).map((x: any) => ({ referencia: x.id, historico: x.descricao, valor: Number(x.valor || 0) }));
      } else if (m.evento === 'patrimonio_aquisicao') {
        const { data } = await supabase.from('pat_bens').select('id,descricao,valor').limit(5);
        linhas = (data ?? []).map((x: any) => ({ referencia: x.id, historico: `Aquisição — ${x.descricao}`, valor: Number(x.valor || 0) }));
      } else if (m.evento === 'patrimonio_depreciacao') {
        const { data } = await supabase.from('pat_bens').select('id,descricao,valor,taxa_depreciacao').limit(5);
        linhas = (data ?? []).map((x: any) => ({
          referencia: x.id,
          historico: `Depreciação mensal — ${x.descricao}`,
          valor: Number(((Number(x.valor || 0) * Number(x.taxa_depreciacao || 0)) / 100 / 12).toFixed(2)),
        }));
      } else if (m.evento === 'patrimonio_baixa') {
        const { data } = await supabase.from('pat_baixas').select('id,motivo,valor_residual').limit(5);
        linhas = (data ?? []).map((x: any) => ({ referencia: x.id, historico: `Baixa — ${x.motivo}`, valor: Number(x.valor_residual || 0) }));
      }
      setPrevia({ mapa: m, linhas });
    } catch (e: any) {
      toast.error(e.message ?? 'Não foi possível simular.');
    } finally {
      setSimulando(null);
    }
  };

  const automatica = config.contabilizacao_automatica === 'true';

  return (
    <div className="space-y-4">
      <AvisoEstrutura />

      <Alert>
        <ShieldCheck className="h-4 w-4" aria-hidden="true" />
        <AlertDescription>
          A contabilização automática está <strong>{automatica ? 'ativa' : 'desativada'}</strong>. Nenhum lançamento é
          gerado automaticamente a partir do Financeiro ou do Patrimônio enquanto o mapeamento não for validado pelo
          setor contábil. Utilize a simulação para conferir o resultado antes da efetivação.
        </AlertDescription>
      </Alert>

      {loading && <p className="text-sm text-muted-foreground">Carregando mapeamentos...</p>}

      <div className="grid gap-4 md:grid-cols-2">
        {itens.map((m) => (
          <Card key={m.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between gap-2">
                <CardTitle className="text-base">{labelOrigem(m.evento)}</CardTitle>
                <div className="flex gap-1">
                  <Badge variant={m.validado ? 'default' : 'secondary'}>{m.validado ? 'Validado' : 'Não validado'}</Badge>
                  <Badge variant={m.ativo ? 'default' : 'outline'}>{m.ativo ? 'Ativo' : 'Inativo'}</Badge>
                </div>
              </div>
              <CardDescription>{m.descricao}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <p><span className="text-muted-foreground">Débito:</span> {contaLabel(m.conta_debito_id)}</p>
              <p><span className="text-muted-foreground">Crédito:</span> {contaLabel(m.conta_credito_id)}</p>
              <div className="flex flex-wrap gap-2 pt-1">
                <Button size="sm" variant="outline" onClick={() => setEdit(m)}>
                  <Link2 className="mr-1 h-4 w-4" aria-hidden="true" /> Mapear contas
                </Button>
                <Button size="sm" variant="secondary" disabled={simulando === m.id} onClick={() => simular(m)}>
                  {simulando === m.id
                    ? <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden="true" />
                    : <FlaskConical className="mr-1 h-4 w-4" aria-hidden="true" />} Simular
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!edit} onOpenChange={() => setEdit(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Mapeamento — {edit ? labelOrigem(edit.evento) : ''}</DialogTitle></DialogHeader>
          {edit && (
            <div className="grid gap-3">
              <div>
                <Label>Conta de débito</Label>
                <Select value={edit.conta_debito_id ?? ''} onValueChange={(v) => setEdit({ ...edit, conta_debito_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {analiticas.map((c) => <SelectItem key={c.id} value={c.id}>{c.codigo} — {c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Conta de crédito</Label>
                <Select value={edit.conta_credito_id ?? ''} onValueChange={(v) => setEdit({ ...edit, conta_credito_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {analiticas.map((c) => <SelectItem key={c.id} value={c.id}>{c.codigo} — {c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Histórico padrão</Label>
                <Input value={edit.historico_padrao ?? ''} onChange={(e) => setEdit({ ...edit, historico_padrao: e.target.value })} />
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <Label htmlFor="validado">Validado pelo setor contábil</Label>
                <Switch id="validado" checked={edit.validado} onCheckedChange={(v) => setEdit({ ...edit, validado: v })} />
              </div>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <Label htmlFor="ativo">Gerar lançamentos automaticamente</Label>
                  <p className="text-xs text-muted-foreground">Só pode ser ativado após a validação do mapeamento.</p>
                </div>
                <Switch id="ativo" checked={edit.ativo} disabled={!edit.validado}
                  onCheckedChange={(v) => setEdit({ ...edit, ativo: v })} />
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEdit(null)}>Cancelar</Button>
            <Button onClick={salvar} disabled={salvando}>
              {salvando && <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden="true" />} Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!previa} onOpenChange={() => setPrevia(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Simulação — {previa ? labelOrigem(previa.mapa.evento) : ''}</DialogTitle>
          </DialogHeader>
          <p className="text-xs text-muted-foreground">
            Prévia gerada apenas para conferência. Nenhum lançamento foi gravado.
          </p>
          <div className="max-h-[55vh] space-y-2 overflow-auto text-sm">
            {previa?.linhas.length === 0 && <p className="text-muted-foreground">Não há registros de origem para simular.</p>}
            {previa?.linhas.map((l) => (
              <div key={l.referencia} className="rounded-md border p-3">
                <p className="font-medium">{previa.mapa.historico_padrao ?? l.historico}</p>
                <p className="text-xs text-muted-foreground">{l.historico}</p>
                <p className="mt-1 text-xs">
                  D — {contaLabel(previa.mapa.conta_debito_id)}: <strong>{brl(l.valor)}</strong>
                </p>
                <p className="text-xs">
                  C — {contaLabel(previa.mapa.conta_credito_id)}: <strong>{brl(l.valor)}</strong>
                </p>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
