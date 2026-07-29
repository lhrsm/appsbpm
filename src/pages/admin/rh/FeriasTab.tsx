import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Plus, Check, X } from 'lucide-react';

const STATUS: Record<string, { label: string; variant: any }> = {
  solicitado: { label: 'Solicitado', variant: 'secondary' },
  aprovado: { label: 'Aprovado', variant: 'default' },
  reprovado: { label: 'Reprovado', variant: 'destructive' },
  cancelado: { label: 'Cancelado', variant: 'outline' },
  concluido: { label: 'Concluído', variant: 'outline' },
};

const dataBR = (d?: string | null) => (d ? new Date(`${d}T12:00:00`).toLocaleDateString('pt-BR') : '—');

const diasEntre = (a: string, b: string) =>
  a && b ? Math.max(0, Math.round((+new Date(b) - +new Date(a)) / 86400000) + 1) : 0;

export default function FeriasTab() {
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [lista, setLista] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [filtro, setFiltro] = useState('todos');
  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState<any>({
    colaborador_id: '',
    periodo_aquisitivo_inicio: '',
    periodo_aquisitivo_fim: '',
    data_inicio: '',
    data_fim: '',
    abono_pecuniario: false,
    dias_abono: '0',
    observacoes: '',
  });

  const carregar = async () => {
    setLoading(true);
    let q = supabase.from('rh_ferias').select('*').order('data_inicio', { ascending: false });
    if (filtro !== 'todos') q = q.eq('status', filtro as any);
    const [colab, fer] = await Promise.all([
      supabase.from('rh_colaboradores').select('id, nome').order('nome'),
      q,
    ]);
    if (fer.error) toast.error('Não foi possível carregar as férias.');
    setColaboradores(colab.data ?? []);
    setLista(fer.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro]);

  const nomeColab = (id: string) => colaboradores.find((c) => c.id === id)?.nome ?? '—';

  const salvar = async () => {
    if (!form.colaborador_id || !form.data_inicio || !form.data_fim) {
      toast.error('Informe o colaborador e o período de gozo.');
      return;
    }
    if (form.data_fim < form.data_inicio) {
      toast.error('A data final deve ser posterior à inicial.');
      return;
    }
    setSalvando(true);
    const { error } = await supabase.from('rh_ferias').insert({
      colaborador_id: form.colaborador_id,
      periodo_aquisitivo_inicio: form.periodo_aquisitivo_inicio || null,
      periodo_aquisitivo_fim: form.periodo_aquisitivo_fim || null,
      data_inicio: form.data_inicio,
      data_fim: form.data_fim,
      dias: diasEntre(form.data_inicio, form.data_fim),
      abono_pecuniario: form.abono_pecuniario,
      dias_abono: Number(form.dias_abono || 0),
      observacoes: form.observacoes || null,
      status: 'solicitado',
    });
    setSalvando(false);
    if (error) {
      toast.error('Não foi possível registrar as férias.');
      return;
    }
    toast.success('Solicitação de férias registrada.');
    setAberto(false);
    carregar();
  };

  const decidir = async (id: string, status: 'aprovado' | 'reprovado' | 'cancelado') => {
    const { data: sess } = await supabase.auth.getSession();
    const { error } = await supabase
      .from('rh_ferias')
      .update({
        status,
        aprovado_por: sess.session?.user.id ?? null,
        aprovado_em: new Date().toISOString(),
      })
      .eq('id', id);
    if (error) {
      toast.error(error.message.includes('própria') ? 'Você não pode decidir sobre as próprias férias.' : 'Não foi possível atualizar.');
      return;
    }
    toast.success('Situação atualizada.');
    carregar();
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Select value={filtro} onValueChange={setFiltro}>
          <SelectTrigger className="w-[200px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as situações</SelectItem>
            {Object.entries(STATUS).map(([v, s]) => (
              <SelectItem key={v} value={v}>
                {s.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button onClick={() => setAberto(true)}>
          <Plus className="mr-2 h-4 w-4" /> Programar férias
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 p-8 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
        </div>
      ) : lista.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Nenhum período de férias registrado.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {lista.map((f) => (
            <Card key={f.id}>
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold">{nomeColab(f.colaborador_id)}</p>
                    <Badge variant={STATUS[f.status]?.variant}>{STATUS[f.status]?.label ?? f.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Gozo: {dataBR(f.data_inicio)} a {dataBR(f.data_fim)} • {f.dias ?? 0} dias
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Aquisitivo: {dataBR(f.periodo_aquisitivo_inicio)} a {dataBR(f.periodo_aquisitivo_fim)}
                  </p>
                  {f.abono_pecuniario && (
                    <p className="text-xs text-muted-foreground">Abono pecuniário: {f.dias_abono ?? 0} dias</p>
                  )}
                  {f.observacoes && <p className="text-xs text-muted-foreground">{f.observacoes}</p>}
                </div>
                {f.status === 'solicitado' && (
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" aria-label="Aprovar" onClick={() => decidir(f.id, 'aprovado')}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Reprovar" onClick={() => decidir(f.id, 'reprovado')}>
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Programar férias</DialogTitle>
          </DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1 sm:col-span-2">
              <Label>Colaborador *</Label>
              <Select
                value={form.colaborador_id || undefined}
                onValueChange={(v) => setForm({ ...form, colaborador_id: v })}
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
            {(
              [
                ['periodo_aquisitivo_inicio', 'Aquisitivo — início'],
                ['periodo_aquisitivo_fim', 'Aquisitivo — fim'],
                ['data_inicio', 'Gozo — início *'],
                ['data_fim', 'Gozo — fim *'],
              ] as const
            ).map(([k, l]) => (
              <div key={k} className="space-y-1">
                <Label htmlFor={`fer-${k}`}>{l}</Label>
                <Input
                  id={`fer-${k}`}
                  type="date"
                  value={form[k]}
                  onChange={(e) => setForm({ ...form, [k]: e.target.value })}
                />
              </div>
            ))}
            <div className="flex items-center gap-2">
              <Switch
                id="fer-abono"
                checked={form.abono_pecuniario}
                onCheckedChange={(v) => setForm({ ...form, abono_pecuniario: v })}
              />
              <Label htmlFor="fer-abono">Abono pecuniário</Label>
            </div>
            {form.abono_pecuniario && (
              <div className="space-y-1">
                <Label htmlFor="fer-dias">Dias de abono</Label>
                <Input
                  id="fer-dias"
                  type="number"
                  value={form.dias_abono}
                  onChange={(e) => setForm({ ...form, dias_abono: e.target.value })}
                />
              </div>
            )}
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="fer-obs">Observações</Label>
              <Textarea
                id="fer-obs"
                value={form.observacoes}
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
    </div>
  );
}
