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
          "flex items-center gap-2 min-w-0 md:flex hidden",
          isDashboard && "bg-white/78 backdrop-blur-md rounded-[10px] px-3 py-2 border border-white/40 shadow-sm"
        )}>
          <img
            src="/sbpm-logo.jpeg"
            alt="SBPM"
            className="h-9 w-auto shrink-0"
            onError={(e) => {
              e.currentTarget.src = "https://www.sbpmbahia.com.br/wp-content/uploads/2021/05/cropped-logo-sbpm-1-192x192.png";
            }}
          />
          {isDashboard && (
            <div className="flex flex-col leading-none">
              <span className="text-[12px] font-bold text-[#172033]">Portal da SBPM</span>
              <span className="text-[10px] font-medium text-slate-500">Associado</span>
            </div>
          )}
        </div>


        <div className="flex-1" />

        <div className="flex shrink-0 items-center gap-1.5 md:gap-4 w-full md:w-auto justify-end">
          <div className={cn(
            "hidden md:flex items-center gap-2 rounded-full px-2 py-1 border shadow-sm",
            isDashboard 
              ? "bg-white/88 backdrop-blur-md border-white/40" 
              : "bg-slate-50/80 backdrop-blur-md border-slate-200"
          )}>
            <PortalGlobalSearch profile={profile} permissions={permissions} variant="icon" />
            <div className={cn("w-[1px] h-4 mx-1", isDashboard ? "bg-white/40" : "bg-slate-200")} />
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
