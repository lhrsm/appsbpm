
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Menu, MessageCircle, Home, FileText, Plus, HelpCircle, User, ChevronDown } from 'lucide-react';
import { icons } from '@/design-system/icons';
import FloatingActionsManager from '@/portal/components/FloatingActionsManager';
import MobileBottomNavigation from '@/portal/components/MobileBottomNavigation';
import UserProfileDropdown from '@/portal/components/UserProfileDropdown';

interface ExternalPortalLayoutProps {
  profileType: 'associate' | 'dependent';
  user: {
    nome: string;
    fotoUrl?: string;
    matricula?: string;
    titularNome?: string;
    ativo?: boolean;
  };
  onLogout: () => void;
  banner?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Layout externo do portal do associado/dependente.
 * 
 * Responsividade:
 * - Desktop (≥1024px): Header com logo e sidebar, layout grid
 * - Mobile (<1024px): Header compacto, navegação inferior fixa
 * - PWA: Mesmo layout mobile + safe-area
 * 
 * Breakpoints:
 * - 320–390px: 1 coluna para cards, header super compacto
 * - 390–1023px: até 2 colunas para cards, header compacto
 * - ≥1024px: Desktop completo, sem mudanças
 */

export default function ExternalPortalLayout({
  profileType,
  user,
  onLogout,
  banner,
  children,
}: ExternalPortalLayoutProps) {
  const navigate = useNavigate();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleNotifications = () => {
    navigate('/dashboard/notificacoes');
  };

  const handleLogoutClick = () => {
    setDropdownOpen(false);
    onLogout();
  };

  // ===== RENDERIZAÇÃO MOBILE (<1024px) =====
  if (isMobile) {
    return (
      <div className="mobile-portal-layout">
        {/* Header Compacto Mobile */}
        <header className="mobile-portal-header">
          <div className="mobile-header-container">
            {/* Menu Button */}
            <button className="mobile-header-button" aria-label="Menu">
              <Menu size={24} />
            </button>

            {/* User Block — Grid Layout */}
            <div className="mobile-user-block">
              {/* Avatar */}
              <div className="mobile-user-avatar">
                {user.fotoUrl ? (
                  <img src={user.fotoUrl} alt={user.nome} />
                ) : (
                  <div className="mobile-avatar-initials">
                    {user.nome
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .toUpperCase()
                      .slice(0, 2)}
                  </div>
                )}
              </div>
...
              {/* Name + Role */}
              <div className="mobile-user-info">
                <div className="mobile-user-name">
                  {user.nome}
                </div>
                <div className="mobile-user-role">
                  {profileType === 'dependent' ? 'Dependente • Titular' : 'Associado • Titular'}
                </div>
              </div>

              {/* Icon Dropdown */}
              <div className="text-slate-400">
                <icons.expandir size={14} />
              </div>
            </div>

            {/* Notifications Button */}
            <button
              className="mobile-header-button"
              onClick={handleNotifications}
              aria-label="Notificações"
            >
              <Bell size={24} />
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="mobile-portal-main">
          {banner}
          <div className="mobile-portal-content">
            {children}
          </div>
          {/* Espaço para WhatsApp e Navegação */}
          <div className="mobile-bottom-spacing"></div>
        </main>

        {/* Floating Actions (WhatsApp) */}
        <div className="mobile-floating-actions">
          <FloatingActionsManager profileType={profileType} />
        </div>

        {/* Bottom Navigation */}
        <MobileBottomNavigation />
      </div>
    );
  }

  // ===== RENDERIZAÇÃO DESKTOP (≥1024px) =====
  return (
    <div className="external-portal-layout">
      {/* Header Desktop */}
      <header className="portal-header-desktop">
        <div className="portal-header-content">
          <div className="portal-header-logo">
            <div className="logo-placeholder">SBPM</div>
          </div>
          <div className="portal-header-spacer"></div>
          <div className="portal-header-actions">
            <button
              className="portal-header-button"
              onClick={handleNotifications}
              aria-label="Notificações"
            >
              <Bell size={24} />
            </button>
            <div className="portal-header-divider"></div>
            <div className="portal-header-user">
              <button
                className="portal-header-user-button"
                onClick={() => setDropdownOpen(!dropdownOpen)}
              >
                <div className="portal-user-avatar-desktop">
                  {user.fotoUrl ? (
                    <img src={user.fotoUrl} alt={user.nome} />
                  ) : (
                    <div className="avatar-initials">
                      {user.nome
                        .split(' ')
                        .map((n) => n[0])
                        .join('')
                        .toUpperCase()
                        .slice(0, 2)}
                    </div>
                  )}
                </div>
                <div className="portal-user-text">
                  <div className="portal-user-name">{user.nome}</div>
                  <div className="portal-user-role">
                    {profileType === 'dependent' ? 'Dependente' : 'Associado'}
                  </div>
                </div>
              </button>
              {dropdownOpen && (
                <UserProfileDropdown
                  user={user}
                  onLogout={handleLogoutClick}
                  onClose={() => setDropdownOpen(false)}
                />
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="portal-main-desktop">
        {banner}
        <div className="portal-content-desktop">
          {children}
        </div>
      </main>

      {/* Floating Actions */}
      <FloatingActionsManager profileType={profileType} />
    </div>
  );
}
