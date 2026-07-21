import { useState } from 'react';
import { useAssociado } from '@/contexts/AssociadoContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Award, Gift, CheckCircle2, Send, Paperclip, Plus, Trash2, Loader2 } from 'lucide-react';

interface Dep {
  nome: string;
  cpf: string;
  parentesco: string;
  anexos: File[];
}

const PARENTESCOS = [
  'Cônjuge / Companheiro(a)',
  'Filho(a)',
  'Enteado(a)',
  'Pai',
  'Mãe',
  'Irmão / Irmã',
  'Neto(a)',
  'Avô / Avó',
  'Outro',
];

const ACCEPT = '.pdf,.png,.jpg,.jpeg,application/pdf,image/png,image/jpeg';

export default function AssociacaoPremiada() {
  const { associado } = useAssociado();
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  // Quem indicou
  const [indicador, setIndicador] = useState({
    nome: associado?.nome || '',
    email: (associado as any)?.email || '',
    matricula: associado?.matricula || '',
    telefone: (associado as any)?.telefone || '',
  });

  // Indicado
  const [indicado, setIndicado] = useState({
    nome: '',
    email: '',
    matricula: '',
    telefone: '',
    cep: '',
    cidade: '',
    estado: '',
    endereco: '',
  });
  const [indicadoAnexos, setIndicadoAnexos] = useState<File[]>([]);
  const [buscandoCep, setBuscandoCep] = useState(false);

  const [temDependentes, setTemDependentes] = useState<'nao' | 'sim'>('nao');
  const [dependentes, setDependentes] = useState<Dep[]>([
    { nome: '', cpf: '', parentesco: '', anexos: [] },
  ]);

  const [observacoes, setObservacoes] = useState('');

  const buscarCep = async (cepRaw: string) => {
    const cep = cepRaw.replace(/\D/g, '');
    if (cep.length !== 8) return;
    setBuscandoCep(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      const data = await res.json();
      if (data.erro) {
        toast.error('CEP não encontrado');
        return;
      }
      setIndicado((s) => ({
        ...s,
        cep,
        cidade: data.localidade || '',
        estado: data.uf || '',
        endereco: [data.logradouro, data.bairro].filter(Boolean).join(' - '),
      }));
    } catch {
      toast.error('Falha ao buscar CEP');
    } finally {
      setBuscandoCep(false);
    }
  };

  const addDependente = () =>
    setDependentes((d) => [...d, { nome: '', cpf: '', parentesco: '', anexos: [] }]);
  const removeDependente = (i: number) =>
    setDependentes((d) => d.filter((_, idx) => idx !== i));
  const updateDep = (i: number, patch: Partial<Dep>) =>
    setDependentes((d) => d.map((x, idx) => (idx === i ? { ...x, ...patch } : x)));

  const uploadFiles = async (files: File[], prefix: string): Promise<string[]> => {
    const urls: string[] = [];
    for (const f of files) {
      const safeName = f.name.replace(/[^\w.\-]+/g, '_');
      const path = `${prefix}/${Date.now()}_${safeName}`;
      const { error } = await supabase.storage
        .from('indicacoes-anexos')
        .upload(path, f, { contentType: f.type, upsert: false });
      if (error) throw error;
      urls.push(path);
    }
    return urls;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!indicador.nome.trim() || !indicador.matricula.trim()) {
      toast.error('Informe seu nome e matrícula.');
      return;
    }
    if (!indicado.nome.trim() || !indicado.telefone.trim()) {
      toast.error('Preencha nome e telefone do indicado.');
      return;
    }
    if (temDependentes === 'sim') {
      for (const d of dependentes) {
        if (!d.nome.trim() || !d.parentesco) {
          toast.error('Preencha nome e grau de parentesco de todos os dependentes.');
          return;
        }
      }
    }

    setEnviando(true);
    try {
      const folder = `${Date.now()}_${indicado.nome.replace(/[^\w]+/g, '_').slice(0, 30)}`;
      const anexosIndicado = await uploadFiles(indicadoAnexos, `${folder}/indicado`);
      const anexosDeps: { nome: string; arquivos: string[] }[] = [];
      if (temDependentes === 'sim') {
        for (let i = 0; i < dependentes.length; i++) {
          const arquivos = await uploadFiles(dependentes[i].anexos, `${folder}/dep_${i + 1}`);
          anexosDeps.push({ nome: dependentes[i].nome, arquivos });
        }
      }

      const { error } = await supabase.functions.invoke('send-indicacao', {
        body: {
          indicador,
          indicado: { ...indicado, anexos: anexosIndicado },
          dependentes:
            temDependentes === 'sim'
              ? dependentes.map((d, i) => ({
                  nome: d.nome,
                  cpf: d.cpf,
                  parentesco: d.parentesco,
                  anexos: anexosDeps[i]?.arquivos || [],
                }))
              : [],
          observacoes,
        },
      });
      if (error) throw error;

      setEnviado(true);
      toast.success('Indicação enviada com sucesso!');
      setIndicado({ nome: '', email: '', matricula: '', telefone: '', cep: '', cidade: '', estado: '', endereco: '' });
      setIndicadoAnexos([]);
      setDependentes([{ nome: '', cpf: '', parentesco: '', anexos: [] }]);
      setTemDependentes('nao');
      setObservacoes('');
    } catch (err: any) {
      console.error(err);
      toast.error(err?.message || 'Não foi possível enviar a indicação.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div className="container mx-auto p-4 md:p-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="p-3 rounded-full bg-sbpm-yellow/20 text-sbpm-yellow">
          <Award className="h-8 w-8" />
        </div>
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-primary">Associação Premiada</h1>
          <p className="text-muted-foreground">Indique novos associados e concorra a prêmios exclusivos</p>
        </div>
      </div>

      <Card className="border-l-4 border-sbpm-green">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-sbpm-green" />
            Regulamento
          </CardTitle>
          <CardDescription>Confira as regras da Campanha Associação Premiada</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p><strong>1. Quem pode participar:</strong> Associados titulares da SBPM com cadastro ativo e adimplente.</p>
          <p><strong>2. Como participar:</strong> Preencha o formulário abaixo. Cada indicação válida gera um número da sorte.</p>
          <p><strong>3. Indicação válida:</strong> Quando o indicado efetivar seu cadastro como associado da SBPM.</p>
          <p><strong>4. Prêmios e sorteios:</strong> Divulgados oficialmente pelos canais da SBPM.</p>
          <p><strong>5. LGPD:</strong> Ao enviar, você declara ter autorização do indicado para uso dos dados na campanha.</p>
          <p><strong>Dúvidas:</strong> <a href="mailto:contato@sbpmbahia.com.br" className="text-primary underline">contato@sbpmbahia.com.br</a></p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Indicador */}
        <Card>
          <CardHeader>
            <CardTitle>Dados de quem indicou</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={indicador.nome} onChange={(e) => setIndicador({ ...indicador, nome: e.target.value })} maxLength={200} required />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" value={indicador.email} onChange={(e) => setIndicador({ ...indicador, email: e.target.value })} maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label>Matrícula *</Label>
              <Input value={indicador.matricula} onChange={(e) => setIndicador({ ...indicador, matricula: e.target.value })} maxLength={50} required />
            </div>
            <div className="space-y-2">
              <Label>Telefone</Label>
              <Input value={indicador.telefone} onChange={(e) => setIndicador({ ...indicador, telefone: e.target.value })} maxLength={30} placeholder="(71) 90000-0000" />
            </div>
          </CardContent>
        </Card>

        {/* Indicado */}
        <Card>
          <CardHeader>
            <CardTitle>Dados do indicado</CardTitle>
            <CardDescription>Informações da pessoa que você está indicando</CardDescription>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Nome *</Label>
              <Input value={indicado.nome} onChange={(e) => setIndicado({ ...indicado, nome: e.target.value })} maxLength={200} required />
            </div>
            <div className="space-y-2">
              <Label>E-mail</Label>
              <Input type="email" value={indicado.email} onChange={(e) => setIndicado({ ...indicado, email: e.target.value })} maxLength={200} />
            </div>
            <div className="space-y-2">
              <Label>Matrícula</Label>
              <Input value={indicado.matricula} onChange={(e) => setIndicado({ ...indicado, matricula: e.target.value })} maxLength={50} placeholder="Se já for policial militar" />
            </div>
            <div className="space-y-2">
              <Label>Telefone / WhatsApp *</Label>
              <Input value={indicado.telefone} onChange={(e) => setIndicado({ ...indicado, telefone: e.target.value })} maxLength={30} required placeholder="(71) 90000-0000" />
            </div>
            <div className="space-y-2">
              <Label>CEP</Label>
              <div className="relative">
                <Input
                  value={indicado.cep}
                  onChange={(e) => setIndicado({ ...indicado, cep: e.target.value })}
                  onBlur={(e) => buscarCep(e.target.value)}
                  maxLength={9}
                  placeholder="00000-000"
                />
                {buscandoCep && (
                  <Loader2 className="h-4 w-4 animate-spin absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                )}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Endereço</Label>
              <Input value={indicado.endereco} onChange={(e) => setIndicado({ ...indicado, endereco: e.target.value })} maxLength={200} placeholder="Rua, bairro" />
            </div>
            <div className="space-y-2">
              <Label>Cidade</Label>
              <Input value={indicado.cidade} onChange={(e) => setIndicado({ ...indicado, cidade: e.target.value })} maxLength={120} />
            </div>
            <div className="space-y-2">
              <Label>Estado</Label>
              <Input value={indicado.estado} onChange={(e) => setIndicado({ ...indicado, estado: e.target.value.toUpperCase() })} maxLength={2} placeholder="BA" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label className="flex items-center gap-2">
                <Paperclip className="h-4 w-4" /> Anexos do indicado (PDF, PNG, JPG)
              </Label>
              <Input
                type="file"
                multiple
                accept={ACCEPT}
                onChange={(e) => setIndicadoAnexos(Array.from(e.target.files || []))}
              />
              {indicadoAnexos.length > 0 && (
                <p className="text-xs text-muted-foreground">
                  {indicadoAnexos.length} arquivo(s) selecionado(s): {indicadoAnexos.map((f) => f.name).join(', ')}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dependentes */}
        <Card>
          <CardHeader>
            <CardTitle>Possui dependentes?</CardTitle>
            <CardDescription>Informe os dependentes que serão incluídos na indicação</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <RadioGroup
              value={temDependentes}
              onValueChange={(v) => setTemDependentes(v as 'sim' | 'nao')}
              className="flex gap-6"
            >
              <div className="flex items-center gap-2">
                <RadioGroupItem value="nao" id="dep-nao" />
                <Label htmlFor="dep-nao" className="cursor-pointer">Não</Label>
              </div>
              <div className="flex items-center gap-2">
                <RadioGroupItem value="sim" id="dep-sim" />
                <Label htmlFor="dep-sim" className="cursor-pointer">Sim</Label>
              </div>
            </RadioGroup>

            {temDependentes === 'sim' && (
              <div className="space-y-4">
                {dependentes.map((dep, i) => (
                  <div key={i} className="border rounded-lg p-4 space-y-4 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Dependente {i + 1}</h4>
                      {dependentes.length > 1 && (
                        <Button type="button" variant="ghost" size="sm" onClick={() => removeDependente(i)}>
                          <Trash2 className="h-4 w-4 mr-1" /> Remover
                        </Button>
                      )}
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Nome *</Label>
                        <Input value={dep.nome} onChange={(e) => updateDep(i, { nome: e.target.value })} maxLength={200} />
                      </div>
                      <div className="space-y-2">
                        <Label>CPF</Label>
                        <Input value={dep.cpf} onChange={(e) => updateDep(i, { cpf: e.target.value })} maxLength={20} placeholder="000.000.000-00" />
                      </div>
                      <div className="space-y-2">
                        <Label>Grau de parentesco *</Label>
                        <Select value={dep.parentesco} onValueChange={(v) => updateDep(i, { parentesco: v })}>
                          <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                          <SelectContent>
                            {PARENTESCOS.map((p) => (
                              <SelectItem key={p} value={p}>{p}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                          <Paperclip className="h-4 w-4" /> Documentos (PDF, PNG, JPG)
                        </Label>
                        <Input
                          type="file"
                          multiple
                          accept={ACCEPT}
                          onChange={(e) => updateDep(i, { anexos: Array.from(e.target.files || []) })}
                        />
                        {dep.anexos.length > 0 && (
                          <p className="text-xs text-muted-foreground">{dep.anexos.length} arquivo(s)</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                <Button type="button" variant="outline" onClick={addDependente}>
                  <Plus className="h-4 w-4 mr-2" /> Adicionar outro dependente
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Observações</CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              maxLength={2000}
              rows={4}
              placeholder="Melhor horário para contato, informações adicionais, etc."
            />
          </CardContent>
        </Card>

        {enviado && (
          <Alert className="border-sbpm-green bg-sbpm-green/10">
            <CheckCircle2 className="h-4 w-4 text-sbpm-green" />
            <AlertDescription className="text-sbpm-green">
              Sua indicação foi enviada para <strong>contato@sbpmbahia.com.br</strong>. Obrigado por participar!
            </AlertDescription>
          </Alert>
        )}

        <Button
          type="submit"
          disabled={enviando}
          size="lg"
          className="w-full md:w-auto bg-sbpm-green hover:bg-sbpm-green/90"
        >
          <Send className="h-4 w-4 mr-2" />
          {enviando ? 'Enviando...' : 'Enviar Indicação'}
        </Button>
      </form>
    </div>
  );
}
