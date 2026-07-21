import { useState } from 'react';
import { useAssociado } from '@/contexts/AssociadoContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { Handshake, CheckCircle2, Loader2, Plus, Trash2 } from 'lucide-react';

const REDES_OPCOES = [
  'Instagram','Facebook','TikTok','YouTube','LinkedIn','Twitter/X','Site','WhatsApp','Outro',
];
type RedeSocial = { tipo: string; valor: string };

const ESTADOS = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'
];

export default function IndicarParceiro() {
  const { associado } = useAssociado();
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [estado, setEstado] = useState('');
  const [cidades, setCidades] = useState<string[]>([]);
  const [redes, setRedes] = useState<RedeSocial[]>([{ tipo: 'Instagram', valor: '' }]);
  const [form, setForm] = useState({
    nome: '',
    email: '',
    telefone: '',
    cidade: '',
  });

  const carregarCidades = async (uf: string) => {
    setEstado(uf);
    setForm((f) => ({ ...f, cidade: '' }));
    try {
      const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
      const data = await res.json();
      setCidades(data.map((c: { nome: string }) => c.nome));
    } catch {
      setCidades([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!associado) return;

    if (!form.nome || !form.telefone || !estado || !form.cidade) {
      toast({ title: 'Preencha os campos obrigatórios', variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-parceiro-indicacao', {
        body: {
          indicador: {
            nome: associado.nome,
            email: associado.email || '',
            telefone: associado.telefone || '',
            matricula: associado.matricula,
          },
          parceiro: {
            nome: form.nome,
            email: form.email,
            telefone: form.telefone,
            estado,
            cidade: form.cidade,
            redes_sociais: redes.filter(r => r.valor.trim()).map(r => `${r.tipo}: ${r.valor.trim()}`).join('\n'),
          },
        },
      });

      if (error) throw error;

      setEnviado(true);
      toast({
        title: 'Indicação enviada!',
        description: 'O e-mail foi recebido pelo departamento comercial.',
      });
    } catch (err) {
      console.error(err);
      toast({
        title: 'Erro ao enviar',
        description: 'Tente novamente em alguns instantes.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  if (enviado) {
    return (
      <div className="max-w-2xl mx-auto animate-fade-in">
        <Card>
          <CardContent className="p-8 text-center space-y-4">
            <CheckCircle2 className="h-16 w-16 text-sbpm-green mx-auto" />
            <h2 className="text-2xl font-bold">Indicação enviada com sucesso!</h2>
            <p className="text-muted-foreground">
              O e-mail foi recebido pelo departamento comercial da SBPM.
              Em breve entraremos em contato com o parceiro indicado.
            </p>
            <Button
              onClick={() => {
                setEnviado(false);
                setForm({ nome: '', email: '', telefone: '', cidade: '' });
                setRedes([{ tipo: 'Instagram', valor: '' }]);
                setEstado('');
                setCidades([]);
              }}
            >
              Fazer nova indicação
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-3">
        <Handshake className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Indicar Parceiro</h1>
          <p className="text-muted-foreground text-sm">
            Indique um estabelecimento para se tornar parceiro da SBPM
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Seus dados (indicador)</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Nome</Label>
              <Input value={associado?.nome || ''} disabled />
            </div>
            <div>
              <Label>Matrícula</Label>
              <Input value={associado?.matricula || ''} disabled />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input value={associado?.email || ''} disabled />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={associado?.telefone || ''} disabled />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados do parceiro indicado</CardTitle>
          </CardHeader>
          <CardContent className="grid md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label>Nome do estabelecimento *</Label>
              <Input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                maxLength={200}
                required
              />
            </div>
            <div>
              <Label>E-mail</Label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                maxLength={200}
              />
            </div>
            <div>
              <Label>Telefone *</Label>
              <Input
                value={form.telefone}
                onChange={(e) => setForm({ ...form, telefone: e.target.value })}
                maxLength={30}
                required
              />
            </div>
            <div>
              <Label>Estado *</Label>
              <Select value={estado} onValueChange={carregarCidades}>
                <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                <SelectContent>
                  {ESTADOS.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Cidade *</Label>
              <Select
                value={form.cidade}
                onValueChange={(v) => setForm({ ...form, cidade: v })}
                disabled={!estado || cidades.length === 0}
              >
                <SelectTrigger><SelectValue placeholder={estado ? 'Selecione' : 'Escolha o estado'} /></SelectTrigger>
                <SelectContent>
                  {cidades.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="md:col-span-2">
              <Label>Redes sociais</Label>
              <Textarea
                value={form.redes_sociais}
                onChange={(e) => setForm({ ...form, redes_sociais: e.target.value })}
                maxLength={1000}
                placeholder="Instagram, Facebook, site, etc."
                rows={3}
              />
            </div>
          </CardContent>
        </Card>

        <Button type="submit" disabled={loading} className="w-full md:w-auto">
          {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Handshake className="h-4 w-4 mr-2" />}
          Enviar indicação
        </Button>
      </form>
    </div>
  );
}
