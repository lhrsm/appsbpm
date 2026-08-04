import { useEffect, useRef, useState } from 'react';
import { Accessibility, Type, Contrast, ZapOff, Hand, RotateCcw, X, Focus, Underline, Rows3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useA11y, type A11yPreferences } from '@/a11y/preferences';

/**
 * Painel de preferências de acessibilidade.
 *
 * Complementa — nunca substitui — a acessibilidade nativa do portal.
 * É totalmente operável por teclado, tem foco preso enquanto aberto,
 * fecha com Escape e devolve o foco ao botão de origem.
 */
export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const { prefs, setPref, reset } = useA11y();
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const panel = panelRef.current;
    panel?.querySelector<HTMLElement>('button, [href], input, select')?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation();
        setOpen(false);
        triggerRef.current?.focus();
        return;
      }
      if (e.key !== 'Tab' || !panel) return;
      const focusables = Array.from(
        panel.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'),
      ).filter((el) => !el.hasAttribute('disabled'));
      if (!focusables.length) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };

    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [open]);

  const toggle = <K extends keyof A11yPreferences>(key: K, value: A11yPreferences[K]) => setPref(key, value);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Fechar opções de acessibilidade' : 'Abrir opções de acessibilidade'}
        aria-expanded={open}
        aria-controls="a11y-panel"
        className={cn(
          "safe-mb fixed left-4 z-[60] flex h-12 w-12 min-h-11 min-w-11 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-primary-foreground/20 hover:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring transition-all duration-300",
          "bottom-20 md:bottom-4",
          "lgpd-open:bottom-[calc(var(--lgpd-sheet-height,160px)+24px)]"
        )}
      >
        <Accessibility className="h-6 w-6" aria-hidden="true" />
      </button>

      {open && (
        <div
          id="a11y-panel"
          ref={panelRef}
          role="dialog"
          aria-modal="false"
          aria-labelledby="a11y-panel-title"
          className={cn(
            "safe-mb fixed left-4 z-[60] max-h-[70dvh] w-[min(20rem,calc(100vw-2rem))] overflow-y-auto rounded-lg border bg-card p-4 shadow-2xl transition-all duration-300",
            "bottom-36 md:bottom-20",
            "lgpd-open:bottom-[calc(var(--lgpd-sheet-height,160px)+84px)]"
          )}
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 id="a11y-panel-title" className="text-sm font-semibold">
              Preferências de acessibilidade
            </h2>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                triggerRef.current?.focus();
              }}
              aria-label="Fechar painel de acessibilidade"
              className="flex h-11 w-11 items-center justify-center rounded hover:bg-muted"
            >
              <X className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <p className="mb-3 text-xs text-muted-foreground">
            As opções ficam salvas neste dispositivo e respeitam as preferências do seu sistema.
          </p>

          <div className="space-y-3">
            <fieldset>
              <legend className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Type className="h-3.5 w-3.5" aria-hidden="true" /> Tamanho do texto
              </legend>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { v: 1, l: 'Padrão', d: 'Tamanho padrão do texto' },
                  { v: 1.25, l: 'Grande', d: 'Texto 125 por cento maior' },
                  { v: 1.5, l: 'Maior', d: 'Texto 150 por cento maior' },
                ].map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => toggle('fontScale', o.v)}
                    aria-pressed={prefs.fontScale === o.v}
                    aria-label={o.d}
                    className={cn(
                      'min-h-11 rounded border px-1 py-1 text-xs font-semibold',
                      prefs.fontScale === o.v
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:bg-muted',
                    )}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </fieldset>

            <ToggleRow
              icon={<Contrast className="h-3.5 w-3.5" aria-hidden="true" />}
              label="Alto contraste"
              checked={prefs.contrast}
              onChange={(v) => toggle('contrast', v)}
            />
            <ToggleRow
              icon={<ZapOff className="h-3.5 w-3.5" aria-hidden="true" />}
              label="Reduzir animações"
              checked={prefs.reduceMotion}
              onChange={(v) => toggle('reduceMotion', v)}
            />
            <ToggleRow
              icon={<Focus className="h-3.5 w-3.5" aria-hidden="true" />}
              label="Destacar foco do teclado"
              checked={prefs.focusHighlight}
              onChange={(v) => toggle('focusHighlight', v)}
            />
            <ToggleRow
              icon={<Underline className="h-3.5 w-3.5" aria-hidden="true" />}
              label="Sublinhar links"
              checked={prefs.underlineLinks}
              onChange={(v) => toggle('underlineLinks', v)}
            />
            <ToggleRow
              icon={<Rows3 className="h-3.5 w-3.5" aria-hidden="true" />}
              label="Espaçamento confortável"
              checked={prefs.comfortable}
              onChange={(v) => toggle('comfortable', v)}
            />
            <ToggleRow
              icon={<Hand className="h-3.5 w-3.5" aria-hidden="true" />}
              label="Tradutor de Libras (VLibras)"
              checked={prefs.vlibras}
              onChange={(v) => toggle('vlibras', v)}
            />

            <Button variant="outline" size="sm" onClick={reset} className="min-h-11 w-full">
              <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
              Restaurar padrões
            </Button>

            <a
              href="/acessibilidade"
              className="block rounded px-1 py-2 text-xs font-medium text-primary underline underline-offset-2"
            >
              Ler a declaração de acessibilidade
            </a>
          </div>
        </div>
      )}
    </>
  );
}

function ToggleRow({
  icon,
  label,
  checked,
  onChange,
}: {
  icon: React.ReactNode;
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-2 rounded border border-border p-2 text-sm">
      <span className="flex items-center gap-2">
        {icon}
        <span id={`a11y-${label}`}>{label}</span>
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-labelledby={`a11y-${label}`}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2',
          checked ? 'bg-primary' : 'bg-muted-foreground/40',
        )}
      >
        <span className="sr-only">{checked ? 'Ativado' : 'Desativado'}</span>
        <span
          aria-hidden="true"
          className={cn(
            'absolute top-1 h-4 w-4 rounded-full bg-background transition-all',
            checked ? 'left-6' : 'left-1',
          )}
        />
      </button>
    </div>
  );
}
