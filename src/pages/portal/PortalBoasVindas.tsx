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
          className="auth-links mt-6 flex flex-wrap items-center justify-center gap-4 text-xs font-medium"
        >
          <Link to="/privacidade" className="text-slate-500 hover:text-primary transition-colors">Política de Privacidade</Link>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <Link to="/acessibilidade" className="text-slate-500 hover:text-primary transition-colors">Acessibilidade</Link>
        </nav>
      </main>
    </AuthBackgroundLayout>
  );
}

