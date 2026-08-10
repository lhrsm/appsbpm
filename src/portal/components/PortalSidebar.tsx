import { NavLink, useLocation } from "react-router-dom";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { icons } from "@/design-system/icons";
import { getNavigationSections, type PortalNavItem, type PortalProfile } from "../navigation";

export interface PortalSidebarProps {
  profile: PortalProfile;
  permissions?: string[];
  collapsed: boolean;
  onToggleCollapsed: () => void;
  className?: string;
}

export function isItemActive(route: string, pathname: string) {
  const base = route.split("#")[0];
  if (base === "/dashboard") return pathname === "/dashboard";
  return pathname === base || pathname.startsWith(`${base}/`);
}

export function SidebarLink({
  item,
  collapsed,
  onNavigate,
}: {
  item: PortalNavItem;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const { pathname } = useLocation();
  const active = isItemActive(item.route, pathname);
  const Icon = item.icon;

  const link = (
    <NavLink
      to={item.route}
      onClick={onNavigate}
      aria-current={active ? "page" : undefined}
      className={cn(
        "relative flex min-h-11 items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        active
          ? "bg-primary/10 font-semibold text-primary"
          : "text-foreground/80 hover:bg-muted hover:text-foreground",
        collapsed && "justify-center px-0"
      )}
    >
      {active && (
        <span className="absolute left-0 top-1/2 h-6 w-1 -translate-y-1/2 rounded-r bg-primary" aria-hidden />
      )}
      <Icon className="h-5 w-5 shrink-0" aria-hidden />
      {!collapsed && <span className="truncate">{item.label}</span>}
      {!collapsed && !!item.badge && (
        <span className="ml-auto rounded-full bg-primary px-2 py-0.5 text-[10px] font-bold text-primary-foreground">
          {item.badge}
        </span>
      )}
      {collapsed && <span className="sr-only">{item.label}</span>}
    </NavLink>
  );

  if (!collapsed) return link;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{item.label}</TooltipContent>
    </Tooltip>
  );
}

/** Sidebar do portal externo, montada a partir da configuração central. */
export default function PortalSidebar({ profile, permissions, collapsed, onToggleCollapsed, className }: PortalSidebarProps) {
  const sections = getNavigationSections({ profile, permissions });
  const Recolher = collapsed ? icons.proximo : icons.anterior;

  return (
    <aside
      className={cn(
        "sticky top-16 hidden h-[calc(100dvh-4rem)] shrink-0 border-r bg-white md:flex md:flex-col",
        collapsed ? "w-[72px]" : "w-64",
        "transition-[width] duration-200 motion-reduce:transition-none",
        className
      )}
      aria-label="Menu principal"
    >
      <nav id="navegacao-principal" aria-label="Navegação principal" className="flex-1 overflow-y-auto overflow-x-hidden p-2">
        {sections.map((section) => (
          <div key={section.id} className="mb-3">
            {!collapsed && (
              <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {section.section}
              </p>
            )}
            {collapsed && <div className="mx-3 my-2 border-t" aria-hidden />}
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.id}>
                  <SidebarLink item={item} collapsed={collapsed} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t p-2">
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggleCollapsed}
          className="w-full justify-center gap-2"
          aria-label={collapsed ? "Expandir menu lateral" : "Recolher menu lateral"}
          aria-expanded={!collapsed}
        >
          <Recolher className="h-4 w-4" aria-hidden />
          {!collapsed && <span>Recolher</span>}
        </Button>
      </div>
    </aside>
  );
}
