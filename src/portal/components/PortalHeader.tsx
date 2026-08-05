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
        "sticky top-0 z-40 w-full shadow-sm safe-pt safe-px border-b transition-all duration-200 overflow-hidden",
        "h-14 md:h-20 lg:h-24 flex items-center relative",
        "bg-white dark:bg-slate-900 text-gray-900 dark:text-slate-50 border-gray-200 dark:border-white/10"
      )}
    >
      {/* Background Image with Overlay - Only on Desktop/Ultrawide */}
      <div 
        className="absolute inset-0 z-0 pointer-events-none opacity-0 md:opacity-90 transition-opacity duration-300"
        style={{
          backgroundImage: `url(${bannerInstitutional.url})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 35%',
        }}
      >
        <div className="absolute inset-0 bg-white/40 dark:bg-slate-900/60 backdrop-blur-[2px]" />
      </div>

      {/* Mobile background fallback */}
      <div className="absolute inset-0 z-0 md:hidden bg-white/96 dark:bg-slate-900/96" />

      <div className="mx-auto flex h-full w-full max-w-[1400px] items-center gap-2.5 px-3 md:px-6 lg:px-8 xl:px-10 2xl:max-w-[1600px] 2xl:px-12 3xl:max-w-portal-ultrawide relative z-10">
        <Button
          variant="ghost"
          size="icon"
          className="h-11 w-11 shrink-0 text-inherit hover:bg-accent hover:text-accent-foreground md:hidden"
          onClick={onOpenMenu}
        >
          <Menu className="h-5 w-5" aria-hidden />
          <span className="sr-only">Abrir menu</span>
        </Button>
...


        <div className="flex items-center gap-2 min-w-0">
          <img
            src="/sbpm.jpeg"
            alt="SBPM"
            className="h-10 w-auto md:h-11 shrink-0"
            onError={(e) => {
              e.currentTarget.src = "https://www.sbpmbahia.com.br/wp-content/uploads/2021/05/cropped-logo-sbpm-1-192x192.png";
            }}
          />
          <div className="min-w-0 hidden xs:block">
            <p className="truncate text-sm font-bold leading-tight md:text-base">Portal da SBPM</p>
            <p className="truncate text-[10px] opacity-85 md:text-[11px]">
              {profile === "dependent" ? "Portal do Dependente" : "Portal do Associado"}
            </p>
          </div>
        </div>
        <div className="flex-1" />
        {environment && (
          <Badge variant="secondary" className="hidden text-[10px] uppercase md:inline-flex">
            {environment}
          </Badge>
        )}

        <div className="mx-2 hidden min-w-0 flex-1 justify-center lg:flex">
          <PortalGlobalSearch profile={profile} permissions={permissions} variant="bar" />
        </div>
        <div className="ml-auto flex shrink-0 items-center gap-1 lg:ml-0">
          <PortalGlobalSearch profile={profile} permissions={permissions} variant="icon" />
          <PortalNotificationCenter />
          <PortalUserMenu profile={profile} user={user} onLogout={onLogout} />
        </div>
      </div>
    </header>

  );
}
