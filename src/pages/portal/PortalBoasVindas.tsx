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
          className="mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-bold"
        >
          <div className="bg-white/36 backdrop-blur-[5px] rounded-full px-3 py-1.5 flex items-center gap-4">
            <Link to="/privacidade" className="text-[#1f4f3a] dark:text-green-300 hover:text-[#14532d] dark:hover:text-white transition-colors hover:underline">Política de Privacidade</Link>
            <span className="text-slate-900/48 dark:text-white/40">•</span>
            <Link to="/acessibilidade" className="text-[#1f4f3a] dark:text-green-300 hover:text-[#14532d] dark:hover:text-white transition-colors hover:underline">Acessibilidade</Link>
          </div>
        </nav>
      </main>
    </AuthBackgroundLayout>
  );
}

