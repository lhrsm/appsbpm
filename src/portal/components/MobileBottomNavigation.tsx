
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, Card, Plus, HelpCircle, User } from 'lucide-react';

const navItems = [
  { id: 'visao', label: 'Visão', icon: Eye, path: '/dashboard/carteirinha' },
  { id: 'carteirinha', label: 'Carteirinha', icon: Card, path: '/dashboard/carteirinha' },
  { id: 'solicitacoes', label: 'Solicitações', icon: Plus, path: '/dashboard/solicitacoes' },
  { id: 'canais', label: 'Canais', icon: HelpCircle, path: '/dashboard/faq' },
  { id: 'meus', label: 'Meus', icon: User, path: '/dashboard/perfil' },
];

export default function MobileBottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => {
    return location.pathname.startsWith(path);
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
