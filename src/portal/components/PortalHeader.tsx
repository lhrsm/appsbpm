import { useState, useEffect } from "react";
import { useMobileVisualViewport } from "@/hooks/useMobileVisualViewport";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { icons } from "@/design-system/icons";
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

  // Removido isKeyboardOpen pois o header deve ser fixo conforme especificação.
  return (
    <header className={cn(
      "sticky top-0 z-40 w-full shadow-sm safe-pt safe-px border-b transition-all duration-200",
      "bg-[hsl(var(--header-bg))] text-foreground border-border",
      "h-14 md:h-16"
    )}>
      <div className="mx-auto flex h-full w-full max-w-[1400px] items-center gap-2.5 px-3 md:px-6 lg:px-8 xl:px-10 2xl:max-w-[1600px] 2xl:px-12 3xl:max-w-portal-ultrawide">
        <Button
          asChild
          variant="ghost"
          size="icon"
          className="min-h-11 min-w-11 shrink-0 text-inherit hover:bg-accent hover:text-accent-foreground md:hidden"
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
...


        <div className="flex items-center gap-2 min-w-0 flex-1">
          <img
            src={sbpmLogo}
            alt="SBPM"
            className="h-8 w-8 shrink-0 rounded-full object-cover"
          />
          <div className="min-w-0 hidden xs:block">
            <p className="truncate text-sm font-bold leading-tight">Portal da SBPM</p>
            <p className="truncate text-[10px] opacity-85 hidden sm:block">
              {profile === "dependent" ? "Portal do Dependente" : "Portal do Associado"}
            </p>
          </div>
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
        </div>
      </div>
    </header>

  );
}
