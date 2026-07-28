import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAssociado, Dependente } from '@/contexts/AssociadoContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import sbpmLogo from '@/assets/sbpm-logo.jpeg';
import loginBg from '@/assets/login-bg.png.asset.json';


export default function Login() {
  const [credential, setCredential] = useState('');
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { 
    setAssociado, 
    setDependentes, 
    setLimite, 
    setHistoricoLimite, 
    setCarencias, 
    setInformes,
    setIsDependente,
    setDependenteLogado
  } = useAssociado();

  // Remove formatting from CPF for comparison
  const cleanCpf = (cpf: string) => cpf.replace(/\D/g, '');

  // Aplica máscara de CPF (000.000.000-00) quando o valor passa de 8 dígitos
  // (matrícula tem no máximo 8 dígitos, então continua sem formatação)
  const applyMask = (value: string) => {
    const d = value.replace(/\D/g, '').slice(0, 11);
    if (d.length <= 8) return d;
    return d
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/^(\d{3})\.(\d{3})\.(\d{3})(\d{1,2})$/, '$1.$2.$3-$4');
  };


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

    if (!consent) {
      toast({
        title: 'Consentimento necessário',
        description: 'Você precisa aceitar a Política de Privacidade para acessar o portal.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);

    try {
      const cleanedCredential = cleanCpf(credential.trim());
      
      // Buscar associado pela matrícula ou CPF
      let associadoData = null;
      let dependenteData: Dependente | null = null;
      let isLoginAsDependente = false;
      
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
        // Try by CPF in associados table
        const { data: allAssociados } = await supabase
          .from('associados')
          .select('*')
          .eq('ativo', true);
        
        associadoData = allAssociados?.find(a => cleanCpf(a.cpf) === cleanedCredential) || null;
        
        // If not found in associados, try in dependentes table
        if (!associadoData) {
          const { data: allDependentes } = await supabase
            .from('dependentes')
            .select('*')
            .eq('ativo', true);
          
          const foundDependente = allDependentes?.find(d => d.cpf && cleanCpf(d.cpf) === cleanedCredential);
          
          if (foundDependente) {
            // Found a dependente, now get the associated associado
            const { data: associadoDoDepData } = await supabase
              .from('associados')
              .select('*')
              .eq('id', foundDependente.associado_id)
              .eq('ativo', true)
              .maybeSingle();
            
            if (associadoDoDepData) {
              associadoData = associadoDoDepData;
              dependenteData = foundDependente as Dependente;
              isLoginAsDependente = true;
            }
          }
        }
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
        supabase.from('limites').select('*').eq('associado_id', associadoData.id).maybeSingle(),
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
      setIsDependente(isLoginAsDependente);
      setDependenteLogado(dependenteData);

      // Registrar acesso (best-effort, não bloqueia login)
      try {
        await supabase.from('acessos_log').insert({
          associado_id: associadoData.id,
          dependente_id: dependenteData?.id ?? null,
          tipo_usuario: isLoginAsDependente ? 'dependente' : 'titular',
          metodo_login: /^\d{11}$/.test(cleanedCredential) ? 'cpf' : 'matricula',
          user_agent: navigator.userAgent.slice(0, 500),
          sucesso: true,
        });
      } catch {}


      const nomeExibir = isLoginAsDependente && dependenteData 
        ? dependenteData.nome.split(' ')[0] 
        : associadoData.nome.split(' ')[0];

      toast({
        title: 'Bem-vindo!',
        description: `Olá, ${nomeExibir}!`,
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
    <AuthBackgroundLayout>
      <a
        href="#main-login"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Pular para o formulário de acesso
      </a>
      <main id="main-login" className="w-full max-w-md">

        <Card className="auth-card w-full border-0 animate-fade-in">

          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <img
                src={sbpmLogo}
                alt="SBPM - Sociedade Beneficente da Polícia Militar"
                className="h-32 w-auto object-contain mix-blend-multiply"
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
            <form onSubmit={handleLogin} className="space-y-6" aria-label="Formulário de acesso ao Portal do Associado">
              <div className="space-y-2">
                <Label htmlFor="credential" className="text-foreground font-medium">
                  Matrícula ou CPF
                </Label>
                <Input
                  id="credential"
                  type="text"
                  inputMode="numeric"
                  autoComplete="username"
                  placeholder="Digite sua matrícula ou CPF"
                  value={credential}
                  onChange={(e) => setCredential(applyMask(e.target.value))}
                  maxLength={14}

                  className="h-12 text-lg"
                  disabled={loading}
                  aria-required="true"
                />
              </div>

              <div className="flex items-start gap-3 rounded-md border bg-muted/30 p-3">
                <Checkbox
                  id="lgpd-consent"
                  checked={consent}
                  onCheckedChange={(v) => setConsent(v === true)}
                  disabled={loading}
                  aria-describedby="lgpd-consent-desc"
                  className="mt-0.5"
                />
                <Label
                  htmlFor="lgpd-consent"
                  id="lgpd-consent-desc"
                  className="text-xs font-normal leading-relaxed text-muted-foreground cursor-pointer"
                >
                  Li e concordo com a{' '}
                  <Link to="/privacidade" className="font-medium text-primary underline underline-offset-2">
                    Política de Privacidade
                  </Link>
                  {' '}e autorizo o tratamento dos meus dados para uso do portal, conforme a LGPD.
                </Label>
              </div>

              <Button
                type="submit"
                className="w-full h-12 text-lg font-semibold"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" />
                    <span>Acessando...</span>
                  </>
                ) : (
                  'Acessar'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <nav
          aria-label="Links institucionais"
          className="mt-6 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs text-muted-foreground"
        >
          <Link to="/privacidade" className="underline underline-offset-2 hover:text-foreground">
            Política de Privacidade
          </Link>
          <span aria-hidden="true">·</span>
          <Link to="/acessibilidade" className="underline underline-offset-2 hover:text-foreground">
            Acessibilidade
          </Link>
          <span aria-hidden="true">·</span>
          <a
            href="mailto:contato@sbpmbahia.com.br?subject=LGPD%20-%20Solicita%C3%A7%C3%A3o%20de%20Titular"
            className="underline underline-offset-2 hover:text-foreground"
          >
            Meus dados (LGPD)
          </a>
        </nav>
      </main>
    </AuthBackgroundLayout>

  );
}
