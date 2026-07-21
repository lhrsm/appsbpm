import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Cookie } from 'lucide-react';

const STORAGE_KEY = 'sbpm.cookie-consent.v1';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      setVisible(true);
    }
  }, []);

  const decide = (value: 'accepted' | 'essential') => {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ value, at: new Date().toISOString() })
      );
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
      className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6"
    >
      <div className="mx-auto max-w-3xl rounded-lg border bg-card p-4 shadow-2xl sm:p-5">
        <div className="flex items-start gap-3">
          <div
            aria-hidden="true"
            className="mt-0.5 flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"
          >
            <Cookie className="h-5 w-5" />
          </div>
          <div className="flex-1">
            <h2
              id="cookie-consent-title"
              className="text-sm font-semibold text-foreground sm:text-base"
            >
              Sua privacidade importa
            </h2>
            <p
              id="cookie-consent-desc"
              className="mt-1 text-xs text-muted-foreground sm:text-sm"
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
