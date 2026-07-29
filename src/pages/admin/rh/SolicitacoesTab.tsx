import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Loader2, Plus } from 'lucide-react';

const STATUS: Record<string, { label: string; variant: any }> = {
  solicitado: { label: 'Aberta', variant: 'secondary' },
  aprovado: { label: 'Deferida', variant: 'default' },
  reprovado: { label: 'Indeferida', variant: 'destructive' },
  cancelado: { label: 'Cancelada', variant: 'outline' },
  concluido: { label: 'Concluída', variant: 'outline' },
};

const TIPOS = [
  'Declaração de vínculo',
  'Segunda via de holerite',
  'Alteração de dados cadastrais',
  'Adiantamento salarial',
  'Antecipação de férias',
  'Outro',
];

const dataHora = (d: string) => new Date(d).toLocaleString('pt-BR');

export default function SolicitacoesTab() {
  const [colaboradores, setColaboradores] = useState<any[]>([]);
  const [lista, setLista] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [filtro, setFiltro] = useState('todos');

  const [aberto, setAberto] = useState(false);
  const [form, setForm] = useState<any>({ colaborador_id: '', tipo: TIPOS[0], descricao: '' });

  const [respostaAberta, setRespostaAberta] = useState(false);
  const [alvo, setAlvo] = useState<any>(null);
  const [resposta, setResposta] = useState('');
  const [decisao, setDecisao] = useState<'aprovado' | 'reprovado'>('aprovado');

  const carregar = async () => {
    setLoading(true);
    let q = supabase.from('rh_solicitacoes').select('*').order('created_at', { ascending: false });
    if (filtro !== 'todos') q = q.eq('status', filtro as any);
    const [colab, sol] = await Promise.all([
      supabase.from('rh_colaboradores').select('id, nome').order('nome'),
      q,
    ]);
    if (sol.error) toast.error('Não foi possível carregar as solicitações.');
    setColaboradores(colab.data ?? []);
    setLista(sol.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    carregar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filtro]);

  const nomeColab = (id: string) => colaboradores.find((c) => c.id === id)?.nome ?? '—';

  const salvar = async () => {
    if (!form.colaborador_id || !form.tipo) {
      toast.error('Informe o colaborador e o tipo da solicitação.');
      return;
    }
    setSalvando(true);
    const { error } = await supabase.from('rh_solicitacoes').insert({
      colaborador_id: form.colaborador_id,
      tipo: form.tipo,
      descricao: form.descricao || null,
      status: 'solicitado',
    });
    setSalvando(false);
    if (error) {
      toast.error('Não foi possível registrar a solicitação.');
      return;
    }
    toast.success('Solicitação registrada.');
    setAberto(false);
    setForm({ colaborador_id: '', tipo: TIPOS[0], descricao: '' });
    carregar();
  };

  const responder = async () => {
    if (!alvo) return;
    setSalvando(true);
    const { data: sess } = await supabase.auth.getSession();
    const { error } = await supabase
      .from('rh_solicitacoes')
      .update({
        status: decisao,
        resposta: resposta || null,
        respondido_por: sess.session?.user.id ?? null,
        respondido_em: new Date().toISOString(),
      })
      .eq('id', alvo.id);
    setSalvando(false);
    if (error) {
      toast.error(
        error.message.includes('própria')
          ? 'Você não pode responder à sua própria solicitação.'
          : 'Não foi possível responder a solicitação.',
      );
      return;
    }
    toast.success('Solicitação respondida.');
    setRespostaAberta(false);
    setResposta('');
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
          <Plus className="mr-2 h-4 w-4" /> Nova solicitação
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 p-8 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" /> Carregando...
        </div>
      ) : lista.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-sm text-muted-foreground">
            Nenhuma solicitação registrada.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {lista.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex flex-wrap items-start justify-between gap-3 p-4">
                <div className="min-w-0 space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate font-semibold">{s.tipo}</p>
                    <Badge variant={STATUS[s.status]?.variant}>{STATUS[s.status]?.label ?? s.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {nomeColab(s.colaborador_id)} • aberta em {dataHora(s.created_at)}
                  </p>
                  {s.descricao && <p className="text-sm">{s.descricao}</p>}
                  {s.resposta && <p className="text-xs text-muted-foreground">Resposta: {s.resposta}</p>}
                </div>
                {s.status === 'solicitado' && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAlvo(s);
                      setDecisao('aprovado');
                      setResposta('');
                      setRespostaAberta(true);
                    }}
                  >
                    Responder
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Nova solicitação</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
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
            <div className="space-y-1">
              <Label>Tipo *</Label>
              <Select value={TIPOS.includes(form.tipo) ? form.tipo : 'Outro'} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {TIPOS.map((t) => (
                    <SelectItem key={t} value={t}>
                      {t}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {!TIPOS.slice(0, -1).includes(form.tipo) && (
              <div className="space-y-1">
                <Label htmlFor="s-outro">Descreva o tipo</Label>
                <Input
                  id="s-outro"
                  placeholder="Ex.: Solicitação de crachá"
                  onChange={(e) => setForm({ ...form, tipo: e.target.value || 'Outro' })}
                />
              </div>
            )}
            <div className="space-y-1">
              <Label htmlFor="s-desc">Descrição</Label>
              <Textarea
                id="s-desc"
                value={form.descricao}
                onChange={(e) => setForm({ ...form, descricao: e.target.value })}
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

      <Dialog open={respostaAberta} onOpenChange={setRespostaAberta}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Responder solicitação</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div className="space-y-1">
              <Label>Decisão</Label>
              <Select value={decisao} onValueChange={(v: any) => setDecisao(v)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="aprovado">Deferir</SelectItem>
                  <SelectItem value="reprovado">Indeferir</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1">
              <Label htmlFor="r-texto">Resposta</Label>
              <Textarea id="r-texto" value={resposta} onChange={(e) => setResposta(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setRespostaAberta(false)}>
              Cancelar
            </Button>
            <Button onClick={responder} disabled={salvando}>
              {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Enviar resposta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
