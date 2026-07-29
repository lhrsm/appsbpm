import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAssociado, Dependente } from '@/contexts/AssociadoContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';
import sbpmLogo from '@/assets/sbpm-logo.png';
import AuthBackgroundLayout from '@/components/AuthBackgroundLayout';



export default function Login() {
  const [credential, setCredential] = useState('');
  const [loading, setLoading] = useState(false);
  const [consent, setConsent] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);
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

      const res = await portalCall<any>('login', {
        credential: /^\d{11}$/.test(cleanedCredential) ? cleanedCredential : credential.trim(),
        user_agent: navigator.userAgent.slice(0, 500),
      });

      if (!res?.token || !res?.associado) {
        toast({
          title: 'Credencial não encontrada',
          description: 'Verifique sua matrícula ou CPF e tente novamente.',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      setPortalToken(res.token);

      const dependenteData: Dependente | null = res.dependente ?? null;
      const isLoginAsDependente = Boolean(dependenteData);

      setAssociado(res.associado);
      setDependentes(res.dependentes || []);
      setLimite(res.limite || null);
      setHistoricoLimite(res.historico || []);
      setCarencias([]);
      setInformes(res.informes || []);
      setIsDependente(isLoginAsDependente);
      setDependenteLogado(dependenteData);

      const nomeExibir = isLoginAsDependente && dependenteData
        ? dependenteData.nome.split(' ')[0]
        : res.associado.nome.split(' ')[0];

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
    <AuthBackgroundLayout align="center">
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
                className="h-28 w-auto object-contain"
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

              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="w-full text-sm font-medium text-primary hover:underline"
              >
                Esqueci minha senha
              </button>
            </form>

            <Dialog open={forgotOpen} onOpenChange={setForgotOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Esqueci minha senha</DialogTitle>
                  <DialogDescription>
                    O acesso ao Portal do Associado é feito com a sua matrícula ou CPF, sem senha.
                    Se não conseguir entrar, fale com a Previdência da SBPM para conferir o seu cadastro.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-2">
                  <Button asChild className="w-full">
                    <a
                      href="https://wa.me/5571985496972?text=Ol%C3%A1%2C%20preciso%20de%20ajuda%20para%20acessar%20o%20Portal%20do%20Associado."
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Falar com a Previdência no WhatsApp
                    </a>
                  </Button>
                  <Button asChild variant="outline" className="w-full">
                    <a href="mailto:previdencia@sbpmbahia.com.br?subject=Ajuda%20para%20acessar%20o%20Portal%20do%20Associado">
                      Enviar e-mail para a Previdência
                    </a>
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

          </CardContent>
        </Card>

        <nav
          aria-label="Links institucionais"
          className="auth-links mt-6 flex flex-wrap items-center justify-center gap-2 text-xs"
        >
          <Link to="/privacidade" className="auth-link">
            Política de Privacidade
          </Link>
          <Link to="/acessibilidade" className="auth-link">
            Acessibilidade
          </Link>
          <a
            href="mailto:contato@sbpmbahia.com.br?subject=LGPD%20-%20Solicita%C3%A7%C3%A3o%20de%20Titular"
            className="auth-link"
          >
            Meus dados (LGPD)
          </a>
        </nav>

      </main>
    </AuthBackgroundLayout>

  );
}
