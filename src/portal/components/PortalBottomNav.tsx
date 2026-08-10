import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useViewport } from "@/design-system/hooks";
import { getNavigationItems, bottomNavIdsByProfile, type PortalProfile } from "../navigation";
import { isItemActive } from "./PortalSidebar";

/** Navegação inferior (mobile/PWA) com até cinco atalhos principais. */
export default function PortalBottomNav({
  profile,
  permissions,
}: {
  profile: PortalProfile;
  permissions?: string[];
}) {
  const { pathname } = useLocation();
   const { keyboardOpen } = useViewport();
  const ordem = bottomNavIdsByProfile[profile];
  const items = getNavigationItems({ profile, permissions })
    .filter((i) => ordem.includes(i.id))
    .sort((a, b) => ordem.indexOf(a.id) - ordem.indexOf(b.id))
    .slice(0, 5);

  // Com o teclado virtual aberto, a barra roubaria espaço do formulário.
  if (items.length < 2 || keyboardOpen) return null;

  return (
    <nav
      aria-label="Navegação rápida"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-[hsl(var(--bottom-nav-bg))] border-border pb-[env(safe-area-inset-bottom)] backdrop-blur safe-px md:hidden h-[var(--bottom-navigation-height,72px)] flex items-center justify-around px-2"
    >

      <ul className="flex items-stretch w-full">
        {items.map((item) => {
          const active = isItemActive(item.route, pathname);
          const Icon = item.icon;
          return (
            <li key={item.id} className="min-w-0 flex-1">
              <NavLink
                to={item.route}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-full flex-col items-center justify-center gap-1 px-1 py-1 transition-all duration-200",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                  active 
                    ? "font-bold text-[var(--green-main)] scale-110" 
                    : "text-slate-500 font-medium opacity-80",
                )}
              >
                <Icon className={cn("h-6 w-6 shrink-0 transition-transform", active && "animate-in zoom-in-75")} aria-hidden />
                <span className="w-full truncate text-center text-[10px] uppercase tracking-tighter leading-none">{item.label.split(" ")[0]}</span>
                {active && <span className="absolute bottom-1 h-1 w-5 rounded-full bg-[var(--green-main)] shadow-[0_0_8px_rgba(22,138,73,0.3)]" aria-hidden />}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

