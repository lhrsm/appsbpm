import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { icons } from "@/design-system/icons";
import { getNavigationSections, type PortalProfile } from "../navigation";
import { SidebarLink } from "./PortalSidebar";
import { maskMatricula, maskNome, primeiroNome } from "../mask";
import type { PortalUser } from "./PortalUserMenu";

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
}: MobileNavigationDrawerProps) {
  const sections = getNavigationSections({ profile, permissions });
  const iniciais = primeiroNome(user.nome).slice(0, 2).toUpperCase() || "SB";

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="left"
        className="flex w-[86vw] max-w-xs flex-col gap-0 p-0 pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] pt-[env(safe-area-inset-top)]"
      >
        <SheetHeader className="border-b p-4 text-left">
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {user.fotoUrl && <AvatarImage src={user.fotoUrl} alt="" />}
              <AvatarFallback className="text-xs">{iniciais}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold">{primeiroNome(user.nome)}</p>
              <p className="truncate text-xs text-muted-foreground">
                {profile === "dependent"
                  ? `Dependente de ${maskNome(user.titularNome)}`
                  : `Matrícula ${maskMatricula(user.matricula)}`}
              </p>
            </div>
          </div>
        </SheetHeader>

        <nav className="min-h-0 flex-1 overflow-y-auto p-2" aria-label="Menu principal">
          {sections.map((section) => (
            <div key={section.id} className="mb-3">
              <p className="px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                {section.section}
              </p>
              <ul className="space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.id}>
                    <SidebarLink item={item} onNavigate={() => onOpenChange(false)} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        <div className="shrink-0 border-t p-2">
          <a
            href="/dashboard/faq"
            onClick={() => onOpenChange(false)}
            className="flex min-h-11 items-center gap-2 rounded-md px-3 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground"
          >
            <Ajuda className="h-4 w-4" aria-hidden />
            Ajuda e suporte
          </a>
          {onLogout && (
            <button
              type="button"
              onClick={() => {
                onOpenChange(false);
                onLogout();
              }}
              className="flex min-h-11 w-full items-center gap-2 rounded-md px-3 text-sm text-destructive transition hover:bg-destructive/10"
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
