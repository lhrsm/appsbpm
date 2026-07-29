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

type Tabela = 'pat_categorias' | 'pat_unidades' | 'pat_setores' | 'pat_responsaveis';

type Campo = {
  key: string;
  label: string;
  tipo?: 'texto' | 'numero' | 'textarea' | 'switch' | 'ref';
  refTabela?: 'pat_unidades' | 'pat_setores';
  obrigatorio?: boolean;
  col?: 1 | 2;
};

type Entidade = {
  tabela: Tabela;
  titulo: string;
  singular: string;
  ordem: string;
  campos: Campo[];
  resumo: (r: any, refs: Refs) => string;
};

type Refs = { pat_unidades: any[]; pat_setores: any[] };

const ENTIDADES: Entidade[] = [
  {
    tabela: 'pat_categorias',
    titulo: 'Categorias',
    singular: 'categoria',
    ordem: 'nome',
    campos: [
      { key: 'nome', label: 'Nome', obrigatorio: true, col: 2 },
      { key: 'vida_util_meses', label: 'Vida útil padrão (meses)', tipo: 'numero' },
      { key: 'taxa_depreciacao', label: 'Taxa de depreciação (% ao ano)', tipo: 'numero' },
      { key: 'ativo', label: 'Ativa', tipo: 'switch' },
      { key: 'descricao', label: 'Descrição', tipo: 'textarea', col: 2 },
    ],
    resumo: (r) =>
      [r.vida_util_meses && `Vida útil ${r.vida_util_meses} meses`,
       Number(r.taxa_depreciacao) > 0 && `Depreciação ${r.taxa_depreciacao}% a.a.`]
        .filter(Boolean).join(' • ') || 'Sem parâmetros de depreciação',
  },
  {
    tabela: 'pat_unidades',
    titulo: 'Unidades',
    singular: 'unidade',
    ordem: 'nome',
    campos: [
      { key: 'nome', label: 'Nome da unidade', obrigatorio: true, col: 2 },
      { key: 'codigo', label: 'Código' },
      { key: 'cidade', label: 'Cidade' },
      { key: 'estado', label: 'Estado (UF)' },
      { key: 'ativo', label: 'Ativa', tipo: 'switch' },
      { key: 'endereco', label: 'Endereço', tipo: 'textarea', col: 2 },
    ],
    resumo: (r) => [r.codigo, r.cidade, r.estado].filter(Boolean).join(' • ') || 'Sem localização informada',
  },
  {
    tabela: 'pat_setores',
    titulo: 'Setores',
    singular: 'setor',
    ordem: 'nome',
    campos: [
      { key: 'nome', label: 'Nome do setor', obrigatorio: true, col: 2 },
      { key: 'codigo', label: 'Código' },
      { key: 'unidade_id', label: 'Unidade', tipo: 'ref', refTabela: 'pat_unidades' },
      { key: 'ativo', label: 'Ativo', tipo: 'switch' },
    ],
    resumo: (r, refs) =>
      [r.codigo, refs.pat_unidades.find((u) => u.id === r.unidade_id)?.nome]
        .filter(Boolean).join(' • ') || 'Sem unidade vinculada',
  },
  {
    tabela: 'pat_responsaveis',
    titulo: 'Responsáveis',
    singular: 'responsável',
    ordem: 'nome',
    campos: [
      { key: 'nome', label: 'Nome completo', obrigatorio: true, col: 2 },
      { key: 'matricula', label: 'Matrícula' },
      { key: 'cargo', label: 'Cargo / função' },
      { key: 'email', label: 'E-mail' },
      { key: 'telefone', label: 'Telefone' },
      { key: 'unidade_id', label: 'Unidade', tipo: 'ref', refTabela: 'pat_unidades' },
      { key: 'setor_id', label: 'Setor', tipo: 'ref', refTabela: 'pat_setores' },
      { key: 'ativo', label: 'Ativo', tipo: 'switch' },
    ],
    resumo: (r, refs) =>
      [r.matricula, r.cargo, refs.pat_setores.find((s) => s.id === r.setor_id)?.nome]
        .filter(Boolean).join(' • ') || 'Sem lotação informada',
  },
];

