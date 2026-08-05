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
      <CardHeader className="text-center pb-2 pt-2 px-4 space-y-1 desktop-header-respiro">
        <div className="flex justify-center mb-1">
          <img
            src={sbpmLogo}
            alt="SBPM - Sociedade Beneficente da Polícia Militar"
            className="h-[62px] w-auto object-contain"
          />
        </div>
        <CardTitle className="text-2xl font-bold text-primary leading-tight clamp-title">Bem-vindo ao Portal da SBPM</CardTitle>
        <CardDescription className="text-[var(--public-description-light)] font-medium text-[0.80rem] leading-snug">
          Acesse seus dados e serviços em um ambiente seguro.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-4 pb-4 pt-4">
        <nav aria-label="Como deseja continuar" className="portal-choice-container">
          {CAMINHOS.map(({ to, icone: Icone, titulo, descricao }) => (
            <Link
              key={to}
              to={to}
              className="portal-choice"
            >
              <span className="portal-icon-green shrink-0" aria-hidden="true">
                <Icone className="h-[22px] w-[22px]" />
              </span>
              <span className="flex-1 text-left min-w-0">
                <span className="block portal-title">{titulo}</span>
                <span className="block portal-description">{descricao}</span>

              </span>
              <ChevronRight className="portal-chevron shrink-0" aria-hidden="true" />
            </Link>
          ))}
        </nav>

        <div className="flex justify-center">
          <Link 
            to="/recuperar-acesso" 
            className="portal-recovery-button"
          >
            <HelpCircle aria-hidden="true" /> Recuperar acesso
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
        @media (min-width: 1200px) {
          .desktop-header-respiro {
            padding-top: 8px !important;
            padding-bottom: 12px !important;
          }
          .desktop-header-respiro h3 {
            margin-top: 12px !important;
            margin-bottom: 6px !important;
          }
          .desktop-header-respiro p {
            margin-bottom: 12px !important;
          }
        }
      `}} />

    </Card>
  );
}
