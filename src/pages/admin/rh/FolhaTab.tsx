import { useCallback, useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { usePermissoes } from '@/hooks/usePermissoes';
import {
  ArrowLeft,
  Calculator,
  Loader2,
  Lock,
  Plus,
  RefreshCw,
  Trash2,
  Wallet,
} from 'lucide-react';

const moeda = (v: any) =>
  Number(v ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

const competenciaBR = (d?: string | null) =>
  d ? new Date(`${d.slice(0, 7)}-01T12:00:00`).toLocaleDateString('pt-BR', { month: '2-digit', year: 'numeric' }) : '—';

const TIPOS = [
  { value: 'mensal', label: 'Mensal' },
  { value: 'decimo_terceiro', label: '13º salário' },
  { value: 'ferias', label: 'Férias' },
  { value: 'rescisao', label: 'Rescisão' },
  { value: 'complementar', label: 'Complementar' },
];

const STATUS: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  rascunho: { label: 'Rascunho', variant: 'outline' },
  em_calculo: { label: 'Em cálculo', variant: 'secondary' },
  conferida: { label: 'Conferida', variant: 'secondary' },
  fechada: { label: 'Fechada', variant: 'default' },
  paga: { label: 'Paga', variant: 'default' },
  cancelada: { label: 'Cancelada', variant: 'destructive' },
};

const bloqueada = (s: string) => ['fechada', 'paga', 'cancelada'].includes(s);

export default function FolhaTab() {
  const { pode } = usePermissoes();
  const podeVer = pode('rh_sensivel', 'visualizar');
  const podeCriar = pode('rh_sensivel', 'criar');
  const podeEditar = pode('rh_sensivel', 'editar');
  const podeExcluir = pode('rh_sensivel', 'excluir');

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [folhas, setFolhas] = useState<any[]>([]);
  const [verbas, setVerbas] = useState<any[]>([]);
  const [colaboradores, setColaboradores] = useState<any[]>([]);

  const [abertaId, setAbertaId] = useState<string | null>(null);
  const [itens, setItens] = useState<any[]>([]);
  const [lancamentos, setLancamentos] = useState<any[]>([]);

  const [novaAberta, setNovaAberta] = useState(false);
  const [nova, setNova] = useState<any>({
    competencia: new Date().toISOString().slice(0, 7),
    tipo: 'mensal',
    data_pagamento: '',
    observacoes: '',
  });

  const [lancAberto, setLancAberto] = useState(false);
  const [lanc, setLanc] = useState<any>({ item_id: '', verba_id: '', referencia: '', valor: '' });

  const folhaAberta = useMemo(() => folhas.find((f) => f.id === abertaId) ?? null, [folhas, abertaId]);

  const carregar = useCallback(async () => {
    setLoading(true);
    const [f, v, c] = await Promise.all([
      supabase.from('rh_folhas').select('*').order('competencia', { ascending: false }),
      supabase.from('rh_verbas').select('*').eq('ativo', true).order('codigo'),
      supabase.from('rh_colaboradores').select('id, nome, situacao').order('nome'),
    ]);
    if (f.error) toast.error('Não foi possível carregar a folha de pagamento.');
    setFolhas(f.data ?? []);
    setVerbas(v.data ?? []);
    setColaboradores(c.data ?? []);
    setLoading(false);
  }, []);

  const carregarDetalhe = useCallback(async (folhaId: string) => {
    const { data: is } = await supabase
      .from('rh_folha_itens')
      .select('*')
      .eq('folha_id', folhaId);
    const ids = (is ?? []).map((i: any) => i.id);
    const { data: ls } = ids.length
      ? await supabase.from('rh_folha_lancamentos').select('*').in('item_id', ids)
      : { data: [] as any[] };
    setItens(is ?? []);
    setLancamentos(ls ?? []);
  }, []);

  useEffect(() => {
    if (podeVer) void carregar();
    else setLoading(false);
  }, [carregar, podeVer]);

  useEffect(() => {
    if (abertaId) void carregarDetalhe(abertaId);
  }, [abertaId, carregarDetalhe]);

  const nomeColab = (id: string) => colaboradores.find((c) => c.id === id)?.nome ?? '—';
  const verba = (id: string) => verbas.find((v) => v.id === id);

  const criarFolha = async () => {
    if (!nova.competencia) return toast.error('Informe a competência.');
    setSalvando(true);
    const { error } = await supabase.from('rh_folhas').insert({
      competencia: `${nova.competencia}-01`,
      tipo: nova.tipo,
      data_pagamento: nova.data_pagamento || null,
      observacoes: nova.observacoes || null,
      status: 'rascunho',
    });
    setSalvando(false);
    if (error) return toast.error(error.message);
    toast.success('Competência criada.');
    setNovaAberta(false);
    setNova({ competencia: new Date().toISOString().slice(0, 7), tipo: 'mensal', data_pagamento: '', observacoes: '' });
    void carregar();
  };

  const gerarItens = async () => {
    if (!folhaAberta) return;
    setSalvando(true);

    const { data: vinculos } = await supabase
      .from('rh_vinculos')
      .select('id, colaborador_id, data_fim')
      .is('data_fim', null);

    const { data: remun } = await supabase
      .from('rh_remuneracoes')
      .select('vinculo_id, salario_base, vigencia_inicio, vigencia_fim')
      .order('vigencia_inicio', { ascending: false });

    const salarioDe = (vinculoId: string) =>
      Number((remun ?? []).find((r: any) => r.vinculo_id === vinculoId && !r.vigencia_fim)?.salario_base ?? 0);

    const existentes = new Set(itens.map((i) => i.colaborador_id));
    const novos = (vinculos ?? [])
      .filter((v: any) => !existentes.has(v.colaborador_id))
      .map((v: any) => ({
        folha_id: folhaAberta.id,
        colaborador_id: v.colaborador_id,
        vinculo_id: v.id,
        salario_base: salarioDe(v.id),
      }));

    if (!novos.length) {
      setSalvando(false);
      return toast.info('Nenhum colaborador novo para incluir nesta competência.');
    }

    const { data: inseridos, error } = await supabase.from('rh_folha_itens').insert(novos).select('id, salario_base');
    if (error) {
      setSalvando(false);
      return toast.error(error.message);
    }

    const verbaSalario = verbas.find((v) => v.codigo === '001');
    if (verbaSalario) {
      const lancs = (inseridos ?? [])
        .filter((i: any) => Number(i.salario_base) > 0)
        .map((i: any) => ({
          item_id: i.id,
          verba_id: verbaSalario.id,
          referencia: '30 dias',
          valor: i.salario_base,
          origem: 'automatica',
        }));
      if (lancs.length) await supabase.from('rh_folha_lancamentos').insert(lancs);
    }

    setSalvando(false);
    toast.success(`${novos.length} colaborador(es) incluído(s).`);
    await carregarDetalhe(folhaAberta.id);
    void carregar();
  };

  const salvarLancamento = async () => {
    if (!lanc.item_id || !lanc.verba_id) return toast.error('Selecione o colaborador e a verba.');
    if (!lanc.valor || Number(lanc.valor) <= 0) return toast.error('Informe um valor válido.');
    setSalvando(true);
    const { error } = await supabase.from('rh_folha_lancamentos').insert({
      item_id: lanc.item_id,
      verba_id: lanc.verba_id,
      referencia: lanc.referencia || null,
      valor: Number(lanc.valor),
      origem: 'manual',
    });
    setSalvando(false);
    if (error) return toast.error(error.message);
    toast.success('Lançamento registrado.');
    setLancAberto(false);
    setLanc({ item_id: '', verba_id: '', referencia: '', valor: '' });
    if (abertaId) await carregarDetalhe(abertaId);
    void carregar();
  };

  const excluirLancamento = async (id: string) => {
    const { error } = await supabase.from('rh_folha_lancamentos').delete().eq('id', id);
    if (error) return toast.error(error.message);
    if (abertaId) await carregarDetalhe(abertaId);
    void carregar();
  };

  const mudarStatus = async (status: string) => {
    if (!folhaAberta) return;
    const patch: any = { status };
    if (status === 'fechada') {
      patch.fechada_em = new Date().toISOString();
      if (!confirm('Fechar a folha? Após o fechamento não será possível alterar os lançamentos.')) return;
    }
    const { error } = await supabase.from('rh_folhas').update(patch).eq('id', folhaAberta.id);
    if (error) return toast.error(error.message);
    toast.success('Situação atualizada.');
    void carregar();
  };

  const excluirFolha = async (id: string) => {
    if (!confirm('Excluir esta competência e todos os seus lançamentos?')) return;
    const { error } = await supabase.from('rh_folhas').delete().eq('id', id);
    if (error) return toast.error(error.message);
    toast.success('Competência excluída.');
    if (abertaId === id) setAbertaId(null);
    void carregar();
  };

  if (!podeVer) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
          <Lock className="h-8 w-8" aria-hidden="true" />
          <p className="text-sm">
            A folha de pagamento contém dados sensíveis. É necessária permissão no módulo
            «RH — salários e dados bancários».
          </p>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" aria-hidden="true" />
      </div>
    );
  }

  // ===== Detalhe da competência =====
  if (folhaAberta) {
    const trava = bloqueada(folhaAberta.status);
    const lancDoItem = (itemId: string) => lancamentos.filter((l) => l.item_id === itemId);

    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={() => setAbertaId(null)}>
              <ArrowLeft className="mr-1 h-4 w-4" aria-hidden="true" /> Voltar
            </Button>
            <div>
              <h2 className="text-lg font-semibold">
                Folha {competenciaBR(folhaAberta.competencia)} ·{' '}
                {TIPOS.find((t) => t.value === folhaAberta.tipo)?.label}
              </h2>
              <p className="text-xs text-muted-foreground">
                {itens.length} colaborador(es) · líquido {moeda(folhaAberta.total_liquido)}
              </p>
            </div>
            <Badge variant={STATUS[folhaAberta.status]?.variant ?? 'outline'}>
              {STATUS[folhaAberta.status]?.label ?? folhaAberta.status}
            </Badge>
          </div>

          <div className="flex flex-wrap gap-2">
            {!trava && podeCriar && (
              <Button variant="outline" size="sm" onClick={gerarItens} disabled={salvando}>
                <RefreshCw className="mr-1 h-4 w-4" aria-hidden="true" /> Gerar colaboradores
              </Button>
            )}
            {!trava && podeCriar && itens.length > 0 && (
              <Button size="sm" onClick={() => setLancAberto(true)}>
                <Plus className="mr-1 h-4 w-4" aria-hidden="true" /> Lançamento
              </Button>
            )}
            {!trava && podeEditar && (
              <Select value={folhaAberta.status} onValueChange={mudarStatus}>
                <SelectTrigger className="h-9 w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="rascunho">Rascunho</SelectItem>
                  <SelectItem value="em_calculo">Em cálculo</SelectItem>
                  <SelectItem value="conferida">Conferida</SelectItem>
                  <SelectItem value="fechada">Fechar folha</SelectItem>
                  <SelectItem value="cancelada">Cancelar</SelectItem>
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { rotulo: 'Proventos', valor: folhaAberta.total_proventos },
            { rotulo: 'Descontos', valor: folhaAberta.total_descontos },
            { rotulo: 'Líquido', valor: folhaAberta.total_liquido },
          ].map((k) => (
            <Card key={k.rotulo}>
              <CardContent className="py-4">
                <p className="text-xs text-muted-foreground">{k.rotulo}</p>
                <p className="text-xl font-semibold">{moeda(k.valor)}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {itens.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-sm text-muted-foreground">
              Nenhum colaborador nesta competência. Use «Gerar colaboradores» para incluir os
              vínculos ativos com remuneração vigente.
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {itens.map((i) => (
              <Card key={i.id}>
                <CardHeader className="pb-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <CardTitle className="text-base">{nomeColab(i.colaborador_id)}</CardTitle>
                    <div className="flex gap-4 text-sm">
                      <span className="text-muted-foreground">Base {moeda(i.salario_base)}</span>
                      <span className="text-emerald-600 dark:text-emerald-400">+{moeda(i.total_proventos)}</span>
                      <span className="text-destructive">−{moeda(i.total_descontos)}</span>
                      <span className="font-semibold">{moeda(i.total_liquido)}</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {lancDoItem(i.id).length === 0 ? (
                    <p className="text-xs text-muted-foreground">Sem lançamentos.</p>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Verba</TableHead>
                          <TableHead>Referência</TableHead>
                          <TableHead className="text-right">Valor</TableHead>
                          <TableHead className="w-10" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {lancDoItem(i.id).map((l) => {
                          const v = verba(l.verba_id);
                          return (
                            <TableRow key={l.id}>
                              <TableCell>
                                <span className="font-mono text-xs text-muted-foreground">{v?.codigo}</span>{' '}
                                {v?.nome ?? '—'}
                                {v?.tipo === 'desconto' && (
                                  <Badge variant="outline" className="ml-2">Desconto</Badge>
                                )}
                              </TableCell>
                              <TableCell className="text-muted-foreground">{l.referencia ?? '—'}</TableCell>
                              <TableCell className="text-right">{moeda(l.valor)}</TableCell>
                              <TableCell>
                                {!trava && podeExcluir && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Excluir lançamento"
                                    onClick={() => excluirLancamento(l.id)}
                                  >
                                    <Trash2 className="h-4 w-4" aria-hidden="true" />
                                  </Button>
                                )}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={lancAberto} onOpenChange={setLancAberto}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Novo lançamento</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              <div className="space-y-1">
                <Label>Colaborador</Label>
                <Select value={lanc.item_id} onValueChange={(v) => setLanc({ ...lanc, item_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {itens.map((i) => (
                      <SelectItem key={i.id} value={i.id}>{nomeColab(i.colaborador_id)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label>Verba</Label>
                <Select value={lanc.verba_id} onValueChange={(v) => setLanc({ ...lanc, verba_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {verbas.map((v) => (
                      <SelectItem key={v.id} value={v.id}>
                        {v.codigo} · {v.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-1">
                  <Label>Referência</Label>
                  <Input
                    value={lanc.referencia}
                    onChange={(e) => setLanc({ ...lanc, referencia: e.target.value })}
                    placeholder="Ex.: 10 horas"
                  />
                </div>
                <div className="space-y-1">
                  <Label>Valor (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={lanc.valor}
                    onChange={(e) => setLanc({ ...lanc, valor: e.target.value })}
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="ghost" onClick={() => setLancAberto(false)}>Cancelar</Button>
              <Button onClick={salvarLancamento} disabled={salvando}>
                {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
                Lançar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // ===== Lista de competências =====
  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold">
            <Wallet className="h-5 w-5 text-primary" aria-hidden="true" /> Folha de pagamento
          </h2>
          <p className="text-sm text-muted-foreground">
            Competências, verbas e lançamentos por colaborador. Folhas fechadas ficam bloqueadas
            para alteração.
          </p>
        </div>
        {podeCriar && (
          <Button onClick={() => setNovaAberta(true)}>
            <Plus className="mr-1 h-4 w-4" aria-hidden="true" /> Nova competência
          </Button>
        )}
      </div>

      {folhas.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-2 py-12 text-center text-muted-foreground">
            <Calculator className="h-8 w-8" aria-hidden="true" />
            <p className="text-sm">Nenhuma competência criada ainda.</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Competência</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Situação</TableHead>
                  <TableHead className="text-right">Proventos</TableHead>
                  <TableHead className="text-right">Descontos</TableHead>
                  <TableHead className="text-right">Líquido</TableHead>
                  <TableHead className="w-24" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {folhas.map((f) => (
                  <TableRow key={f.id} className="cursor-pointer" onClick={() => setAbertaId(f.id)}>
                    <TableCell className="font-medium">{competenciaBR(f.competencia)}</TableCell>
                    <TableCell>{TIPOS.find((t) => t.value === f.tipo)?.label ?? f.tipo}</TableCell>
                    <TableCell>
                      <Badge variant={STATUS[f.status]?.variant ?? 'outline'}>
                        {STATUS[f.status]?.label ?? f.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{moeda(f.total_proventos)}</TableCell>
                    <TableCell className="text-right">{moeda(f.total_descontos)}</TableCell>
                    <TableCell className="text-right font-semibold">{moeda(f.total_liquido)}</TableCell>
                    <TableCell onClick={(e) => e.stopPropagation()}>
                      {podeExcluir && !bloqueada(f.status) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label="Excluir competência"
                          onClick={() => excluirFolha(f.id)}
                        >
                          <Trash2 className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      <Dialog open={novaAberta} onOpenChange={setNovaAberta}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova competência</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <Label>Competência</Label>
                <Input
                  type="month"
                  value={nova.competencia}
                  onChange={(e) => setNova({ ...nova, competencia: e.target.value })}
                />
              </div>
              <div className="space-y-1">
                <Label>Tipo</Label>
                <Select value={nova.tipo} onValueChange={(v) => setNova({ ...nova, tipo: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIPOS.map((t) => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1">
              <Label>Data de pagamento</Label>
              <Input
                type="date"
                value={nova.data_pagamento}
                onChange={(e) => setNova({ ...nova, data_pagamento: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Observações</Label>
              <Textarea
                value={nova.observacoes}
                onChange={(e) => setNova({ ...nova, observacoes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setNovaAberta(false)}>Cancelar</Button>
            <Button onClick={criarFolha} disabled={salvando}>
              {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />}
              Criar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
