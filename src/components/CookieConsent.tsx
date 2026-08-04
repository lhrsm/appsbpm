import { useEffect, useState, useRef } from 'react';
import { Cookie, Shield, X, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import { PrivacyConsentActions } from './privacy/PrivacyConsentActions';
import { PrivacyConsentSummary } from './privacy/PrivacyConsentSummary';
import { PrivacyConsentDetails } from './privacy/PrivacyConsentDetails';

const STORAGE_KEY = 'sbpm.cookie-consent.v1';
const CONSENT_VERSION = '1.0';

type ConsentState = 'hidden' | 'collapsed' | 'expanded' | 'details' | 'saving';

export default function CookieConsent() {
  const [state, setState] = useState<ConsentState>('hidden');
  const [isClosing, setIsClosing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (!saved) {
        const timer = setTimeout(() => setState('collapsed'), 800);
        return () => clearTimeout(timer);
      }
    } catch {
      setState('collapsed');
    }
  }, []);

  useEffect(() => {
    if (state !== 'hidden' && state !== 'collapsed') {
      document.body.setAttribute('data-lgpd-open', 'true');
      if (containerRef.current) {
        const height = containerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--lgpd-sheet-height', `${height}px`);
      }
    } else {
      document.body.removeAttribute('data-lgpd-open');
    }
  }, [state]);

  const decide = async (value: 'accepted' | 'essential') => {
    setState('saving');
    
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ value, at: new Date().toISOString(), versao: CONSENT_VERSION })
      );
    } catch {}

    try {
      const associadoId = (() => {
        try {
          const raw = localStorage.getItem('sbpm.associado');
          return raw ? JSON.parse(raw)?.id ?? null : null;
        } catch { return null; }
      })();
      await supabase.from('consentimentos').insert({
        associado_id: associadoId,
        tipo: 'cookies',
        versao: CONSENT_VERSION,
        aceito: value === 'accepted',
        user_agent: navigator.userAgent.slice(0, 500),
      });
    } catch {}

    setIsClosing(true);
    setTimeout(() => {
      setState('hidden');
      setIsClosing(false);
    }, 300);
  };

  if (state === 'hidden') return null;

  if (state === 'collapsed') {
    return (
      <button
        onClick={() => setState('expanded')}
        className={cn(
          "fixed right-4 z-[1000] flex items-center gap-2 h-12 px-4 rounded-full",
          "bottom-[calc(16px+env(safe-area-inset-bottom))] sm:bottom-6",
          "bg-white/90 dark:bg-slate-800/90 backdrop-blur-md border border-white/50 dark:border-white/10 shadow-lg",
          "text-primary hover:scale-105 transition-all duration-300 group active:scale-95",
          "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4"
        )}
        aria-label="Abrir preferências de privacidade"
        title="Privacidade"
      >
        <Shield className="h-5 w-5" />
        <span className="text-xs font-bold hidden sm:inline">Privacidade</span>
      </button>
    );
  }

  return (
    <>
      <div 
        className={cn(
          "fixed inset-0 z-[999] transition-opacity duration-300 pointer-events-none",
          "bg-[var(--lgpd-overlay-light)] dark:bg-[var(--lgpd-overlay-dark)]",
          isClosing ? "opacity-0" : "opacity-100"
        )}
        aria-hidden="true"
      />

      <div
        ref={containerRef}
        role="dialog"
        aria-modal="false"
        aria-labelledby="cookie-consent-title"
        className={cn(
          "fixed left-1/2 z-[1000] -translate-x-1/2",
          "bottom-[calc(76px+env(safe-area-inset-bottom))] sm:bottom-24 sm:left-auto sm:right-6 sm:translate-x-0",
          "w-[calc(100%-24px)] max-w-[var(--lgpd-max-width)]",
          "max-h-[var(--lgpd-mobile-max-height)] sm:max-h-[80vh]",
          "overflow-y-auto overscroll-behavior-contain no-scrollbar",
          "rounded-[var(--lgpd-radius)] border",
          "bg-[var(--lgpd-sheet-bg-light)] dark:bg-[var(--lgpd-sheet-bg-dark)]",
          "backdrop-blur-[var(--lgpd-blur)] -webkit-backdrop-filter: blur(var(--lgpd-blur))",
          "border-white/65 dark:border-white/10",
          "shadow-[var(--lgpd-shadow-light)] dark:shadow-[var(--lgpd-shadow-dark)]",
          "transition-all duration-300 ease-in-out",
          "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-8",
          isClosing && "opacity-0 translate-y-8 pointer-events-none"
        )}
      >
        <div className="p-[18px] sm:p-5 flex flex-col gap-3">
          <div className="flex items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2.5">
            <div className="flex items-center gap-2.5 text-primary">
              <Shield className="h-5 w-5" />
              <h2 id="cookie-consent-title" className="text-sm font-bold text-foreground">
                Sua privacidade importa
              </h2>
            </div>
            <div className="flex items-center gap-1">
              <button 
                onClick={() => setState('collapsed')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
                aria-label="Recolher"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
              <button 
                onClick={() => setState('collapsed')}
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors text-slate-400"
                aria-label="Fechar"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
          
          <PrivacyConsentSummary 
            onToggleDetails={() => setState(state === 'details' ? 'expanded' : 'details')}
            showDetails={state === 'details'}
          />

          {state === 'details' && <PrivacyConsentDetails />}

          <PrivacyConsentActions 
            onAccept={() => decide('accepted')}
            onEssential={() => decide('essential')}
            isSaving={state === 'saving'}
          />
        </div>
      </div>
    </>
  );
}
