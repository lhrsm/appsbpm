import { useState } from 'react';
import { useAssociado } from '@/contexts/AssociadoContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

type ParceiroForm = {
  nome: string;
  email: string;
  telefone: string;
  estado: string;
  cidade: string;
  cidades: string[];
  redes: RedeSocial[];
};

const emptyParceiro = (): ParceiroForm => ({
  nome: '',
  email: '',
  telefone: '',
  estado: '',
  cidade: '',
  cidades: [],
  redes: [{ tipo: 'Instagram', valor: '' }],
});

export default function IndicarParceiro() {
  const { associado } = useAssociado();
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [parceiros, setParceiros] = useState<ParceiroForm[]>([emptyParceiro()]);

  const updateParceiro = (idx: number, patch: Partial<ParceiroForm>) => {
    setParceiros((prev) => prev.map((p, i) => (i === idx ? { ...p, ...patch } : p)));
  };

  const carregarCidades = async (idx: number, uf: string) => {
    updateParceiro(idx, { estado: uf, cidade: '', cidades: [] });
    try {
      const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
      const data = await res.json();
      updateParceiro(idx, { cidades: data.map((c: { nome: string }) => c.nome) });
    } catch {
      updateParceiro(idx, { cidades: [] });
    }
  };

  const addParceiro = () => setParceiros((p) => [...p, emptyParceiro()]);
  const removeParceiro = (idx: number) => setParceiros((p) => p.filter((_, i) => i !== idx));

  const addRede = (idx: number) => {
    updateParceiro(idx, { redes: [...parceiros[idx].redes, { tipo: 'Instagram', valor: '' }] });
  };
  const removeRede = (idx: number, ri: number) => {
    updateParceiro(idx, { redes: parceiros[idx].redes.filter((_, i) => i !== ri) });
  };
  const updateRede = (idx: number, ri: number, patch: Partial<RedeSocial>) => {
    updateParceiro(idx, {
      redes: parceiros[idx].redes.map((r, i) => (i === ri ? { ...r, ...patch } : r)),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!associado) return;

    for (const p of parceiros) {
      if (!p.nome || !p.telefone || !p.estado || !p.cidade) {
        toast({ title: 'Preencha os campos obrigatórios de todos os parceiros', variant: 'destructive' });
        return;
      }
    }

    setLoading(true);
    try {
      const indicador = {
        nome: associado.nome,
        email: associado.email || '',
        telefone: associado.telefone || '',
        matricula: associado.matricula,
      };

      const results = await Promise.all(
        parceiros.map((p) =>
          supabase.functions.invoke('send-parceiro-indicacao', {
            body: {
              indicador,
              parceiro: {
                nome: p.nome,
                email: p.email,
                telefone: p.telefone,
                estado: p.estado,
                cidade: p.cidade,
                redes_sociais: p.redes
                  .filter((r) => r.valor.trim())
                  .map((r) => `${r.tipo}: ${r.valor.trim()}`)
                  .join('\n'),
              },
            },
          }),
        ),
      );

      const firstError = results.find((r) => r.error);
      if (firstError?.error) throw firstError.error;

      setEnviado(true);
      toast({
        title: 'Indicações enviadas!',
        description: `${parceiros.length} indicação(ões) recebida(s) pelo departamento comercial.`,
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
            <h2 className="text-2xl font-bold">Indicações enviadas com sucesso!</h2>
            <p className="text-muted-foreground">
              O e-mail foi recebido pelo departamento comercial da SBPM.
              Em breve entraremos em contato com os parceiros indicados.
            </p>
            <Button
              onClick={() => {
                setEnviado(false);
                setParceiros([emptyParceiro()]);
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
            Indique um ou mais estabelecimentos para se tornarem parceiros da SBPM
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

        {parceiros.map((p, idx) => (
          <Card key={idx}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
              <CardTitle className="text-lg">
                Parceiro indicado {parceiros.length > 1 ? `#${idx + 1}` : ''}
              </CardTitle>
              {parceiros.length > 1 && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeParceiro(idx)}
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Remover
                </Button>
              )}
            </CardHeader>
            <CardContent className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <Label>Nome do estabelecimento *</Label>
                <Input
                  value={p.nome}
                  onChange={(e) => updateParceiro(idx, { nome: e.target.value })}
                  maxLength={200}
                  required
                />
              </div>
              <div>
                <Label>E-mail</Label>
                <Input
                  type="email"
                  value={p.email}
                  onChange={(e) => updateParceiro(idx, { email: e.target.value })}
                  maxLength={200}
                />
              </div>
              <div>
                <Label>Telefone *</Label>
                <Input
                  value={p.telefone}
                  onChange={(e) => updateParceiro(idx, { telefone: e.target.value })}
                  maxLength={30}
                  required
                />
              </div>
              <div>
                <Label>Estado *</Label>
                <Select value={p.estado} onValueChange={(v) => carregarCidades(idx, v)}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {ESTADOS.map((uf) => <SelectItem key={uf} value={uf}>{uf}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Cidade *</Label>
                <Select
                  value={p.cidade}
                  onValueChange={(v) => updateParceiro(idx, { cidade: v })}
                  disabled={!p.estado || p.cidades.length === 0}
                >
                  <SelectTrigger><SelectValue placeholder={p.estado ? 'Selecione' : 'Escolha o estado'} /></SelectTrigger>
                  <SelectContent>
                    {p.cidades.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="md:col-span-2 space-y-3">
                <Label>Redes sociais</Label>
                {p.redes.map((r, ri) => (
                  <div key={ri} className="flex gap-2">
                    <Select
                      value={r.tipo}
                      onValueChange={(v) => updateRede(idx, ri, { tipo: v })}
                    >
                      <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {REDES_OPCOES.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
                      </SelectContent>
                    </Select>
                    <Input
                      value={r.valor}
                      onChange={(e) => updateRede(idx, ri, { valor: e.target.value })}
                      placeholder={r.tipo === 'Site' ? 'https://...' : `@usuario ou link do ${r.tipo}`}
                      maxLength={200}
                      className="flex-1"
                    />
                    {p.redes.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeRede(idx, ri)}
                        aria-label="Remover"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => addRede(idx)}
                >
                  <Plus className="h-4 w-4 mr-1" /> Adicionar rede social
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        <Button
          type="button"
          variant="outline"
          onClick={addParceiro}
          className="w-full md:w-auto"
        >
          <Plus className="h-4 w-4 mr-2" /> Adicionar outro parceiro
        </Button>

        <div>
          <Button type="submit" disabled={loading} className="w-full md:w-auto">
            {loading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Handshake className="h-4 w-4 mr-2" />}
            Enviar {parceiros.length > 1 ? `${parceiros.length} indicações` : 'indicação'}
          </Button>
        </div>
      </form>
    </div>
  );
}
