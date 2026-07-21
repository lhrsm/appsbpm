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
import { Users, User, Calendar, AlertCircle, UserPlus, CheckCircle2, Loader2, Paperclip, X as XIcon } from 'lucide-react';
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

export default function Dependentes() {
  const { dependentes, associado, isDependente } = useAssociado();
  const [open, setOpen] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [sucesso, setSucesso] = useState(false);
  const [anexos, setAnexos] = useState<File[]>([]);
  const [uploadingIdx, setUploadingIdx] = useState<number | null>(null);

  const MAX_FILES = 10;
  const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

  const [form, setForm] = useState({
    nome: '',
    cpf: '',
    data_nascimento: '',
    parentesco: '',
    sexo: '',
    telefone: '',
    email: '',
    observacoes: '',
  });

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
    setForm({
      nome: '', cpf: '', data_nascimento: '', parentesco: '',
      sexo: '', telefone: '', email: '', observacoes: '',
    });
    setAnexos([]);
    setSucesso(false);
  };

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const combined = [...anexos, ...files].slice(0, MAX_FILES);
    const filtered = combined.filter((f) => {
      if (f.size > MAX_SIZE) {
        toast.error(`"${f.name}" excede 10 MB e foi ignorado.`);
        return false;
      }
      return true;
    });
    setAnexos(filtered);
    e.target.value = '';
  };

  const removerAnexo = (idx: number) => {
    setAnexos((prev) => prev.filter((_, i) => i !== idx));
  };

  const uploadAnexos = async (): Promise<string[]> => {
    const paths: string[] = [];
    const folder = `solicitacoes/${associado?.matricula || 'anon'}/${Date.now()}`;
    for (let i = 0; i < anexos.length; i++) {
      setUploadingIdx(i);
      const file = anexos[i];
      const safeName = file.name.replace(/[^\w.\-]+/g, '_');
      const path = `${folder}/${i}-${safeName}`;
      const { error } = await supabase.storage
        .from('dependentes-anexos')
        .upload(path, file, { contentType: file.type || 'application/octet-stream', upsert: false });
      if (error) throw new Error(`Falha ao enviar "${file.name}": ${error.message}`);
      paths.push(path);
    }
    setUploadingIdx(null);
    return paths;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!associado) return;
    if (!form.nome.trim() || !form.parentesco) {
      toast.error('Preencha nome e parentesco.');
      return;
    }
    setEnviando(true);
    try {
      const anexosPaths = anexos.length > 0 ? await uploadAnexos() : [];
      const { data, error } = await supabase.functions.invoke('send-dependente-solicitacao', {
        body: {
          titular: {
            nome: associado.nome,
            matricula: associado.matricula,
            email: associado.email || '',
            telefone: associado.telefone || '',
          },
          dependente: { ...form, anexos: anexosPaths },
        },
      });
      if (error) throw error;
      if (!data?.ok) throw new Error(data?.error || 'Falha ao enviar solicitação');
      setSucesso(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erro ao enviar solicitação';
      toast.error(msg);
    } finally {
      setEnviando(false);
      setUploadingIdx(null);
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
        <div className="grid gap-4">
          {dependentes.map((dependente) => (
            <Card key={dependente.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center overflow-hidden shrink-0">
                    {dependente.foto_url ? (
                      <img src={dependente.foto_url} alt={dependente.nome} className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">{dependente.nome}</h3>
                        <div className="flex gap-2 flex-wrap mt-1">
                          <Badge className={tipoColor[dependente.tipo]}>{tipoLabel[dependente.tipo]}</Badge>
                          {(() => {
                            const s = (dependente.status || (dependente.ativo ? 'ativo' : 'inativo')).toLowerCase();
                            const styles: Record<string, string> = {
                              ativo: 'bg-green-100 text-green-700 border-green-200',
                              inativo: 'bg-red-100 text-red-700 border-red-200',
                              pendente: 'bg-yellow-100 text-yellow-800 border-yellow-200',
                            };
                            const labels: Record<string, string> = {
                              ativo: 'Ativo', inativo: 'Inativo', pendente: 'Pendente',
                            };
                            return (
                              <Badge variant="outline" className={styles[s] || ''}>
                                {labels[s] || s}
                              </Badge>
                            );
                          })()}
                        </div>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      {dependente.cpf && (
                        <div>
                          <span className="font-medium">CPF:</span>{' '}
                          {dependente.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '***.$2.$3-**')}
                        </div>
                      )}
                      {dependente.data_nascimento && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(dependente.data_nascimento), 'dd/MM/yyyy', { locale: ptBR })}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
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
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                  Sua solicitação de inclusão de dependente foi recebida e está com status
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
                <DialogTitle>Solicitar Inclusão de Dependente</DialogTitle>
                <DialogDescription>
                  Preencha os dados do novo dependente. A solicitação ficará com status
                  <strong> pendente </strong> até a análise e autorização do setor responsável.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleSubmit} className="space-y-4 pt-2">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <Label htmlFor="nome">Nome completo *</Label>
                    <Input id="nome" value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} required maxLength={200} />
                  </div>
                  <div>
                    <Label htmlFor="cpf">CPF</Label>
                    <Input id="cpf" value={form.cpf} onChange={(e) => setForm({ ...form, cpf: e.target.value })} maxLength={20} />
                  </div>
                  <div>
                    <Label htmlFor="data_nascimento">Data de Nascimento</Label>
                    <Input id="data_nascimento" type="date" value={form.data_nascimento} onChange={(e) => setForm({ ...form, data_nascimento: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="parentesco">Parentesco *</Label>
                    <Select value={form.parentesco} onValueChange={(v) => setForm({ ...form, parentesco: v })}>
                      <SelectTrigger id="parentesco"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        {PARENTESCOS.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="sexo">Sexo</Label>
                    <Select value={form.sexo} onValueChange={(v) => setForm({ ...form, sexo: v })}>
                      <SelectTrigger id="sexo"><SelectValue placeholder="Selecione" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Masculino">Masculino</SelectItem>
                        <SelectItem value="Feminino">Feminino</SelectItem>
                        <SelectItem value="Outro">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="telefone">Telefone</Label>
                    <Input id="telefone" value={form.telefone} onChange={(e) => setForm({ ...form, telefone: e.target.value })} maxLength={30} />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input id="email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={200} />
                  </div>
                  <div className="md:col-span-2">
                    <Label htmlFor="observacoes">Observações</Label>
                    <Textarea id="observacoes" value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} maxLength={1000} rows={3} />
                  </div>
                </div>

                <DialogFooter className="gap-2">
                  <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={enviando}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={enviando}>
                    {enviando ? (<><Loader2 className="h-4 w-4 mr-2 animate-spin" />Enviando...</>) : 'Enviar solicitação'}
                  </Button>
                </DialogFooter>
              </form>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
