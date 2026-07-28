import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const STORAGE_KEY = 'sbpm.cookie-consent.v1';
const CONSENT_VERSION = '1.0';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const decide = async (value: 'accepted' | 'essential') => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ value, at: new Date().toISOString(), versao: CONSENT_VERSION })
      );
    } catch {}
    // Registro no banco (best-effort, não bloqueia UX)
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
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-labelledby="cookie-consent-title"
      aria-describedby="cookie-consent-desc"
      className="fixed inset-x-0 bottom-0 z-50 p-3 sm:p-4 lg:left-0 lg:right-auto lg:max-w-md"
    >
      <div className="mx-auto w-full max-w-lg rounded-lg border bg-card/95 p-3 shadow-2xl backdrop-blur sm:p-4 lg:mx-0">
        <div className="flex items-start gap-3">
          <div
            aria-hidden="true"
            className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <Cookie className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <h2
              id="cookie-consent-title"
              className="text-sm font-semibold text-foreground"
            >
              Sua privacidade importa
            </h2>
            <p
              id="cookie-consent-desc"
              className="mt-1 text-xs text-muted-foreground"
            >
              Usamos cookies e armazenamento local estritamente necessários para
              manter sua sessão e preferências no Portal do Associado, em
              conformidade com a LGPD (Lei nº 13.709/2018). Ao continuar, você
              concorda com o uso desses dados conforme nossa{' '}
              <Link
                to="/privacidade"
                className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
              >
                Política de Privacidade
              </Link>
              .
            </p>
            <div className="mt-3 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <Button
                variant="outline"
                size="sm"
                onClick={() => decide('essential')}
              >
                Apenas essenciais
              </Button>
              <Button size="sm" onClick={() => decide('accepted')}>
                Aceitar e continuar
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
