import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNavigationState } from '@/hooks/useNavigationState';

import { Button, Input, Label, Card, CardContent, CardDescription, CardHeader, CardTitle, Field, PasswordInput, AuthCard } from '@/design-system/components';
import { icons } from '@/design-system/icons';
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
  const { setIsNavigating } = useNavigationState();
  const aplicar = useAplicarPortal();

  useEffect(() => {
    setIsNavigating(false);
  }, [setIsNavigating]);


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
    <AuthBackgroundLayout align="right">
      <PublicFlowModal className="public-auth-theme">
        <AuthCard className="!w-[calc(100%-24px)] min-[320px]:!w-[calc(100%-16px)]">
          <CardHeader className="text-center pb-2 pt-6 px-6 flex-shrink-0">
            <div className="flex justify-center mb-4">
              <img src={sbpmLogo} alt="SBPM" className="h-14 w-auto object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary leading-tight">Bem-vindo ao Portal da SBPM</CardTitle>
            <CardDescription className="text-muted-foreground font-medium text-[0.80rem] leading-snug">Use seu CPF ou matrícula e a senha criada no primeiro acesso.</CardDescription>
          </CardHeader>
          <CardContent className="px-6 pb-8 pt-2 overflow-y-auto flex-grow">
            <form onSubmit={submeter} className="space-y-5" aria-label="Formulário de acesso">
              <Field label="CPF ou matrícula" htmlFor="credential">
                <Input
                  id="credential"
                  inputMode="numeric"
                  enterKeyHint="next"
                  autoComplete="username"
                  placeholder="Digite seu CPF ou matrícula"
                  value={credential}
                  onChange={(e) => handleCredentialChange(e.target.value)}
                  maxLength={14}
                  disabled={loading}
                  onFocus={(e) => {
                    setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                  }}
                />
              </Field>

              <Field label="Senha" htmlFor="password">
                <PasswordInput
                  id="password"
                  enterKeyHint="done"
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                  onFocus={(e) => {
                    setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                  }}
                />
              </Field>

              <Button type="submit" className="w-full h-12" loading={loading}>
                Acessar
              </Button>

              <div className="flex items-center justify-between mt-2">
                <Link to="/recuperar-acesso" className="text-[14px] font-semibold text-[#166534] hover:underline underline-offset-4">
                  Esqueci minha senha
                </Link>
                <Link to="/primeiro-acesso" className="text-[14px] font-semibold text-[#166534] hover:underline underline-offset-4">
                  Primeiro acesso
                </Link>
              </div>

            </form>
          </CardContent>
        </AuthCard>
      </PublicFlowModal>
    </AuthBackgroundLayout>
  );
}
