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
  /** Indica se está na rota de dashboard para exibir background institucional. */
  isDashboard?: boolean;
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
  isDashboard,
}: PortalHeaderProps) {
  const Menu = icons.menu;

  // Header fixo com layout em grid conforme especificação.
  return (
    <header 
      className={cn(
        "sticky top-0 z-40 w-full transition-all duration-300 border-b",
        "flex items-center relative overflow-hidden",
        isDashboard 
          ? "h-[190px] md:h-[205px] 2xl:h-[220px] rounded-b-[24px] shadow-lg border-none" 
          : "h-14 md:h-16 shadow-sm bg-white dark:bg-slate-900 border-gray-200 dark:border-white/10",
        "data-[ui-version=sbpm-mobile-header-v6]"
      )}
      data-ui-version="sbpm-mobile-header-v6"
    >
      {/* Background Institucional Panorâmico (Somente Desktop Dashboard) */}
      {isDashboard && (
        <div className="absolute inset-0 z-0 hidden lg:block">
          <img 
            src="/images/hero-background.jpg" 
            alt="" 
            className="h-full w-full object-cover object-[center_38%]"
          />
          {/* Overlay suave para melhorar contraste */}
          <div className="absolute inset-0 bg-slate-900/10 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/5 pointer-events-none" />
        </div>
      )}

      <div className={cn(
        "mx-auto flex h-full w-full max-w-[1600px] gap-2.5 px-3 md:px-6 relative z-10",
        isDashboard ? "items-start pt-6" : "items-center"
      )}>

        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10 shrink-0 md:hidden flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20 mt-2"
          onClick={onOpenMenu}
        >
          <Menu className="h-6 w-6 text-white" aria-hidden />
          <span className="sr-only">Abrir menu</span>
        </Button>


        <div className={cn(
          "flex items-center gap-2.5 min-w-0 md:flex hidden",
          isDashboard 
            ? "lg:absolute lg:left-8 lg:top-6 2xl:left-10 2xl:top-7" 
            : "bg-white/78 backdrop-blur-md rounded-[10px] px-3 py-2 border border-white/40 shadow-sm"
        )}>
          <img
            src="/sbpm-logo-transparent.png"
            alt="SBPM"
            className={cn(
              "shrink-0",
              isDashboard ? "h-[50px] 2xl:h-[58px] w-auto" : "h-9 w-auto"
            )}
            onError={(e) => {
              e.currentTarget.src = "/sbpm-logo.jpeg";
            }}
          />
          {isDashboard && (
            <div className="flex flex-col leading-[1.15] text-white" style={{ textShadow: '0 1px 3px rgba(0,0,0,0.35)' }}>
              <span className="text-[16px] font-bold">Portal da SBPM</span>
              <span className="text-[11px] font-medium text-white/82">Portal do Associado</span>
            </div>
          )}
        </div>


        <div className="flex-1" />

        <div className="flex shrink-0 items-center gap-1.5 md:gap-4 w-full md:w-auto justify-end">
          <div className={cn(
            "hidden md:flex items-center gap-3",
            !isDashboard && "rounded-full px-2 py-1 border shadow-sm bg-slate-50/80 backdrop-blur-md border-slate-200"
          )}>
            <PortalGlobalSearch profile={profile} permissions={permissions} variant="icon" />
            {!isDashboard && <div className="w-[1px] h-4 mx-1 bg-slate-200" />}
            <PortalNotificationCenter />
          </div>

          <div className="flex items-center gap-2 md:block">
             <div className="md:hidden flex items-center gap-2 bg-white/10 backdrop-blur-md rounded-full px-2 py-1 border border-white/20 mr-1">
                <PortalNotificationCenter />
             </div>
             <PortalUserMenu profile={profile} user={user} onLogout={onLogout} />
          </div>
        </div>

      </div>
    </header>



  );
}
