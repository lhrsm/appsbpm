import { Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserPlus, LogIn, HelpCircle, BadgePlus, ChevronRight } from 'lucide-react';
import sbpmLogo from '@/assets/sbpm-logo.png';
import { cn } from '@/lib/utils';

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

export function PublicPortalWelcomeCard() {
  return (
    <Card className="auth-card w-full border-0 animate-fade-in">
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-4">
          <img
            src={sbpmLogo}
            alt="SBPM - Sociedade Beneficente da Polícia Militar"
            className="h-24 w-auto object-contain"
          />
        </div>
        <CardTitle className="text-2xl font-bold text-primary">Bem-vindo ao Portal da SBPM</CardTitle>
        <CardDescription className="text-slate-600 dark:text-slate-300 font-medium">
          Acesse seus dados, serviços e informações institucionais em um ambiente seguro.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 pt-6">
        <nav aria-label="Como deseja continuar" className="grid gap-3 sm:grid-cols-1">
          {CAMINHOS.map(({ to, icone: Icone, titulo, descricao }) => (
            <Link
              key={to}
              to={to}
              className="portal-choice"
            >
              <span className="portal-icon-circle-green h-10 w-10 shrink-0" aria-hidden="true">
                <Icone className="h-5 w-5" />
              </span>
              <span className="flex-1 text-left">
                <span className="block portal-title text-sm">{titulo}</span>
                <span className="block portal-description text-xs leading-normal">{descricao}</span>
              </span>
              <ChevronRight className="portal-chevron h-5 w-5" aria-hidden="true" />
            </Link>
          ))}
        </nav>

        <Link 
          to="/recuperar-acesso" 
          className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-[var(--public-link-light)] dark:text-green-300 hover:text-green-900 dark:hover:text-white transition-colors mt-2 hover:underline"
        >
          <HelpCircle className="h-4 w-4 text-green-700 dark:text-green-400" aria-hidden="true" /> Recuperar acesso
        </Link>
      </CardContent>
    </Card>
  );
}
