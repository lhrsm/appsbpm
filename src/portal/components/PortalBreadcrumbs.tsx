import { Link, useLocation, useNavigate } from "react-router-dom";
import { icons } from "@/design-system/icons";
import { getRouteLabel, type PortalProfile } from "../navigation";

/** Trilha de navegação automática do portal externo. */
export default function PortalBreadcrumbs({ profile }: { profile?: PortalProfile }) {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const Sep = icons.proximo;
  const Voltar = icons.anterior;

  const parts = pathname.split("/").filter(Boolean);
  if (parts.length <= 1) return null;

  const crumbs = parts.map((_, i) => {
    const to = "/" + parts.slice(0, i + 1).join("/");
    return { to, label: getRouteLabel(to) ?? (to === "/dashboard" ? "Início" : parts[i]) };
  });

  const atual = crumbs[crumbs.length - 1];
  const anterior = crumbs[crumbs.length - 2];

  return (
    <>
      {/* Mobile: apenas o retorno à página anterior */}
      <button
        type="button"
        onClick={() => navigate(anterior?.to ?? "/dashboard")}
        className="flex min-h-11 items-center gap-1 text-sm text-muted-foreground transition hover:text-foreground sm:hidden"
      >
        <Voltar className="h-4 w-4" aria-hidden />
        Voltar para {anterior?.label ?? "Início"}
      </button>

      <nav aria-label="Trilha de navegação" className="hidden sm:block">
        <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
          {crumbs.map((c, i) => {
            const last = i === crumbs.length - 1;
            return (
              <li key={c.to} className="flex max-w-[16rem] items-center gap-1">
                {last ? (
                  <span aria-current="page" className="truncate font-medium text-foreground">
                    {atual.label}
                  </span>
                ) : (
                  <>
                    <Link to={c.to} className="truncate transition hover:text-foreground hover:underline">
                      {c.label}
                    </Link>
                    <Sep className="h-3.5 w-3.5 shrink-0" aria-hidden />
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}
