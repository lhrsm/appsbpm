import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Eye, EyeOff } from 'lucide-react';
import sbpmLogo from '@/assets/sbpm-logo.png';
import AuthBackgroundLayout from '@/components/AuthBackgroundLayout';
import { loginComSenha } from '@/lib/portalAcesso';
import { useAplicarPortal } from './useAplicarPortal';
import { padCpf, padRegistrationNumber, formatCpf, formatRegistrationNumber } from '@/lib/identity';
import { PublicFlowModal } from '@/components/portal/PublicFlowModal';

export default function PortalEntrar() {
  const [credential, setCredential] = useState('');
  const [password, setPassword] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const aplicar = useAplicarPortal();

  const handleCredentialChange = (v: string) => {
    const clean = v.replace(/\D/g, '');
    if (clean.length <= 9) {
      setCredential(formatRegistrationNumber(clean));
    } else {
      setCredential(formatCpf(clean));
    }
  };

  const submeter = async (e: React.FormEvent) => {
    e.preventDefault();
    const clean = credential.replace(/\D/g, '');
    const normalized = clean.length > 9 ? padCpf(clean) : padRegistrationNumber(clean);
    if (!normalized || !password) {
      toast({ title: 'Informe seus dados', description: 'Preencha CPF ou matrícula e a senha.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const res = await loginComSenha(normalized, password);
    setLoading(false);

    if (!res?.success || !res.portal) {
      toast({ title: 'Não foi possível entrar', description: res?.message ?? 'Credenciais inválidas.', variant: 'destructive' });
      return;
    }
    if (!aplicar(res.portal)) {
      toast({ title: 'Cadastro em sincronização', description: 'Fale com o atendimento da SBPM.', variant: 'destructive' });
      return;
    }
    toast({ title: 'Bem-vindo!', description: `Olá, ${res.portal.associado.nome.split(' ')[0]}!` });
    navigate('/dashboard');
  };

  return (
    <AuthBackgroundLayout align="center">
      <PublicFlowModal>
        <Card className="auth-card border-0 animate-fade-in shadow-none backdrop-blur-none">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <img src={sbpmLogo} alt="SBPM" className="h-[62px] w-auto object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary leading-tight clamp-title">Bem-vindo ao Portal da SBPM</CardTitle>
            <CardDescription className="text-[var(--public-description-light)] font-medium text-[0.80rem] leading-snug">Use seu CPF ou matrícula e a senha criada no primeiro acesso.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submeter} className="space-y-5" aria-label="Formulário de acesso">
              <div className="space-y-2">
                <Label htmlFor="credential">CPF ou matrícula</Label>
                <Input
                  id="credential"
                  inputMode="numeric"
                  enterKeyHint="next"
                  autoComplete="username"
                  placeholder="Digite seu CPF ou matrícula"
                  value={credential}
                  onChange={(e) => handleCredentialChange(e.target.value)}
                  maxLength={14}
                  className="h-10 text-base"
                  disabled={loading}
                  onFocus={(e) => {
                    setTimeout(() => {
                      e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }, 300);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={verSenha ? 'text' : 'password'}
                    enterKeyHint="done"
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-10 pr-12 text-base"
                    disabled={loading}
                    onFocus={(e) => {
                      setTimeout(() => {
                        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 300);
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setVerSenha((v) => !v)}
                    className="absolute right-1 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={verSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {verSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-10 text-base font-semibold" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" aria-hidden="true" /> Acessando...
                  </>
                ) : (
                  'Acessar'
                )}
              </Button>

              <div className="flex items-center justify-between text-sm">
                <Link to="/recuperar-acesso" className="font-medium text-primary hover:underline">
                  Esqueci minha senha
                </Link>
                <Link to="/primeiro-acesso" className="font-medium text-primary hover:underline">
                  Primeiro acesso
                </Link>
              </div>
            </form>
          </CardContent>
          <style dangerouslySetInnerHTML={{ __html: `
            .clamp-title {
              font-size: clamp(1.45rem, 6vw, 1.8rem) !important;
            }
          `}} />
        </Card>
      </PublicFlowModal>
    </AuthBackgroundLayout>
  );
}
