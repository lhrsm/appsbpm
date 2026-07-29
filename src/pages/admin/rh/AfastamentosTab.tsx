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
import { Loader2, Plus, Check, X, ShieldAlert } from 'lucide-react';

const TIPOS = [
  { value: 'atestado_medico', label: 'Atestado médico' },
  { value: 'licenca_maternidade', label: 'Licença-maternidade' },
  { value: 'licenca_paternidade', label: 'Licença-paternidade' },
  { value: 'acidente_trabalho', label: 'Acidente de trabalho' },
  { value: 'licenca_nao_remunerada', label: 'Licença não remunerada' },
  { value: 'suspensao', label: 'Suspensão' },
  { value: 'outro', label: 'Outro' },
];

const STATUS: Record<string, { label: string; variant: any }> = {
  solicitado: { label: 'Em análise', variant: 'secondary' },
  aprovado: { label: 'Homologado', variant: 'default' },
  reprovado: { label: 'Recusado', variant: 'destructive' },
  cancelado: { label: 'Cancelado', variant: 'outline' },
  concluido: { label: 'Encerrado', variant: 'outline' },
};

const dataBR = (d?: string | null) => (d ? new Date(`${d}T12:00:00`).toLocaleDateString('pt-BR') : '—');
const diasEntre = (a: string, b: string) =>
  a && b ? Math.max(0, Math.round((+new Date(b) - +new Date(a)) / 86400000) + 1) : null;

export default function AfastamentosTab() {
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [lista, setLista] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [aberto, setAberto] = useState(false);
  const [arquivo, setArquivo] = useState<File | null>(null);
  const [form, setForm] = useState<any>({
    colaborador_id: '',
    tipo: 'atestado_medico',
    data_inicio: '',
    data_fim: '',
    possui_atestado: false,
    observacoes: '',
  });

  const carregar = async () => {
    setLoading(true);
    const [colab, afa] = await Promise.all([
      supabase.from('rh_colaboradores').select('id, nome').order('nome'),
      supabase.from('rh_afastamentos').select('*').order('data_inicio', { ascending: false }),
    ]);
    if (afa.error) toast.error('Não foi possível carregar os afastamentos.');
    setColaboradores(colab.data ?? []);
    setLista(afa.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  const nomeColab = (id: string) => colaboradores.find((c) => c.id === id)?.nome ?? '—';

  const salvar = async () => {
    if (!form.colaborador_id || !form.data_inicio) {
      toast.error('Informe o colaborador e a data de início.');
      return;
    }
    setSalvando(true);
    let documento_path: string | null = null;
    if (arquivo) {
      const path = `afastamentos/${form.colaborador_id}/${Date.now()}-${arquivo.name}`;
      const { error: upErr } = await supabase.storage.from('rh-documentos').upload(path, arquivo);
      if (upErr) {
        setSalvando(false);
        toast.error('Não foi possível anexar o documento.');
        return;
      }
      documento_path = path;
    }
    const { error } = await supabase.from('rh_afastamentos').insert({
      colaborador_id: form.colaborador_id,
      tipo: form.tipo,
      data_inicio: form.data_inicio,
      data_fim: form.data_fim || null,
      dias: form.data_fim ? diasEntre(form.data_inicio, form.data_fim) : null,
      possui_atestado: form.possui_atestado || !!documento_path,
      documento_path,
      observacoes: form.observacoes || null,
      status: 'solicitado',
    });
    setSalvando(false);
    if (error) {
      toast.error('Não foi possível registrar o afastamento.');
      return;
    }
    toast.success('Afastamento registrado.');
    setAberto(false);
    setArquivo(null);
    carregar();
  };

  const decidir = async (id: string, status: 'aprovado' | 'reprovado') => {
    const { data: sess } = await supabase.auth.getSession();
    const { error } = await supabase
      .from('rh_afastamentos')
      .update({ status, aprovado_por: sess.session?.user.id ?? null, aprovado_em: new Date().toISOString() })
      .eq('id', id);
    if (error) {
      toast.error('Não foi possível atualizar a situação.');
      return;
    }
    toast.success('Situação atualizada.');
    carregar();
  };

  const abrirDocumento = async (path: string) => {
    const { data, error } = await supabase.storage.from('rh-documentos').createSignedUrl(path, 60);
    if (error || !data) {
      toast.error('Não foi possível abrir o documento.');
      return;
    }
    window.open(data.signedUrl, '_blank', 'noopener');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 rounded-md border border-dashed p-3 text-xs text-muted-foreground">
        <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
        Registre apenas a informação administrativa do afastamento. Não descreva diagnóstico, CID ou
        qualquer dado clínico neste cadastro.
      </div>

      <div>
        <Button onClick={() => setAberto(true)}>
          <Plus className="mr-2 h-4 w-4" /> Registrar afastamento
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 p-8 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
        </div>
      ) : lista.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Nenhum afastamento registrado.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {lista.map((a) => (
            <Card key={a.id}>
              <CardContent className="flex items-start justify-between gap-3 p-4">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold">{nomeColab(a.colaborador_id)}</p>
                    <Badge variant={STATUS[a.status]?.variant}>{STATUS[a.status]?.label ?? a.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {TIPOS.find((t) => t.value === a.tipo)?.label ?? a.tipo} • {dataBR(a.data_inicio)} a{' '}
                    {dataBR(a.data_fim)}
                    {a.dias ? ` • ${a.dias} dias` : ''}
                  </p>
                  {a.observacoes && <p className="text-xs text-muted-foreground">{a.observacoes}</p>}
                  {a.documento_path && (
                    <Button
                      variant="link"
                      className="h-auto p-0 text-xs"
                      onClick={() => abrirDocumento(a.documento_path)}
                    >
                      Ver documento anexado
                    </Button>
                  )}
                </div>
                {a.status === 'solicitado' && (
                  <div className="flex shrink-0 gap-1">
                    <Button variant="ghost" size="icon" aria-label="Homologar" onClick={() => decidir(a.id, 'aprovado')}>
                      <Check className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" aria-label="Recusar" onClick={() => decidir(a.id, 'reprovado')}>
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
            <DialogTitle>Registrar afastamento</DialogTitle>
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
            <div className="space-y-1 sm:col-span-2">
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
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
              <Label htmlFor="af-ini">Início *</Label>
              <Input
                id="af-ini"
                type="date"
                value={form.data_inicio}
                onChange={(e) => setForm({ ...form, data_inicio: e.target.value })}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="af-fim">Término previsto</Label>
              <Input
                id="af-fim"
                type="date"
                value={form.data_fim}
                onChange={(e) => setForm({ ...form, data_fim: e.target.value })}
              />
            </div>
            <div className="flex items-center gap-2 sm:col-span-2">
              <Switch
                id="af-atestado"
                checked={form.possui_atestado}
                onCheckedChange={(v) => setForm({ ...form, possui_atestado: v })}
              />
              <Label htmlFor="af-atestado">Possui atestado apresentado</Label>
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="af-doc">Documento (opcional)</Label>
              <Input
                id="af-doc"
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                onChange={(e) => setArquivo(e.target.files?.[0] ?? null)}
              />
            </div>
            <div className="space-y-1 sm:col-span-2">
              <Label htmlFor="af-obs">Observações administrativas</Label>
              <Textarea
                id="af-obs"
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
