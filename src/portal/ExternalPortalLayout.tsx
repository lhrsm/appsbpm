
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Bell, Menu, MessageCircle, Home, FileText, Plus, HelpCircle, User, ChevronDown } from 'lucide-react';
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { icons } from '@/design-system/icons';
import FloatingActionsManager from '@/portal/components/FloatingActionsManager';
import MobileBottomNavigation from '@/portal/components/MobileBottomNavigation';
import MobileNavigationDrawer from '@/portal/components/MobileNavigationDrawer';
import { useTheme } from "@/components/ThemeProvider";
import PortalHeader from './components/PortalHeader';


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
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme, setTheme } = useTheme();
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
            {/* Hamburger Menu - Left */}
            <button 
              className="mobile-header-button" 
              aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} 
              onClick={() => setMenuOpen(!menuOpen)}
              style={{ display: 'flex' }}
            >
              {menuOpen ? <icons.fechar size={24} /> : <Menu size={24} />}
            </button>



            {/* User Block — Grid Layout */}
            <DropdownMenu open={dropdownOpen} onOpenChange={setDropdownOpen}>
              <DropdownMenuTrigger asChild>
                <div className="mobile-user-block cursor-pointer active:opacity-80 transition-opacity">
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

                  {/* Name + Role */}
                  <div className="mobile-user-info">
                    <div className="text-[11px] font-medium text-slate-500 leading-none mb-0.5">
                      Bom dia,
                    </div>
                    <div className="mobile-user-name">
                      {user.nome}
                    </div>
                    <div className="mobile-user-role">
                      {profileType === 'dependent' ? 'Dependente • Titular' : 'Associado • Titular'}
                    </div>
                  </div>

                  {/* Icon Dropdown */}
                  <div className="text-slate-400">
                    <icons.expandir size={14} className={cn("transition-transform duration-200", dropdownOpen && "rotate-180")} />
                  </div>
                </div>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent 
                align="center" 
                sideOffset={8}
                className="w-[320px] max-w-[calc(100vw-32px)] p-2.5 !text-[#263244] !opacity-100 border border-slate-900/10 shadow-[0_16px_38px_rgba(15,23,42,0.20)] rounded-[18px] overflow-hidden z-[9999] dark:!text-[#e2e8f0] dark:border-white/10 dark:!bg-[#0f172a]/98"
                style={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.985)',
                  backdropFilter: 'blur(16px)', 
                  WebkitBackdropFilter: 'blur(16px)'
                }}
              >
                <div className="space-y-0.5">
                  {[
                    { label: "Meu perfil", to: "/dashboard/perfil", icon: icons.perfil },
                    { label: "Segurança", to: "/dashboard/seguranca", icon: icons.senha },
                    { label: "Privacidade", to: "/dashboard/minha-privacidade", icon: icons.lgpd },
                    { label: "Histórico", to: "/dashboard/historico", icon: icons.horario },
                    { label: "Central de Ajuda", to: "/dashboard/faq", icon: icons.ajuda },
                  ].map((item) => (
                    <DropdownMenuItem 
                      key={item.label} 
                      onSelect={() => navigate(item.to)}
                      className="flex items-center gap-2.5 px-3 py-2.5 !text-[#263244] dark:!text-[#e2e8f0] font-medium rounded-lg cursor-pointer focus:!bg-[rgba(240,253,244,0.96)] focus:!text-[#166534] transition-colors"
                    >
                      <item.icon className="h-4 w-4 !text-[#64748b] dark:!text-[#94a3b8]" />
                      {item.label}
                    </DropdownMenuItem>
                  ))}
                </div>

                <DropdownMenuSeparator className="my-2 bg-slate-900/8 dark:bg-white/8" />
                
                <div className="px-1 py-1">
                  <div className="px-2 py-1.5 mb-1 text-[11px] font-bold !text-[#475569] dark:!text-[#94a3b8] uppercase tracking-wider">
                    Aparência
                  </div>

                  <div className="flex flex-col gap-1">
                    <DropdownMenuItem 
                      onSelect={() => setTheme("light")}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2.5 font-medium rounded-lg cursor-pointer transition-colors",
                        theme === "light" 
                          ? "bg-[rgba(34,197,94,0.16)] text-[#166534] dark:text-[#86efac] border border-[rgba(34,197,94,0.35)]" 
                          : "!text-[#263244] dark:!text-[#cbd5e1] hover:!bg-[rgba(34,197,94,0.14)] hover:!text-[#166534] dark:hover:!text-[#86efac]"
                      )}
                    >
                      <icons.lgpd className={cn("h-4 w-4", theme === "light" ? "text-inherit" : "!text-[#64748b] dark:!text-[#94a3b8]")} />
                      Modo Claro
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onSelect={() => setTheme("dark")}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2.5 font-medium rounded-lg cursor-pointer transition-colors",
                        theme === "dark" 
                          ? "bg-[rgba(34,197,94,0.16)] text-[#166534] dark:text-[#86efac] border border-[rgba(34,197,94,0.35)]" 
                          : "!text-[#263244] dark:!text-[#cbd5e1] hover:!bg-[rgba(34,197,94,0.14)] hover:!text-[#166534] dark:hover:!text-[#86efac]"
                      )}
                    >
                      <icons.lgpd className={cn("h-4 w-4", theme === "dark" ? "text-inherit" : "!text-[#64748b] dark:!text-[#94a3b8]")} />
                      Modo Escuro
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onSelect={() => setTheme("system")}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2.5 font-medium rounded-lg cursor-pointer transition-colors",
                        theme === "system" 
                          ? "bg-[rgba(34,197,94,0.16)] text-[#166534] dark:text-[#86efac] border border-[rgba(34,197,94,0.35)]" 
                          : "!text-[#263244] dark:!text-[#cbd5e1] hover:!bg-[rgba(34,197,94,0.14)] hover:!text-[#166534] dark:hover:!text-[#86efac]"
                      )}
                    >
                      <icons.configuracoes className={cn("h-4 w-4", theme === "system" ? "text-inherit" : "!text-[#64748b] dark:!text-[#94a3b8]")} />
                      Sistema
                    </DropdownMenuItem>
                  </div>
                </div>

                <DropdownMenuSeparator className="my-2 bg-slate-900/8 dark:bg-white/8" />

                <DropdownMenuItem
                  className="flex items-center gap-2.5 px-3 py-2.5 text-red-600 dark:text-red-400 font-semibold rounded-lg cursor-pointer hover:!bg-red-500/10 dark:hover:!bg-red-500/20 focus:bg-red-500/10 transition-colors group"
                  onSelect={handleLogoutClick}
                >
                  <icons.sair className="h-4 w-4 text-red-500 group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors" />
                  Sair
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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
        <div className="mobile-floating-actions" style={{ bottom: 'calc(var(--mobile-bottom-nav-height, 68px) + env(safe-area-inset-bottom) + 24px)' }}>
          <FloatingActionsManager profileType={profileType} />
        </div>

        {/* Bottom Navigation */}
        <MobileBottomNavigation />

        {/* Navigation Drawer */}
        <MobileNavigationDrawer
          open={menuOpen}
          onOpenChange={setMenuOpen}
          profile={profileType === 'associate' ? 'associate' : 'dependent'}
          user={user}
          onLogout={onLogout}
        />

      </div>
    );
  }

  // ===== RENDERIZAÇÃO DESKTOP (≥1024px) =====
  return (
    <div className="external-portal-layout min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Header Global com Background Institucional no Dashboard */}
      <PortalHeader 
        profile={profileType}
        user={user}
        onOpenMenu={() => {}}
        menuOpen={false}
        onLogout={onLogout}
        isDashboard={location.pathname === '/dashboard'}
      />

      {/* Main Content */}
      <main className="portal-main-desktop relative">
        <div className={cn(
          "max-w-[1600px] mx-auto px-6",
          location.pathname === '/dashboard' ? "mt-5 md:mt-6" : "mt-8"
        )}>
          {banner}
          
          <div className={cn("portal-content-desktop", location.pathname === '/dashboard' ? "pt-0" : "")}>
            {children}
          </div>
        </div>
      </main>

      {/* Floating Actions */}
      <FloatingActionsManager profileType={profileType} />
    </div>
  );
}
