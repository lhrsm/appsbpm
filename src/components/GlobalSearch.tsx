import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { useAssociado } from '@/contexts/AssociadoContext';

type Item = { label: string; path: string; keywords?: string; group: string };

const titularItems: Item[] = [
  { label: 'Carteirinha', path: '/dashboard/carteirinha', group: 'Portal' },
  { label: 'Notificações', path: '/dashboard/notificacoes', group: 'Portal' },
  { label: 'Solicitações / Chamados', path: '/dashboard/solicitacoes', group: 'Portal' },
  { label: 'Meus Documentos', path: '/dashboard/documentos', group: 'Portal' },
  { label: 'Financeiro / Mensalidades', path: '/dashboard/financeiro', group: 'Portal' },
  { label: 'Limite Disponível', path: '/dashboard/limite', group: 'Portal' },
  { label: 'Clínicas e Parceiros', path: '/dashboard/clinicas', group: 'Portal' },
  { label: 'Informe de Rendimentos', path: '/dashboard/informes', group: 'Portal' },
  { label: 'Dependentes', path: '/dashboard/dependentes', group: 'Portal' },
  { label: 'Associação Premiada', path: '/dashboard/associacao-premiada', group: 'Portal' },
  { label: 'Simulador de Mensalidade', path: '/dashboard/simulador', group: 'Portal' },
  { label: 'Indicar Parceiro', path: '/dashboard/indicar-parceiro', group: 'Portal' },
  { label: 'Pecúlio', path: '/dashboard/peculio', group: 'Portal' },
  { label: 'Meu Perfil', path: '/dashboard/perfil', group: 'Conta' },
  { label: 'Privacidade (LGPD)', path: '/dashboard/minha-privacidade', group: 'Conta' },
];

const dependenteItems: Item[] = [
  { label: 'Carteirinha', path: '/dashboard/carteirinha', group: 'Portal' },
  { label: 'Notificações', path: '/dashboard/notificacoes', group: 'Portal' },
  { label: 'Solicitações / Chamados', path: '/dashboard/solicitacoes', group: 'Portal' },
  { label: 'Meus Documentos', path: '/dashboard/documentos', group: 'Portal' },
  { label: 'Clínicas e Parceiros', path: '/dashboard/clinicas', group: 'Portal' },
  { label: 'Meu Perfil', path: '/dashboard/perfil', group: 'Conta' },
  { label: 'Privacidade (LGPD)', path: '/dashboard/minha-privacidade', group: 'Conta' },
];

export default function GlobalSearch({ variant = 'icon' }: { variant?: 'icon' | 'bar' }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { isDependente } = useAssociado();
  const items = isDependente ? dependenteItems : titularItems;

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' || e.key === 'K') && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  const go = (path: string) => {
    setOpen(false);
    navigate(path);
  };

  const grouped = items.reduce<Record<string, Item[]>>((acc, it) => {
    (acc[it.group] ||= []).push(it);
    return acc;
  }, {});

  return (
    <>
      {variant === 'bar' ? (
        <button
          onClick={() => setOpen(true)}
          className="hidden md:flex items-center gap-2 h-9 px-3 rounded-md bg-white/10 hover:bg-white/20 text-primary-foreground text-sm w-64 transition"
          aria-label="Buscar (Ctrl+K)"
        >
          <Search className="h-4 w-4 opacity-80" />
          <span className="opacity-80 flex-1 text-left">Buscar...</span>
          <kbd className="text-[10px] font-mono opacity-70 border border-white/30 rounded px-1.5 py-0.5">
            Ctrl K
          </kbd>
        </button>
      ) : (
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setOpen(true)}
          aria-label="Buscar (Ctrl+K)"
          title="Buscar (Ctrl+K)"
        >
          <Search className="h-5 w-5" />
        </Button>
      )}

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar página, opção ou serviço..." />
        <CommandList>
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>
          {Object.entries(grouped).map(([group, list], idx) => (
            <div key={group}>
              {idx > 0 && <CommandSeparator />}
              <CommandGroup heading={group}>
                {list.map((it) => (
                  <CommandItem
                    key={it.path}
                    value={`${it.label} ${it.keywords ?? ''}`}
                    onSelect={() => go(it.path)}
                  >
                    {it.label}
                  </CommandItem>
                ))}
              </CommandGroup>
            </div>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  );
}
