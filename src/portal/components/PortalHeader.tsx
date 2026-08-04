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

/** Cabeçalho fixo do portal externo (compacto no mobile e em landscape). */
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
    <header className="sticky top-0 z-40 w-full bg-header text-primary-foreground shadow-sm safe-pt safe-px">
      <div className="mx-auto flex h-14 w-full max-w-[1400px] items-center gap-2 px-3 md:h-16 md:px-6 lg:px-8 xl:px-10 2xl:max-w-[1600px] 2xl:px-12 3xl:max-w-portal-ultrawide landscape-compact">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="min-h-11 min-w-11 shrink-0 text-primary-foreground hover:bg-primary-foreground/15 md:hidden"
          onClick={onOpenMenu}
        >
          <button
            type="button"
            aria-label="Abrir menu de navegação"
            aria-expanded={menuOpen}
            aria-controls="portal-mobile-drawer"
          >
            <Menu className="h-5 w-5" aria-hidden />
          </button>
        </Button>

        <img
          src={sbpmLogo}
          alt="SBPM"
          width={36}
          height={36}
          className="h-8 w-8 shrink-0 rounded-full bg-background object-cover p-0.5 md:h-9 md:w-9"
        />
        <div className="hidden min-w-0 sm:block">
          <p className="truncate text-sm font-bold leading-tight">Portal da SBPM</p>
          <p className="truncate text-[11px] opacity-85 landscape-hide">
            {profile === "dependent" ? "Portal do Dependente" : "Portal do Associado"}
          </p>
        </div>
        {environment && (
          <Badge variant="secondary" className="hidden text-[10px] uppercase md:inline-flex">
            {environment}
          </Badge>
        )}

        <div className="mx-2 hidden min-w-0 flex-1 justify-center lg:flex">
          <PortalGlobalSearch profile={profile} permissions={permissions} variant="bar" />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-0.5 lg:ml-0">
          <PortalGlobalSearch profile={profile} permissions={permissions} variant="icon" />
          <PortalNotificationCenter />
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="hidden min-h-11 min-w-11 text-primary-foreground hover:bg-primary-foreground/15 md:inline-flex"
            aria-label="Central de ajuda"
          >
            <a href="/dashboard/faq">
              <Ajuda className="h-5 w-5" aria-hidden />
            </a>
          </Button>
          <ThemeToggle className="hidden min-h-11 min-w-11 text-primary-foreground hover:bg-primary-foreground/15 md:inline-flex" />
          <PortalUserMenu profile={profile} user={user} onLogout={onLogout} />
        </div>
      </div>
    </header>
  );
}
