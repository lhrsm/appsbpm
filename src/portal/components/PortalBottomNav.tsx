import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { getNavigationItems, bottomNavIds, type PortalProfile } from "../navigation";
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
  const items = getNavigationItems({ profile, permissions })
    .filter((i) => bottomNavIds.includes(i.id))
    .sort((a, b) => bottomNavIds.indexOf(a.id) - bottomNavIds.indexOf(b.id))
    .slice(0, 5);

  if (items.length < 2) return null;

  return (
    <nav
      aria-label="Navegação rápida"
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
    >
      <ul className="flex items-stretch">
        {items.map((item) => {
          const active = isItemActive(item.route, pathname);
          const Icon = item.icon;
          return (
            <li key={item.id} className="flex-1">
              <NavLink
                to={item.route}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex min-h-[56px] flex-col items-center justify-center gap-0.5 px-1 py-1.5 text-[10px] transition-colors",
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring",
                  active ? "font-semibold text-primary" : "text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" aria-hidden />
                <span className="w-full truncate text-center leading-tight">{item.label.split(" ")[0]}</span>
                {active && <span className="h-0.5 w-6 rounded-full bg-primary" aria-hidden />}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
