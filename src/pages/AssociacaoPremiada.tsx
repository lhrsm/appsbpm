import { useState } from 'react';
import { useAssociado } from '@/contexts/AssociadoContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Award, Gift, CheckCircle2, Send } from 'lucide-react';

export default function AssociacaoPremiada() {
  const { associado } = useAssociado();
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const [form, setForm] = useState({
    indicado_nome: '',
    indicado_cpf: '',
    indicado_telefone: '',
    indicado_email: '',
    indicado_cidade: '',
    observacoes: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!associado) return;

    if (!form.indicado_nome.trim() || !form.indicado_telefone.trim()) {
      toast.error('Preencha nome e telefone da pessoa indicada.');
      return;
    }

    setEnviando(true);
    try {
      const { data, error } = await supabase.functions.invoke('send-indicacao', {
        body: {
          associado_matricula: associado.matricula,
          associado_nome: associado.nome,
          associado_email: (associado as any).email || '',
          ...form,
        },
      });

      if (error) throw error;

      setEnviado(true);
      toast.success('Indicação enviada com sucesso!');
      setForm({
        indicado_nome: '',
        indicado_cpf: '',
        indicado_telefone: '',
        indicado_email: '',
        indicado_cidade: '',
        observacoes: '',
      });
    } catch (err: any) {
      console.error(err);
      toast.error('Não foi possível enviar a indicação. Tente novamente.');
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

      {/* Regulamento */}
      <Card className="border-l-4 border-sbpm-green">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gift className="h-5 w-5 text-sbpm-green" />
            Regulamento
          </CardTitle>
          <CardDescription>Confira as regras da Campanha Associação Premiada</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3 text-sm leading-relaxed">
          <p><strong>1. Quem pode participar:</strong> A campanha é exclusiva para associados titulares da SBPM com cadastro ativo e adimplente.</p>
          <p><strong>2. Como participar:</strong> Basta preencher o formulário abaixo com os dados de um potencial associado. Cada indicação válida gera um número da sorte.</p>
          <p><strong>3. Indicação válida:</strong> É considerada válida quando a pessoa indicada efetivar seu cadastro como associado da SBPM.</p>
          <p><strong>4. Prêmios:</strong> Os prêmios serão divulgados periodicamente pelos canais oficiais da SBPM. Quanto mais indicações válidas, maiores as chances.</p>
          <p><strong>5. Sorteios:</strong> Os sorteios serão realizados nas datas anunciadas oficialmente e transmitidos pelas redes sociais da SBPM.</p>
          <p><strong>6. Divulgação dos ganhadores:</strong> Os ganhadores serão comunicados pelos telefones/e-mails cadastrados e nas redes sociais oficiais.</p>
          <p><strong>7. Uso dos dados:</strong> Ao enviar uma indicação, o associado declara ter autorização da pessoa indicada para o compartilhamento dos dados de contato para fins da campanha, em conformidade com a LGPD.</p>
          <p><strong>8. Dúvidas:</strong> Em caso de dúvidas, entre em contato pelo e-mail <a href="mailto:contato@sbpmbahia.com.br" className="text-primary underline">contato@sbpmbahia.com.br</a>.</p>
        </CardContent>
      </Card>

      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle>Formulário de Indicação</CardTitle>
          <CardDescription>Preencha os dados da pessoa que você deseja indicar</CardDescription>
        </CardHeader>
        <CardContent>
          {enviado && (
            <Alert className="mb-4 border-sbpm-green bg-sbpm-green/10">
              <CheckCircle2 className="h-4 w-4 text-sbpm-green" />
              <AlertDescription className="text-sbpm-green">
                Sua indicação foi enviada para <strong>contato@sbpmbahia.com.br</strong>. Obrigado por participar!
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="indicado_nome">Nome completo *</Label>
                <Input
                  id="indicado_nome"
                  name="indicado_nome"
                  value={form.indicado_nome}
                  onChange={handleChange}
                  required
                  maxLength={200}
                  placeholder="Nome da pessoa indicada"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="indicado_cpf">CPF</Label>
                <Input
                  id="indicado_cpf"
                  name="indicado_cpf"
                  value={form.indicado_cpf}
                  onChange={handleChange}
                  maxLength={20}
                  placeholder="000.000.000-00"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="indicado_telefone">Telefone / WhatsApp *</Label>
                <Input
                  id="indicado_telefone"
                  name="indicado_telefone"
                  value={form.indicado_telefone}
                  onChange={handleChange}
                  required
                  maxLength={30}
                  placeholder="(71) 90000-0000"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="indicado_email">E-mail</Label>
                <Input
                  id="indicado_email"
                  name="indicado_email"
                  type="email"
                  value={form.indicado_email}
                  onChange={handleChange}
                  maxLength={200}
                  placeholder="email@exemplo.com"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="indicado_cidade">Cidade</Label>
                <Input
                  id="indicado_cidade"
                  name="indicado_cidade"
                  value={form.indicado_cidade}
                  onChange={handleChange}
                  maxLength={120}
                  placeholder="Cidade / UF"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="observacoes">Observações</Label>
                <Textarea
                  id="observacoes"
                  name="observacoes"
                  value={form.observacoes}
                  onChange={handleChange}
                  maxLength={2000}
                  rows={4}
                  placeholder="Melhor horário para contato, informações adicionais, etc."
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={enviando}
              className="w-full md:w-auto bg-sbpm-green hover:bg-sbpm-green/90"
            >
              <Send className="h-4 w-4 mr-2" />
              {enviando ? 'Enviando...' : 'Enviar Indicação'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
