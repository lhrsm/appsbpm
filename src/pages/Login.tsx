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
  const [credential, setCredential] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setAssociado, setDependentes, setLimite, setHistoricoLimite, setCarencias, setInformes } = useAssociado();

  // Remove formatting from CPF for comparison
  const cleanCpf = (cpf: string) => cpf.replace(/\D/g, '');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!credential.trim()) {
      toast({
        title: 'Erro',
        description: 'Por favor, informe sua matrícula ou CPF.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const cleanedCredential = cleanCpf(credential.trim());
      
      // Buscar associado pela matrícula ou CPF
      let associadoData = null;
      
      // First try by matricula
      const { data: byMatricula } = await supabase
        .from('associados')
        .select('*')
        .eq('matricula', credential.trim())
        .eq('ativo', true)
        .maybeSingle();
      
      if (byMatricula) {
        associadoData = byMatricula;
      } else {
        // Try by CPF (cleaned)
        const { data: byCpf } = await supabase
          .from('associados')
          .select('*')
          .eq('ativo', true);
        
        // Find by CPF (removing formatting from both sides)
        associadoData = byCpf?.find(a => cleanCpf(a.cpf) === cleanedCredential) || null;
      }

      if (!associadoData) {
        toast({
          title: 'Credencial não encontrada',
          description: 'Verifique sua matrícula ou CPF e tente novamente.',
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
            Acesse com sua matrícula ou CPF para consultar seus benefícios
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="credential" className="text-foreground font-medium">
                Matrícula ou CPF
              </Label>
              <Input
                id="credential"
                type="text"
                placeholder="Digite sua matrícula ou CPF"
                value={credential}
                onChange={(e) => setCredential(e.target.value)}
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
