import { Link, useLocation } from "react-router-dom";

import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { icons } from "@/design-system/icons";
import { getNavigationSections, type PortalNavItem, type PortalProfile } from "../navigation";
import { isItemActive } from "./PortalSidebar";
import { primeiroNome } from "../mask";
import type { PortalUser } from "./PortalUserMenu";
import PortalNotificationCenter from "./PortalNotificationCenter";
import { cn } from "@/lib/utils";

/** Sub-componente para links da sidebar no drawer mobile com suporte a cores customizadas. */
function MobileDrawerLink({
  item,
  onNavigate,
}: {
  item: PortalNavItem;
  onNavigate?: () => void;
}) {
  const { pathname } = useLocation();
  const active = isItemActive(item.route, pathname);
  const Icon = item.icon;

  return (
    <Link
      to={item.route}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
        active
          ? "bg-white/10 font-semibold text-white"
          : "text-slate-300 hover:bg-white/5 hover:text-white"
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-[var(--green-main)]" aria-hidden />
      )}
      <Icon className={cn("h-5 w-5 shrink-0", active ? "text-[var(--green-main)]" : "text-slate-400")} aria-hidden />
      <span className="truncate">{item.label}</span>
      {!!item.badge && (
        <span className="ml-auto rounded-full bg-[var(--green-main)] px-2 py-0.5 text-[10px] font-bold text-white">
          {item.badge}
        </span>
      )}
    </Link>
  );
}

export interface MobileNavigationDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  profile: PortalProfile;
  permissions?: string[];
  user: PortalUser;
  /** Ação de sair exibida no rodapé do menu. */
  onLogout?: () => void;
}


/**
 * Menu em drawer para tablet/mobile.
 * Radix garante focus trap, fechamento por Escape e devolução do foco ao gatilho.
 */
export default function MobileNavigationDrawer({
  open,
  onOpenChange,
  profile,
  permissions,
  user,
  onLogout,
}: MobileNavigationDrawerProps) {
  const sections = getNavigationSections({ profile, permissions });
  const iniciais = primeiroNome(user.nome).slice(0, 2).toUpperCase() || "SB";
  const Ajuda = icons.ajuda;
  const Sair = icons.sair;


  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="flex w-[86vw] max-w-xs flex-col gap-0 p-0 pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] border-none shadow-[0_16px_38px_rgba(15,23,42,0.40)] bg-[#0f172a] dark:bg-[#0f172a] h-[calc(100dvh-var(--mobile-header-height))] mt-[var(--mobile-header-height)]"
      >
        <SheetHeader className="border-b border-white/10 p-5 text-left bg-transparent">
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <div className="flex items-center gap-4">
            <Avatar className="h-12 w-12 border-2 border-[var(--green-main)]">
              {user.fotoUrl && <AvatarImage src={user.fotoUrl} alt="" />}
              <AvatarFallback className="text-sm font-bold bg-[var(--green-light)] text-[var(--green-dark)]">{iniciais}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-lg font-bold text-white leading-tight">{user.nome}</p>
              <p className="truncate text-sm font-medium text-slate-400 mt-0.5">
                {profile === "dependent"
                  ? `Dependente • ${user.titularNome}`
                  : `Associado • Titular`}
              </p>
            </div>
            <PortalNotificationCenter />
          </div>
        </SheetHeader>

        <nav className="min-h-0 flex-1 overflow-y-auto p-2" aria-label="Menu principal">
          {sections.map((section) => (
            <div key={section.id} className="mb-3">
              <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {section.section}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <MobileDrawerLink 
                      item={item} 
                      onNavigate={() => onOpenChange(false)} 
                    />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t border-white/10 p-2 bg-[#0f172a]">
          <Link
            to="/dashboard/faq"
            onClick={() => onOpenChange(false)}
            className="flex min-h-11 items-center gap-2 rounded-md px-3 text-sm text-slate-400 transition hover:bg-white/5 hover:text-white"
          >
            <Ajuda className="h-4 w-4" aria-hidden />
            Ajuda e suporte
          </Link>

          {onLogout && (
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onLogout();
              }}
              className="flex min-h-11 w-full items-center gap-2 rounded-md px-3 text-sm text-red-400 transition hover:bg-red-400/10"
            >
              <Sair className="h-4 w-4" aria-hidden />
              Sair da conta
            </button>
          )}
        </div>
      </SheetContent>

    </Sheet>
  );
}