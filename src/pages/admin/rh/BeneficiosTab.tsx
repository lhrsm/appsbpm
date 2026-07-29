import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Plus, UserPlus } from 'lucide-react';

const moeda = (v: any) =>
  v == null ? '—' : Number(v).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
const dataBR = (d?: string | null) => (d ? new Date(`${d}T12:00:00`).toLocaleDateString('pt-BR') : '—');

export default function BeneficiosTab() {
  const [beneficios, setBeneficios] = useState<any[]>([]);
  const [concessoes, setConcessoes] = useState<any[]>([]);
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  const [benAberto, setBenAberto] = useState(false);
  const [ben, setBen] = useState<any>({
    nome: '',
    tipo: '',
    descricao: '',
    valor_padrao: '',
    desconto_colaborador: '',
    ativo: true,
  });

  const [conAberto, setConAberto] = useState(false);
  const [con, setCon] = useState<any>({
    colaborador_id: '',
    beneficio_id: '',
    valor: '',
    data_inicio: new Date().toISOString().slice(0, 10),
    observacoes: '',
  });

  const carregar = async () => {
    setLoading(true);
    const [b, c, colab] = await Promise.all([
      supabase.from('rh_beneficios').select('*').order('nome'),
      supabase.from('rh_beneficio_concessoes').select('*').order('data_inicio', { ascending: false }),
      supabase.from('rh_colaboradores').select('id, nome').order('nome'),
    ]);
    if (b.error) toast.error('Não foi possível carregar os benefícios.');
    setBeneficios(b.data ?? []);
    setConcessoes(c.data ?? []);
    setColaboradores(colab.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  const nomeColab = (id: string) => colaboradores.find((x) => x.id === id)?.nome ?? '—';
  const nomeBen = (id: string) => beneficios.find((x) => x.id === id)?.nome ?? '—';

  const salvarBeneficio = async () => {
    if (!ben.nome.trim()) {
      toast.error('Informe o nome do benefício.');
      return;
    }
    setSalvando(true);
    const { error } = await supabase.from('rh_beneficios').insert({
      nome: ben.nome.trim(),
      tipo: ben.tipo || null,
      descricao: ben.descricao || null,
      valor_padrao: ben.valor_padrao ? Number(ben.valor_padrao) : null,
      desconto_colaborador: ben.desconto_colaborador ? Number(ben.desconto_colaborador) : null,
      ativo: ben.ativo,
    });
    setSalvando(false);
    if (error) {
      toast.error('Não foi possível salvar o benefício.');
      return;
    }
    toast.success('Benefício cadastrado.');
    setBenAberto(false);
    setBen({ nome: '', tipo: '', descricao: '', valor_padrao: '', desconto_colaborador: '', ativo: true });
    carregar();
  };

  const salvarConcessao = async () => {
    if (!con.colaborador_id || !con.beneficio_id) {
      toast.error('Selecione o colaborador e o benefício.');
      return;
    }
    setSalvando(true);
    const padrao = beneficios.find((b) => b.id === con.beneficio_id)?.valor_padrao;
    const { error } = await supabase.from('rh_beneficio_concessoes').insert({
      colaborador_id: con.colaborador_id,
      beneficio_id: con.beneficio_id,
      valor: con.valor ? Number(con.valor) : padrao ?? null,
      data_inicio: con.data_inicio,
      observacoes: con.observacoes || null,
    });
    setSalvando(false);
    if (error) {
      toast.error('Não foi possível conceder o benefício.');
      return;
    }
    toast.success('Benefício concedido.');
    setConAberto(false);
    setCon({
      colaborador_id: '',
      beneficio_id: '',
      valor: '',
      data_inicio: new Date().toISOString().slice(0, 10),
      observacoes: '',
    });
    carregar();
  };

  const encerrar = async (id: string) => {
    const { error } = await supabase
      .from('rh_beneficio_concessoes')
      .update({ ativo: false, data_fim: new Date().toISOString().slice(0, 10) })
      .eq('id', id);
    if (error) {
      toast.error('Não foi possível encerrar a concessão.');
      return;
    }
    toast.success('Concessão encerrada.');
    carregar();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setBenAberto(true)}>
          <Plus className="mr-2 h-4 w-4" /> Novo benefício
        </Button>
        <Button variant="outline" onClick={() => setConAberto(true)}>
          <UserPlus className="mr-2 h-4 w-4" /> Conceder a colaborador
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 p-8 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
        </div>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Catálogo de benefícios</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-2 sm:grid-cols-2">
              {beneficios.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhum benefício cadastrado.</p>
              ) : (
                beneficios.map((b) => (
                  <div key={b.id} className="rounded-md border p-3">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium">{b.nome}</p>
                      <Badge variant={b.ativo ? 'default' : 'secondary'}>{b.ativo ? 'Ativo' : 'Inativo'}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {b.tipo || 'Sem tipo definido'} • valor padrão {moeda(b.valor_padrao)}
                      {b.desconto_colaborador ? ` • desconto ${moeda(b.desconto_colaborador)}` : ''}
                    </p>
                    {b.descricao && <p className="text-xs text-muted-foreground">{b.descricao}</p>}
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Concessões</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {concessoes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Nenhuma concessão registrada.</p>
              ) : (
                concessoes.map((c) => (
                  <div key={c.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{nomeColab(c.colaborador_id)}</p>
                      <p className="text-xs text-muted-foreground">
                        {nomeBen(c.beneficio_id)} • {moeda(c.valor)} • desde {dataBR(c.data_inicio)}
                        {c.data_fim ? ` até ${dataBR(c.data_fim)}` : ''}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={c.ativo ? 'default' : 'secondary'}>{c.ativo ? 'Vigente' : 'Encerrada'}</Badge>
                      {c.ativo && (
                        <Button variant="outline" size="sm" onClick={() => encerrar(c.id)}>
                          Encerrar
                        </Button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}

      <Dialog open={benAberto} onOpenChange={setBenAberto}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Novo benefício</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="b-nome">Nome *</Label>
              <Input id="b-nome" value={ben.nome} onChange={(e) => setBen({ ...ben, nome: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label htmlFor="b-tipo">Tipo</Label>
              <Input
                id="b-tipo"
                placeholder="Ex.: Vale-transporte"
                value={ben.tipo}
                onChange={(e) => setBen({ ...ben, tipo: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="b-valor">Valor padrão (R$)</Label>
              <Input
                id="b-valor"
                type="number"
                step="0.01"
                value={ben.valor_padrao}
                onChange={(e) => setBen({ ...ben, valor_padrao: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="b-desc">Desconto do colaborador (R$)</Label>
              <Input
                id="b-desc"
                type="number"
                step="0.01"
                value={ben.desconto_colaborador}
                onChange={(e) => setBen({ ...ben, desconto_colaborador: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="b-ativo" checked={ben.ativo} onCheckedChange={(v) => setBen({ ...ben, ativo: v })} />
              <Label htmlFor="b-ativo">Ativo</Label>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="b-descricao">Descrição</Label>
              <Textarea
                id="b-descricao"
                value={ben.descricao}
                onChange={(e) => setBen({ ...ben, descricao: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBenAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarBeneficio} disabled={salvando}>
              {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={conAberto} onOpenChange={setConAberto}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Conceder benefício</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label>Colaborador *</Label>
              <Select
                value={con.colaborador_id || undefined}
                onValueChange={(v) => setCon({ ...con, colaborador_id: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o colaborador" />
                </SelectTrigger>
                <SelectContent>
                  {colaboradores.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.nome}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label>Benefício *</Label>
              <Select value={con.beneficio_id || undefined} onValueChange={(v) => setCon({ ...con, beneficio_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o benefício" />
                </SelectTrigger>
                <SelectContent>
                  {beneficios
                    .filter((b) => b.ativo)
                    .map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {b.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="c-valor">Valor (R$)</Label>
              <Input
                id="c-valor"
                type="number"
                step="0.01"
                placeholder="Deixe vazio para usar o padrão"
                value={con.valor}
                onChange={(e) => setCon({ ...con, valor: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="c-ini">Início</Label>
              <Input
                id="c-ini"
                type="date"
                value={con.data_inicio}
                onChange={(e) => setCon({ ...con, data_inicio: e.target.value })}
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="c-obs">Observações</Label>
              <Textarea
                id="c-obs"
                value={con.observacoes}
                onChange={(e) => setCon({ ...con, observacoes: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarConcessao} disabled={salvando}>
              {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Conceder
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
