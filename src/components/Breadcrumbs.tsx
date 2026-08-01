import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';

const LABELS: Record<string, string> = {
  dashboard: 'Início',
  carteirinha: 'Carteirinha',
  clinicas: 'Clínicas e Parceiros',
  informes: 'Informe de Rendimentos',
  dependentes: 'Dependentes',
  'associacao-premiada': 'Associação Premiada',
  simulador: 'Simulador',
  'indicar-parceiro': 'Indicar Parceiro',
  peculio: 'Pecúlio',
  'solicitar-peculio': 'Solicitar Pecúlio',
  perfil: 'Meu Perfil',
  'minha-privacidade': 'Privacidade',
  notificacoes: 'Notificações',
  solicitacoes: 'Solicitações',
  documentos: 'Meus Documentos',
  financeiro: 'Financeiro',
  agenda: 'Agenda',
  faq: 'Perguntas Frequentes',
};

export default function Breadcrumbs() {
  const { pathname } = useLocation();
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length <= 1) return null;

  const crumbs = parts.map((seg, i) => ({
    to: '/' + parts.slice(0, i + 1).join('/'),
    label: LABELS[seg] ?? seg,
    last: i === parts.length - 1,
  }));

  return (
    <nav
      aria-label="Trilha de navegação"
      className="flex items-center flex-wrap gap-1 text-sm text-muted-foreground"
    >
      <Link to="/dashboard" className="flex items-center gap-1 hover:text-foreground transition">
        <Home className="h-3.5 w-3.5" />
        <span className="sr-only">Início</span>
      </Link>
      {crumbs.slice(1).map((c) => (
        <span key={c.to} className="flex items-center gap-1">
          <ChevronRight className="h-3.5 w-3.5" />
          {c.last ? (
            <span className="text-foreground font-medium" aria-current="page">
              {c.label}
            </span>
          ) : (
            <Link to={c.to} className="hover:text-foreground transition">
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
