import { useNavigate } from 'react-router-dom';
import { CardHeader, CardTitle, CardDescription, CardContent, AuthCard } from '@/design-system/components';
import { icons } from '@/design-system/icons';
import sbpmLogo from '@/assets/sbpm-logo.png';
import { useNavigationState } from '@/hooks/useNavigationState';

const CAMINHOS = [
  {
    to: '/primeiro-acesso',
    icon: icons.perfil,
    titulo: 'Fazer primeiro acesso',
    descricao: 'Valide seus dados e crie seu acesso ao Portal da SBPM.',
  },
  {
    to: '/entrar',
    icon: icons.senha,
    titulo: 'Já tenho acesso',
    descricao: 'Entre utilizando seu CPF ou matrícula e sua senha.',
  },
  {
    to: '/quero-me-associar',
    icon: icons.adicionar,
    titulo: 'Quero me associar',
    descricao: 'Preencha um pré-cadastro para iniciar seu processo.',
  },

];

export function PublicPortalWelcomeCard() {
  const navigate = useNavigate();
  const { setIsNavigating } = useNavigationState();

  const handleNavigation = (to: string, message: string) => {
    setIsNavigating(true, message);
    setTimeout(() => {
      navigate(to);
      setTimeout(() => setIsNavigating(false), 300);
    }, 100);
  };

  return (
    <AuthCard className="!bg-white/94 !border-[rgba(22,138,73,0.42)] !w-full max-w-[480px]">
      <CardHeader className="text-center pb-2 pt-6 px-5 space-y-1">
        <div className="flex justify-center mb-4">
          <img
            src={sbpmLogo}
            alt="SBPM"
            className="h-16 w-auto object-contain"
          />
        </div>
        <CardTitle className="text-2xl font-bold text-[#172033] leading-tight">Portal do Associado</CardTitle>
        <CardDescription className="text-[#64748B] font-medium text-[0.9rem]">
          Selecione uma das opções abaixo para acessar os serviços da SBPM.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-5 pb-8 pt-4">
        <div className="grid gap-3 mb-6 portal-choice-container">
          {CAMINHOS.map(({ to, icon: Icon, titulo, descricao }) => (
            <button
              key={to}
              onClick={() => handleNavigation(to, `Carregando ${titulo.toLowerCase()}...`)}
              className="portal-choice group w-full"
            >
              <div className="portal-icon-green shrink-0 group-hover:bg-[#168A49] group-hover:text-white transition-colors rounded-full h-10 w-10 flex items-center justify-center bg-[rgba(22,138,73,0.1)]">
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="portal-title">{titulo}</h3>
                <p className="portal-description">{descricao}</p>
              </div>
              <icons.proximo className="portal-chevron shrink-0 text-[#64748B] group-hover:text-[#168A49] transition-colors" />
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <button 
            onClick={() => handleNavigation('/recuperar-acesso', 'Abrindo a recuperação de acesso...')}
            className="portal-recovery-button"
          >
            <icons.ajuda className="w-4 h-4" /> Recuperar acesso
          </button>
        </div>
      </CardContent>
    </AuthCard>
  );
}
