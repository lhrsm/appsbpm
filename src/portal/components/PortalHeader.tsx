import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { icons } from "@/design-system/icons";
import ThemeToggle from "@/components/ThemeToggle";
import sbpmLogo from "@/assets/sbpm-logo.jpeg";
import PortalGlobalSearch from "./PortalGlobalSearch";
import PortalNotificationCenter from "./PortalNotificationCenter";
import PortalUserMenu, { type PortalUser } from "./PortalUserMenu";
import type { PortalProfile } from "../navigation";

export interface PortalHeaderProps {
  profile: PortalProfile;
  user: PortalUser;
  permissions?: string[];
  onOpenMenu: () => void;
  menuOpen: boolean;
  onLogout: () => void;
  /** Rótulo do ambiente (exibido apenas fora de produção). */
  environment?: string;
}

/** Cabeçalho fixo do portal externo. */
export default function PortalHeader({
  profile,
  user,
  permissions,
  onOpenMenu,
  menuOpen,
  onLogout,
  environment,
}: PortalHeaderProps) {
  const Menu = icons.menu;
  const Ajuda = icons.ajuda;

  return (
    <header className="sticky top-0 z-40 w-full bg-primary text-primary-foreground shadow-sm pt-[env(safe-area-inset-top)]">
      <div className="flex h-16 w-full items-center gap-2 px-3 sm:px-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={onOpenMenu}
          aria-label="Abrir menu de navegação"
          aria-expanded={menuOpen}
          aria-controls="portal-mobile-drawer"
          className="min-h-11 min-w-11 text-primary-foreground hover:bg-primary-foreground/15 md:hidden"
        >
          <Menu className="h-5 w-5" aria-hidden />
        </Button>

        <img
          src={sbpmLogo}
          alt="SBPM"
          className="h-9 w-9 shrink-0 rounded-full bg-background object-cover p-0.5"
        />
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-bold leading-tight">Portal da SBPM</p>
          <p className="truncate text-[11px] opacity-85">
            {profile === "dependent" ? "Portal do Dependente" : "Portal do Associado"}
          </p>
        </div>
        {environment && (
          <Badge variant="secondary" className="hidden text-[10px] uppercase sm:inline-flex">
            {environment}
          </Badge>
        )}

        <div className="mx-2 hidden flex-1 justify-center lg:flex">
          <PortalGlobalSearch profile={profile} permissions={permissions} variant="bar" />
        </div>
        <div className="ml-auto flex items-center gap-0.5 lg:ml-0">
          <PortalGlobalSearch profile={profile} permissions={permissions} variant="icon" />
          <PortalNotificationCenter />
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="hidden min-h-11 min-w-11 text-primary-foreground hover:bg-primary-foreground/15 sm:inline-flex"
            aria-label="Central de ajuda"
          >
            <a href="/dashboard/faq">
              <Ajuda className="h-5 w-5" aria-hidden />
            </a>
          </Button>
          <ThemeToggle className="hidden min-h-11 min-w-11 text-primary-foreground hover:bg-primary-foreground/15 sm:inline-flex" />
          <PortalUserMenu profile={profile} user={user} onLogout={onLogout} />
        </div>
      </div>
    </header>
  );
}
