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

  let content: ReactNode;
  if (loading) {
    console.log("[Layout] Rendering loading skeleton...");
    content = (
      <>
        <PageHeaderSkeleton />
        <ContentSkeleton />
      </>
    );
  } else if (error) {
    console.error("[Layout] Rendering error state:", error);
    content = <PortalErrorState title="Falha ao carregar portal" description={error} onRetry={onRetry} />;
  } else if (!allowed) {
    console.warn("[Layout] Access denied for route:", pathname);
    content = <PortalAccessRestricted />;
  } else {
    console.log("[Layout] Rendering children content...");
    content = children;
  }

  return (
    <TooltipProvider delayDuration={200}>
      <div className="flex min-h-dvh w-full flex-col bg-background">
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
              className={cn("min-w-0 flex-1 focus:outline-none", "pb-bottom-nav")}
            >

              <PortalPageContainer>
                {banner}
                <PortalBreadcrumbs profile={profileType} />
                {pageTitle && !loading && !error && allowed && (
                  <PageHeader title={pageTitle} description={pageDescription} actions={actions} />
                )}
                {content}
              </PortalPageContainer>
            </main>
            <PortalFooter />
          </div>
        </div>

        <PortalBottomNav profile={profileType} permissions={permissions} />
      </div>
    </TooltipProvider>
  );
}
