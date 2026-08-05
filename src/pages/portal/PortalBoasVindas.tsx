import { Link } from 'react-router-dom';
import AuthBackgroundLayout from '@/components/AuthBackgroundLayout';
import { PublicPortalWelcomeCard } from '@/components/portal/PublicPortalWelcomeCard';
import { PublicFlowModal } from '@/components/portal/PublicFlowModal';
import { Shield, Accessibility, Globe, Headset } from 'lucide-react';

export default function PortalBoasVindas() {
  return (
    <AuthBackgroundLayout align="right">
      <PublicFlowModal>
        <div className="w-full flex flex-col items-center">
          <PublicPortalWelcomeCard />

          <nav
            aria-label="Links institucionais"
            className="mt-[14px] grid grid-cols-2 gap-[10px] w-full max-w-[388px] mx-auto pb-8 px-[4%] sm:grid-cols-2 xs:grid-cols-1 desktop-footer-links"
          >
            <Link 
              to="/privacidade" 
              className="external-link-card"
            >
              <Shield className="h-4 w-4 text-[#16a34a] shrink-0" />
              <span>Privacidade</span>
            </Link>

            <Link 
              to="/acessibilidade" 
              className="external-link-card"
            >
              <Accessibility className="h-4 w-4 text-[#16a34a] shrink-0" />
              <span>Acessibilidade</span>
            </Link>

            <a 
              href="https://www.sbpmbahia.com.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="external-link-card"
            >
              <Globe className="h-4 w-4 text-[#16a34a] shrink-0" />
              <span>Site Oficial</span>
            </a>

            <a 
              href="https://www.sbpmbahia.com.br/contato" 
              target="_blank" 
              rel="noopener noreferrer"
              className="external-link-card"
            >
              <Headset className="h-4 w-4 text-[#16a34a] shrink-0" />
              <span>Atendimento</span>
            </a>
          </nav>
        </div>

        <style dangerouslySetInnerHTML={{ __html: `
          .external-link-card {
            background: rgba(255, 255, 255, 0.94);
            border: 1.25px solid rgba(22, 163, 74, 0.42);
            border-radius: 14px;
            color: #166534;
            box-shadow: 0 6px 16px rgba(15, 23, 42, 0.07);
            min-height: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
            padding: 10px 12px;
            font-weight: 600;
            font-size: 0.82rem;
            gap: 8px;
            transition: all 0.2s ease;
          }
          .external-link-card:active {
            transform: scale(0.96);
            background: rgba(255, 255, 255, 1);
          }
          @media (min-width: 1280px) {
            .desktop-footer-links {
              width: calc(100% - 48px) !important;
              max-width: 520px !important;
              gap: 16px 20px !important;
              margin-top: 20px !important;
              margin-inline: auto !important;
              padding-bottom: 24px !important;
            }
            .external-link-card {
              min-height: 48px !important;
              padding: 12px 16px !important;
              font-size: 0.9rem !important;
              border-radius: 18px !important;
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
