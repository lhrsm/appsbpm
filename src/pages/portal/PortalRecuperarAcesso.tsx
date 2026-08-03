import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, MailCheck, ArrowLeft } from 'lucide-react';
import sbpmLogo from '@/assets/sbpm-logo.png';
import AuthBackgroundLayout from '@/components/AuthBackgroundLayout';
import { recuperarAcesso } from '@/lib/portalAcesso';
import { padCpf, padRegistrationNumber } from '@/lib/identity';

export default function PortalRecuperarAcesso() {
  const [credential, setCredential] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const handleCredentialChange = (v: string) => {
    const clean = v.replace(/\D/g, '');
    if (clean.length <= 9) {
      // Padrão Matrícula: 00000000-0
      if (clean.length <= 8) setCredential(clean);
      else setCredential(clean.replace(/^(\d{8})(\d{0,1})/, '$1-$2'));
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
    setLoading(true);
    const clean = credential.replace(/\D/g, '');
    const normalized = clean.length > 9 ? padCpf(clean) : padRegistrationNumber(clean);
    await recuperarAcesso(normalized || "");
    setLoading(false);
    setEnviado(true);
  };

  return (
    <AuthBackgroundLayout align="center">
      <main className="w-full max-w-md">
        <Card className="auth-card w-full border-0 animate-fade-in">
          <CardHeader className="pb-2 text-center">
            <div className="flex justify-center mb-3">
              <img src={sbpmLogo} alt="SBPM" className="h-20 w-auto object-contain" />
            </div>
            <CardTitle className="text-xl font-bold text-primary">Recuperar acesso</CardTitle>
            <CardDescription>Informe seu CPF ou matrícula para receber as instruções por e-mail.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {enviado ? (
              <div className="space-y-4 text-center">
                <MailCheck className="mx-auto h-12 w-12 text-primary" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">
                  Se existir uma conta vinculada aos dados informados, enviaremos as instruções para o e-mail
                  cadastrado. Verifique também a caixa de spam.
                </p>
                <Button asChild className="w-full">
                  <Link to="/entrar">Voltar para o login</Link>
                </Button>
              </div>
            ) : (
              <form onSubmit={submeter} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="credential">CPF ou matrícula</Label>
                  <Input
                    id="credential"
                    inputMode="numeric"
                    value={credential}
                    onChange={(e) => handleCredentialChange(e.target.value)}
                    maxLength={14}
                    className="h-11"
                  />
                </div>
                <Button type="submit" className="w-full h-11" disabled={loading || !credential.trim()}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Enviar instruções'}
                </Button>
                <Button asChild variant="ghost" className="w-full">
                  <Link to="/entrar">
                    <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" /> Voltar
                  </Link>
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </main>
    </AuthBackgroundLayout>
  );
}
