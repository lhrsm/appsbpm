import { Link } from 'react-router-dom';
import AuthBackgroundLayout from '@/components/AuthBackgroundLayout';
import { PublicPortalWelcomeCard } from '@/components/portal/PublicPortalWelcomeCard';

export default function PortalBoasVindas() {
  return (
    <AuthBackgroundLayout align="center">
      <main className="w-full max-w-xl">
        <PublicPortalWelcomeCard />

        <nav
          aria-label="Links institucionais"
          className="mt-8 flex flex-col items-center gap-6"
        >
          <div className="flex flex-wrap items-center justify-center gap-4 text-[13px] font-bold">
            <div className="bg-white/42 backdrop-blur-[6px] rounded-full px-4 py-2 flex items-center gap-4 border border-green-600/10 shadow-sm">
              <Link to="/privacidade" className="text-green-900 dark:text-green-300 hover:text-green-700 dark:hover:text-white transition-colors hover:underline underline-offset-4">Política de Privacidade</Link>
              <span className="text-slate-900/48 dark:text-white/40">•</span>
              <Link to="/acessibilidade" className="text-green-900 dark:text-green-300 hover:text-green-700 dark:hover:text-white transition-colors hover:underline underline-offset-4">Acessibilidade</Link>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pb-4">
            <a 
              href="https://www.sbpmbahia.com.br" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[13px] font-bold text-green-900 dark:text-green-300 hover:text-green-700 dark:hover:text-white transition-colors flex items-center gap-2 group bg-white/42 backdrop-blur-[6px] px-4 py-2 rounded-full border border-green-600/10 shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-600/60 group-hover:bg-green-600 transition-colors" />
              Site Institucional
            </a>
            <a 
              href="https://www.sbpmbahia.com.br/contato" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-[13px] font-bold text-green-900 dark:text-green-300 hover:text-green-700 dark:hover:text-white transition-colors flex items-center gap-2 group bg-white/42 backdrop-blur-[6px] px-4 py-2 rounded-full border border-green-600/10 shadow-sm"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-green-600/60 group-hover:bg-green-600 transition-colors" />
              Central de Atendimento
            </a>
          </div>
        </nav>
      </main>
    </AuthBackgroundLayout>
  );
}

