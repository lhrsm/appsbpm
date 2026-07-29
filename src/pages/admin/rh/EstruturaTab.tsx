import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Loader2 } from 'lucide-react';

type Tabela = 'rh_unidades' | 'rh_setores' | 'rh_cargos';

type Campo = {
  key: string;
  label: string;
  tipo?: 'texto' | 'numero' | 'textarea' | 'switch' | 'ref';
  refTabela?: 'rh_unidades';
  col?: 1 | 2;
};

type Entidade = {
  tabela: Tabela;
  titulo: string;
  singular: string;
  campos: Campo[];
  resumo: (r: any, unidades: any[]) => string;
};

const ENTIDADES: Entidade[] = [
  {
    tabela: 'rh_unidades',
    titulo: 'Unidades',
    singular: 'unidade',
    campos: [
      { key: 'nome', label: 'Nome da unidade', col: 2 },
      { key: 'codigo', label: 'Código' },
      { key: 'cnpj', label: 'CNPJ' },
      { key: 'cidade', label: 'Cidade' },
      { key: 'uf', label: 'UF' },
      { key: 'ativo', label: 'Ativa', tipo: 'switch' },
      { key: 'endereco', label: 'Endereço', tipo: 'textarea', col: 2 },
    ],
    resumo: (r) => [r.codigo, r.cidade, r.uf].filter(Boolean).join(' • ') || 'Sem localização informada',
  },
  {
    tabela: 'rh_setores',
    titulo: 'Setores',
    singular: 'setor',
    campos: [
      { key: 'nome', label: 'Nome do setor', col: 2 },
      { key: 'codigo', label: 'Código' },
      { key: 'unidade_id', label: 'Unidade', tipo: 'ref', refTabela: 'rh_unidades' },
      { key: 'ativo', label: 'Ativo', tipo: 'switch' },
      { key: 'descricao', label: 'Descrição', tipo: 'textarea', col: 2 },
    ],
    resumo: (r, unidades) =>
      [r.codigo, unidades.find((u) => u.id === r.unidade_id)?.nome].filter(Boolean).join(' • ') ||
      'Sem unidade vinculada',
  },
  {
    tabela: 'rh_cargos',
    titulo: 'Cargos',
    singular: 'cargo',
    campos: [
      { key: 'nome', label: 'Nome do cargo', col: 2 },
      { key: 'codigo', label: 'Código' },
      { key: 'cbo', label: 'CBO' },
      { key: 'faixa_salarial_min', label: 'Faixa salarial mínima', tipo: 'numero' },
      { key: 'faixa_salarial_max', label: 'Faixa salarial máxima', tipo: 'numero' },
      { key: 'ativo', label: 'Ativo', tipo: 'switch' },
      { key: 'descricao', label: 'Descrição', tipo: 'textarea', col: 2 },
    ],
    resumo: (r) => [r.codigo, r.cbo && `CBO ${r.cbo}`].filter(Boolean).join(' • ') || 'Sem código informado',
  },
];

