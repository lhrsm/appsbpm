import { Link } from 'react-router-dom';

interface PrivacyConsentSummaryProps {
  onToggleDetails: () => void;
  showDetails: boolean;
}

export function PrivacyConsentSummary({ onToggleDetails, showDetails }: PrivacyConsentSummaryProps) {
  return (
    <div className="flex-1">
      <p id="cookie-consent-desc" className="text-[13px] sm:text-sm leading-[1.5] text-foreground/80 dark:text-foreground/90">
        Utilizamos armazenamento local estritamente necessário para manter sua sessão e preferências no Portal do Associado, em conformidade com a LGPD.
      </p>
      <div className="mt-2 flex items-center gap-3">
        <Link
          to="/privacidade"
          className="text-[12px] font-semibold text-primary hover:underline underline-offset-4"
        >
          Política de Privacidade
        </Link>
        <button
          onClick={onToggleDetails}
          className="text-[12px] font-semibold text-slate-500 dark:text-slate-400 hover:text-primary transition-colors"
        >
          {showDetails ? "Ver menos" : "Saiba mais"}
        </button>
      </div>
    </div>
  );
}
