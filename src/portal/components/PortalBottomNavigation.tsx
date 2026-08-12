
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, CreditCard, FileText, Users, User } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

interface PortalBottomNavigationProps {
  currentPath: string;
}

export default function PortalBottomNavigation({ currentPath }: PortalBottomNavigationProps) {
  const navigate = useNavigate();

  const navItems: NavItem[] = [
    { path: '/dashboard/carteirinha', label: 'Carteirinha', icon: <CreditCard size={24} /> },
    { path: '/dashboard/solicitacoes', label: 'Solicitações', icon: <FileText size={24} /> },
    { path: '/dashboard/dependentes', label: 'Dependentes', icon: <Users size={24} /> },
    { path: '/dashboard/perfil', label: 'Perfil', icon: <User size={24} /> },
    { path: '/dashboard', label: 'Visão', icon: <Eye size={24} /> },
  ];

  const isActive = (path: string) => {
    if (path === '/dashboard' && currentPath === '/dashboard') return true;
    if (path !== '/dashboard' && currentPath.startsWith(path)) return true;
    return false;
  };

  return (
    <nav
      className={cn(
        'mobile-bottom-navigation',
        'fixed bottom-0 left-0 right-0 w-full',
        'bg-white/96 dark:bg-slate-950/96',
        'border-t border-border',
        'shadow-lg',
        'z-40',
        'flex items-start justify-around'
      )}
      style={{
        height: `calc(var(--mobile-bottom-nav-height, 68px) + env(safe-area-inset-bottom))`,
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {navItems.map((item) => (
        <button
          key={item.path}
          onClick={() => navigate(item.path)}
          className={cn(
            'nav-item',
            'flex flex-col items-center justify-center',
            'w-1/5 h-[var(--mobile-bottom-nav-height,68px)]',
            'px-1 py-1',
            'transition-colors duration-200',
            'no-underline',
            'border-none bg-transparent',
            isActive(item.path)
              ? 'text-primary'
              : 'text-muted-foreground'
          )}
          aria-current={isActive(item.path) ? 'page' : undefined}
        >
          <span className="nav-icon text-2xl flex items-center justify-center mb-0.5">
            {item.icon}
          </span>
          <span className="nav-label text-xs font-medium leading-tight text-center">
            {item.label}
          </span>
        </button>
      ))}
    </nav>
  );
}
