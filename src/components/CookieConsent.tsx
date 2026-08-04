import { useEffect, useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Cookie, ExternalLink } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

const STORAGE_KEY = 'sbpm.cookie-consent.v1';
const CONSENT_VERSION = '1.0';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) {
        // Delay slight to ensure background and other elements are rendered
        const timer = setTimeout(() => setVisible(true), 600);
        return () => clearTimeout(timer);
      }
    } catch {
      setVisible(true);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      document.body.setAttribute('data-lgpd-open', 'true');
      // Set the property for accessibility button repositioning if needed
      if (containerRef.current) {
        const height = containerRef.current.offsetHeight;
        document.documentElement.style.setProperty('--lgpd-sheet-height', `${height}px`);
      }
    } else {
      document.body.removeAttribute('data-lgpd-open');
    }
  }, [visible]);

  const decide = async (value: 'accepted' | 'essential') => {
    setIsClosing(true);
    
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ value, at: new Date().toISOString(), versao: CONSENT_VERSION })
      );
    } catch {}

    // Registro no banco
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

    // Animation duration match
    setTimeout(() => {
      setVisible(false);
      setIsClosing(false);
    }, 240);
  };

  if (!visible) return null;

  return (
    <>
      {/* Discreet Overlay */}
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
        aria-modal="true"
        aria-labelledby="cookie-consent-title"
        aria-describedby="cookie-consent-desc"
        className={cn(
          "fixed left-1/2 z-[1000] -translate-x-1/2",
          "bottom-[calc(12px+env(safe-area-inset-bottom))] sm:bottom-6",
          "w-[calc(100%-24px)] max-w-[var(--lgpd-max-width)]",
          "max-h-[var(--lgpd-mobile-max-height)] sm:max-h-[80vh]",
          "overflow-y-auto overscroll-behavior-contain",
          "rounded-[var(--lgpd-radius)] border",
          "bg-[var(--lgpd-sheet-bg-light)] dark:bg-[var(--lgpd-sheet-bg-dark)]",
          "backdrop-blur-[var(--lgpd-blur)] -webkit-backdrop-blur-[var(--lgpd-blur)]",
          "border-white/45 dark:border-white/10",
          "shadow-[var(--lgpd-shadow-light)] dark:shadow-[var(--lgpd-shadow-dark)]",
          "transition-all duration-240 ease-out-quint",
          "motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-6",
          isClosing && "opacity-0 translate-y-4 pointer-events-none"
        )}
      >
        <div className="p-[18px] sm:p-6 flex flex-col gap-3 sm:gap-4">
          <div className="flex items-start gap-3 sm:gap-4">
            <div
              aria-hidden="true"
              className="mt-0.5 flex h-9 w-9 sm:h-10 sm:w-10 flex-shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary"
            >
              <Cookie className="h-4 w-4 sm:h-5 sm:w-5" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-2">
                <h2
                  id="cookie-consent-title"
                  className="text-base sm:text-lg font-bold text-foreground leading-tight"
                >
                  Sua privacidade importa
                </h2>
                <Link
                  to="/privacidade"
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-primary hover:underline sm:hidden"
                  aria-label="Saiba mais sobre nossa política de privacidade"
                >
                  Saiba mais <ExternalLink className="h-2.5 w-2.5" />
                </Link>
              </div>
              
              <p
                id="cookie-consent-desc"
                className="mt-1.5 text-[13px] sm:text-sm leading-[1.45] text-foreground/80 dark:text-foreground/90"
              >
                Usamos cookies e armazenamento local estritamente necessários para
                manter sua sessão e preferências no Portal do Associado, em
                conformidade com a LGPD. Ao continuar, você concorda com nossa{' '}
                <Link
                  to="/privacidade"
                  className="font-semibold text-primary underline underline-offset-2 hover:opacity-80 transition-opacity"
                >
                  Política de Privacidade
                </Link>
                .
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 sm:flex-row sm:justify-end sm:items-center mt-1">
            <Link
              to="/privacidade"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mr-auto"
            >
              Saiba mais <ExternalLink className="h-3 w-3" />
            </Link>
            
            <Button
              variant="outline"
              className={cn(
                "w-full sm:w-auto h-11 sm:h-10 rounded-xl text-[14px] sm:text-sm font-semibold",
                "bg-transparent dark:bg-slate-900/40 border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800"
              )}
              onClick={() => decide('essential')}
            >
              Apenas essenciais
            </Button>
            <Button 
              className="w-full sm:w-auto h-11 sm:h-10 rounded-xl text-[14px] sm:text-sm font-semibold bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20"
              onClick={() => decide('accepted')}
            >
              Aceitar e continuar
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
