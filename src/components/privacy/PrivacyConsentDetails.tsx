import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export function PrivacyConsentDetails() {
  return (
    <div className="mt-3 py-3 border-t border-slate-100 dark:border-slate-800 animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="text-[12px] sm:text-[13px] leading-relaxed text-foreground/70 dark:text-foreground/80 space-y-3 max-h-[200px] overflow-y-auto pr-2 no-scrollbar">
        <p>
          Este portal utiliza tecnologias de armazenamento local para garantir o funcionamento técnico 
          do sistema de autenticação e as preferências de acessibilidade definidas pelo usuário.
        </p>
        <p>
          Os dados coletados são processados de acordo com a Lei Geral de Proteção de Dados (LGPD) 
          e não são compartilhados com terceiros para fins publicitários.
        </p>
        <p>
          Para mais informações sobre como tratamos seus dados pessoais, consulte nossa{' '}
          <Link to="/privacidade" className="text-primary font-medium hover:underline inline-flex items-center gap-0.5">
            Política de Privacidade completa <ExternalLink className="h-3 w-3" />
          </Link>.
        </p>
      </div>
    </div>
  );
}
