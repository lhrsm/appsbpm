import { useEffect, useState } from 'react';
import { Accessibility, Type, Contrast, ZapOff, Hand, RotateCcw, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type Prefs = {
  fontScale: number; // 1, 1.15, 1.3
  contrast: boolean;
  reduceMotion: boolean;
  vlibras: boolean;
};

const KEY = 'sbpm.a11y.v1';
const DEFAULTS: Prefs = { fontScale: 1, contrast: false, reduceMotion: false, vlibras: false };

function apply(p: Prefs) {
  const root = document.documentElement;
  root.style.fontSize = `${p.fontScale * 100}%`;
  root.classList.toggle('a11y-contrast', p.contrast);
  root.classList.toggle('a11y-reduce-motion', p.reduceMotion);
}

function loadVLibras() {
  if (document.getElementById('vlibras-script')) return;
  if (!document.querySelector('[vw]')) {
    const wrap = document.createElement('div');
    wrap.setAttribute('vw', '');
    wrap.className = 'enabled';
    wrap.innerHTML =
      '<div vw-access-button class="active"></div><div vw-plugin-wrapper><div class="vw-plugin-top-wrapper"></div></div>';
    document.body.appendChild(wrap);
  }
  const s = document.createElement('script');
  s.id = 'vlibras-script';
  s.src = 'https://vlibras.gov.br/app/vlibras-plugin.js';
  s.onload = () => {
    // @ts-ignore
    try { new window.VLibras.Widget('https://vlibras.gov.br/app'); } catch {}
  };
  document.body.appendChild(s);
}

function unloadVLibras() {
  document.querySelectorAll('[vw]').forEach((el) => el.remove());
  document.getElementById('vlibras-script')?.remove();
}

export default function AccessibilityWidget() {
  const [open, setOpen] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(DEFAULTS);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(KEY);
      const p = raw ? { ...DEFAULTS, ...JSON.parse(raw) } : DEFAULTS;
      setPrefs(p);
      apply(p);
      if (p.vlibras) loadVLibras();
    } catch {}
  }, []);

  const update = (patch: Partial<Prefs>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    apply(next);
    try { localStorage.setItem(KEY, JSON.stringify(next)); } catch {}
    if (patch.vlibras === true) loadVLibras();
    if (patch.vlibras === false) unloadVLibras();
  };

  const reset = () => {
    unloadVLibras();
    setPrefs(DEFAULTS);
    apply(DEFAULTS);
    try { localStorage.removeItem(KEY); } catch {}
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Abrir opções de acessibilidade"
        aria-expanded={open}
        aria-controls="a11y-panel"
        className="fixed bottom-4 left-4 z-[60] flex h-12 w-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg ring-2 ring-primary-foreground/20 hover:opacity-90 focus:outline-none focus:ring-4 focus:ring-primary/40"
      >
        <Accessibility className="h-6 w-6" aria-hidden="true" />
      </button>

      {open && (
        <div
          id="a11y-panel"
          role="dialog"
          aria-label="Opções de acessibilidade"
          className="fixed bottom-20 left-4 z-[60] w-72 rounded-lg border bg-card p-4 shadow-2xl"
        >
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold">Acessibilidade</h2>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label="Fechar"
              className="rounded p-1 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <p className="mb-1 flex items-center gap-2 text-xs font-medium text-muted-foreground">
                <Type className="h-3.5 w-3.5" aria-hidden="true" /> Tamanho do texto
              </p>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { v: 1, l: 'A' },
                  { v: 1.15, l: 'A+' },
                  { v: 1.3, l: 'A++' },
                ].map((o) => (
                  <button
                    key={o.v}
                    type="button"
                    onClick={() => update({ fontScale: o.v })}
                    className={cn(
                      'rounded border py-1 text-sm font-semibold',
                      prefs.fontScale === o.v
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border hover:bg-muted'
                    )}
                    aria-pressed={prefs.fontScale === o.v}
                  >
                    {o.l}
                  </button>
                ))}
              </div>
            </div>

            <ToggleRow
              icon={<Contrast className="h-3.5 w-3.5" aria-hidden="true" />}
              label="Alto contraste"
              checked={prefs.contrast}
              onChange={(v) => update({ contrast: v })}
            />
            <ToggleRow
              icon={<ZapOff className="h-3.5 w-3.5" aria-hidden="true" />}
              label="Reduzir animações"
              checked={prefs.reduceMotion}
              onChange={(v) => update({ reduceMotion: v })}
            />
            <ToggleRow
              icon={<Hand className="h-3.5 w-3.5" aria-hidden="true" />}
              label="Tradutor Libras (VLibras)"
              checked={prefs.vlibras}
              onChange={(v) => update({ vlibras: v })}
            />

            <Button variant="outline" size="sm" onClick={reset} className="w-full">
              <RotateCcw className="mr-2 h-4 w-4" aria-hidden="true" />
              Restaurar padrões
            </Button>
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
    <label className="flex cursor-pointer items-center justify-between gap-2 rounded border border-border p-2 text-sm hover:bg-muted/60">
      <span className="flex items-center gap-2">
        {icon}
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative h-5 w-9 rounded-full transition-colors',
          checked ? 'bg-primary' : 'bg-muted-foreground/30'
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 h-4 w-4 rounded-full bg-white transition-all',
            checked ? 'left-4' : 'left-0.5'
          )}
        />
      </button>
    </label>
  );
}
