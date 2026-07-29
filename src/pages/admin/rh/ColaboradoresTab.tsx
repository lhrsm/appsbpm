import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Loader2, Search, Briefcase } from 'lucide-react';
import { maskCPF, maskTelefone } from '@/lib/format';

const SITUACOES = [
  { value: 'ativo', label: 'Ativo' },
  { value: 'afastado', label: 'Afastado' },
  { value: 'ferias', label: 'Em férias' },
  { value: 'suspenso', label: 'Suspenso' },
  { value: 'desligado', label: 'Desligado' },
];

const TIPOS_VINCULO = [
  { value: 'clt', label: 'CLT' },
  { value: 'estagio', label: 'Estágio' },
  { value: 'aprendiz', label: 'Jovem aprendiz' },
  { value: 'temporario', label: 'Temporário' },
  { value: 'terceirizado', label: 'Terceirizado' },
  { value: 'prestador', label: 'Prestador de serviço' },
  { value: 'estatutario', label: 'Estatutário' },
  { value: 'cedido', label: 'Cedido' },
];

const vazio = {
  matricula_funcional: '',
  nome: '',
  nome_social: '',
  cpf: '',
  rg: '',
  data_nascimento: '',
  email: '',
  telefone: '',
  cep: '',
  logradouro: '',
  numero: '',
  bairro: '',
  cidade: '',
  uf: '',
  situacao: 'ativo',
  observacoes: '',
};

