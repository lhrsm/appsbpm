
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, CreditCard, Plus, HelpCircle, User } from 'lucide-react';

const navItems = [
  { id: 'visao', label: 'Visão', icon: Eye, path: '/dashboard' },
  { id: 'carteirinha', label: 'Carteirinha', icon: CreditCard, path: '/dashboard/carteirinha' },
  { id: 'solicitacoes', label: 'Solicitações', icon: Plus, path: '/dashboard/solicitacoes' },
  { id: 'canais', label: 'Canais', icon: HelpCircle, path: '/dashboard/faq' },
  { id: 'meus', label: 'Meus', icon: User, path: '/dashboard/perfil' },
];

export default function MobileBottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    const current = location.pathname;
    
    // Visão Geral ativado apenas na rota exata do dashboard
    if (path === '/dashboard') {
      return current === '/dashboard';
    }
    
    // Carteirinha ativado apenas na rota exata da carteirinha
    if (path === '/dashboard/carteirinha') {
      return current === '/dashboard/carteirinha';
    }
    
    // Outros itens usam startsWith para sub-rotas
    return current.startsWith(path);
  };


  return (
    <nav className="mobile-bottom-navigation">
      <div className="mobile-bottom-nav-container">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const active = isActive(item.path);

          return (
            <button
              key={item.id}
              onClick={() => navigate(item.path)}
              className={`mobile-bottom-nav-item ${active ? 'active' : 'inactive'}`}
              aria-label={item.label}
              aria-current={active ? 'page' : undefined}
            >
              <div className="mobile-bottom-nav-icon">
                <IconComponent size={24} strokeWidth={2} />
              </div>
              <div className="mobile-bottom-nav-label">{item.label}</div>
            </button>
          );
        })}
      </div>
    </nav>
  );
}
