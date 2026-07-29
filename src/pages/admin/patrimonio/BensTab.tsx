import { useEffect, useMemo, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { Plus, Pencil, QrCode, History, Loader2, Paperclip, Trash2, Printer, FileDown } from 'lucide-react';
import {
  PAT_STATUS, PatStatus, CONSERVACAO, brl, dataBR, dataHoraBR, depreciacao,
  gerarQRDataUrl, urlQR, gerarEtiquetasPDF, exportarCSV, exportarPDF, exportarXLSX,
  uploadAnexos, abrirAnexo,
} from '@/lib/patrimonio';
import { usePatRefs, nomeDe } from './usePatRefs';

const STATUS_KEYS = Object.keys(PAT_STATUS) as PatStatus[];

const vazio = {
  id: '', numero_patrimonial: '', codigo_interno: '', descricao: '', categoria_id: '',
  marca: '', modelo: '', numero_serie: '', data_aquisicao: '', valor: '', fornecedor_id: '',
  fornecedor_nome: '', nota_fiscal: '', localizacao: '', unidade_id: '', setor_id: '',
  responsavel_id: '', estado_conservacao: 'bom', vida_util_meses: '', taxa_depreciacao: '',
  status: 'em_uso', observacoes: '', fotos: [] as any[], documentos: [] as any[],
};

export default function BensTab() {
  const refs = usePatRefs();
  const [bens, setBens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [busca, setBusca] = useState('');
  const [fStatus, setFStatus] = useState('todos');
  const [fUnidade, setFUnidade] = useState('todas');
  const [fCategoria, setFCategoria] = useState('todas');
  const [open, setOpen] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState<any>(vazio);
  const [qrBem, setQrBem] = useState<any>(null);
  const [qrImg, setQrImg] = useState('');
  const [histBem, setHistBem] = useState<any>(null);
  const [historico, setHistorico] = useState<any[]>([]);
  const fotoRef = useRef<HTMLInputElement>(null);
  const docRef = useRef<HTMLInputElement>(null);

  const carregar = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('pat_bens').select('*').order('numero_patrimonial');
    if (error) toast.error(error.message);
    setBens(data || []);
    setLoading(false);
  };

  useEffect(() => { void carregar(); }, []);

  const filtrados = useMemo(() => bens.filter((b) => {
    if (fStatus !== 'todos' && b.status !== fStatus) return false;
    if (fUnidade !== 'todas' && b.unidade_id !== fUnidade) return false;
    if (fCategoria !== 'todas' && b.categoria_id !== fCategoria) return false;
    if (busca) {
      const t = `${b.numero_patrimonial} ${b.codigo_interno ?? ''} ${b.descricao} ${b.marca ?? ''} ${b.modelo ?? ''} ${b.numero_serie ?? ''}`;
      if (!t.toLowerCase().includes(busca.toLowerCase())) return false;
    }
    return true;
  }), [bens, busca, fStatus, fUnidade, fCategoria]);

  const totalValor = filtrados.reduce((s, b) => s + Number(b.valor || 0), 0);

  const abrir = (b?: any) => {
    setForm(b ? { ...vazio, ...b, valor: String(b.valor ?? ''), data_aquisicao: b.data_aquisicao ?? '' } : vazio);
    setOpen(true);
  };

  const salvar = async () => {
    if (!form.numero_patrimonial.trim()) return toast.error('Informe o número patrimonial.');
    if (!form.descricao.trim()) return toast.error('Informe a descrição do bem.');
    setSalvando(true);
    const { data: sess } = await supabase.auth.getSession();
    const payload: any = {
      numero_patrimonial: form.numero_patrimonial.trim(),
      codigo_interno: form.codigo_interno || null,
      descricao: form.descricao.trim(),
      categoria_id: form.categoria_id || null,
      marca: form.marca || null,
      modelo: form.modelo || null,
      numero_serie: form.numero_serie || null,
      data_aquisicao: form.data_aquisicao || null,
      valor: Number(form.valor || 0),
      fornecedor_id: form.fornecedor_id || null,
      fornecedor_nome: form.fornecedor_nome || null,
      nota_fiscal: form.nota_fiscal || null,
      localizacao: form.localizacao || null,
      unidade_id: form.unidade_id || null,
      setor_id: form.setor_id || null,
      responsavel_id: form.responsavel_id || null,
      estado_conservacao: form.estado_conservacao,
      vida_util_meses: form.vida_util_meses === '' ? null : Number(form.vida_util_meses),
      taxa_depreciacao: Number(form.taxa_depreciacao || 0),
      status: form.status,
      observacoes: form.observacoes || null,
      fotos: form.fotos ?? [],
      documentos: form.documentos ?? [],
    };
    if (!form.id) {
      payload.criado_por = sess.session?.user.id ?? null;
      payload.criado_por_email = sess.session?.user.email ?? null;
    }
    const { error } = form.id
      ? await supabase.from('pat_bens').update(payload).eq('id', form.id)
      : await supabase.from('pat_bens').insert(payload);
    setSalvando(false);
    if (error) {
      return toast.error(
        error.message.includes('pat_bens_numero_uk')
          ? 'Já existe um bem com esse número patrimonial.'
          : error.message,
      );
    }
    toast.success('Bem salvo.');
    setOpen(false);
    void carregar();
  };

  const excluir = async (b: any) => {
    if (!confirm('Excluir este bem? Só é permitido para cadastros sem histórico. Caso contrário, utilize a baixa patrimonial.')) return;
    const { error } = await supabase.from('pat_bens').delete().eq('id', b.id);
    if (error) return toast.error(error.message);
    toast.success('Bem excluído.');
    void carregar();
  };

  const anexar = async (campo: 'fotos' | 'documentos', files: FileList | null) => {
    if (!files?.length) return;
    try {
      const novos = await uploadAnexos(campo, files);
      setForm((f: any) => ({ ...f, [campo]: [...(f[campo] ?? []), ...novos] }));
      toast.success('Arquivo(s) anexado(s). Salve o bem para confirmar.');
    } catch (e: any) {
      toast.error(e?.message ?? 'Falha no upload.');
    }
  };

  const verQR = async (b: any) => {
    setQrBem(b);
    setQrImg(await gerarQRDataUrl(b.qr_token));
  };

  const verHistorico = async (b: any) => {
    setHistBem(b);
    const { data } = await supabase
      .from('pat_bem_historico').select('*').eq('bem_id', b.id).order('created_at', { ascending: false });
    setHistorico(data || []);
  };

  const linhas = () => filtrados.map((b) => [
    b.numero_patrimonial, b.descricao,
    nomeDe(refs.categorias, b.categoria_id) ?? '—',
    PAT_STATUS[b.status as PatStatus].label,
    nomeDe(refs.unidades, b.unidade_id) ?? '—',
    nomeDe(refs.setores, b.setor_id) ?? '—',
    nomeDe(refs.responsaveis, b.responsavel_id) ?? '—',
    dataBR(b.data_aquisicao), Number(b.valor || 0),
  ]);
  const cabecalho = ['Nº patrimonial', 'Descrição', 'Categoria', 'Situação', 'Unidade', 'Setor', 'Responsável', 'Aquisição', 'Valor'];

  const setoresFiltrados = form.unidade_id
    ? refs.setores.filter((s) => !s.unidade_id || s.unidade_id === form.unidade_id)
    : refs.setores;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <Input className="max-w-xs" placeholder="Buscar por número, descrição, série..." value={busca} onChange={(e) => setBusca(e.target.value)} />
        <Select value={fStatus} onValueChange={setFStatus}>
          <SelectTrigger className="w-[190px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todas as situações</SelectItem>
            {STATUS_KEYS.map((s) => <SelectItem key={s} value={s}>{PAT_STATUS[s].label}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={fUnidade} onValueChange={setFUnidade}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as unidades</SelectItem>
            {refs.unidades.map((u) => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={fCategoria} onValueChange={setFCategoria}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas as categorias</SelectItem>
            {refs.categorias.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
          </SelectContent>
        </Select>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button size="sm" variant="outline" onClick={() => exportarPDF('Bens patrimoniais', cabecalho, linhas())}>
            <FileDown className="mr-1 h-4 w-4" /> PDF
          </Button>
          <Button size="sm" variant="outline" onClick={() => exportarXLSX('bens-patrimoniais', cabecalho, linhas())}>XLSX</Button>
          <Button size="sm" variant="outline" onClick={() => exportarCSV('bens-patrimoniais', cabecalho, linhas())}>CSV</Button>
          <Button size="sm" variant="outline" onClick={() => gerarEtiquetasPDF(filtrados)} disabled={!filtrados.length}>
            <Printer className="mr-1 h-4 w-4" /> Etiquetas QR
          </Button>
          <Button size="sm" onClick={() => abrir()}><Plus className="mr-1 h-4 w-4" /> Novo bem</Button>
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        {filtrados.length} bem(ns) • valor de aquisição {brl(totalValor)}
      </p>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando bens...</p>
      ) : filtrados.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">Nenhum bem encontrado com os filtros atuais.</CardContent></Card>
      ) : (
        <div className="grid gap-2">
          {filtrados.map((b) => {
            const dep = depreciacao(b);
            return (
              <Card key={b.id}>
                <CardContent className="flex flex-wrap items-center gap-3 p-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs text-muted-foreground">{b.numero_patrimonial}</span>
                      <p className="truncate font-semibold">{b.descricao}</p>
                      <Badge className={PAT_STATUS[b.status as PatStatus].className}>{PAT_STATUS[b.status as PatStatus].label}</Badge>
                    </div>
                    <p className="truncate text-xs text-muted-foreground">
                      {[nomeDe(refs.categorias, b.categoria_id), [b.marca, b.modelo].filter(Boolean).join(' '),
                        nomeDe(refs.unidades, b.unidade_id), nomeDe(refs.setores, b.setor_id),
                        nomeDe(refs.responsaveis, b.responsavel_id) && `Resp.: ${nomeDe(refs.responsaveis, b.responsavel_id)}`,
                        b.localizacao].filter(Boolean).join(' • ') || 'Sem localização definida'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Aquisição {dataBR(b.data_aquisicao)} • {brl(Number(b.valor || 0))} • valor contábil {brl(dep.atual)}
                    </p>
                  </div>
                  <Button size="sm" variant="outline" onClick={() => verQR(b)} title="QR Code"><QrCode className="h-4 w-4" /></Button>
                  <Button size="sm" variant="outline" onClick={() => verHistorico(b)} title="Histórico"><History className="h-4 w-4" /></Button>
                  <Button size="sm" variant="outline" onClick={() => abrir(b)} title="Editar"><Pencil className="h-4 w-4" /></Button>
                  <Button size="sm" variant="ghost" onClick={() => excluir(b)} title="Excluir"><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Cadastro */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-h-[92vh] max-w-3xl overflow-y-auto">
          <DialogHeader><DialogTitle>{form.id ? 'Editar bem' : 'Novo bem'}</DialogTitle></DialogHeader>
          <Tabs defaultValue="identificacao">
            <TabsList className="flex w-full flex-wrap justify-start">
              <TabsTrigger value="identificacao">Identificação</TabsTrigger>
              <TabsTrigger value="aquisicao">Aquisição</TabsTrigger>
              <TabsTrigger value="localizacao">Localização</TabsTrigger>
              <TabsTrigger value="anexos">Fotos e documentos</TabsTrigger>
            </TabsList>

            <TabsContent value="identificacao" className="mt-4 grid gap-3 md:grid-cols-2">
              <div><Label>Número patrimonial *</Label><Input value={form.numero_patrimonial} onChange={(e) => setForm({ ...form, numero_patrimonial: e.target.value })} /></div>
              <div><Label>Código interno</Label><Input value={form.codigo_interno} onChange={(e) => setForm({ ...form, codigo_interno: e.target.value })} /></div>
              <div className="md:col-span-2"><Label>Descrição *</Label><Input value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} /></div>
              <div>
                <Label>Categoria</Label>
                <Select value={form.categoria_id || 'nenhum'} onValueChange={(v) => setForm({ ...form, categoria_id: v === 'nenhum' ? '' : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Não informada</SelectItem>
                    {refs.categorias.map((c) => <SelectItem key={c.id} value={c.id}>{c.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Situação</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {STATUS_KEYS.filter((s) => s !== 'baixado').map((s) => (
                      <SelectItem key={s} value={s}>{PAT_STATUS[s].label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Marca</Label><Input value={form.marca} onChange={(e) => setForm({ ...form, marca: e.target.value })} /></div>
              <div><Label>Modelo</Label><Input value={form.modelo} onChange={(e) => setForm({ ...form, modelo: e.target.value })} /></div>
              <div><Label>Número de série</Label><Input value={form.numero_serie} onChange={(e) => setForm({ ...form, numero_serie: e.target.value })} /></div>
              <div>
                <Label>Estado de conservação</Label>
                <Select value={form.estado_conservacao} onValueChange={(v) => setForm({ ...form, estado_conservacao: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CONSERVACAO.map((c) => <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2"><Label>Observações</Label><Textarea rows={3} value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} /></div>
            </TabsContent>

            <TabsContent value="aquisicao" className="mt-4 grid gap-3 md:grid-cols-2">
              <div><Label>Data de aquisição</Label><Input type="date" value={form.data_aquisicao} onChange={(e) => setForm({ ...form, data_aquisicao: e.target.value })} /></div>
              <div><Label>Valor (R$)</Label><Input type="number" step="0.01" value={form.valor} onChange={(e) => setForm({ ...form, valor: e.target.value })} /></div>
              <div>
                <Label>Fornecedor cadastrado</Label>
                <Select value={form.fornecedor_id || 'nenhum'} onValueChange={(v) => setForm({ ...form, fornecedor_id: v === 'nenhum' ? '' : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Não informado</SelectItem>
                    {refs.fornecedores.map((f) => <SelectItem key={f.id} value={f.id}>{f.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Fornecedor (texto livre)</Label><Input value={form.fornecedor_nome} onChange={(e) => setForm({ ...form, fornecedor_nome: e.target.value })} /></div>
              <div><Label>Nota fiscal</Label><Input value={form.nota_fiscal} onChange={(e) => setForm({ ...form, nota_fiscal: e.target.value })} /></div>
              <div><Label>Vida útil (meses)</Label><Input type="number" value={form.vida_util_meses} onChange={(e) => setForm({ ...form, vida_util_meses: e.target.value })} /></div>
              <div><Label>Taxa de depreciação (% ao ano)</Label><Input type="number" step="0.01" value={form.taxa_depreciacao} onChange={(e) => setForm({ ...form, taxa_depreciacao: e.target.value })} /></div>
            </TabsContent>

            <TabsContent value="localizacao" className="mt-4 grid gap-3 md:grid-cols-2">
              <div>
                <Label>Unidade</Label>
                <Select value={form.unidade_id || 'nenhum'} onValueChange={(v) => setForm({ ...form, unidade_id: v === 'nenhum' ? '' : v, setor_id: '' })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Não informada</SelectItem>
                    {refs.unidades.map((u) => <SelectItem key={u.id} value={u.id}>{u.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Setor</Label>
                <Select value={form.setor_id || 'nenhum'} onValueChange={(v) => setForm({ ...form, setor_id: v === 'nenhum' ? '' : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Não informado</SelectItem>
                    {setoresFiltrados.map((s) => <SelectItem key={s.id} value={s.id}>{s.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Responsável</Label>
                <Select value={form.responsavel_id || 'nenhum'} onValueChange={(v) => setForm({ ...form, responsavel_id: v === 'nenhum' ? '' : v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="nenhum">Não informado</SelectItem>
                    {refs.responsaveis.map((r) => <SelectItem key={r.id} value={r.id}>{r.nome}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div><Label>Localização física</Label><Input placeholder="Sala, andar, prédio..." value={form.localizacao} onChange={(e) => setForm({ ...form, localizacao: e.target.value })} /></div>
            </TabsContent>

            <TabsContent value="anexos" className="mt-4 space-y-4">
              {(['fotos', 'documentos'] as const).map((campo) => (
                <div key={campo} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="capitalize">{campo}</Label>
                    <Button size="sm" variant="outline" onClick={() => (campo === 'fotos' ? fotoRef : docRef).current?.click()}>
                      <Paperclip className="mr-1 h-4 w-4" /> Anexar
                    </Button>
                  </div>
                  {(form[campo] ?? []).length === 0 ? (
                    <p className="text-xs text-muted-foreground">Nenhum arquivo anexado.</p>
                  ) : (
                    <ul className="space-y-1">
                      {(form[campo] ?? []).map((a: any, i: number) => (
                        <li key={a.path} className="flex items-center gap-2 rounded-md border p-2 text-xs">
                          <button className="flex-1 truncate text-left underline" onClick={() => abrirAnexo(a.path).catch(() => toast.error('Não foi possível abrir o arquivo.'))}>
                            {a.nome}
                          </button>
                          <Button size="sm" variant="ghost" onClick={() => setForm({ ...form, [campo]: form[campo].filter((_: any, j: number) => j !== i) })}>
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              ))}
              <input ref={fotoRef} type="file" accept="image/*" multiple hidden onChange={(e) => anexar('fotos', e.target.files)} />
              <input ref={docRef} type="file" multiple hidden onChange={(e) => anexar('documentos', e.target.files)} />
            </TabsContent>
          </Tabs>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={salvar} disabled={salvando}>
              {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Salvar bem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* QR Code */}
      <Dialog open={!!qrBem} onOpenChange={(o) => !o && setQrBem(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>QR Code do bem</DialogTitle></DialogHeader>
          {qrBem && (
            <div className="space-y-3 text-center">
              {qrImg && <img src={qrImg} alt={`QR Code do bem ${qrBem.numero_patrimonial}`} className="mx-auto h-48 w-48" />}
              <p className="font-mono text-sm">{qrBem.numero_patrimonial}</p>
              <p className="text-xs text-muted-foreground">{qrBem.descricao}</p>
              <p className="break-all text-[10px] text-muted-foreground">{urlQR(qrBem.qr_token)}</p>
              <div className="flex justify-center gap-2">
                <Button size="sm" variant="outline" onClick={() => gerarEtiquetasPDF([qrBem])}>
                  <Printer className="mr-1 h-4 w-4" /> Imprimir etiqueta
                </Button>
                <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(urlQR(qrBem.qr_token)); toast.success('Link copiado.'); }}>
                  Copiar link
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Histórico */}
      <Dialog open={!!histBem} onOpenChange={(o) => !o && setHistBem(null)}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader><DialogTitle>Histórico do bem {histBem?.numero_patrimonial}</DialogTitle></DialogHeader>
          {historico.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum registro no histórico.</p>
          ) : (
            <ol className="space-y-2">
              {historico.map((h) => (
                <li key={h.id} className="rounded-md border p-3 text-sm">
                  <p className="font-medium capitalize">{String(h.acao).replace(/_/g, ' ')}</p>
                  <p className="text-xs text-muted-foreground">{dataHoraBR(h.created_at)}</p>
                  {(h.status_anterior || h.status_novo) && (
                    <p className="text-xs">
                      {h.status_anterior ? PAT_STATUS[h.status_anterior as PatStatus]?.label : '—'} →{' '}
                      {h.status_novo ? PAT_STATUS[h.status_novo as PatStatus]?.label : '—'}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
