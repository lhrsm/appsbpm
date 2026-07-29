import { useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, Pencil, Trash2, Loader2, Search } from 'lucide-react';
import AvisoEstrutura from './AvisoEstrutura';
import { useCtbRefs, type Conta } from './useCtbRefs';
import { CONTA_TIPOS, NATUREZAS, dataBR, nivelPorCodigo } from '@/lib/contabilidade';

const vazio = {
  codigo: '', nome: '', tipo: 'ativo', natureza: 'devedora', parent_id: '',
  aceita_lancamento: false, ativa: true, vigencia_inicio: '', vigencia_fim: '',
};

export default function PlanoContasTab() {
  const { contas, loading, recarregar } = useCtbRefs();
  const [busca, setBusca] = useState('');
  const [aberto, setAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(vazio);

  const filtradas = useMemo(() => {
    const q = busca.trim().toLowerCase();
    if (!q) return contas;
    return contas.filter((c) => `${c.codigo} ${c.nome}`.toLowerCase().includes(q));
  }, [contas, busca]);

  const abrir = (c?: Conta) => {
    if (c) {
      setEditId(c.id);
      setForm({
        codigo: c.codigo, nome: c.nome, tipo: c.tipo, natureza: c.natureza,
        parent_id: c.parent_id ?? '', aceita_lancamento: c.aceita_lancamento, ativa: c.ativa,
        vigencia_inicio: c.vigencia_inicio ?? '', vigencia_fim: c.vigencia_fim ?? '',
      });
    } else {
      setEditId(null);
      setForm(vazio);
    }
    setAberto(true);
  };

  const salvar = async () => {
    if (!form.codigo.trim() || !form.nome.trim()) {
      toast.error('Informe o código e o nome da conta.');
      return;
    }
    setSalvando(true);
    const payload = {
      codigo: form.codigo.trim(),
      nome: form.nome.trim(),
      tipo: form.tipo,
      natureza: form.natureza,
      nivel: nivelPorCodigo(form.codigo),
      parent_id: form.parent_id || null,
      aceita_lancamento: form.aceita_lancamento,
      ativa: form.ativa,
      vigencia_inicio: form.vigencia_inicio || null,
      vigencia_fim: form.vigencia_fim || null,
    };
    const { error } = editId
      ? await supabase.from('ctb_plano_contas').update(payload).eq('id', editId)
      : await supabase.from('ctb_plano_contas').insert(payload);
    setSalvando(false);
    if (error) { toast.error(error.message); return; }
    toast.success(editId ? 'Conta atualizada.' : 'Conta cadastrada.');
    setAberto(false);
    await recarregar();
  };

  const excluir = async (c: Conta) => {
    if (!confirm(`Excluir a conta ${c.codigo} — ${c.nome}?`)) return;
    const { error } = await supabase.from('ctb_plano_contas').delete().eq('id', c.id);
    if (error) { toast.error(error.message); return; }
    toast.success('Conta excluída.');
    await recarregar();
  };

  return (
    <div className="space-y-4">
      <AvisoEstrutura />

      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
          <Input className="pl-8" placeholder="Buscar por código ou nome" value={busca} onChange={(e) => setBusca(e.target.value)} />
        </div>
        <Button onClick={() => abrir()}>
          <Plus className="mr-1 h-4 w-4" aria-hidden="true" /> Nova conta
        </Button>
      </div>

      {loading && <p className="text-sm text-muted-foreground">Carregando plano de contas...</p>}
      {!loading && filtradas.length === 0 && (
        <Card><CardContent className="p-6 text-sm text-muted-foreground">
          Nenhuma conta cadastrada. O plano de contas oficial deverá ser definido com o setor contábil.
        </CardContent></Card>
      )}

      <div className="space-y-2">
        {filtradas.map((c) => (
          <Card key={c.id}>
            <CardContent className="flex flex-wrap items-center justify-between gap-3 p-3">
              <div style={{ paddingLeft: `${(c.nivel - 1) * 16}px` }}>
                <p className="font-medium">
                  <span className="font-mono text-sm text-muted-foreground">{c.codigo}</span> — {c.nome}
                </p>
                <p className="text-xs text-muted-foreground">
                  {CONTA_TIPOS.find((t) => t.value === c.tipo)?.label} · {NATUREZAS.find((n) => n.value === c.natureza)?.label} ·
                  Nível {c.nivel} · Vigência {dataBR(c.vigencia_inicio)} a {c.vigencia_fim ? dataBR(c.vigencia_fim) : 'indeterminada'}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={c.aceita_lancamento ? 'default' : 'secondary'}>
                  {c.aceita_lancamento ? 'Analítica' : 'Sintética'}
                </Badge>
                <Badge variant={c.ativa ? 'outline' : 'destructive'}>{c.ativa ? 'Ativa' : 'Inativa'}</Badge>
                <Button size="icon" variant="ghost" aria-label="Editar conta" onClick={() => abrir(c)}>
                  <Pencil className="h-4 w-4" aria-hidden="true" />
                </Button>
                <Button size="icon" variant="ghost" aria-label="Excluir conta" onClick={() => excluir(c)}>
                  <Trash2 className="h-4 w-4 text-destructive" aria-hidden="true" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={aberto} onOpenChange={setAberto}>
        <DialogContent className="max-w-2xl">
          <DialogHeader><DialogTitle>{editId ? 'Editar conta' : 'Nova conta contábil'}</DialogTitle></DialogHeader>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <Label>Código</Label>
              <Input value={form.codigo} onChange={(e) => setForm({ ...form, codigo: e.target.value })} placeholder="1.1.01.001" />
            </div>
            <div>
              <Label>Nome</Label>
              <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
            </div>
            <div>
              <Label>Tipo</Label>
              <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CONTA_TIPOS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Natureza</Label>
              <Select value={form.natureza} onValueChange={(v) => setForm({ ...form, natureza: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {NATUREZAS.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="sm:col-span-2">
              <Label>Conta superior</Label>
              <Select value={form.parent_id || 'nenhuma'} onValueChange={(v) => setForm({ ...form, parent_id: v === 'nenhuma' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Nenhuma" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="nenhuma">Nenhuma (conta raiz)</SelectItem>
                  {contas.filter((c) => c.id !== editId).map((c) => (
                    <SelectItem key={c.id} value={c.id}>{c.codigo} — {c.nome}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Vigência — início</Label>
              <Input type="date" value={form.vigencia_inicio} onChange={(e) => setForm({ ...form, vigencia_inicio: e.target.value })} />
            </div>
            <div>
              <Label>Vigência — fim</Label>
              <Input type="date" value={form.vigencia_fim} onChange={(e) => setForm({ ...form, vigencia_fim: e.target.value })} />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <Label htmlFor="aceita">Aceita lançamento</Label>
              <Switch id="aceita" checked={form.aceita_lancamento} onCheckedChange={(v) => setForm({ ...form, aceita_lancamento: v })} />
            </div>
            <div className="flex items-center justify-between rounded-md border p-3">
              <Label htmlFor="ativa">Ativa</Label>
              <Switch id="ativa" checked={form.ativa} onCheckedChange={(v) => setForm({ ...form, ativa: v })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAberto(false)}>Cancelar</Button>
            <Button onClick={salvar} disabled={salvando}>
              {salvando && <Loader2 className="mr-1 h-4 w-4 animate-spin" aria-hidden="true" />} Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
