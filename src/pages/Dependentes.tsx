import { useState } from 'react';
import { useAssociado } from '@/contexts/AssociadoContext';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter,
} from '@/components/ui/dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Users, User, Calendar, AlertCircle, UserPlus, CheckCircle2, Loader2, Paperclip, X as XIcon, Plus, Trash2, UserMinus, UserCheck } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

const PARENTESCOS = [
  'Cônjuge / Companheiro(a)',
  'Filho(a) até 30 anos',
  'Filho(a) acima de 30 anos',
  'Enteado(a)',
  'Pai',
  'Mãe',
  'Sogro(a)',
  'Avô / Avó',
  'Neto(a)',
  'Irmão / Irmã',
  'Tio(a)',
  'Sobrinho(a)',
  'Outro',
];

interface DepForm {
  nome: string;
  cpf: string;
  data_nascimento: string;
  parentesco: string;
  sexo: string;
  telefone: string;
  email: string;
  observacoes: string;
  anexos: File[];
}

const emptyDep = (): DepForm => ({
  nome: '', cpf: '', data_nascimento: '', parentesco: '',
  sexo: '', telefone: '', email: '', observacoes: '', anexos: [],
});

const MAX_FILES = 10;
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export default function Dependentes() {
  const { dependentes, associado, isDependente } = useAssociado();
  const [open, setOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [deps, setDeps] = useState<DepForm[]>([emptyDep()]);
  const [excluirDep, setExcluirDep] = useState<any | null>(null);
  const [acaoDep, setAcaoDep] = useState<'exclusao' | 'reativacao'>('exclusao');
  const [motivoExclusao, setMotivoExclusao] = useState('');
  const [enviandoExcl, setEnviandoExcl] = useState(false);
  const [sucessoExcl, setSucessoExcl] = useState(false);

  const tipoLabel: Record<string, string> = {
    conjuge: 'Cônjuge',
    filho: 'Filho(a)',
    pai_mae: 'Pai/Mãe',
    outro: 'Outro',
  };

  const tipoColor: Record<string, string> = {
    conjuge: 'bg-pink-100 text-pink-700',
    filho: 'bg-blue-100 text-blue-700',
    pai_mae: 'bg-purple-100 text-purple-700',
    outro: 'bg-gray-100 text-gray-700',
  };

  const resetForm = () => {
    setDeps([emptyDep()]);
    setSucesso(false);
  };

  const updateDep = (idx: number, patch: Partial<DepForm>) => {
    setDeps((prev) => prev.map((d, i) => (i === idx ? { ...d, ...patch } : d)));
  };

  const addDep = () => setDeps((prev) => [...prev, emptyDep()]);
  const removeDep = (idx: number) => setDeps((prev) => prev.filter((_, i) => i !== idx));

  const handleFilesChange = (idx: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const current = deps[idx].anexos;
    const combined = [...current, ...files].slice(0, MAX_FILES);
    const filtered = combined.filter((f) => {
      if (f.size > MAX_SIZE) {
        toast.error(`"${f.name}" excede 10 MB e foi ignorado.`);
        return false;
      }
      return true;
    });
    updateDep(idx, { anexos: filtered });
    e.target.value = '';
  };

  const removerAnexo = (idx: number, fileIdx: number) => {
    updateDep(idx, { anexos: deps[idx].anexos.filter((_, i) => i !== fileIdx) });
  };

  const uploadAnexos = async (files: File[], depIdx: number): Promise<string[]> => {
    const paths: string[] = [];
    const folder = `solicitacoes/${associado?.matricula || 'anon'}/${Date.now()}/dep-${depIdx + 1}`;
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const safeName = file.name.replace(/[^\w.\-]+/g, '_');
      const path = `${folder}/${i}-${safeName}`;
      const { error } = await supabase.storage
        .from('dependentes-anexos')
        .upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: false });
      if (error) throw new Error(`Falha ao enviar "${file.name}": ${error.message}`);
      paths.push(path);
    }
    return paths;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!associado) return;
    for (let i = 0; i < deps.length; i++) {
      const d = deps[i];
      if (!d.nome.trim() || !d.parentesco) {
        toast.error(`Preencha nome e parentesco do dependente ${i + 1}.`);
        return;
      }
    }
    setEnviando(true);
    try {
      const payloadDeps = await Promise.all(
        deps.map(async (d, i) => {
          const paths = d.anexos.length > 0 ? await uploadAnexos(d.anexos, i) : [];
          const { anexos, ...rest } = d;
          return { ...rest, anexos: paths };
        }),
      );
      const { data, error } = await supabase.functions.invoke('send-dependente-solicitacao', {
        body: {
          titular: {
            nome: associado.nome,
            matricula: associado.matricula,
            email: associado.email || '',
            telefone: associado.telefone || '',
          },
          dependentes: payloadDeps,
        },
      });
      if (error) {
        const ctx: any = (error as any).context;
        let details = error.message;
        try { if (ctx?.text) details = await ctx.text(); } catch {}
        throw new Error(details);
      }
      if (!data?.ok) throw new Error(data?.error || 'Falha ao enviar solicitação');
      setSucesso(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar solicitação';
      toast.error(msg);
    } finally {
      setEnviando(false);
    }
  };

  const handleSubmitExclusao = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!associado || !excluirDep) return;
    if (motivoExclusao.trim().length < 3) {
      toast.error('Informe o motivo da exclusão.');
      return;
    }
    setEnviandoExcl(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-dependente-exclusao', {
        body: {
          titular: {
            nome: associado.nome,
            matricula: associado.matricula,
            email: associado.email || '',
            telefone: associado.telefone || '',
          },
          dependente: {
            id: excluirDep.id,
            nome: excluirDep.nome,
            cpf: excluirDep.cpf || '',
            parentesco: excluirDep.tipo || '',
          },
          motivo: motivoExclusao.trim(),
        },
      });
      if (error) {
        const ctx: any = (error as any).context;
        let details = error.message;
        try { if (ctx?.text) details = await ctx.text(); } catch {}
        throw new Error(details);
      }
      if (!data?.ok) throw new Error(data?.error || 'Falha ao enviar solicitação');
      setSucessoExcl(true);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Erro ao enviar solicitação');
    } finally {
      setEnviandoExcl(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Dependentes</h2>
          <p className="text-muted-foreground">
            Visualize os dependentes vinculados ao seu cadastro
          </p>
        </div>
        {!isDependente && (
          <Button onClick={() => { resetForm(); setOpen(true); }} className="gap-2">
            <UserPlus className="h-4 w-4" />
            Incluir Dependente
          </Button>
        )}
      </div>

      {/* Resumo */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Dependentes</p>
              <p className="text-3xl font-bold text-primary">{dependentes.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista */}
      {dependentes.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dependentes.map((dependente) => {
            const s = (dependente.status || (dependente.ativo ? 'ativo' : 'inativo')).toLowerCase();
            const styles: Record<string, string> = {
              ativo: 'bg-green-100 text-green-700 border-green-200',
              inativo: 'bg-red-100 text-red-700 border-red-200',
              pendente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
            };
            const labels: Record<string, string> = { ativo: 'Ativo', inativo: 'Inativo', pendente: 'Pendente' };
            return (
              <Card key={dependente.id} className="hover:shadow-md transition-shadow">
                <CardContent className="pt-5 pb-4">
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center overflow-hidden shrink-0">
                      {dependente.foto_url ? (
                        <img src={dependente.foto_url} alt={dependente.nome} className="w-full h-full object-cover" />
                      ) : (
                        <User className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate" title={dependente.nome}>
                        {dependente.nome}
                      </h3>
                      <div className="flex gap-1.5 flex-wrap mt-1">
                        <Badge className={`${tipoColor[dependente.tipo]} text-xs`}>{tipoLabel[dependente.tipo]}</Badge>
                        <Badge variant="outline" className={`${styles[s] || ''} text-xs`}>{labels[s] || s}</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 space-y-1 text-sm text-muted-foreground">
                    {dependente.cpf && (
                      <div className="truncate">
                        <span className="font-medium">CPF:</span>{' '}
                        {dependente.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '***.$2.$3-**')}
                      </div>
                    )}
                    {dependente.data_nascimento && (
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{format(new Date(dependente.data_nascimento), 'dd/MM/yyyy', { locale: ptBR })}</span>
                      </div>
                    )}
                  </div>

                  {!isDependente && s !== 'pendente' && (
                    <div className="mt-3 pt-3 border-t">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full text-destructive hover:text-destructive hover:bg-destructive/10 gap-2"
                        onClick={() => { setExcluirDep(dependente); setMotivoExclusao(''); setSucessoExcl(false); }}
                      >
                        <UserMinus className="h-4 w-4" />
                        Solicitar exclusão
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-lg text-foreground mb-2">Nenhum dependente cadastrado</h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                {isDependente
                  ? 'Você não possui dependentes vinculados ao seu cadastro.'
                  : 'Você não possui dependentes vinculados. Clique em "Incluir Dependente" para solicitar a inclusão.'}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Modal de solicitação */}
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) resetForm(); }}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          {sucesso ? (
            <div className="py-8 text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle2 className="h-12 w-12 text-green-600" />
                </div>
              </div>
              <DialogHeader>
                <DialogTitle className="text-center text-2xl">Solicitação enviada com sucesso!</DialogTitle>
                <DialogDescription className="text-center text-base pt-2">
                  Sua solicitação de inclusão de {deps.length > 1 ? 'dependentes' : 'dependente'} foi recebida e está com status
                  <strong className="text-foreground"> pendente </strong>
                  de análise. Em breve o setor responsável entrará em contato.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-center">
                <Button onClick={() => { setOpen(false); resetForm(); }}>Fechar</Button>
              </DialogFooter>
            </div>
          ) : (
            <>
              <DialogHeader>
                <DialogTitle>Solicitar Inclusão de Dependente(s)</DialogTitle>
                <DialogDescription>
                  Preencha os dados do(s) novo(s) dependente(s). A solicitação ficará com status
                  <strong> pendente </strong> até a análise e autorização do setor responsável.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                {deps.map((form, idx) => (
                  <div key={idx} className="border rounded-lg p-4 space-y-3 bg-muted/20 relative">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-sm text-foreground">Dependente {idx + 1}</h4>
                      {deps.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeDep(idx)}
                          disabled={enviando}
                          className="text-destructive hover:text-destructive gap-1"
                        >
                          <Trash2 className="h-4 w-4" /> Remover
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="md:col-span-2">
                        <Label htmlFor={`nome-${idx}`}>Nome completo *</Label>
                        <Input id={`nome-${idx}`} value={form.nome} onChange={(e) => updateDep(idx, { nome: e.target.value })} required maxLength={200} />
                      </div>
                      <div>
                        <Label htmlFor={`cpf-${idx}`}>CPF</Label>
                        <Input id={`cpf-${idx}`} value={form.cpf} onChange={(e) => updateDep(idx, { cpf: e.target.value })} maxLength={20} />
                      </div>
                      <div>
                        <Label htmlFor={`data-${idx}`}>Data de Nascimento</Label>
                        <Input id={`data-${idx}`} type="date" value={form.data_nascimento} onChange={(e) => updateDep(idx, { data_nascimento: e.target.value })} />
                      </div>
                      <div>
                        <Label htmlFor={`parentesco-${idx}`}>Parentesco *</Label>
                        <Select value={form.parentesco} onValueChange={(v) => updateDep(idx, { parentesco: v })}>
                          <SelectTrigger id={`parentesco-${idx}`}><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            {PARENTESCOS.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`sexo-${idx}`}>Sexo</Label>
                        <Select value={form.sexo} onValueChange={(v) => updateDep(idx, { sexo: v })}>
                          <SelectTrigger id={`sexo-${idx}`}><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Masculino">Masculino</SelectItem>
                            <SelectItem value="Feminino">Feminino</SelectItem>
                            <SelectItem value="Outro">Outro</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor={`tel-${idx}`}>Telefone</Label>
                        <Input id={`tel-${idx}`} value={form.telefone} onChange={(e) => updateDep(idx, { telefone: e.target.value })} maxLength={30} />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor={`email-${idx}`}>E-mail</Label>
                        <Input id={`email-${idx}`} type="email" value={form.email} onChange={(e) => updateDep(idx, { email: e.target.value })} maxLength={200} />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor={`obs-${idx}`}>Observações</Label>
                        <Textarea id={`obs-${idx}`} value={form.observacoes} onChange={(e) => updateDep(idx, { observacoes: e.target.value })} maxLength={1000} rows={2} />
                      </div>

                      <div className="md:col-span-2 space-y-2">
                        <Label>Documentos (opcional)</Label>
                        <p className="text-xs text-muted-foreground">
                          Até {MAX_FILES} arquivos, 10 MB cada. Formatos: PDF, JPG, PNG.
                        </p>
                        <div className="flex items-center gap-2">
                          <Input
                            id={`anexos-${idx}`}
                            type="file"
                            multiple
                            accept="application/pdf,image/jpeg,image/png,image/jpg"
                            onChange={(e) => handleFilesChange(idx, e)}
                            className="hidden"
                            disabled={enviando || form.anexos.length >= MAX_FILES}
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => document.getElementById(`anexos-${idx}`)?.click()}
                            disabled={enviando || form.anexos.length >= MAX_FILES}
                            className="gap-2"
                          >
                            <Paperclip className="h-4 w-4" />
                            Anexar documentos
                          </Button>
                          <span className="text-xs text-muted-foreground">
                            {form.anexos.length}/{MAX_FILES}
                          </span>
                        </div>
                        {form.anexos.length > 0 && (
                          <ul className="space-y-1">
                            {form.anexos.map((f, i) => (
                              <li key={i} className="flex items-center justify-between gap-2 text-sm border rounded-md px-2 py-1 bg-background">
                                <span className="truncate flex items-center gap-2">
                                  <Paperclip className="h-3 w-3 shrink-0" />
                                  <span className="truncate">{f.name}</span>
                                  <span className="text-xs text-muted-foreground shrink-0">
                                    ({(f.size / 1024).toFixed(0)} KB)
                                  </span>
                                </span>
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6 shrink-0"
                                  onClick={() => removerAnexo(idx, i)}
                                  disabled={enviando}
                                >
                                  <XIcon className="h-3 w-3" />
                                </Button>
                              </li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  onClick={addDep}
                  disabled={enviando}
                  className="w-full gap-2"
                >
                  <Plus className="h-4 w-4" /> Adicionar outro dependente
                </Button>

                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={enviando}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={enviando}>
                    {enviando ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enviando...</>) : `Enviar solicitação${deps.length > 1 ? ` (${deps.length})` : ''}`}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de solicitação de exclusão */}
      <Dialog open={!!excluirDep} onOpenChange={(v) => { if (!v) { setExcluirDep(null); setMotivoExclusao(''); setSucessoExcl(false); } }}>
        <DialogContent className="max-w-md">
          {sucessoExcl ? (
            <div className="py-6 text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-3 bg-green-100 rounded-full">
                  <CheckCircle2 className="h-10 w-10 text-green-600" />
                </div>
              </div>
              <DialogHeader>
                <DialogTitle className="text-center">Solicitação enviada</DialogTitle>
                <DialogDescription className="text-center pt-1">
                  A exclusão de <strong>{excluirDep?.nome}</strong> foi encaminhada e ficará
                  <strong> pendente de aprovação </strong> pelo setor responsável.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="sm:justify-center">
                <Button onClick={() => { setExcluirDep(null); setMotivoExclusao(''); setSucessoExcl(false); }}>Fechar</Button>
              </DialogFooter>
            </div>
          ) : (
            <form onSubmit={handleSubmitExclusao} className="space-y-4">
              <DialogHeader>
                <DialogTitle>Solicitar exclusão de dependente</DialogTitle>
                <DialogDescription>
                  A exclusão de <strong>{excluirDep?.nome}</strong> só será efetivada após aprovação da instituição.
                </DialogDescription>
              </DialogHeader>
              <div>
                <Label htmlFor="motivo-excl">Motivo da exclusão *</Label>
                <Textarea
                  id="motivo-excl"
                  value={motivoExclusao}
                  onChange={(e) => setMotivoExclusao(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  required
                  placeholder="Descreva o motivo da solicitação..."
                />
              </div>
              <DialogFooter className="gap-2">
                <Button type="button" variant="outline" onClick={() => setExcluirDep(null)} disabled={enviandoExcl}>
                  Cancelar
                </Button>
                <Button type="submit" variant="destructive" disabled={enviandoExcl}>
                  {enviandoExcl ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enviando...</>) : 'Enviar solicitação'}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