export default function EstruturaTab() {
  const [dados, setDados] = useState<Record<Tabela, any[]>>({
    rh_unidades: [],
    rh_setores: [],
    rh_cargos: [],
  });
  const [loading, setLoading] = useState(true);
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [entidade, setEntidade] = useState<Entidade>(ENTIDADES[0]);
  const [editando, setEditando] = useState<any>(null);
  const [form, setForm] = useState<any>({});

  const carregar = async () => {
    setLoading(true);
    const [u, s, c] = await Promise.all([
      supabase.from('rh_unidades').select('*').order('nome'),
      supabase.from('rh_setores').select('*').order('nome'),
      supabase.from('rh_cargos').select('*').order('nome'),
    ]);
    setDados({ rh_unidades: u.data ?? [], rh_setores: s.data ?? [], rh_cargos: c.data ?? [] });
    setLoading(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  const abrir = (ent: Entidade, registro?: any) => {
    setEntidade(ent);
    setEditando(registro ?? null);
    setForm(registro ? { ...registro } : { ativo: true });
    setAberto(true);
  };

  const salvar = async () => {
    if (!form.nome?.trim()) {
      toast.error('Informe o nome.');
      return;
    }
    setSalvando(true);
    const payload: any = {};
    entidade.campos.forEach((c) => {
      let v = form[c.key];
      if (c.tipo === 'numero') v = v === '' || v == null ? null : Number(v);
      else if (c.tipo === 'switch') v = !!v;
      else v = v === '' ? null : v ?? null;
      payload[c.key] = v;
    });
    payload.nome = form.nome;

    const { error } = editando
      ? await supabase.from(entidade.tabela).update(payload).eq('id', editando.id)
      : await supabase.from(entidade.tabela).insert(payload);
    setSalvando(false);
    if (error) {
      toast.error(`Não foi possível salvar a ${entidade.singular}.`);
      return;
    }
    toast.success('Registro salvo.');
    setAberto(false);
    carregar();
  };

  const unidades = dados.rh_unidades;

  return (
    <div className="space-y-4">
      <Tabs defaultValue="rh_unidades">
        <TabsList>
          {ENTIDADES.map((e) => (
            <TabsTrigger key={e.tabela} value={e.tabela}>
              {e.titulo}
            </TabsTrigger>
          ))}
        </TabsList>

        {ENTIDADES.map((e) => (
          <TabsContent key={e.tabela} value={e.tabela} className="mt-4 space-y-3">
            <div className="flex justify-end">
              <Button onClick={() => abrir(e)}>
                <Plus className="mr-2 h-4 w-4" /> Nova {e.singular}
              </Button>
            </div>
            {loading ? (
              <div className="flex items-center gap-2 p-6 text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
              </div>
            ) : dados[e.tabela].length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center text-sm text-muted-foreground">
                  Nenhum registro cadastrado.
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-3 lg:grid-cols-2">
                {dados[e.tabela].map((r) => (
                  <Card key={r.id}>
                    <CardContent className="flex items-start justify-between gap-3 p-4">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="font-medium truncate">{r.nome}</p>
                          {!r.ativo && (
                            <Badge variant="secondary" className="text-[10px]">
                              Inativo
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">{e.resumo(r, unidades)}</p>
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => abrir(e, r)} aria-label="Editar">
                        <Pencil className="h-4 w-4" />
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        ))}
      </Tabs>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-h-[85vh] max-w-xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editando ? 'Editar' : 'Nova'} {entidade.singular}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            {entidade.campos.map((c) => (
              <div key={c.key} className={`space-y-1 ${c.col === 2 ? 'sm:col-span-2' : ''}`}>
                <Label htmlFor={`f-${c.key}`}>{c.label}</Label>
                {c.tipo === 'switch' ? (
                  <div className="pt-1">
                    <Switch
                      id={`f-${c.key}`}
                      checked={!!form[c.key]}
                      onCheckedChange={(v) => setForm({ ...form, [c.key]: v })}
                    />
                  </div>
                ) : c.tipo === 'textarea' ? (
                  <Textarea
                    id={`f-${c.key}`}
                    value={form[c.key] ?? ''}
                    onChange={(ev) => setForm({ ...form, [c.key]: ev.target.value })}
                  />
                ) : c.tipo === 'ref' ? (
                  <Select
                    value={form[c.key] || undefined}
                    onValueChange={(v) => setForm({ ...form, [c.key]: v })}
                  >
                    <SelectTrigger id={`f-${c.key}`}>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {unidades.map((u) => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.nome}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    id={`f-${c.key}`}
                    type={c.tipo === 'numero' ? 'number' : 'text'}
                    value={form[c.key] ?? ''}
                    onChange={(ev) => setForm({ ...form, [c.key]: ev.target.value })}
                  />
                )}
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvar} disabled={salvando}>
              {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
