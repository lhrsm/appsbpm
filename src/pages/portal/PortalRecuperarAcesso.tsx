import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNavigationState } from '@/hooks/useNavigationState';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
        <Card className="auth-card border-0 animate-fade-in shadow-none overflow-hidden">
          <CardHeader className="text-center pb-2 pt-6 space-y-1">
            <div className="flex justify-center mb-3">
              <img src={sbpmLogo} alt="SBPM" className="h-14 w-auto object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary leading-tight">Bem-vindo ao Portal da SBPM</CardTitle>
            <CardDescription className="text-[var(--public-description-light)] font-medium text-[0.80rem] leading-snug px-2">Recuperar acesso • Informe seus dados para as instruções.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {enviado ? (
              <div className="space-y-4 text-center">
                <MailCheck className="mx-auto h-12 w-12 text-primary" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">
                  Se existir uma conta vinculada aos dados informados, enviaremos as instruções para o e-mail
                  cadastrado. Verifique também a caixa de spam.
                </p>
                <button type="button" className="portal-btn-primary w-full h-12 rounded-xl" onClick={() => navigate('/entrar')}>
                  Voltar para o login
                </button>
              </div>
            ) : (
              <form onSubmit={submeter} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="credential">CPF ou matrícula</Label>
                    <Input
                     id="credential"
                     inputMode="numeric"
                     enterKeyHint="done"
                     placeholder="CPF ou matrícula"
                     value={credential}
                     onChange={(e) => handleCredentialChange(e.target.value)}
                     maxLength={14}
                     className="h-11 rounded-xl bg-white border-primary/30 focus-visible:ring-primary"
                     onFocus={(e) => {
                       setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                     }}
                   />
                </div>
                <button type="submit" className="portal-btn-primary w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20" disabled={loading || !credential.trim()}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : 'Enviar instruções'}
                </button>
                <button
                  type="button"
                  className="portal-btn-secondary w-full h-11 rounded-xl text-sm font-semibold flex items-center justify-center"
                  onClick={() => navigate('/entrar')}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" /> Voltar
                </button>
              </form>
            )}
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
