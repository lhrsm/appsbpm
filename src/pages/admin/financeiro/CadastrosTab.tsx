import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { brl } from '@/lib/financeiro';

type Campo = {
  key: string;
  label: string;
  tipo?: 'texto' | 'numero' | 'textarea' | 'select' | 'switch';
  opcoes?: { value: string; label: string }[];
  obrigatorio?: boolean;
  col?: 1 | 2;
};

type Entidade = {
  tabela: 'fin_contas_bancarias' | 'fin_caixas' | 'fin_centros_custo' | 'fin_categorias' | 'fin_fornecedores';
  titulo: string;
  singular: string;
  ordem: string;
  campos: Campo[];
  resumo: (r: any) => string;
};

const ENTIDADES: Entidade[] = [
  {
    tabela: 'fin_contas_bancarias',
    titulo: 'Contas bancárias',
    singular: 'conta bancária',
    ordem: 'nome',
    campos: [
      { key: 'nome', label: 'Nome / apelido', obrigatorio: true, col: 2 },
      { key: 'banco', label: 'Banco' },
      { key: 'tipo', label: 'Tipo', tipo: 'select', opcoes: [
        { value: 'corrente', label: 'Conta corrente' },
        { value: 'poupanca', label: 'Poupança' },
        { value: 'investimento', label: 'Investimento' },
        { value: 'aplicacao', label: 'Aplicação' },
      ] },
      { key: 'agencia', label: 'Agência' },
      { key: 'conta', label: 'Conta' },
      { key: 'saldo_inicial', label: 'Saldo inicial (R$)', tipo: 'numero' },
      { key: 'ativo', label: 'Ativa', tipo: 'switch' },
      { key: 'observacoes', label: 'Observações', tipo: 'textarea', col: 2 },
    ],
    resumo: (r) => [r.banco, r.agencia && `Ag. ${r.agencia}`, r.conta && `C/C ${r.conta}`, `Saldo inicial ${brl(Number(r.saldo_inicial))}`]
      .filter(Boolean).join(' • '),
  },
  {
    tabela: 'fin_caixas',
    titulo: 'Caixas',
    singular: 'caixa',
    ordem: 'nome',
    campos: [
      { key: 'nome', label: 'Nome do caixa', obrigatorio: true, col: 2 },
      { key: 'responsavel', label: 'Responsável' },
      { key: 'saldo_inicial', label: 'Saldo inicial (R$)', tipo: 'numero' },
      { key: 'ativo', label: 'Ativo', tipo: 'switch' },
      { key: 'observacoes', label: 'Observações', tipo: 'textarea', col: 2 },
    ],
    resumo: (r) => [r.responsavel, `Saldo inicial ${brl(Number(r.saldo_inicial))}`].filter(Boolean).join(' • '),
  },
  {
    tabela: 'fin_centros_custo',
    titulo: 'Centros de custo',
    singular: 'centro de custo',
    ordem: 'codigo',
    campos: [
      { key: 'codigo', label: 'Código', obrigatorio: true },
      { key: 'nome', label: 'Nome', obrigatorio: true },
      { key: 'ativo', label: 'Ativo', tipo: 'switch' },
      { key: 'descricao', label: 'Descrição', tipo: 'textarea', col: 2 },
    ],
    resumo: (r) => `${r.codigo} — ${r.descricao ?? 'Sem descrição'}`,
  },
  {
    tabela: 'fin_categorias',
    titulo: 'Categorias',
    singular: 'categoria',
    ordem: 'nome',
    campos: [
      { key: 'nome', label: 'Nome', obrigatorio: true },
      { key: 'natureza', label: 'Natureza', tipo: 'select', obrigatorio: true, opcoes: [
        { value: 'receita', label: 'Receita' },
        { value: 'despesa', label: 'Despesa' },
      ] },
      { key: 'ativo', label: 'Ativa', tipo: 'switch' },
    ],
    resumo: (r) => (r.natureza === 'receita' ? 'Receita' : 'Despesa'),
  },
  {
    tabela: 'fin_fornecedores',
    titulo: 'Fornecedores e favorecidos',
    singular: 'fornecedor',
    ordem: 'nome',
    campos: [
      { key: 'nome', label: 'Nome / razão social', obrigatorio: true, col: 2 },
      { key: 'documento', label: 'CPF / CNPJ' },
      { key: 'telefone', label: 'Telefone' },
      { key: 'email', label: 'E-mail' },
      { key: 'chave_pix', label: 'Chave PIX' },
      { key: 'banco', label: 'Banco' },
      { key: 'agencia', label: 'Agência' },
      { key: 'conta', label: 'Conta' },
      { key: 'ativo', label: 'Ativo', tipo: 'switch' },
      { key: 'observacoes', label: 'Observações', tipo: 'textarea', col: 2 },
    ],
    resumo: (r) => [r.documento, r.telefone, r.email].filter(Boolean).join(' • ') || 'Sem dados de contato',
  },
];

