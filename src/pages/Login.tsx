import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAssociado } from '@/contexts/AssociadoContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import sbpmLogo from '@/assets/sbpm-logo.jpeg';

export default function Login() {
  const [matricula, setMatricula] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setAssociado, setDependentes, setLimite, setHistoricoLimite, setCarencias, setInformes } = useAssociado();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!matricula.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, informe sua matrícula.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      // Buscar associado pela matrícula
      const { data: associadoData, error: associadoError } = await supabase
        .from('associados')
        .select('*')
        .eq('matricula', matricula.trim())
        .eq('ativo', true)
        .single();

      if (associadoError || !associadoData) {
        toast({
          title: 'Matrícula não encontrada',
          description: 'Verifique sua matrícula e tente novamente.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      // Carregar dados relacionados em paralelo
      const [dependentesRes, limiteRes, historicoRes, carenciasRes, informesRes] = await Promise.all([
        supabase.from('dependentes').select('*').eq('associado_id', associadoData.id).eq('ativo', true),
        supabase.from('limites').select('*').eq('associado_id', associadoData.id).single(),
        supabase.from('historico_limite').select('*').eq('associado_id', associadoData.id).order('data_utilizacao', { ascending: false }),
        supabase.from('carencias').select('*').eq('associado_id', associadoData.id),
        supabase.from('informes_rendimentos').select('*').eq('associado_id', associadoData.id).order('ano', { ascending: false }),
      ]);

      setAssociado(associadoData);
      setDependentes(dependentesRes.data || []);
      setLimite(limiteRes.data || null);
      setHistoricoLimite(historicoRes.data || []);
      setCarencias(carenciasRes.data || []);
      setInformes(informesRes.data || []);

      toast({
        title: 'Bem-vindo!',
        description: `Olá, ${associadoData.nome.split(' ')[0]}!`,
      });

      navigate('/dashboard');
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      toast({
        title: 'Erro',
        description: 'Ocorreu um erro ao acessar o sistema. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 via-background to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-xl border-0 animate-fade-in">
        <CardHeader className="text-center pb-2">
          <div className="flex justify-center mb-4">
            <img
              src={sbpmLogo}
              alt="SBPM - Sociedade Beneficente da Polícia Militar"
              className="h-32 w-auto object-contain"
            />
          </div>
          <CardTitle className="text-2xl font-bold text-primary">
            Portal do Associado
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Acesse com sua matrícula para consultar seus benefícios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="matricula" className="text-foreground font-medium">
                Matrícula
              </Label>
              <Input
                id="matricula"
                type="text"
                placeholder="Digite sua matrícula"
                value={matricula}
                onChange={(e) => setMatricula(e.target.value)}
                className="h-12 text-lg"
                disabled={loading}
              />
            </div>
            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Acessando...
                </>
              ) : (
                'Acessar'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
