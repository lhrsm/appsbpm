import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

/**
 * Encerra a sessão automaticamente após um período de inatividade.
 * Mostra um aviso 1 minuto antes do logout.
 */
export function useInactivityLock(
  enabled: boolean,
  onLock: () => void,
  timeoutMs: number = 10 * 60 * 1000, // 10 min
  warnBeforeMs: number = 60 * 1000, // 1 min
) {
  const timerRef = useRef<number | null>(null);
  const warnRef = useRef<number | null>(null);
  const warnedRef = useRef(false);

  useEffect(() => {
    if (!enabled) return;

    const clear = () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
      if (warnRef.current) window.clearTimeout(warnRef.current);
      timerRef.current = null;
      warnRef.current = null;
    };

    const reset = () => {
      clear();
      warnedRef.current = false;
      warnRef.current = window.setTimeout(() => {
        if (warnedRef.current) return;
        warnedRef.current = true;
        toast.warning('Sua sessão será encerrada em 1 minuto por inatividade.', {
          duration: warnBeforeMs,
        });
      }, Math.max(0, timeoutMs - warnBeforeMs));
      timerRef.current = window.setTimeout(() => {
        toast.info('Sessão encerrada por inatividade.');
        onLock();
      }, timeoutMs);
    };

    const events: (keyof WindowEventMap)[] = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
    ];
    events.forEach((ev) => window.addEventListener(ev, reset, { passive: true }));
    reset();

    return () => {
      clear();
      events.forEach((ev) => window.removeEventListener(ev, reset));
    };
  }, [enabled, onLock, timeoutMs, warnBeforeMs]);
}
