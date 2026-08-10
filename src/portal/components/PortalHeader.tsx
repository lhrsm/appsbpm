import { useState, useEffect } from "react";
import { useMobileVisualViewport } from "@/hooks/useMobileVisualViewport";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { icons } from "@/design-system/icons";
import sbpmLogo from "@/assets/sbpm-logo.jpeg";
import bannerInstitutional from "@/assets/banner-institucional.png.asset.json";
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

  // Header fixo com layout em grid conforme especificação.
  return (
    <header 
      className={cn(
        "sticky top-0 z-40 w-full shadow-sm safe-pt safe-px border-b transition-all duration-200",
        "flex items-center relative overflow-hidden",
        "h-14 md:h-[180px] lg:h-[210px] xl:h-[225px] 2xl:h-[240px]",
        "bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-50 border-gray-200 dark:border-white/10",
        "portal-institutional-header"
      )}
    >
      <div className="mx-auto flex h-full w-full max-w-[1600px] items-start md:items-center gap-2.5 px-3 md:px-6 pt-2 md:pt-0 relative z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 md:hidden flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 mt-2"
          onClick={onOpenMenu}
        >
          <Menu className="h-6 w-6 text-white md:text-inherit" aria-hidden />
          <span className="sr-only">Abrir menu</span>
        </Button>

        <div className="flex items-center gap-2 min-w-0 md:flex hidden">
          <img
            src="/sbpm.jpeg"
            alt="SBPM"
            className="h-10 w-auto shrink-0"
            onError={(e) => {
              e.currentTarget.src = "https://www.sbpmbahia.com.br/wp-content/uploads/2021/05/cropped-logo-sbpm-1-192x192.png";
            }}
          />
        </div>

        <div className="flex-1" />

        <div className="flex shrink-0 items-center gap-1.5 md:gap-3">
          <div className="hidden md:flex">
            <PortalGlobalSearch profile={profile} permissions={permissions} variant="icon" />
            <PortalNotificationCenter />
          </div>
          <PortalUserMenu profile={profile} user={user} onLogout={onLogout} />
        </div>
      </div>
    </header>


  );
}
