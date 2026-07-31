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

export default function PortalRecuperarAcesso() {
  const [credential, setCredential] = useState('');
  const [loading, setLoading] = useState(false);
  const [enviado, setEnviado] = useState(false);

  const submeter = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await recuperarAcesso(credential.trim());
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
                    onChange={(e) => setCredential(e.target.value)}
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
