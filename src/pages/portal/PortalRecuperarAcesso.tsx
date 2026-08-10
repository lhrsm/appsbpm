import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNavigationState } from '@/hooks/useNavigationState';

import { Button, Input, Label, Card, CardContent, CardDescription, CardHeader, CardTitle, Field, Alert, AuthCard } from '@/design-system/components';
import { icons } from '@/design-system/icons';
import { Loader2, MailCheck, ArrowLeft } from 'lucide-react';
import sbpmLogo from '@/assets/sbpm-logo.png';
import AuthBackgroundLayout from '@/components/AuthBackgroundLayout';
import { recuperarAcesso } from '@/lib/portalAcesso';
import { padCpf, padRegistrationNumber, formatCpf, formatRegistrationNumber } from '@/lib/identity';
import { PublicFlowModal } from '@/components/portal/PublicFlowModal';

export default function PortalRecuperarAcesso() {
  const [credential, setCredential] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const navigate = useNavigate();
  const { setIsNavigating } = useNavigationState();

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
    setLoading(true);
    const clean = credential.replace(/\D/g, '');
    const normalized = clean.length > 9 ? padCpf(clean) : padRegistrationNumber(clean);
    await recuperarAcesso(normalized || "");
    setLoading(false);
    setEnviado(true);
  };

  return (
    <AuthBackgroundLayout align="right">
      <PublicFlowModal>
        <AuthCard>
          <CardHeader className="text-center pb-2 pt-6 space-y-1 px-6 flex-shrink-0">
            <div className="flex justify-center mb-3">
              <img src={sbpmLogo} alt="SBPM" className="h-14 w-auto object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary leading-tight">Bem-vindo ao Portal da SBPM</CardTitle>
            <CardDescription className="text-muted-foreground font-medium text-[0.80rem] leading-snug">Recuperar acesso • Informe seus dados para as instruções.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 px-6 pb-6 pt-2 overflow-y-auto flex-grow">
            {enviado ? (
              <div className="space-y-4">
                <Alert tone="info" icon={MailCheck} title="E-mail enviado">
                  Se existir uma conta vinculada aos dados informados, enviaremos as instruções para o e-mail
                  cadastrado. Verifique também a caixa de spam.
                </Alert>
                <Button className="w-full h-12" onClick={() => navigate('/entrar')}>
                  Voltar para o login
                </Button>
              </div>
            ) : (
              <form onSubmit={submeter} className="space-y-4">
                <Field label="CPF ou matrícula" htmlFor="credential">
                    <Input
                     id="credential"
                     inputMode="numeric"
                     enterKeyHint="done"
                     placeholder="CPF ou matrícula"
                     value={credential}
                     onChange={(e) => handleCredentialChange(e.target.value)}
                     maxLength={14}
                     onFocus={(e) => {
                       setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                     }}
                   />
                </Field>
                <Button type="submit" className="w-full h-12" loading={loading} disabled={!credential.trim()}>
                  Enviar instruções
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-full h-11"
                  onClick={() => navigate('/entrar')}
                  leftIcon={ArrowLeft}
                >
                  Voltar
                </Button>
              </form>
            )}
          </CardContent>
        </AuthCard>
      </PublicFlowModal>
    </AuthBackgroundLayout>
  );
}
