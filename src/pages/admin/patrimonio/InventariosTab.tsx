import { useEffect, useState } from 'react';
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
import { Plus, Loader2, ListChecks, Check, X, FileDown, ScanLine } from 'lucide-react';
import { INV_STATUS, ITEM_STATUS, dataBR, exportarPDF, exportarCSV } from '@/lib/patrimonio';
import { usePatRefs, nomeDe } from './usePatRefs';

export default function InventariosTab() {
  const refs = usePatRefs();
  const [inventarios, setInventarios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState<any>({ titulo: '', unidade_id: '', setor_id: '', observacoes: '' });
  const [atual, setAtual] = useState<any>(null);
  const [itens, setItens] = useState<any[]>([]);
  const [bens, setBens] = useState<any[]>([]);
  const [leitura, setLeitura] = useState('');
  const [avulso, setAvulso] = useState({ numero: '', descricao: '' });

  const carregar = async () => {
    setLoading(true);
    const [inv, b] = await Promise.all([
      supabase.from('pat_inventarios').select('*').order('created_at', { ascending: false }),
      supabase.from('pat_bens').select('id,numero_patrimonial,descricao,qr_token,unidade_id,setor_id'),
    ]);
    setInventarios(inv.data || []);
    setBens(b.data || []);
    setLoading(false);
  };

  useEffect(() => { void carregar(); }, []);

  const criar = async () => {
    if (!form.titulo.trim()) return toast.error('Informe o título do inventário.');
    setSalvando(true);
    const { data: sess } = await supabase.auth.getSession();
    const { error } = await supabase.from('pat_inventarios').insert({
      titulo: form.titulo.trim(),
      unidade_id: form.unidade_id || null,
      setor_id: form.setor_id || null,
      observacoes: form.observacoes || null,
      criado_por: sess.session?.user.id ?? null,
      criado_por_email: sess.session?.user.email ?? null,
    });
    setSalvando(false);
    if (error) return toast.error(error.message);
    toast.success('Inventário criado.');
    setOpen(false);
    setForm({ titulo: '', unidade_id: '', setor_id: '', observacoes: '' });
    void carregar();
  };

  const abrirInventario = async (inv: any) => {
    setAtual(inv);
    const { data } = await supabase.from('pat_inventario_itens').select('*').eq('inventario_id', inv.id).order('created_at');
    setItens(data || []);
  };

  const gerarLista = async (inv: any) => {
    const { data, error } = await supabase.rpc('pat_gerar_lista_inventario', { _inventario_id: inv.id });
    if (error) return toast.error(error.message);
    toast.success(`${data ?? 0} bem(ns) adicionados à lista esperada.`);
    void carregar();
    void abrirInventario({ ...inv, status: 'em_andamento' });
  };

  const marcar = async (item: any, status: string, divergencia?: string) => {
    const { data: sess } = await supabase.auth.getSession();
    const { error } = await supabase.from('pat_inventario_itens').update({
      status: status as any,
      divergencia: divergencia ?? item.divergencia,
      conferido_em: new Date().toISOString(),
      conferido_por: sess.session?.user.id ?? null,
    }).eq('id', item.id);
    if (error) return toast.error(error.message);
    setItens((l) => l.map((i) => (i.id === item.id ? { ...i, status, conferido_em: new Date().toISOString() } : i)));
  };

  const conferirPorCodigo = async () => {
    const valor = leitura.trim();
    if (!valor) return;
    const token = valor.split('/').pop() ?? valor;
    const bem = bens.find((b) => b.qr_token === token || b.numero_patrimonial.toLowerCase() === valor.toLowerCase());
    setLeitura('');
    if (!bem) return toast.error('Bem não localizado no cadastro. Registre como bem sem cadastro.');
    const item = itens.find((i) => i.bem_id === bem.id);
    if (item) {
      await marcar(item, 'localizado');
      return toast.success(`${bem.numero_patrimonial} marcado como localizado.`);
    }
    const { error } = await supabase.from('pat_inventario_itens').insert({
      inventario_id: atual.id, bem_id: bem.id, status: 'divergente',
      divergencia: 'Bem encontrado fora da unidade/setor esperado',
      conferido_em: new Date().toISOString(),
    });
    if (error) return toast.error(error.message);
    toast.success('Bem registrado como divergência de localização.');
    void abrirInventario(atual);
  };

  const registrarAvulso = async () => {
    if (!avulso.descricao.trim()) return toast.error('Descreva o bem encontrado.');
    const { error } = await supabase.from('pat_inventario_itens').insert({
      inventario_id: atual.id, status: 'nao_cadastrado',
      numero_avulso: avulso.numero || null, descricao_avulsa: avulso.descricao.trim(),
      conferido_em: new Date().toISOString(),
    });
    if (error) return toast.error(error.message);
    toast.success('Bem sem cadastro registrado.');
    setAvulso({ numero: '', descricao: '' });
    void abrirInventario(atual);
  };

  const encerrar = async () => {
    if (!confirm('Encerrar o inventário? Itens não conferidos serão marcados como não localizados.')) return;
    await supabase.from('pat_inventario_itens')
      .update({ status: 'nao_localizado' as any }).eq('inventario_id', atual.id).eq('status', 'esperado');
    const { error } = await supabase.from('pat_inventarios')
      .update({ status: 'encerrado' as any, data_fim: new Date().toISOString().slice(0, 10) }).eq('id', atual.id);
    if (error) return toast.error(error.message);
    toast.success('Inventário encerrado.');
    void carregar();
    void abrirInventario({ ...atual, status: 'encerrado' });
  };

  const nomeItem = (i: any) => {
    const b = bens.find((x) => x.id === i.bem_id);
    return b ? `${b.numero_patrimonial} — ${b.descricao}` : `${i.numero_avulso ?? 'Sem número'} — ${i.descricao_avulsa ?? 'Bem sem cadastro'}`;
  };

  const relatorio = () => {
    const rows = itens.map((i) => [nomeItem(i), ITEM_STATUS[i.status].label, i.divergencia ?? '—', i.conferido_em ? dataBR(i.conferido_em) : '—']);
    exportarPDF(`Inventário ${atual.titulo}`, ['Bem', 'Situação', 'Divergência', 'Conferido em'], rows,
      `${nomeDe(refs.unidades, atual.unidade_id) ?? 'Todas as unidades'} • ${itens.length} itens`);
  };

  if (atual) {
    const resumo = itens.reduce((acc: any, i) => ({ ...acc, [i.status]: (acc[i.status] ?? 0) + 1 }), {});
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => setAtual(null)}>← Voltar</Button>
          <h2 className="text-lg font-semibold">{atual.titulo}</h2>
          <Badge className={INV_STATUS[atual.status].className}>{INV_STATUS[atual.status].label}</Badge>
          <div className="ml-auto flex gap-2">
            {atual.status === 'planejado' && (
              <Button size="sm" onClick={() => gerarLista(atual)}><ListChecks className="mr-1 h-4 w-4" /> Gerar lista esperada</Button>
            )}
            <Button size="sm" variant="outline" onClick={relatorio}><FileDown className="mr-1 h-4 w-4" /> Relatório</Button>
            <Button size="sm" variant="outline" onClick={() => exportarCSV('inventario', ['Bem', 'Situação'], itens.map((i) => [nomeItem(i), ITEM_STATUS[i.status].label]))}>CSV</Button>
            {atual.status !== 'encerrado' && <Button size="sm" variant="destructive" onClick={encerrar}>Encerrar inventário</Button>}
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          {Object.entries(ITEM_STATUS).map(([k, v]) => `${v.label}: ${resumo[k] ?? 0}`).join(' • ')}
        </p>

        {atual.status !== 'encerrado' && (
          <Card>
            <CardContent className="grid gap-3 p-4 md:grid-cols-2">
              <div>
                <Label>Conferir por QR Code ou número patrimonial</Label>
                <div className="flex gap-2">
                  <Input
                    autoFocus value={leitura}
                    placeholder="Leia o QR Code ou digite o número"
                    onChange={(e) => setLeitura(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && conferirPorCodigo()}
                  />
                  <Button onClick={conferirPorCodigo}><ScanLine className="h-4 w-4" /></Button>
                </div>
              </div>
              <div>
                <Label>Bem encontrado sem cadastro</Label>
                <div className="flex gap-2">
                  <Input className="w-32" placeholder="Nº" value={avulso.numero} onChange={(e) => setAvulso({ ...avulso, numero: e.target.value })} />
                  <Input placeholder="Descrição" value={avulso.descricao} onChange={(e) => setAvulso({ ...avulso, descricao: e.target.value })} />
                  <Button variant="outline" onClick={registrarAvulso}>Registrar</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {itens.length === 0 ? (
          <Card><CardContent className="p-10 text-center text-muted-foreground">Nenhum item na lista. Gere a lista esperada para iniciar a conferência.</CardContent></Card>
        ) : (
          <div className="grid gap-2">
            {itens.map((i) => (
              <Card key={i.id}>
                <CardContent className="flex flex-wrap items-center gap-3 p-3">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{nomeItem(i)}</p>
                    <p className="text-xs text-muted-foreground">
                      {i.divergencia ? `Divergência: ${i.divergencia}` : i.conferido_em ? `Conferido em ${dataBR(i.conferido_em)}` : 'Aguardando conferência'}
                    </p>
                  </div>
                  <Badge className={ITEM_STATUS[i.status].className}>{ITEM_STATUS[i.status].label}</Badge>
                  {atual.status !== 'encerrado' && (
                    <>
                      <Button size="sm" variant="outline" onClick={() => marcar(i, 'localizado')} title="Localizado"><Check className="h-4 w-4" /></Button>
                      <Button size="sm" variant="outline" onClick={() => marcar(i, 'nao_localizado')} title="Não localizado"><X className="h-4 w-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => {
                        const d = prompt('Descreva a divergência encontrada:');
                        if (d) marcar(i, 'divergente', d);
                      }}>Divergência</Button>
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Campanhas de conferência física por unidade ou setor.</p>
        <Button size="sm" onClick={() => setOpen(true)}><Plus className="mr-1 h-4 w-4" /> Novo inventário</Button>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : inventarios.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">Nenhum inventário criado.</CardContent></Card>
      ) : (
        <div className="grid gap-2 md:grid-cols-2">
          {inventarios.map((inv) => (
            <Card key={inv.id} className="cursor-pointer hover:border-primary" onClick={() => abrirInventario(inv)}>
              <CardContent className="p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold">{inv.titulo}</p>
                  <Badge className={INV_STATUS[inv.status].className}>{INV_STATUS[inv.status].label}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  {[nomeDe(refs.unidades, inv.unidade_id) ?? 'Todas as unidades', nomeDe(refs.setores, inv.setor_id)]
                    .filter(Boolean).join(' • ')} • Início {dataBR(inv.data_inicio)}
                  {inv.data_fim ? ` • Fim ${dataBR(inv.data_fim)}` : ''}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Novo inventário</DialogTitle></DialogHeader>
          <div className="grid gap-3">
            <div><Label>Título *</Label><Input value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} placeholder="Inventário anual 2026" /></div>
            <div>
              <Label>Unidade</Label>
              <Select value={form.unidade_id || 'todas'} onValueChange={(v) => setForm({ ...form, unidade_id: v === 'todas' ? '' : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas as unidades</SelectItem>
                  {refs.unidades.map((u) => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Setor</Label>
              <Select value={form.setor_id || 'todos'} onValueChange={(v) => setForm({ ...form, setor_id: v === 'todos' ? '' : v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os setores</SelectItem>
                  {refs.setores.map((s) => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div><Label>Observações</Label><Textarea rows={2} value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={criar} disabled={salvando}>{salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Criar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
