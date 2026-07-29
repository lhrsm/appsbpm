import { useEffect, useMemo, useState } from 'react';
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
import { Loader2, Plus, Clock } from 'lucide-react';

const TIPOS = [
  { value: 'normal', label: 'Normal' },
  { value: 'falta', label: 'Falta' },
  { value: 'falta_abonada', label: 'Falta abonada' },
  { value: 'ferias', label: 'Férias' },
  { value: 'afastamento', label: 'Afastamento' },
  { value: 'feriado', label: 'Feriado' },
  { value: 'folga', label: 'Folga' },
  { value: 'hora_extra', label: 'Hora extra' },
];

const DIAS = [
  { v: 1, l: 'Seg' },
  { v: 2, l: 'Ter' },
  { v: 3, l: 'Qua' },
  { v: 4, l: 'Qui' },
  { v: 5, l: 'Sex' },
  { v: 6, l: 'Sáb' },
  { v: 0, l: 'Dom' },
];

const dataBR = (d?: string | null) => (d ? new Date(`${d}T12:00:00`).toLocaleDateString('pt-BR') : '—');

export default function FrequenciaTab() {
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [jornadas, setJornadas] = useState<any[]>([]);
  const [registros, setRegistros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mes, setMes] = useState(() => new Date().toISOString().slice(0, 7));
  const [colabFiltro, setColabFiltro] = useState('todos');

  const [pontoAberto, setPontoAberto] = useState(false);
  const [ponto, setPonto] = useState<any>({
    colaborador_id: '',
    data: new Date().toISOString().slice(0, 10),
    hora_entrada: '',
    hora_saida: '',
    tipo: 'normal',
    abonado: false,
    justificativa: '',
  });

  const [jornadaAberta, setJornadaAberta] = useState(false);
  const [jornada, setJornada] = useState<any>({
    nome: '',
    carga_semanal: '',
    hora_entrada: '',
    hora_saida: '',
    intervalo_minutos: '60',
    dias_semana: [1, 2, 3, 4, 5],
    ativo: true,
  });

  const carregar = async () => {
    setLoading(true);
    const inicio = `${mes}-01`;
    const fimDate = new Date(Number(mes.slice(0, 4)), Number(mes.slice(5, 7)), 0);
    const fim = fimDate.toISOString().slice(0, 10);

    let q = supabase
      .from('rh_frequencia')
      .select('*')
      .gte('data', inicio)
      .lte('data', fim)
      .order('data', { ascending: false });
    if (colabFiltro !== 'todos') q = q.eq('colaborador_id', colabFiltro);

    const [colab, jor, freq] = await Promise.all([
      supabase.from('rh_colaboradores').select('id, nome, matricula_funcional').order('nome'),
      supabase.from('rh_jornadas').select('*').order('nome'),
      q,
    ]);
    if (freq.error) toast.error('Não foi possível carregar a frequência.');
    setColaboradores(colab.data ?? []);
    setJornadas(jor.data ?? []);
    setRegistros(freq.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mes, colabFiltro]);

  const nomeColab = (id: string) => colaboradores.find((c) => c.id === id)?.nome ?? '—';

  const resumo = useMemo(() => {
    const faltas = registros.filter((r) => r.tipo === 'falta').length;
    const horas = registros.reduce((s, r) => s + Number(r.horas_trabalhadas ?? 0), 0);
    return { total: registros.length, faltas, horas };
  }, [registros]);

  const calcularHoras = (e: string, s: string, intervalo = 60) => {
    if (!e || !s) return null;
    const [eh, em] = e.split(':').map(Number);
    const [sh, sm] = s.split(':').map(Number);
    const min = sh * 60 + sm - (eh * 60 + em) - intervalo;
    return min > 0 ? Number((min / 60).toFixed(2)) : 0;
  };

  const salvarPonto = async () => {
    if (!ponto.colaborador_id || !ponto.data) {
      toast.error('Informe o colaborador e a data.');
      return;
    }
    setSalvando(true);
    const { error } = await supabase.from('rh_frequencia').upsert(
      {
        colaborador_id: ponto.colaborador_id,
        data: ponto.data,
        hora_entrada: ponto.hora_entrada || null,
        hora_saida: ponto.hora_saida || null,
        horas_trabalhadas: calcularHoras(ponto.hora_entrada, ponto.hora_saida),
        tipo: ponto.tipo,
        abonado: ponto.abonado,
        justificativa: ponto.justificativa || null,
      },
      { onConflict: 'colaborador_id,data' },
    );
    setSalvando(false);
    if (error) {
      toast.error('Não foi possível registrar a frequência.');
      return;
    }
    toast.success('Frequência registrada.');
    setPontoAberto(false);
    carregar();
  };

  const salvarJornada = async () => {
    if (!jornada.nome.trim()) {
      toast.error('Informe o nome da jornada.');
      return;
    }
    setSalvando(true);
    const { error } = await supabase.from('rh_jornadas').insert({
      nome: jornada.nome.trim(),
      carga_semanal: jornada.carga_semanal ? Number(jornada.carga_semanal) : null,
      hora_entrada: jornada.hora_entrada || null,
      hora_saida: jornada.hora_saida || null,
      intervalo_minutos: Number(jornada.intervalo_minutos || 0),
      dias_semana: jornada.dias_semana,
      ativo: jornada.ativo,
    });
    setSalvando(false);
    if (error) {
      toast.error('Não foi possível salvar a jornada.');
      return;
    }
    toast.success('Jornada cadastrada.');
    setJornadaAberta(false);
    setJornada({
      nome: '',
      carga_semanal: '',
      hora_entrada: '',
      hora_saida: '',
      intervalo_minutos: '60',
      dias_semana: [1, 2, 3, 4, 5],
      ativo: true,
    });
    carregar();
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {[
          { l: 'Registros no mês', v: resumo.total },
          { l: 'Faltas', v: resumo.faltas },
          { l: 'Horas apuradas', v: resumo.horas.toFixed(1) },
        ].map((i) => (
          <Card key={i.l}>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground">{i.l}</p>
              <p className="text-2xl font-bold">{i.v}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Input type="month" className="w-[170px]" value={mes} onChange={(e) => setMes(e.target.value)} />
        <Select value={colabFiltro} onValueChange={setColabFiltro}>
          <SelectTrigger className="w-[240px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os colaboradores</SelectItem>
            {colaboradores.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.nome}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setPontoAberto(true)}>
          <Plus className="mr-2 h-4 w-4" /> Registrar frequência
        </Button>
        <Button variant="outline" onClick={() => setJornadaAberta(true)}>
          <Clock className="mr-2 h-4 w-4" /> Nova jornada
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Frequência do período</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {loading ? (
            <div className="flex items-center gap-2 py-6 text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
            </div>
          ) : registros.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              Nenhum registro de frequência neste período.
            </p>
          ) : (
            registros.map((r) => (
              <div key={r.id} className="flex flex-wrap items-center justify-between gap-2 rounded-md border p-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{nomeColab(r.colaborador_id)}</p>
                  <p className="text-xs text-muted-foreground">
                    {dataBR(r.data)} • {r.hora_entrada?.slice(0, 5) ?? '--:--'} às{' '}
                    {r.hora_saida?.slice(0, 5) ?? '--:--'}
                    {r.horas_trabalhadas ? ` • ${r.horas_trabalhadas}h` : ''}
                  </p>
                  {r.justificativa && <p className="text-xs text-muted-foreground">{r.justificativa}</p>}
                </div>
                <div className="flex items-center gap-2">
                  {r.abonado && <Badge variant="outline">Abonado</Badge>}
                  <Badge variant={r.tipo === 'falta' ? 'destructive' : 'secondary'}>
                    {TIPOS.find((t) => t.value === r.tipo)?.label ?? r.tipo}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Jornadas cadastradas</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          {jornadas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma jornada cadastrada.</p>
          ) : (
            jornadas.map((j) => (
              <div key={j.id} className="rounded-md border p-3">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm font-medium">{j.nome}</p>
                  <Badge variant={j.ativo ? 'default' : 'secondary'}>{j.ativo ? 'Ativa' : 'Inativa'}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {j.hora_entrada?.slice(0, 5) ?? '--:--'} às {j.hora_saida?.slice(0, 5) ?? '--:--'} •{' '}
                  {j.carga_semanal ?? '—'}h/semana • intervalo {j.intervalo_minutos ?? 0} min
                </p>
                <p className="text-xs text-muted-foreground">
                  {(j.dias_semana ?? []).map((d: number) => DIAS.find((x) => x.v === d)?.l).join(', ')}
                </p>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Dialog open={pontoAberto} onOpenChange={setPontoAberto}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Registrar frequência</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label>Colaborador *</Label>
              <Select
                value={ponto.colaborador_id || undefined}
                onValueChange={(v) => setPonto({ ...ponto, colaborador_id: v })}
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
            <div className="space-y-1">
              <Label htmlFor="f-data">Data *</Label>
              <Input
                id="f-data"
                type="date"
                value={ponto.data}
                onChange={(e) => setPonto({ ...ponto, data: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label>Tipo</Label>
              <Select value={ponto.tipo} onValueChange={(v) => setPonto({ ...ponto, tipo: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => (
                    <SelectItem key={t.value} value={t.value}>
                      {t.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="f-ent">Entrada</Label>
              <Input
                id="f-ent"
                type="time"
                value={ponto.hora_entrada}
                onChange={(e) => setPonto({ ...ponto, hora_entrada: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="f-sai">Saída</Label>
              <Input
                id="f-sai"
                type="time"
                value={ponto.hora_saida}
                onChange={(e) => setPonto({ ...ponto, hora_saida: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Switch
                id="f-abono"
                checked={ponto.abonado}
                onCheckedChange={(v) => setPonto({ ...ponto, abonado: v })}
              />
              <Label htmlFor="f-abono">Ocorrência abonada</Label>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="f-just">Justificativa</Label>
              <Textarea
                id="f-just"
                value={ponto.justificativa}
                onChange={(e) => setPonto({ ...ponto, justificativa: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPontoAberto(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarPonto} disabled={salvando}>
              {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={jornadaAberta} onOpenChange={setJornadaAberta}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova jornada de trabalho</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="j-nome">Nome *</Label>
              <Input
                id="j-nome"
                value={jornada.nome}
                onChange={(e) => setJornada({ ...jornada, nome: e.target.value })}
                placeholder="Ex.: Administrativo 40h"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="j-carga">Carga semanal (horas)</Label>
              <Input
                id="j-carga"
                type="number"
                value={jornada.carga_semanal}
                onChange={(e) => setJornada({ ...jornada, carga_semanal: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="j-int">Intervalo (minutos)</Label>
              <Input
                id="j-int"
                type="number"
                value={jornada.intervalo_minutos}
                onChange={(e) => setJornada({ ...jornada, intervalo_minutos: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="j-ent">Entrada</Label>
              <Input
                id="j-ent"
                type="time"
                value={jornada.hora_entrada}
                onChange={(e) => setJornada({ ...jornada, hora_entrada: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="j-sai">Saída</Label>
              <Input
                id="j-sai"
                type="time"
                value={jornada.hora_saida}
                onChange={(e) => setJornada({ ...jornada, hora_saida: e.target.value })}
              />
            </div>
            <div className="space-y-2 sm:col-span-2">
              <Label>Dias da semana</Label>
              <div className="flex flex-wrap gap-2">
                {DIAS.map((d) => {
                  const ativo = jornada.dias_semana.includes(d.v);
                  return (
                    <Button
                      key={d.v}
                      type="button"
                      size="sm"
                      variant={ativo ? 'default' : 'outline'}
                      onClick={() =>
                        setJornada({
                          ...jornada,
                          dias_semana: ativo
                            ? jornada.dias_semana.filter((x: number) => x !== d.v)
                            : [...jornada.dias_semana, d.v],
                        })
                      }
                    >
                      {d.l}
                    </Button>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setJornadaAberta(false)}>
              Cancelar
            </Button>
            <Button onClick={salvarJornada} disabled={salvando}>
              {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
