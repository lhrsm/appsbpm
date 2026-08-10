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
    icon: icons.entrar,
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
    <AuthCard className="!bg-white/94 !border-[rgba(22,138,73,0.42)]">
      <CardHeader className="text-center pb-2 pt-6 px-6 space-y-1">
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

      <CardContent className="px-6 pb-8 pt-4">
        <div className="grid gap-3 mb-6">
          {CAMINHOS.map(({ to, icon: Icon, titulo, descricao }) => (
            <button
              key={to}
              onClick={() => handleNavigation(to, `Carregando ${titulo.toLowerCase()}...`)}
              className="flex items-center gap-4 p-4 rounded-xl border border-[rgba(22,138,73,0.34)] bg-white/80 hover:bg-[rgba(240,253,244,0.97)] hover:border-[#168A49] transition-all text-left group shadow-sm active:scale-[0.98] w-full"
            >
              <div className="h-10 w-10 rounded-full bg-[rgba(22,138,73,0.1)] flex items-center justify-center shrink-0 group-hover:bg-[#168A49] group-hover:text-white transition-colors">
                <Icon className="h-5 w-5 text-[#168A49] group-hover:text-inherit" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-[#172033] text-[15px]">{titulo}</h3>
                <p className="text-[12px] text-[#64748B] truncate">{descricao}</p>
              </div>
              <icons.proximo className="h-4 w-4 text-[#64748B] group-hover:text-[#168A49] transition-colors shrink-0" />
            </button>
          ))}
        </div>

        <div className="flex justify-center">
          <button 
            onClick={() => handleNavigation('/recuperar-acesso', 'Abrindo a recuperação de acesso...')}
            className="flex items-center text-sm font-semibold text-[#166534] hover:underline underline-offset-4"
          >
            <icons.ajuda className="w-4 h-4 mr-2" /> Recuperar acesso
          </button>
        </div>
      </CardContent>
    </AuthCard>
  );
}
