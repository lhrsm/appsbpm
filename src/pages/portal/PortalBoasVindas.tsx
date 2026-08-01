import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ShieldCheck, UserPlus, LogIn, HelpCircle, BadgePlus, ChevronRight } from 'lucide-react';
import sbpmLogo from '@/assets/sbpm-logo.png';
import AuthBackgroundLayout from '@/components/AuthBackgroundLayout';

const CAMINHOS = [
  {
    to: '/primeiro-acesso',
    icone: UserPlus,
    titulo: 'Fazer primeiro acesso',
    descricao: 'Valide seus dados e crie seu acesso ao Portal da SBPM.',
    destaque: true,
  },
  {
    to: '/entrar',
    icone: LogIn,
    titulo: 'Já tenho acesso',
    descricao: 'Entre utilizando seu CPF ou matrícula e sua senha.',
    destaque: false,
  },
  {
    to: '/quero-me-associar',
    icone: BadgePlus,
    titulo: 'Quero me associar',
    descricao: 'Preencha um pré-cadastro para iniciar seu processo de associação à SBPM.',
    destaque: false,
  },
];

export default function PortalBoasVindas() {
  return (
    <AuthBackgroundLayout align="center">
      <main className="w-full max-w-xl">
        <Card className="auth-card auth-card--wide w-full border-0 animate-fade-in">
          <CardHeader className="text-center pb-2">
            <div className="flex justify-center mb-4">
              <img
                src={sbpmLogo}
                alt="SBPM - Sociedade Beneficente da Polícia Militar"
                className="h-24 w-auto object-contain"
              />
            </div>
            <CardTitle className="text-2xl font-bold text-primary">Bem-vindo ao Portal da SBPM</CardTitle>
            <CardDescription>
              Acesse seus dados, serviços e informações institucionais em um ambiente seguro.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3 pt-6">
            <nav aria-label="Como deseja continuar" className="grid gap-3 sm:grid-cols-1">
              {CAMINHOS.map(({ to, icone: Icone, titulo, descricao, destaque }) => (
                <Link
                  key={to}
                  to={to}
                  className={`portal-choice ${destaque ? 'portal-choice--primary' : ''}`}
                >
                  <span className="portal-choice__icon" aria-hidden="true">
                    <Icone className="h-5 w-5" />
                  </span>
                  <span className="portal-choice__body">
                    <span className="portal-choice__title">{titulo}</span>
                    <span className="portal-choice__desc">{descricao}</span>
                  </span>
                  <ChevronRight className="portal-choice__chevron h-5 w-5" aria-hidden="true" />
                </Link>
              ))}
            </nav>

            <Link to="/recuperar-acesso" className="portal-btn-tertiary w-full">
              <HelpCircle className="h-4 w-4" aria-hidden="true" /> Recuperar acesso
            </Link>

          </CardContent>
        </Card>

        <nav
          aria-label="Links institucionais"
          className="auth-links mt-6 flex flex-wrap items-center justify-center gap-2 text-xs"
        >
          <Link to="/privacidade" className="auth-link">Política de Privacidade</Link>
          <Link to="/acessibilidade" className="auth-link">Acessibilidade</Link>
        </nav>
      </main>
    </AuthBackgroundLayout>
  );
}
