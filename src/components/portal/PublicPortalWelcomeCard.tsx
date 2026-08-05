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
    descricao: 'Preencha um pré-cadastro para iniciar seu processo.',
    destaque: false,
  },
];

export function PublicPortalWelcomeCard() {
  return (
    <Card className="auth-card border-0 animate-fade-in shadow-none overflow-hidden">
      <CardHeader className="text-center pb-2 pt-2 px-4 space-y-1">
        <div className="flex justify-center mb-1">
          <img
            src={sbpmLogo}
            alt="SBPM - Sociedade Beneficente da Polícia Militar"
            className="h-[62px] w-auto object-contain"
          />
        </div>
        <CardTitle className="text-2xl font-bold text-primary leading-tight clamp-title">Bem-vindo ao Portal da SBPM</CardTitle>
        <CardDescription className="text-[var(--public-description-light)] font-medium text-[0.88rem] leading-relaxed">
          Acesse seus dados e serviços em um ambiente seguro.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-4">
        <nav aria-label="Como deseja continuar" className="flex flex-col gap-3">
          {CAMINHOS.map(({ to, icone: Icone, titulo, descricao }) => (
            <Link
              key={to}
              to={to}
              className="portal-choice"
            >
              <span className="portal-icon-circle-green h-[42px] w-[42px] shrink-0" aria-hidden="true">
                <Icone className="h-5 w-5" />
              </span>
              <span className="flex-1 text-left min-w-0">
                <span className="block portal-title text-[0.94rem] leading-[1.25] break-anywhere">{titulo}</span>
                <span className="block portal-description text-[0.82rem] leading-[1.45] font-medium break-anywhere">{descricao}</span>
              </span>
              <ChevronRight className="portal-chevron h-5 w-5 shrink-0" aria-hidden="true" />
            </Link>
          ))}
        </nav>

        <div className="mt-4 flex justify-center">
          <Link 
            to="/recuperar-acesso" 
            className="inline-flex items-center justify-center gap-2 px-[14px] min-h-[40px] text-sm font-semibold text-[var(--public-link-light)] bg-white/52 border border-green-600/22 rounded-full transition-all hover:bg-white/80 active:scale-95 shadow-sm"
          >
            <HelpCircle className="h-4 w-4 text-green-700" aria-hidden="true" /> Recuperar acesso
          </Link>
        </div>
      </CardContent>

      <style dangerouslySetInnerHTML={{ __html: `
        .clamp-title {
          font-size: clamp(1.45rem, 6vw, 1.8rem) !important;
        }
        .break-anywhere {
          overflow-wrap: break-word;
          min-width: 0;
        }
      `}} />
    </Card>
  );
}
