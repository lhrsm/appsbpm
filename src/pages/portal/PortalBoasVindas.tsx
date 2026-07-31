import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, UserPlus, LogIn, HelpCircle } from 'lucide-react';
import sbpmLogo from '@/assets/sbpm-logo.png';
import AuthBackgroundLayout from '@/components/AuthBackgroundLayout';

export default function PortalBoasVindas() {
  return (
    <AuthBackgroundLayout align="center">
      <main className="w-full max-w-md">
        <Card className="auth-card w-full border-0 animate-fade-in">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <img src={sbpmLogo} alt="SBPM - Sociedade Beneficente da Polícia Militar" className="h-28 w-auto object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">Portal do Associado</CardTitle>
            <CardDescription>
              Acesso exclusivo para associados e dependentes da SBPM. Seus dados cadastrais são consultados diretamente
              na base institucional.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button asChild className="w-full h-12 text-base font-semibold">
              <Link to="/entrar">
                <LogIn className="mr-2 h-5 w-5" aria-hidden="true" /> Já tenho acesso
              </Link>
            </Button>
            <Button asChild variant="outline" className="w-full h-12 text-base font-semibold">
              <Link to="/primeiro-acesso">
                <UserPlus className="mr-2 h-5 w-5" aria-hidden="true" /> Primeiro acesso
              </Link>
            </Button>
            <Button asChild variant="ghost" className="w-full">
              <Link to="/recuperar-acesso">
                <HelpCircle className="mr-2 h-4 w-4" aria-hidden="true" /> Recuperar acesso
              </Link>
            </Button>

            <p className="flex items-start gap-2 rounded-md border bg-muted/30 p-3 text-xs text-muted-foreground">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              O portal não cria cadastros novos: apenas confirma sua identidade junto à base da SBPM e libera a consulta
              dos seus dados, conforme a LGPD.
            </p>
          </CardContent>
        </Card>

        <nav aria-label="Links institucionais" className="auth-links mt-6 flex flex-wrap items-center justify-center gap-2 text-xs">
          <Link to="/privacidade" className="auth-link">Política de Privacidade</Link>
          <Link to="/acessibilidade" className="auth-link">Acessibilidade</Link>
        </nav>
      </main>
    </AuthBackgroundLayout>
  );
}