function CadastroCrud({ entidade }: { entidade: Entidade }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState<any>({});
  const [busca, setBusca] = useState('');

  const vazio = useMemo(() => {
    const base: any = { id: '', ativo: true, demo: false };
    entidade.campos.forEach((c) => {
      if (c.tipo === 'switch') base[c.key] = true;
      else if (c.tipo === 'select') base[c.key] = c.opcoes?.[0]?.value ?? '';
      else if (c.tipo === 'numero') base[c.key] = '0';
      else base[c.key] = '';
    });
    return base;
  }, [entidade]);

  const carregar = async () => {
    setLoading(true);
    const { data } = await supabase.from(entidade.tabela).select('*').order(entidade.ordem as any);
    setItems(data || []);
    setLoading(false);
  };

  useEffect(() => { void carregar(); /* eslint-disable-next-line */ }, [entidade.tabela]);

  const abrir = (r?: any) => {
    setForm(r ? { ...vazio, ...r } : vazio);
    setOpen(true);
  };

  const salvar = async () => {
    for (const c of entidade.campos) {
      if (c.obrigatorio && !String(form[c.key] ?? '').trim()) {
        return toast.error(`Informe: ${c.label}`);
      }
    }
    setSalvando(true);
    const payload: any = {};
    entidade.campos.forEach((c) => {
      const v = form[c.key];
      if (c.tipo === 'switch') payload[c.key] = !!v;
      else if (c.tipo === 'numero') payload[c.key] = Number(v || 0);
      else payload[c.key] = v === '' ? null : v;
    });
    const q = form.id
      ? supabase.from(entidade.tabela).update(payload).eq('id', form.id)
      : supabase.from(entidade.tabela).insert(payload);
    const { error } = await q;
    setSalvando(false);
    if (error) return toast.error(error.message);
    toast.success('Registro salvo.');
    setOpen(false);
    void carregar();
  };

  const remover = async (r: any) => {
    if (!confirm('Remover este registro? Lançamentos vinculados permanecerão, apenas sem a referência.')) return;
    const { error } = await supabase.from(entidade.tabela).delete().eq('id', r.id);
    if (error) return toast.error(error.message);
    toast.success('Registro removido.');
    void carregar();
  };

  const filtrados = items.filter((r) =>
    !busca || JSON.stringify(r).toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Input className="max-w-sm" placeholder={`Buscar em ${entidade.titulo.toLowerCase()}`} value={busca} onChange={(e) => setBusca(e.target.value)} />
        <Button size="sm" onClick={() => abrir()}>
          <Plus className="mr-1 h-4 w-4" /> Novo
        </Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : filtrados.length === 0 ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">Nenhum registro cadastrado.</CardContent></Card>
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
          {filtrados.map((r) => (
            <Card key={r.id}>
              <CardContent className="flex items-center gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold truncate">{r.nome}</p>
                    {!r.ativo && <Badge variant="outline">Inativo</Badge>}
                    {r.demo && <Badge variant="outline" className="border-orange-500 text-orange-600">Demonstração</Badge>}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">{entidade.resumo(r)}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => abrir(r)} title="Editar"><Pencil className="h-4 w-4" /></Button>
                <Button size="sm" variant="ghost" onClick={() => remover(r)} title="Remover"><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar' : 'Nova'} {entidade.singular}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 md:grid-cols-2">
            {entidade.campos.map((c) => (
              <div key={c.key} className={c.col === 2 ? 'md:col-span-2' : undefined}>
                {c.tipo === 'switch' ? (
                  <div className="flex items-center justify-between rounded-md border p-3">
                    <Label>{c.label}</Label>
                    <Switch checked={!!form[c.key]} onCheckedChange={(v) => setForm({ ...form, [c.key]: v })} />
                  </div>
                ) : (
                  <>
                    <Label>{c.label}{c.obrigatorio ? ' *' : ''}</Label>
                    {c.tipo === 'select' ? (
                      <Select value={form[c.key] ?? ''} onValueChange={(v) => setForm({ ...form, [c.key]: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {c.opcoes?.map((o) => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    ) : c.tipo === 'textarea' ? (
                      <Textarea rows={2} value={form[c.key] ?? ''} onChange={(e) => setForm({ ...form, [c.key]: e.target.value })} />
                    ) : (
                      <Input
                        type={c.tipo === 'numero' ? 'number' : 'text'}
                        step={c.tipo === 'numero' ? '0.01' : undefined}
                        value={form[c.key] ?? ''}
                        onChange={(e) => setForm({ ...form, [c.key]: e.target.value })}
                      />
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={salvar} disabled={salvando}>
              {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default function CadastrosTab() {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Cadastros financeiros</h2>
        <p className="text-sm text-muted-foreground">
          Contas bancárias, caixas, centros de custo, categorias e favorecidos usados nos lançamentos.
        </p>
      </div>
      <Tabs defaultValue={ENTIDADES[0].tabela}>
        <TabsList className="flex w-full flex-wrap justify-start">
          {ENTIDADES.map((e) => (
            <TabsTrigger key={e.tabela} value={e.tabela}>{e.titulo}</TabsTrigger>
          ))}
        </TabsList>
        {ENTIDADES.map((e) => (
          <TabsContent key={e.tabela} value={e.tabela} className="mt-4">
            <CadastroCrud entidade={e} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
