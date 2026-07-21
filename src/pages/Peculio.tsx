import { useMemo, useState } from 'react';
import { useAssociado } from '@/contexts/AssociadoContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { ShieldCheck, Plus, Trash2, Loader2, CheckCircle2, Info } from 'lucide-react';

type Beneficiario = {
  nome: string;
  parentesco: string;
  cpf: string;
  percentual: string;
};

const novoBeneficiario = (): Beneficiario => ({
  nome: '',
  parentesco: '',
  cpf: '',
  percentual: '',
});

export default function Peculio() {
  const { associado } = useAssociado();
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [beneficiarios, setBeneficiarios] = useState<Beneficiario[]>([novoBeneficiario()]);

  const total = useMemo(
    () =>
      beneficiarios.reduce((sum, b) => {
        const v = parseFloat((b.percentual || '0').replace(',', '.'));
        return sum + (isNaN(v) ? 0 : v);
      }, 0),
    [beneficiarios],
  );

  const atualizar = (idx: number, campo: keyof Beneficiario, valor: string) => {
    setBeneficiarios((prev) => prev.map((b, i) => (i === idx ? { ...b, [campo]: valor } : b)));
  };

  const adicionar = () => setBeneficiarios((p) => [...p, novoBeneficiario()]);
  const remover = (idx: number) =>
    setBeneficiarios((p) => (p.length === 1 ? p : p.filter((_, i) => i !== idx)));

  const distribuirIgualmente = () => {
    const n = beneficiarios.length;
    if (!n) return;
    const base = Math.floor((100 / n) * 100) / 100;
    const resto = Math.round((100 - base * n) * 100) / 100;
    setBeneficiarios((p) =>
      p.map((b, i) => ({
        ...b,
        percentual: (i === 0 ? (base + resto).toFixed(2) : base.toFixed(2)),
      })),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!associado) return;

    for (const b of beneficiarios) {
      if (!b.nome.trim()) {
        toast({ title: 'Informe o nome de todos os beneficiários', variant: 'destructive' });
        return;
      }
      const p = parseFloat((b.percentual || '').replace(',', '.'));
      if (isNaN(p) || p <= 0 || p > 100) {
        toast({ title: 'Percentual inválido', description: `Verifique o beneficiário "${b.nome || 'sem nome'}".`, variant: 'destructive' });
        return;
      }
    }
    if (Math.round(total * 100) / 100 !== 100) {
      toast({ title: 'A soma dos percentuais deve ser 100%', description: `Total atual: ${total.toFixed(2)}%`, variant: 'destructive' });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.functions.invoke('send-peculio-beneficiarios', {
        body: {
          associado: {
            nome: associado.nome,
            matricula: associado.matricula,
            email: associado.email || '',
            telefone: associado.telefone || '',
          },
          beneficiarios: beneficiarios.map((b) => ({
            nome: b.nome.trim(),
            parentesco: b.parentesco.trim(),
            cpf: b.cpf.trim(),
            percentual: parseFloat(b.percentual.replace(',', '.')),
          })),
        },
      });
      if (error) throw error;
      setEnviado(true);
      toast({ title: 'Indicação enviada!', description: 'Sua indicação de beneficiários foi enviada ao setor de Previdência.' });
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
            <h2 className="text-2xl font-bold">Indicação enviada com sucesso!</h2>
            <p className="text-muted-foreground">
              Sua indicação de beneficiários do Pecúlio foi encaminhada ao setor de Previdência
              da SBPM. Em caso de dúvidas, entre em contato pelo WhatsApp (71) 98549-6972.
            </p>
            <Button onClick={() => { setEnviado(false); setBeneficiarios([novoBeneficiario()]); }}>
              Nova indicação
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const totalArred = Math.round(total * 100) / 100;
  const totalOk = totalArred === 100;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <div className="bg-primary/10 p-3 rounded-lg">
          <ShieldCheck className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Pecúlio</h1>
          <p className="text-sm text-muted-foreground">
            Indique os beneficiários do seu pecúlio SBPM
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <Info className="h-5 w-5 text-primary" /> Como funciona o Pecúlio
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed text-muted-foreground">
          <p>
            O <strong>Pecúlio</strong> é um benefício da SBPM pago aos beneficiários indicados pelo
            associado titular em caso de seu falecimento. Trata-se de um valor único, destinado a
            oferecer amparo financeiro imediato à família nesse momento delicado.
          </p>
          <p>
            É <strong>direito e responsabilidade</strong> do associado manter atualizada a relação
            de beneficiários. Você pode indicar <strong>uma ou mais pessoas</strong>, definindo
            para cada uma o <strong>percentual</strong> que receberá do valor total. A soma dos
            percentuais deve ser sempre <strong>100%</strong>.
          </p>
          <p>
            Caso não haja indicação, o pagamento seguirá a ordem legal de sucessão. A qualquer
            momento o associado pode alterar seus beneficiários enviando uma nova indicação por
            este formulário.
          </p>
        </CardContent>
      </Card>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0">
            <CardTitle className="text-lg">Beneficiários</CardTitle>
            <div className="flex gap-2">
              <Button type="button" variant="outline" size="sm" onClick={distribuirIgualmente}>
                Dividir igualmente
              </Button>
              <Button type="button" size="sm" onClick={adicionar}>
                <Plus className="h-4 w-4 mr-1" /> Adicionar
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {beneficiarios.map((b, idx) => (
              <div key={idx} className="border rounded-lg p-4 space-y-3 relative">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">Beneficiário {idx + 1}</span>
                  {beneficiarios.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => remover(idx)}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <Label>Nome completo *</Label>
                    <Input
                      value={b.nome}
                      onChange={(e) => atualizar(idx, 'nome', e.target.value)}
                      placeholder="Nome do beneficiário"
                      maxLength={200}
                      required
                    />
                  </div>
                  <div>
                    <Label>Parentesco</Label>
                    <Input
                      value={b.parentesco}
                      onChange={(e) => atualizar(idx, 'parentesco', e.target.value)}
                      placeholder="Ex: Cônjuge, Filho(a), Mãe..."
                      maxLength={80}
                    />
                  </div>
                  <div>
                    <Label>CPF</Label>
                    <Input
                      value={b.cpf}
                      onChange={(e) => atualizar(idx, 'cpf', e.target.value)}
                      placeholder="000.000.000-00"
                      maxLength={20}
                    />
                  </div>
                  <div>
                    <Label>Percentual (%) *</Label>
                    <Input
                      type="number"
                      inputMode="decimal"
                      step="0.01"
                      min="0.01"
                      max="100"
                      value={b.percentual}
                      onChange={(e) => atualizar(idx, 'percentual', e.target.value)}
                      placeholder="Ex: 50"
                      required
                    />
                  </div>
                </div>
              </div>
            ))}

            <div
              className={`flex items-center justify-between rounded-lg border px-4 py-3 text-sm ${
                totalOk
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-amber-50 border-amber-200 text-amber-800'
              }`}
            >
              <span>Soma dos percentuais</span>
              <strong>{totalArred.toFixed(2)}% / 100%</strong>
            </div>

            <Button type="submit" className="w-full" disabled={loading || !totalOk}>
              {loading ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...</>
              ) : (
                'Enviar indicação de beneficiários'
              )}
            </Button>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
