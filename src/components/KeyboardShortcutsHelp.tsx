import { useEffect, useState } from 'react';
import { Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

type Shortcut = { keys: string[]; description: string };

const shortcuts: { group: string; items: Shortcut[] }[] = [
  {
    group: 'Navegação',
    items: [
      { keys: ['Ctrl', 'K'], description: 'Abrir busca global' },
      { keys: ['?'], description: 'Mostrar atalhos de teclado' },
      { keys: ['Esc'], description: 'Fechar diálogos e menus' },
    ],
  },
  {
    group: 'Acessibilidade',
    items: [
      { keys: ['Tab'], description: 'Avançar entre elementos focáveis' },
      { keys: ['Shift', 'Tab'], description: 'Voltar entre elementos focáveis' },
      { keys: ['Enter'], description: 'Ativar botão ou link em foco' },
    ],
  },
];

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 rounded-md border border-border bg-muted text-foreground text-xs font-mono shadow-sm">
      {children}
    </kbd>
  );
}

export default function KeyboardShortcutsHelp({ className }: { className?: string }) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || target?.isContentEditable) return;
      if (e.key === '?' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={className}
          aria-label="Atalhos de teclado (?)"
          title="Atalhos de teclado (?)"
        >
          <Keyboard className="h-5 w-5" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Atalhos de teclado</DialogTitle>
          <DialogDescription>
            Acelere sua navegação no portal com os atalhos abaixo.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-5 mt-2">
          {shortcuts.map((section) => (
            <div key={section.group}>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                {section.group}
              </h3>
              <ul className="space-y-2">
                {section.items.map((s) => (
                  <li
                    key={s.description}
                    className="flex items-center justify-between gap-4 text-sm"
                  >
                    <span className="text-foreground">{s.description}</span>
                    <span className="flex items-center gap-1">
                      {s.keys.map((k, i) => (
                        <span key={i} className="flex items-center gap-1">
                          {i > 0 && <span className="text-muted-foreground text-xs">+</span>}
                          <Kbd>{k}</Kbd>
                        </span>
                      ))}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
}
