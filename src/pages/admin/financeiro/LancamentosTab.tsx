import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { usePermissoes } from '@/hooks/usePermissoes';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import {
  Plus, Search, Paperclip, CheckCircle2, Ban, Undo2, History, FileDown,
  Pencil, Trash2, Loader2, AlertTriangle,
} from 'lucide-react';
import PageSkeleton from '@/components/PageSkeleton';
import {
  brl, FIN_STATUS, FORMAS_PAGAMENTO, exportarCSV, exportarPDF, exportarXLSX,
  type FinNatureza, type FinStatus,
} from '@/lib/financeiro';

type Modo = 'receitas' | 'despesas' | 'pagar' | 'receber';

const CONFIG: Record<Modo, { natureza: FinNatureza; titulo: string; somenteAbertos: boolean }> = {
  receitas: { natureza: 'receita', titulo: 'Receitas', somenteAbertos: false },
  despesas: { natureza: 'despesa', titulo: 'Despesas', somenteAbertos: false },
  pagar: { natureza: 'despesa', titulo: 'Contas a pagar', somenteAbertos: true },
  receber: { natureza: 'receita', titulo: 'Contas a receber', somenteAbertos: true },
};

const hoje = () => new Date().toISOString().slice(0, 10);

const emptyForm = {
  id: '',
  descricao: '',
  valor: '',
  competencia: hoje().slice(0, 8) + '01',
  vencimento: hoje(),
  categoria_id: '',
  centro_custo_id: '',
  conta_id: '',
  caixa_id: '',
  fornecedor_id: '',
  forma_pagamento: '',
  documento: '',
  observacoes: '',
  demo: false,
  status: 'pendente' as FinStatus,
};

