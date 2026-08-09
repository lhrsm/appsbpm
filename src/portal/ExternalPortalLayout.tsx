import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { PageHeader } from "@/design-system/components/Navigation";
import SkipLinks from "@/a11y/SkipLinks";
import PortalHeader from "./components/PortalHeader";
import PortalSidebar from "./components/PortalSidebar";
import MobileNavigationDrawer from "./components/MobileNavigationDrawer";
import PortalBottomNav from "./components/PortalBottomNav";
import PortalBreadcrumbs from "./components/PortalBreadcrumbs";
import PortalFooter from "./components/PortalFooter";
import PortalPageContainer from "./components/PortalPageContainer";
import { FloatingActionsManager } from "@/components/FloatingActionsManager";

import { PortalAccessRestricted, PortalErrorState } from "./components/PortalStates";
import { PageHeaderSkeleton, ContentSkeleton } from "./components/PortalSkeletons";
import type { PortalUser } from "./components/PortalUserMenu";
import { isRouteAllowed, type PortalProfile } from "./navigation";

const COLLAPSE_KEY = "sbpm:portal:sidebar-collapsed";

export interface ExternalPortalLayoutProps {
  profileType: PortalProfile;
  user: PortalUser;
  permissions?: string[];
  pageTitle?: ReactNode;
  pageDescription?: ReactNode;
  actions?: ReactNode;
  /** Conteúdo exibido acima do cabeçalho da página (banners). */
  banner?: ReactNode;
  children: ReactNode;
  loading?: boolean;
  error?: string | null;
  onRetry?: () => void;
  onLogout: () => void;
  environment?: string;
}

/**
 * Layout compartilhado do Portal do Associado e do Portal do Dependente.
 *
 * Variações de perfil são controladas por `profileType` + `permissions`;
 * não existem dois layouts independentes.
 */
export default function ExternalPortalLayout({
  profileType,
  user,
  permissions,
  pageTitle,
  pageDescription,
  actions,
  banner,
  children,
  loading,
  error,
  onRetry,
  onLogout,
  environment,
}: ExternalPortalLayoutProps) {
  const { pathname } = useLocation();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.localStorage.getItem(COLLAPSE_KEY) === "1";
  });

  useEffect(() => {
    try {
      window.localStorage.setItem(COLLAPSE_KEY, collapsed ? "1" : "0");
    } catch {
      /* preferência apenas local */
    }
  }, [collapsed]);

  const allowed = useMemo(
    () => isRouteAllowed(pathname, { profile: profileType, permissions }),
    [pathname, profileType, permissions]
  );

  console.log("[Layout] Render Stage:", { loading, error, allowed, pathname });

  const renderContent = () => {
    if (loading) {
      console.log("[Layout] Rendering loading skeleton...");
      return (
        <div key="loading">
          <PageHeaderSkeleton />
          <ContentSkeleton />
        </div>
      );
    }
    
    if (error) {
      console.error("[Layout] Rendering error state:", error);
      return <PortalErrorState key="error" title="Falha ao carregar portal" description={error} onRetry={onRetry} />;
    }
    
    if (!allowed) {
      console.warn("[Layout] Access denied for route:", pathname);
      return <PortalAccessRestricted key="denied" />;
    }
    
    console.log("[Layout] Rendering children content...");
    return <div key="children">{children}</div>;
  };

  return (
    <TooltipProvider delayDuration={200}>
      <div key={`portal-layout-${profileType}`} className="flex min-h-dvh w-full flex-col bg-slate-50 dark:bg-slate-900 transition-colors">
        <SkipLinks />



        <PortalHeader
          profile={profileType}
          user={user}
          permissions={permissions}
          onOpenMenu={() => setDrawerOpen(true)}
          menuOpen={drawerOpen}
          onLogout={onLogout}
          environment={environment}
        />


        <div id="portal-mobile-drawer">
          <MobileNavigationDrawer
            open={drawerOpen}
            onOpenChange={setDrawerOpen}
            profile={profileType}
            permissions={permissions}
            user={user}
            onLogout={onLogout}
          />
        </div>


        <div className="flex w-full flex-1 min-w-0">
          <PortalSidebar
            profile={profileType}
            permissions={permissions}
            collapsed={collapsed}
            onToggleCollapsed={() => setCollapsed((c) => !c)}
          />

          <div className="flex min-w-0 flex-1 flex-col">
            <main
              id="conteudo-principal"
              tabIndex={-1}
              className={cn("min-w-0 flex-1 focus:outline-none")}
            >

              <PortalPageContainer>
                <div className="hidden md:block w-full mb-6">
                  <div className="relative w-full h-[200px] overflow-hidden rounded-b-[20px] shadow-sm">
                    <img 
                      src="/images/hero-background.jpg" 
                      alt="Institucional SBPM" 
                      className="w-full h-full object-cover object-center"
                    />
                    <div className="absolute inset-0 bg-gradient-to-b from-slate-900/10 to-slate-900/20" />
                  </div>
                </div>
                {banner && <div key="portal-banner-container" className="mb-0">{banner}</div>}
                <PortalBreadcrumbs profile={profileType} />
                {pageTitle && !loading && !error && allowed && (
                  <PageHeader title={pageTitle} description={pageDescription} actions={actions} />
                )}
                {renderContent()}
              </PortalPageContainer>
            </main>
            <PortalFooter />
          </div>
        </div>

        <PortalBottomNav profile={profileType} permissions={permissions} />
        <FloatingActionsManager />
      </div>
    </TooltipProvider>

  );
}
