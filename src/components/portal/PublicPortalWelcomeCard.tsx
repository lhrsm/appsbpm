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
        <CardDescription className="text-slate-600 dark:text-slate-300 font-medium">
          Acesse seus dados, serviços e informações institucionais em um ambiente seguro.
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-3 pt-6">
        <nav aria-label="Como deseja continuar" className="grid gap-3 sm:grid-cols-1">
          {CAMINHOS.map(({ to, icone: Icone, titulo, descricao, destaque }) => (
            <Link
              key={to}
              to={to}
              className={cn(
                "portal-choice flex items-center gap-4 p-4 rounded-xl border border-slate-100 dark:border-slate-800 transition-all active:scale-[0.98]",
                destaque && "border-primary/20 bg-primary/5"
              )}
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary" aria-hidden="true">
                <Icone className="h-5 w-5" />
              </span>
              <span className="flex-1 text-left">
                <span className="block text-sm font-bold text-foreground">{titulo}</span>
                <span className="block text-xs text-slate-500 dark:text-slate-400 leading-normal">{descricao}</span>
              </span>
              <ChevronRight className="h-5 w-5 text-slate-300 dark:text-slate-600" aria-hidden="true" />
            </Link>
          ))}
        </nav>

        <Link 
          to="/recuperar-acesso" 
          className="flex items-center justify-center gap-2 py-3 text-sm font-semibold text-slate-500 hover:text-primary transition-colors mt-2"
        >
          <HelpCircle className="h-4 w-4" aria-hidden="true" /> Recuperar acesso
        </Link>
      </CardContent>
    </Card>
  );
}