export default function LancamentosTab({ modo }: { modo: Modo }) {
  const cfg = CONFIG[modo];
  const { pode } = usePermissoes();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState<any[]>([]);
  const [aux, setAux] = useState<{ categorias: any[]; centros: any[]; contas: any[]; caixas: any[]; fornecedores: any[] }>({
    categorias: [], centros: [], contas: [], caixas: [], fornecedores: [],
  });
  const [busca, setBusca] = useState('');
  const [statusF, setStatusF] = useState('todos');
  const [centroF, setCentroF] = useState('todos');
  const [de, setDe] = useState('');
  const [ate, setAte] = useState('');

  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(emptyForm);
  const [salvando, setSalvando] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);

  const [acao, setAcao] = useState<{ tipo: 'cancelar' | 'estornar'; item: any } | null>(null);
  const [justificativa, setJustificativa] = useState('');
  const [historico, setHistorico] = useState<{ item: any; linhas: any[] } | null>(null);

  const carregar = async () => {
    setLoading(true);
    const [lanc, cat, cc, ct, cx, fo] = await Promise.all([
      supabase
        .from('fin_lancamentos')
        .select('*, fin_categorias(nome), fin_centros_custo(nome, codigo), fin_fornecedores(nome), fin_contas_bancarias(nome), fin_caixas(nome)')
        .eq('natureza', cfg.natureza)
        .order('vencimento', { ascending: false }),
      supabase.from('fin_categorias').select('id, nome, natureza').eq('ativo', true).order('nome'),
      supabase.from('fin_centros_custo').select('id, nome, codigo').eq('ativo', true).order('codigo'),
      supabase.from('fin_contas_bancarias').select('id, nome').eq('ativo', true).order('nome'),
      supabase.from('fin_caixas').select('id, nome').eq('ativo', true).order('nome'),
      supabase.from('fin_fornecedores').select('id, nome').eq('ativo', true).order('nome'),
    ]);
    setItems(lanc.data || []);
    setAux({
      categorias: (cat.data || []).filter((c: any) => c.natureza === cfg.natureza),
      centros: cc.data || [],
      contas: ct.data || [],
      caixas: cx.data || [],
      fornecedores: fo.data || [],
    });
    setLoading(false);
  };

  useEffect(() => { void carregar(); /* eslint-disable-next-line */ }, [modo]);

  const filtrados = useMemo(() => {
    return items.filter((l) => {
      if (cfg.somenteAbertos && !['rascunho', 'pendente', 'aprovado'].includes(l.status)) return false;
      if (statusF !== 'todos' && l.status !== statusF) return false;
      if (centroF !== 'todos' && l.centro_custo_id !== centroF) return false;
      if (de && l.vencimento < de) return false;
      if (ate && l.vencimento > ate) return false;
      if (busca) {
        const q = busca.toLowerCase();
        const alvo = `${l.descricao} ${l.documento ?? ''} ${l.fin_fornecedores?.nome ?? ''} ${l.fin_categorias?.nome ?? ''}`.toLowerCase();
        if (!alvo.includes(q)) return false;
      }
      return true;
    });
  }, [items, statusF, centroF, de, ate, busca, cfg.somenteAbertos]);

  const totais = useMemo(() => {
    const soma = (fn: (l: any) => boolean) =>
      filtrados.filter(fn).reduce((a, b) => a + Number(b.valor), 0);
    return {
      total: soma((l) => !['cancelado', 'estornado'].includes(l.status)),
      liquidado: soma((l) => l.status === 'pago'),
      aberto: soma((l) => ['rascunho', 'pendente', 'aprovado'].includes(l.status)),
      vencido: soma((l) => ['pendente', 'aprovado'].includes(l.status) && l.vencimento < hoje()),
      aprovacao: filtrados.filter((l) => l.status === 'pendente').length,
    };
  }, [filtrados]);

  const abrir = (l?: any) => {
    setArquivo(null);
    if (l) {
      setForm({
        ...emptyForm, ...l,
        valor: String(l.valor),
        categoria_id: l.categoria_id ?? '',
        centro_custo_id: l.centro_custo_id ?? '',
        conta_id: l.conta_id ?? '',
        caixa_id: l.caixa_id ?? '',
        fornecedor_id: l.fornecedor_id ?? '',
        forma_pagamento: l.forma_pagamento ?? '',
        documento: l.documento ?? '',
        observacoes: l.observacoes ?? '',
      });
    } else {
      setForm(emptyForm);
    }
    setOpen(true);
  };

  const enviarAnexo = async (lancamentoId: string) => {
    if (!arquivo) return null;
    const path = `${lancamentoId}/${Date.now()}-${arquivo.name.replace(/[^\w.\-]/g, '_')}`;
    const { error } = await supabase.storage.from('financeiro-anexos').upload(path, arquivo);
    if (error) {
      toast.error('Lançamento salvo, mas o anexo falhou.');
      return null;
    }
    return { path, nome: arquivo.name, tipo: arquivo.type, tamanho: arquivo.size };
  };

  const salvar = async () => {
    if (!form.descricao.trim() || !form.valor || !form.vencimento) {
      return toast.error('Descrição, valor e vencimento são obrigatórios.');
    }
    if (Number(form.valor) <= 0) return toast.error('O valor deve ser maior que zero.');
    setSalvando(true);
    const { data: sess } = await supabase.auth.getSession();
    const payload: any = {
      natureza: cfg.natureza,
      descricao: form.descricao.trim(),
      valor: Number(form.valor),
      competencia: form.competencia,
      vencimento: form.vencimento,
      categoria_id: form.categoria_id || null,
      centro_custo_id: form.centro_custo_id || null,
      conta_id: form.conta_id || null,
      caixa_id: form.caixa_id || null,
      fornecedor_id: form.fornecedor_id || null,
      forma_pagamento: form.forma_pagamento || null,
      documento: form.documento || null,
      observacoes: form.observacoes || null,
      demo: !!form.demo,
    };

    let id = form.id;
    if (id) {
      const { error } = await supabase.from('fin_lancamentos').update(payload).eq('id', id);
      if (error) { setSalvando(false); return toast.error(error.message); }
    } else {
      payload.status = 'pendente';
      payload.criado_por = sess.session?.user.id ?? null;
      payload.criado_por_email = sess.session?.user.email ?? null;
      const { data, error } = await supabase.from('fin_lancamentos').insert(payload).select('id').single();
      if (error) { setSalvando(false); return toast.error(error.message); }
      id = data.id;
    }

    if (arquivo && id) {
      const anexo = await enviarAnexo(id);
      if (anexo) {
        const atual = items.find((i) => i.id === id)?.anexos ?? [];
        await supabase.from('fin_lancamentos').update({ anexos: [...atual, anexo] as any }).eq('id', id);
      }
    }

    setSalvando(false);
    setOpen(false);
    toast.success('Lançamento salvo.');
    void carregar();
  };

  const aprovar = async (l: any) => {
    const { data: sess } = await supabase.auth.getSession();
    const { error } = await supabase.from('fin_lancamentos').update({
      status: 'aprovado', aprovado_por: sess.session?.user.id ?? null, aprovado_em: new Date().toISOString(),
    }).eq('id', l.id);
    if (error) return toast.error(error.message);
    toast.success('Lançamento aprovado.');
    void carregar();
  };

  const liquidar = async (l: any) => {
    const { error } = await supabase.from('fin_lancamentos')
      .update({ status: 'pago', pago_em: hoje() }).eq('id', l.id);
    if (error) return toast.error(error.message);
    toast.success('Lançamento liquidado.');
    void carregar();
  };

  const confirmarAcao = async () => {
    if (!acao) return;
    if (justificativa.trim().length < 10) {
      return toast.error('Descreva a justificativa (mínimo 10 caracteres).');
    }
    if (acao.tipo === 'cancelar') {
      const { error } = await supabase.from('fin_lancamentos')
        .update({ status: 'cancelado', justificativa: justificativa.trim() }).eq('id', acao.item.id);
      if (error) return toast.error(error.message);
      toast.success('Lançamento cancelado.');
    } else {
      const l = acao.item;
      const { data: sess } = await supabase.auth.getSession();
      const { error } = await supabase.from('fin_lancamentos').insert({
        natureza: l.natureza === 'receita' ? 'despesa' : 'receita',
        status: 'aprovado',
        descricao: `Estorno — ${l.descricao}`,
        valor: l.valor,
        competencia: l.competencia,
        vencimento: hoje(),
        categoria_id: l.categoria_id,
        centro_custo_id: l.centro_custo_id,
        conta_id: l.conta_id,
        caixa_id: l.caixa_id,
        fornecedor_id: l.fornecedor_id,
        estorno_de: l.id,
        justificativa: justificativa.trim(),
        criado_por: sess.session?.user.id ?? null,
        criado_por_email: sess.session?.user.email ?? null,
        demo: l.demo,
      });
      if (error) return toast.error(error.message);
      await supabase.from('fin_lancamentos')
        .update({ status: 'estornado', justificativa: justificativa.trim() }).eq('id', l.id);
      toast.success('Estorno registrado.');
    }
    setAcao(null);
    setJustificativa('');
    void carregar();
  };

  const excluir = async (l: any) => {
    if (!confirm('Excluir definitivamente este lançamento? Só é possível enquanto ele não foi aprovado.')) return;
    const { error } = await supabase.from('fin_lancamentos').delete().eq('id', l.id);
    if (error) return toast.error(error.message);
    toast.success('Lançamento excluído.');
    void carregar();
  };

  const verHistorico = async (l: any) => {
    const { data } = await supabase.from('fin_lancamento_historico')
      .select('*').eq('lancamento_id', l.id).order('created_at', { ascending: false });
    setHistorico({ item: l, linhas: data || [] });
  };

  const baixarAnexo = async (path: string) => {
    const { data, error } = await supabase.storage.from('financeiro-anexos').createSignedUrl(path, 60);
    if (error || !data) return toast.error('Não foi possível abrir o anexo.');
    window.open(data.signedUrl, '_blank');
  };

  const dadosExport = () => ({
    head: ['Descrição', 'Documento', 'Categoria', 'Centro de custo', 'Favorecido', 'Competência', 'Vencimento', 'Pago em', 'Situação', 'Valor'],
    rows: filtrados.map((l) => [
      l.descricao, l.documento ?? '', l.fin_categorias?.nome ?? '', l.fin_centros_custo?.nome ?? '',
      l.fin_fornecedores?.nome ?? '', l.competencia, l.vencimento, l.pago_em ?? '',
      FIN_STATUS[l.status as FinStatus]?.label ?? l.status, Number(l.valor),
    ] as (string | number)[]),
  });

  const podeCriar = pode('financeiro', 'criar');
  const podeEditar = pode('financeiro', 'editar');
  const podeAprovar = pode('financeiro', 'aprovar');
  const podeExportar = pode('financeiro', 'exportar');
  const podeExcluir = pode('financeiro', 'excluir');

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-lg font-semibold">{cfg.titulo}</h2>
          <p className="text-sm text-muted-foreground">
            {cfg.somenteAbertos
              ? 'Somente lançamentos em aberto (rascunho, aguardando aprovação ou aprovados).'
              : 'Todos os lançamentos desta natureza, incluindo liquidados e estornados.'}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          {podeExportar && (
            <>
              <Button variant="outline" size="sm" onClick={() => { const d = dadosExport(); exportarCSV(cfg.titulo.toLowerCase(), d.head, d.rows); }}>
                <FileDown className="w-4 h-4 mr-1" /> CSV
              </Button>
              <Button variant="outline" size="sm" onClick={() => { const d = dadosExport(); exportarXLSX(cfg.titulo.toLowerCase(), d.head, d.rows); }}>
                <FileDown className="w-4 h-4 mr-1" /> XLSX
              </Button>
              <Button variant="outline" size="sm" onClick={() => {
                const d = dadosExport();
                exportarPDF(cfg.titulo.toLowerCase(), cfg.titulo, d.head, d.rows, [
                  `Total: ${brl(totais.total)}`, `Liquidado: ${brl(totais.liquidado)}`, `Em aberto: ${brl(totais.aberto)}`,
                ]);
              }}>
                <FileDown className="w-4 h-4 mr-1" /> PDF
              </Button>
            </>
          )}
          {podeCriar && (
            <Button size="sm" onClick={() => abrir()}>
              <Plus className="w-4 h-4 mr-1" /> Novo lançamento
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Total do filtro</p><p className="text-xl font-bold">{brl(totais.total)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Liquidado</p><p className="text-xl font-bold text-green-600">{brl(totais.liquidado)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Em aberto</p><p className="text-xl font-bold text-yellow-600">{brl(totais.aberto)}</p></CardContent></Card>
        <Card><CardContent className="p-4"><p className="text-xs text-muted-foreground">Vencido</p><p className="text-xl font-bold text-destructive">{brl(totais.vencido)}</p></CardContent></Card>
      </div>

      {totais.aprovacao > 0 && (
        <div className="flex items-center gap-2 rounded-md border border-yellow-500/40 bg-yellow-500/10 px-3 py-2 text-sm">
          <AlertTriangle className="h-4 w-4 text-yellow-600" aria-hidden="true" />
          {totais.aprovacao} lançamento(s) aguardando aprovação.
        </div>
      )}

      <Card>
        <CardContent className="p-4 grid gap-3 md:grid-cols-5">
          <div className="relative md:col-span-2">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
            <Input className="pl-8" placeholder="Buscar descrição, documento ou favorecido" value={busca} onChange={(e) => setBusca(e.target.value)} />
          </div>
          <Select value={statusF} onValueChange={setStatusF}>
            <SelectTrigger><SelectValue placeholder="Situação" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todas as situações</SelectItem>
              {Object.entries(FIN_STATUS).map(([k, v]) => <SelectItem key={k} value={k}>{v.label}</SelectItem>)}
            </SelectContent>
          </Select>
          <Select value={centroF} onValueChange={setCentroF}>
            <SelectTrigger><SelectValue placeholder="Centro de custo" /></SelectTrigger>
            <SelectContent>
              <SelectItem value="todos">Todos os centros de custo</SelectItem>
              {aux.centros.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.codigo} — {c.nome}</SelectItem>)}
            </SelectContent>
          </Select>
          <div className="flex gap-2">
            <Input type="date" value={de} onChange={(e) => setDe(e.target.value)} aria-label="Vencimento de" />
            <Input type="date" value={ate} onChange={(e) => setAte(e.target.value)} aria-label="Vencimento até" />
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <PageSkeleton rows={5} variant="list" showHeader={false} />
      ) : filtrados.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">Nenhum lançamento encontrado com os filtros atuais.</CardContent></Card>
      ) : (
        <div className="grid gap-2">
          {filtrados.map((l) => {
            const meta = FIN_STATUS[l.status as FinStatus];
            const vencido = ['pendente', 'aprovado'].includes(l.status) && l.vencimento < hoje();
            return (
              <Card key={l.id} className={vencido ? 'border-destructive/40' : undefined}>
                <CardContent className="p-4 flex flex-wrap items-center gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className={meta.className}>{meta.label}</Badge>
                      {vencido && <Badge variant="destructive">Vencido</Badge>}
                      {l.demo && <Badge variant="outline" className="border-orange-500 text-orange-600">Demonstração</Badge>}
                      {l.fin_categorias?.nome && <Badge variant="outline">{l.fin_categorias.nome}</Badge>}
                      {l.fin_centros_custo?.codigo && <Badge variant="secondary">{l.fin_centros_custo.codigo}</Badge>}
                      {Array.isArray(l.anexos) && l.anexos.length > 0 && (
                        <Badge variant="outline"><Paperclip className="mr-1 h-3 w-3" />{l.anexos.length}</Badge>
                      )}
                    </div>
                    <p className="mt-1 font-semibold truncate">{l.descricao}</p>
                    <p className="text-xs text-muted-foreground">
                      Venc.: {format(parseISO(l.vencimento), 'dd/MM/yyyy')}
                      {' • '}Comp.: {format(parseISO(l.competencia), 'MM/yyyy')}
                      {l.pago_em && ` • Liquidado em ${format(parseISO(l.pago_em), 'dd/MM/yyyy')}`}
                      {l.fin_fornecedores?.nome && ` • ${l.fin_fornecedores.nome}`}
                    </p>
                    {Array.isArray(l.anexos) && l.anexos.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-2">
                        {l.anexos.map((a: any) => (
                          <button key={a.path} type="button" onClick={() => baixarAnexo(a.path)}
                            className="text-xs text-primary underline underline-offset-2">
                            {a.nome}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <p className={`text-lg font-bold ${cfg.natureza === 'receita' ? 'text-green-600' : 'text-destructive'}`}>
                    {cfg.natureza === 'receita' ? '+' : '−'} {brl(Number(l.valor))}
                  </p>

                  <div className="flex flex-wrap gap-1">
                    <Button size="sm" variant="ghost" title="Histórico" onClick={() => verHistorico(l)}>
                      <History className="h-4 w-4" />
                    </Button>
                    {podeAprovar && l.status === 'pendente' && (
                      <Button size="sm" variant="outline" title="Aprovar" onClick={() => aprovar(l)}>
                        <CheckCircle2 className="h-4 w-4" />
                      </Button>
                    )}
                    {podeEditar && l.status === 'aprovado' && (
                      <Button size="sm" variant="outline" title="Liquidar" onClick={() => liquidar(l)}>
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    {podeEditar && ['rascunho', 'pendente'].includes(l.status) && (
                      <Button size="sm" variant="outline" title="Editar" onClick={() => abrir(l)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                    )}
                    {podeEditar && ['pendente', 'aprovado'].includes(l.status) && (
                      <Button size="sm" variant="outline" title="Cancelar" onClick={() => { setAcao({ tipo: 'cancelar', item: l }); setJustificativa(''); }}>
                        <Ban className="h-4 w-4" />
                      </Button>
                    )}
                    {podeEditar && l.status === 'pago' && (
                      <Button size="sm" variant="outline" title="Estornar" onClick={() => { setAcao({ tipo: 'estornar', item: l }); setJustificativa(''); }}>
                        <Undo2 className="h-4 w-4" />
                      </Button>
                    )}
                    {podeExcluir && ['rascunho', 'pendente'].includes(l.status) && (
                      <Button size="sm" variant="ghost" title="Excluir" onClick={() => excluir(l)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Formulário */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar lançamento' : `Novo lançamento — ${cfg.natureza === 'receita' ? 'Receita' : 'Despesa'}`}</DialogTitle>
            <DialogDescription>
              O lançamento entra como “aguardando aprovação” e todo o histórico fica registrado.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="md:col-span-2">
              <Label>Descrição *</Label>
              <Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            </div>
            <div>
              <Label>Valor (R$) *</Label>
              <Input type="number" step="0.01" min="0" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} />
            </div>
            <div>
              <Label>Documento / NF</Label>
              <Input value={form.documento} onChange={(e) => setForm({ ...form, documento: e.target.value })} />
            </div>
            <div>
              <Label>Competência</Label>
              <Input type="date" value={form.competencia} onChange={(e) => setForm({ ...form, competencia: e.target.value })} />
            </div>
            <div>
              <Label>Vencimento *</Label>
              <Input type="date" value={form.vencimento} onChange={(e) => setForm({ ...form, vencimento: e.target.value })} />
            </div>
            <div>
              <Label>Categoria</Label>
              <Select value={form.categoria_id || 'nenhum'} onValueChange={(v) => setForm({ ...form, categoria_id: v === 'nenhum' ? '' : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Sem categoria</SelectItem>
                  {aux.categorias.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Centro de custo</Label>
              <Select value={form.centro_custo_id || 'nenhum'} onValueChange={(v) => setForm({ ...form, centro_custo_id: v === 'nenhum' ? '' : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Não informado</SelectItem>
                  {aux.centros.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.codigo} — {c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Conta bancária</Label>
              <Select value={form.conta_id || 'nenhum'} onValueChange={(v) => setForm({ ...form, conta_id: v === 'nenhum' ? '' : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Não informada</SelectItem>
                  {aux.contas.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Caixa</Label>
              <Select value={form.caixa_id || 'nenhum'} onValueChange={(v) => setForm({ ...form, caixa_id: v === 'nenhum' ? '' : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Não informado</SelectItem>
                  {aux.caixas.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>{cfg.natureza === 'receita' ? 'Pagador' : 'Favorecido / Fornecedor'}</Label>
              <Select value={form.fornecedor_id || 'nenhum'} onValueChange={(v) => setForm({ ...form, fornecedor_id: v === 'nenhum' ? '' : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Não informado</SelectItem>
                  {aux.fornecedores.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Forma de pagamento</Label>
              <Select value={form.forma_pagamento || 'nenhum'} onValueChange={(v) => setForm({ ...form, forma_pagamento: v === 'nenhum' ? '' : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhum">Não informada</SelectItem>
                  {FORMAS_PAGAMENTO.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Observações</Label>
              <Textarea rows={2} value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>Anexar nota, recibo ou comprovante</Label>
              <Input type="file" onChange={(e) => setArquivo(e.target.files?.[0] ?? null)} />
            </div>
            <div className="md:col-span-2 flex items-center justify-between rounded-md border p-3">
              <div>
                <p className="text-sm font-medium">Dado de demonstração</p>
                <p className="text-xs text-muted-foreground">Marque apenas em ambiente de teste. Fica sinalizado em todas as telas e relatórios.</p>
              </div>
              <Switch checked={!!form.demo} onCheckedChange={(v) => setForm({ ...form, demo: v })} />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={salvar} disabled={salvando}>
              {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancelamento / estorno */}
      <Dialog open={!!acao} onOpenChange={(v) => !v && setAcao(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{acao?.tipo === 'cancelar' ? 'Cancelar lançamento' : 'Estornar lançamento'}</DialogTitle>
            <DialogDescription>
              {acao?.tipo === 'cancelar'
                ? 'O lançamento não será excluído: ficará registrado como cancelado.'
                : 'Será criado um lançamento de estorno de valor equivalente e o original ficará marcado como estornado.'}
            </DialogDescription>
          </DialogHeader>
          <div>
            <Label>Justificativa *</Label>
            <Textarea rows={3} value={justificativa} onChange={(e) => setJustificativa(e.target.value)}
              placeholder="Explique o motivo desta ação (obrigatório)" />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAcao(null)}>Voltar</Button>
            <Button variant="destructive" onClick={confirmarAcao}>Confirmar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Histórico */}
      <Dialog open={!!historico} onOpenChange={(v) => !v && setHistorico(null)}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Histórico do lançamento</DialogTitle>
            <DialogDescription>{historico?.item?.descricao}</DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            {historico?.linhas.length === 0 && <p className="text-sm text-muted-foreground">Sem registros.</p>}
            {historico?.linhas.map((h: any) => (
              <div key={h.id} className="rounded-md border p-3 text-sm">
                <div className="flex items-center justify-between">
                  <strong>{h.acao.replace('_', ' ')}</strong>
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(h.created_at), 'dd/MM/yyyy HH:mm')}
                  </span>
                </div>
                {h.status_anterior && <p className="text-xs">Situação: {h.status_anterior} → {h.status_novo}</p>}
                {h.valor_anterior != null && <p className="text-xs">Valor: {brl(Number(h.valor_anterior))} → {brl(Number(h.valor_novo))}</p>}
                {h.justificativa && <p className="mt-1 text-xs text-muted-foreground">“{h.justificativa}”</p>}
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