function CadastroCrud({ entidade, refs, onChange }: { entidade: Entidade; refs: Refs; onChange: () => void }) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState<any>({});
  const [busca, setBusca] = useState('');

  const vazio = useMemo(() => {
    const base: any = { id: '' };
    entidade.campos.forEach((c) => {
      if (c.tipo === 'switch') base[c.key] = true;
      else if (c.tipo === 'numero') base[c.key] = '';
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

  const salvar = async () => {
    for (const c of entidade.campos) {
      if (c.obrigatorio && !String(form[c.key] ?? '').trim()) return toast.error(`Informe: ${c.label}`);
    }
    setSalvando(true);
    const payload: any = {};
    entidade.campos.forEach((c) => {
      const v = form[c.key];
      if (c.tipo === 'switch') payload[c.key] = !!v;
      else if (c.tipo === 'numero') payload[c.key] = v === '' || v === null ? null : Number(v);
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
    onChange();
  };

  const remover = async (r: any) => {
    if (!confirm('Remover este registro? Bens vinculados permanecem, apenas sem a referência.')) return;
    const { error } = await supabase.from(entidade.tabela).delete().eq('id', r.id);
    if (error) return toast.error(error.message);
    toast.success('Registro removido.');
    void carregar();
    onChange();
  };

  const filtrados = items.filter((r) => !busca || JSON.stringify(r).toLowerCase().includes(busca.toLowerCase()));

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <Input
          className="max-w-sm"
          placeholder={`Buscar em ${entidade.titulo.toLowerCase()}`}
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
        />
        <Button size="sm" onClick={() => { setForm(vazio); setOpen(true); }}>
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
                    <p className="truncate font-semibold">{r.nome}</p>
                    {!r.ativo && <Badge variant="outline">Inativo</Badge>}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">{entidade.resumo(r, refs)}</p>
                </div>
                <Button size="sm" variant="outline" onClick={() => { setForm({ ...vazio, ...r }); setOpen(true); }} title="Editar">
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remover(r)} title="Remover">
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{form.id ? 'Editar' : 'Novo(a)'} {entidade.singular}</DialogTitle>
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
                    {c.tipo === 'ref' ? (
                      <Select
                        value={form[c.key] || 'nenhum'}
                        onValueChange={(v) => setForm({ ...form, [c.key]: v === 'nenhum' ? '' : v })}
                      >
                        <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="nenhum">Não informado</SelectItem>
                          {refs[c.refTabela!].map((o: any) => (
                            <SelectItem key={o.id} value={o.id}>{o.nome}</SelectItem>
                          ))}
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

export default function CadastrosTab({ inicial }: { inicial?: Tabela }) {
  const [refs, setRefs] = useState<Refs>({ pat_unidades: [], pat_setores: [] });

  const carregarRefs = async () => {
    const [u, s] = await Promise.all([
      supabase.from('pat_unidades').select('id,nome').order('nome'),
      supabase.from('pat_setores').select('id,nome').order('nome'),
    ]);
    setRefs({ pat_unidades: u.data || [], pat_setores: s.data || [] });
  };

  useEffect(() => { void carregarRefs(); }, []);

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-semibold">Cadastros patrimoniais</h2>
        <p className="text-sm text-muted-foreground">
          Categorias, unidades, setores e responsáveis utilizados no cadastro e nas movimentações dos bens.
        </p>
      </div>
      <Tabs defaultValue={inicial ?? ENTIDADES[0].tabela}>
        <TabsList className="flex w-full flex-wrap justify-start">
          {ENTIDADES.map((e) => <TabsTrigger key={e.tabela} value={e.tabela}>{e.titulo}</TabsTrigger>)}
        </TabsList>
        {ENTIDADES.map((e) => (
          <TabsContent key={e.tabela} value={e.tabela} className="mt-4">
            <CadastroCrud entidade={e} refs={refs} onChange={carregarRefs} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