export default function ColaboradoresTab() {
  const [lista, setLista] = useState<any[]>([]);
  const [vinculos, setVinculos] = useState<any[]>([]);
  const [refs, setRefs] = useState<{ cargos: any[]; setores: any[]; unidades: any[] }>({
    cargos: [],
    setores: [],
    unidades: [],
  });
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [filtro, setFiltro] = useState('todos');
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [editando, setEditando] = useState<any>(null);
  const [form, setForm] = useState<any>(vazio);

  const [vinculoAberto, setVinculoAberto] = useState(false);
  const [vinculoColab, setVinculoColab] = useState<any>(null);
  const [vinculoForm, setVinculoForm] = useState<any>({
    tipo: 'clt',
    cargo_id: '',
    setor_id: '',
    unidade_id: '',
    data_admissao: '',
    jornada_semanal: '',
  });

  const carregar = async () => {
    setLoading(true);
    const [colab, vinc, cargos, setores, unidades] = await Promise.all([
      supabase.from('rh_colaboradores').select('*').order('nome'),
      supabase.from('rh_vinculos').select('*').order('data_admissao', { ascending: false }),
      supabase.from('rh_cargos').select('id, nome').eq('ativo', true).order('nome'),
      supabase.from('rh_setores').select('id, nome').eq('ativo', true).order('nome'),
      supabase.from('rh_unidades').select('id, nome').eq('ativo', true).order('nome'),
    ]);
    if (colab.error) toast.error('Não foi possível carregar os colaboradores.');
    setLista(colab.data ?? []);
    setVinculos(vinc.data ?? []);
    setRefs({ cargos: cargos.data ?? [], setores: setores.data ?? [], unidades: unidades.data ?? [] });
    setLoading(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    return lista.filter((c) => {
      const okFiltro = filtro === 'todos' || c.situacao === filtro;
      const okBusca =
        !termo ||
        [c.nome, c.matricula_funcional, c.cpf, c.email].some((v: string) =>
          (v ?? '').toLowerCase().includes(termo),
        );
      return okFiltro && okBusca;
    });
  }, [lista, busca, filtro]);

  const vinculoAtual = (colaboradorId: string) =>
    vinculos.find((v) => v.colaborador_id === colaboradorId && v.ativo);

  const abrirNovo = () => {
    setEditando(null);
    setForm(vazio);
    setAberto(true);
  };

  const abrirEdicao = (c: any) => {
    setEditando(c);
    setForm({ ...vazio, ...c, data_nascimento: c.data_nascimento ?? '' });
    setAberto(true);
  };

  const salvar = async () => {
    if (!form.nome.trim() || !form.matricula_funcional.trim()) {
      toast.error('Informe ao menos nome e matrícula funcional.');
      return;
    }
    setSalvando(true);
    const payload: any = { ...form };
    Object.keys(payload).forEach((k) => {
      if (payload[k] === '') payload[k] = null;
    });
    delete payload.id;
    delete payload.created_at;
    delete payload.updated_at;

    const { error } = editando
      ? await supabase.from('rh_colaboradores').update(payload).eq('id', editando.id)
      : await supabase.from('rh_colaboradores').insert(payload);
    setSalvando(false);
    if (error) {
      toast.error(
        error.message.includes('duplicate')
          ? 'Já existe colaborador com essa matrícula ou CPF.'
          : 'Não foi possível salvar o colaborador.',
      );
      return;
    }
    toast.success(editando ? 'Colaborador atualizado.' : 'Colaborador cadastrado.');
    setAberto(false);
    carregar();
  };

  const abrirVinculo = (c: any) => {
    setVinculoColab(c);
    setVinculoForm({
      tipo: 'clt',
      cargo_id: '',
      setor_id: '',
      unidade_id: '',
      data_admissao: '',
      jornada_semanal: '',
    });
    setVinculoAberto(true);
  };

  const salvarVinculo = async () => {
    if (!vinculoForm.data_admissao) {
      toast.error('Informe a data de admissão.');
      return;
    }
    setSalvando(true);
    const { error } = await supabase.from('rh_vinculos').insert({
      colaborador_id: vinculoColab.id,
      tipo: vinculoForm.tipo,
      cargo_id: vinculoForm.cargo_id || null,
      setor_id: vinculoForm.setor_id || null,
      unidade_id: vinculoForm.unidade_id || null,
      data_admissao: vinculoForm.data_admissao,
      jornada_semanal: vinculoForm.jornada_semanal ? Number(vinculoForm.jornada_semanal) : null,
    });
    setSalvando(false);
    if (error) {
      toast.error('Não foi possível registrar o vínculo.');
      return;
    }
    toast.success('Vínculo registrado.');
    setVinculoAberto(false);
    carregar();
  };

  const campo = (key: string, label: string, extra: any = {}) => (
    <div className="space-y-1">
      <Label htmlFor={`rh-${key}`}>{label}</Label>
      <Input
        id={`rh-${key}`}
        value={form[key] ?? ''}
        onChange={(e) => setForm({ ...form, [key]: e.target.value })}
        {...extra}
      />
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input
            className="pl-8"
            placeholder="Buscar por nome, matrícula, CPF ou e-mail"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
          />
        </div>
        <Select value={filtro} onValueChange={setFiltro}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as situações</SelectItem>
            {SITUACOES.map((s) => (
              <SelectItem key={s.value} value={s.value}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={abrirNovo}>
          <Plus className="mr-2 h-4 w-4" /> Novo colaborador
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 p-8 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando colaboradores...
        </div>
      ) : filtrados.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Nenhum colaborador encontrado.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {filtrados.map((c) => {
            const v = vinculoAtual(c.id);
            const cargo = refs.cargos.find((x) => x.id === v?.cargo_id)?.nome;
            const setor = refs.setores.find((x) => x.id === v?.setor_id)?.nome;
            return (
              <Card key={c.id}>
                <CardContent className="flex items-start justify-between gap-3 p-4">
                  <div className="min-w-0 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold truncate">{c.nome}</p>
                      <Badge variant={c.situacao === 'ativo' ? 'default' : 'secondary'} className="text-[10px]">
                        {SITUACOES.find((s) => s.value === c.situacao)?.label ?? c.situacao}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Matrícula {c.matricula_funcional}
                      {c.cpf ? ` • CPF ${maskCPF(c.cpf)}` : ''}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {[cargo, setor].filter(Boolean).join(' • ') || 'Sem vínculo ativo registrado'}
                    </p>
                    {c.telefone && (
                      <p className="text-xs text-muted-foreground">{maskTelefone(c.telefone)}</p>
                    )}
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" onClick={() => abrirVinculo(c)} aria-label="Novo vínculo">
                      <Briefcase className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => abrirEdicao(c)} aria-label="Editar">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-h-[85vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar colaborador' : 'Novo colaborador'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            {campo('matricula_funcional', 'Matrícula funcional *')}
            {campo('cpf', 'CPF')}
            <div className="sm:col-span-2">{campo('nome', 'Nome completo *')}</div>
            {campo('nome_social', 'Nome social')}
            {campo('rg', 'RG')}
            {campo('data_nascimento', 'Data de nascimento', { type: 'date' })}
            <div className="space-y-1">
              <Label>Situação</Label>
              <Select value={form.situacao} onValueChange={(v) => setForm({ ...form, situacao: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SITUACOES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {campo('email', 'E-mail', { type: 'email' })}
            {campo('telefone', 'Telefone')}
            {campo('cep', 'CEP')}
            {campo('logradouro', 'Logradouro')}
            {campo('numero', 'Número')}
            {campo('bairro', 'Bairro')}
            {campo('cidade', 'Cidade')}
            {campo('uf', 'UF', { maxLength: 2 })}
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="rh-obs">Observações</Label>
              <Textarea
                id="rh-obs"
                value={form.observacoes ?? ''}
                onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
              />
            </div>
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

      <Dialog open={vinculoAberto} onOpenChange={setVinculoAberto}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo vínculo — {vinculoColab?.nome}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1">
              <Label>Tipo de vínculo</Label>
              <Select value={vinculoForm.tipo} onValueChange={(v) => setVinculoForm({ ...vinculoForm, tipo: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS_VINCULO.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="v-adm">Data de admissão *</Label>
              <Input
                id="v-adm"
                type="date"
                value={vinculoForm.data_admissao}
                onChange={(e) => setVinculoForm({ ...vinculoForm, data_admissao: e.target.value })}
              />
            </div>
            {(
              [
                ['cargo_id', 'Cargo', refs.cargos],
                ['setor_id', 'Setor', refs.setores],
                ['unidade_id', 'Unidade', refs.unidades],
              ] as const
            ).map(([key, label, opts]) => (
              <div key={key} className="space-y-1">
                <Label>{label}</Label>
                <Select
                  value={vinculoForm[key] || undefined}
                  onValueChange={(v) => setVinculoForm({ ...vinculoForm, [key]: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={`Selecione ${label.toLowerCase()}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {opts.map((o: any) => (
                      <SelectItem key={o.id} value={o.id}>
                        {o.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            ))}
            <div className="space-y-1">
              <Label htmlFor="v-jor">Jornada semanal (horas)</Label>
              <Input
                id="v-jor"
                type="number"
                value={vinculoForm.jornada_semanal}
                onChange={(e) => setVinculoForm({ ...vinculoForm, jornada_semanal: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setVinculoAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarVinculo} disabled={salvando}>
              {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Registrar vínculo
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
