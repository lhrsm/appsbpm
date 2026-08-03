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
      // Padrão Matrícula: 00000000-0
      if (clean.length <= 8) setCredential(clean);
      else setCredential(clean.replace(/^(\d{8})(\d{1})/, '$1-$2'));
    } else {
      // Padrão CPF: 000.000.000-00
      const d = clean.slice(0, 11);
      if (d.length <= 3) setCredential(d);
      else if (d.length <= 6) setCredential(d.replace(/^(\d{3})(\d{0,3})/, '$1.$2'));
      else if (d.length <= 9) setCredential(d.replace(/^(\d{3})(\d{3})(\d{0,3})/, '$1.$2.$3'));
      else setCredential(d.replace(/^(\d{3})(\d{3})(\d{3})(\d{0,2})/, '$1.$2.$3-$4'));
    }
  };

  const submeter = async (e: React.FormEvent) => {
    e.preventDefault();
    const normalized = credential.replace(/\D/g, '');
    if (!normalized || !password) {
      toast({ title: 'Informe seus dados', description: 'Preencha CPF ou matrícula e a senha.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    const res = await loginComSenha(credential.trim(), password);
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
      <main className="w-full max-w-md">
        <Card className="auth-card w-full border-0 animate-fade-in">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <img src={sbpmLogo} alt="SBPM" className="h-24 w-auto object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">Entrar no portal</CardTitle>
            <CardDescription>Use seu CPF ou matrícula e a senha criada no primeiro acesso.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={submeter} className="space-y-5" aria-label="Formulário de acesso">
              <div className="space-y-2">
                <Label htmlFor="credential">CPF ou matrícula</Label>
                <Input
                  id="credential"
                  inputMode="numeric"
                  autoComplete="username"
                  placeholder="Digite seu CPF ou matrícula"
                  value={credential}
                  onChange={(e) => handleCredentialChange(e.target.value)}
                  maxLength={14}
                  className="h-12 text-lg"
                  disabled={loading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={verSenha ? 'text' : 'password'}
                    autoComplete="current-password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="h-12 pr-12 text-lg"
                    disabled={loading}
                  />
                  <button
                    type="button"
                    onClick={() => setVerSenha((v) => !v)}
                    className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={verSenha ? 'Ocultar senha' : 'Mostrar senha'}
                  >
                    {verSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-lg font-semibold" disabled={loading}>
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
        </Card>
      </main>
    </AuthBackgroundLayout>
  );
}
