import { useState } from 'react';
import { useAssociado } from '@/contexts/AssociadoContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ShieldCheck, Loader2, CheckCircle2, Info, FileText, Paperclip, X, Upload } from 'lucide-react';

const MAX_FILES = 10;
const MAX_SIZE = 10 * 1024 * 1024; // 10 MB

export default function SolicitarPeculio() {
  const { associado, dependenteLogado, isDependente } = useAssociado();
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  // Titular falecido
  const [dataFalecimento, setDataFalecimento] = useState('');

  // Solicitante (dependente/beneficiário)
  const [nome, setNome] = useState(dependenteLogado?.nome || '');
  const [cpf, setCpf] = useState(dependenteLogado?.cpf || '');
  const [parentesco, setParentesco] = useState(
    dependenteLogado?.tipo === 'conjuge' ? 'Cônjuge' :
    dependenteLogado?.tipo === 'filho' ? 'Filho(a)' :
    dependenteLogado?.tipo === 'pai_mae' ? 'Pai/Mãe' : ''
  );
  const [email, setEmail] = useState(dependenteLogado?.email || '');
  const [telefone, setTelefone] = useState(dependenteLogado?.telefone || '');
  const [endereco, setEndereco] = useState(dependenteLogado?.endereco || '');

  // Dados bancários
  const [banco, setBanco] = useState('');
  const [agencia, setAgencia] = useState('');
  const [conta, setConta] = useState('');
  const [tipoConta, setTipoConta] = useState('');
  const [pix, setPix] = useState('');

  const [observacoes, setObservacoes] = useState('');
  const [anexos, setAnexos] = useState<File[]>([]);

  const handleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const combined = [...anexos, ...files].slice(0, MAX_FILES);
    const filtered = combined.filter((f) => {
      if (f.size > MAX_SIZE) {
        toast({ title: 'Arquivo muito grande', description: `"${f.name}" excede 10 MB e foi ignorado.`, variant: 'destructive' });
        return false;
      }
      return true;
    });
    setAnexos(filtered);
    e.target.value = '';
  };

  const removerAnexo = (i: number) => setAnexos((prev) => prev.filter((_, idx) => idx !== i));

  const uploadAnexos = async (files: File[]): Promise<string[]> => {
    const paths: string[] = [];
    const folder = `peculio/${associado?.matricula || 'anon'}/${Date.now()}`;
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
    if (!dataFalecimento || !nome.trim()) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const anexosPaths = anexos.length > 0 ? await uploadAnexos(anexos) : [];
      const { error } = await supabase.functions.invoke('send-peculio-solicitacao', {
        body: {
          titular: {
            nome: associado.nome,
            matricula: associado.matricula,
            cpf: associado.cpf || '',
            data_falecimento: dataFalecimento,
          },
          solicitante: {
            nome: nome.trim(),
            cpf: cpf.trim(),
            parentesco: parentesco.trim(),
            email: email.trim(),
            telefone: telefone.trim(),
            endereco: endereco.trim(),
          },
          banco: {
            banco: banco.trim(),
            agencia: agencia.trim(),
            conta: conta.trim(),
            tipo_conta: tipoConta.trim(),
            pix: pix.trim(),
          },
          observacoes: observacoes.trim(),
          anexos: anexosPaths,
        },
      });
      if (error) throw error;
      setEnviado(true);
      toast({ title: 'Solicitação enviada!', description: 'O setor de Previdência entrará em contato.' });
    } catch (err) {
      console.error(err);
      toast({ title: 'Erro ao enviar', description: 'Tente novamente em instantes.', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (enviado) {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <CheckCircle2 className="h-14 w-14 mx-auto text-green-600" />
            <h2 className="text-2xl font-bold">Solicitação enviada!</h2>
            <p className="text-muted-foreground">
              Sua solicitação de pagamento do Pecúlio foi encaminhada ao setor de Previdência da SBPM.
              Nossa equipe entrará em contato para orientar sobre a entrega dos documentos originais.
              Em caso de dúvidas, WhatsApp (71) 98549-6972.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Solicitar Pecúlio</h1>
          <p className="text-sm text-muted-foreground">
            Pedido de pagamento do benefício em caso de falecimento do titular
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="h-5 w-5 text-primary" /> Antes de começar
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            Utilize este formulário para solicitar o pagamento do Pecúlio SBPM em razão do
            falecimento do associado titular. Após o envio, o setor de Previdência entrará em
            contato para orientar sobre a entrega dos documentos originais.
          </p>
          <div className="flex items-start gap-2 rounded-md bg-muted p-3">
            <FileText className="h-4 w-4 mt-0.5 shrink-0" />
            <div>
              <strong>Documentos necessários:</strong> Certidão de Óbito, RG e CPF do beneficiário,
              comprovante de residência atualizado e comprovante da conta bancária para depósito.
            </div>
          </div>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader><CardTitle className="text-lg">Associado titular (falecido)</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Nome</Label>
              <Input value={associado?.nome || ''} disabled />
            </div>
            <div>
              <Label>Matrícula</Label>
              <Input value={associado?.matricula || ''} disabled />
            </div>
            <div>
              <Label>Data do falecimento *</Label>
              <Input
                type="date"
                value={dataFalecimento}
                onChange={(e) => setDataFalecimento(e.target.value)}
                required
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Solicitante / Beneficiário</CardTitle></CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="md:col-span-2">
              <Label>Nome completo *</Label>
              <Input value={nome} onChange={(e) => setNome(e.target.value)} maxLength={200} required />
            </div>
            <div>
              <Label>CPF</Label>
              <Input value={cpf} onChange={(e) => setCpf(e.target.value)} maxLength={20} placeholder="000.000.000-00" />
            </div>
            <div>
              <Label>Parentesco</Label>
              <Input value={parentesco} onChange={(e) => setParentesco(e.target.value)} maxLength={80} />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} />
            </div>
            <div>
              <Label>Telefone / WhatsApp</Label>
              <Input value={telefone} onChange={(e) => setTelefone(e.target.value)} maxLength={30} placeholder="(71) 9 9999-9999" />
            </div>
            <div className="md:col-span-2">
              <Label>Endereço</Label>
              <Textarea value={endereco} onChange={(e) => setEndereco(e.target.value)} rows={2} maxLength={500} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados bancários para pagamento</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <Label>Banco</Label>
              <Input value={banco} onChange={(e) => setBanco(e.target.value)} maxLength={120} />
            </div>
            <div>
              <Label>Agência</Label>
              <Input value={agencia} onChange={(e) => setAgencia(e.target.value)} maxLength={30} />
            </div>
            <div>
              <Label>Conta</Label>
              <Input value={conta} onChange={(e) => setConta(e.target.value)} maxLength={40} />
            </div>
            <div>
              <Label>Tipo de conta</Label>
              <Input value={tipoConta} onChange={(e) => setTipoConta(e.target.value)} maxLength={30} placeholder="Corrente / Poupança" />
            </div>
            <div className="md:col-span-2">
              <Label>Chave PIX (opcional)</Label>
              <Input value={pix} onChange={(e) => setPix(e.target.value)} maxLength={140} />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-lg">Observações</CardTitle></CardHeader>
          <CardContent>
            <Textarea
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              rows={4}
              maxLength={2000}
              placeholder="Informações adicionais que possam ajudar na análise"
            />
          </CardContent>
        </Card>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...</>
          ) : (
            'Enviar solicitação'
          )}
        </Button>
      </form>
    </div>
  );
}
