import { useNavigate } from 'react-router-dom';
import AuthBackgroundLayout from '@/components/AuthBackgroundLayout';
import { PublicPortalWelcomeCard } from '@/components/portal/PublicPortalWelcomeCard';
import { PublicFlowModal } from '@/components/portal/PublicFlowModal';
import { Shield, Accessibility, Globe, Headset } from 'lucide-react';
import { useNavigationState } from '@/hooks/useNavigationState';
import { AuthCard } from '@/design-system/components';
import { useEffect } from 'react';
import { usePrefetchRoutes } from '@/hooks/usePrefetchRoutes';


export default function PortalBoasVindas() {
  const navigate = useNavigate();
  const { setIsNavigating } = useNavigationState();

  usePrefetchRoutes();

  useEffect(() => {
    // Garantir que o loader seja fechado ao montar esta página (ex: ao voltar)
    setIsNavigating(false);
  }, [setIsNavigating]);

  const handleInternalNav = (to: string, message: string) => {
    setIsNavigating(true, message);
    setTimeout(() => {
      navigate(to);
      setTimeout(() => setIsNavigating(false), 300);
    }, 100);
  };

  return (
    <AuthBackgroundLayout align="right">
      <PublicFlowModal>
        <div className="w-full flex flex-col items-center desktop-wrapper-content">
          <PublicPortalWelcomeCard />

          <nav
            aria-label="Links institucionais"
            className="mt-[12px] flex flex-wrap justify-center gap-[12px] w-full max-w-[480px] mx-auto pb-4 px-[4%] desktop-footer-links"
          >
            <button 
              onClick={() => handleInternalNav('/privacidade', 'Carregando política de privacidade...')}
              className="external-link-circle border-0 cursor-pointer"
              title="Privacidade"
            >
              <Shield className="h-5 w-5" />
            </button>
 
            <button 
              onClick={() => handleInternalNav('/acessibilidade', 'Carregando preferências de acessibilidade...')}
              className="external-link-circle border-0 cursor-pointer"
              title="Acessibilidade"
            >
              <Accessibility className="h-5 w-5" />
            </button>


            <a 
              href="https://www.sbpmbahia.com.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="external-link-circle"
              title="Site Oficial"
            >
              <Globe className="h-5 w-5" />
            </a>

            <a 
              href="https://www.sbpmbahia.com.br/contato" 
              target="_blank" 
              rel="noopener noreferrer"
              className="external-link-circle"
              title="Atendimento"
            >
              <Headset className="h-5 w-5" />
            </a>
          </nav>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          .external-link-circle {
            background: rgba(255, 255, 255, 0.94);
            border: 1.5px solid rgba(22, 163, 74, 0.42);
            border-radius: 50%;
            color: #16a34a;
            box-shadow: 0 4px 12px rgba(15, 23, 42, 0.06);
            width: 44px;
            height: 44px;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
          }
          .external-link-circle:active {
            transform: scale(0.92);
            background: rgba(255, 255, 255, 1);
            border-color: #16a34a;
          }
          @media (min-width: 1280px) {
            .desktop-wrapper-content {
              display: flex !important;
              flex-direction: column !important;
              align-items: center !important;
              width: fit-content !important;
              gap: 0 !important;
            }
            .desktop-footer-links {
              display: flex !important;
              flex-direction: row !important;
              flex-wrap: nowrap !important;
              width: fit-content !important;
              max-width: none !important;
              gap: 20px !important;
              margin-top: 32px !important;
              padding: 0 !important;
              justify-content: center !important;
              align-items: center !important;
            }
            .external-link-circle {
              width: 52px !important;
              height: 52px !important;
            }
            .external-link-circle:hover {
              transform: translateY(-2px);
              background: #ffffff;
              border-color: #16a34a;
              color: #15803d;
              box-shadow: 0 6px 20px rgba(15, 23, 42, 0.1);
            }
          }

          @media (max-width: 339px) {
            nav[aria-label="Links institucionais"] {
              grid-template-columns: 1fr;
              width: calc(100% - 20px);
              max-width: 340px;
            }
          }
        `}} />
      </PublicFlowModal>
    </AuthBackgroundLayout>
  );
}
