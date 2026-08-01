import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { cn } from "../utilities";
import { icons, type LucideIcon } from "../icons";
import { Text } from "./Text";

export interface Crumb {
  label: string;
  to?: string;
}

/**
 * Trilha de navegação acessível.
 * @example <Breadcrumb items={[{ label: "Início", to: "/" }, { label: "Informes" }]} />
 */
export function Breadcrumb({ items, className }: { items: Crumb[]; className?: string }) {
  const Sep = icons.proximo;
  return (
    <nav aria-label="Trilha de navegação" className={className}>
      <ol className="flex flex-wrap items-center gap-1 text-xs text-muted-foreground">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={`${item.label}-${i}`} className="flex items-center gap-1">
              {item.to && !last ? (
                <Link to={item.to} className="hover:text-foreground hover:underline">
                  {item.label}
                </Link>
              ) : (
                <span aria-current={last ? "page" : undefined} className={cn(last && "font-medium text-foreground")}>
                  {item.label}
                </span>
              )}
              {!last && <Sep className="h-3 w-3" aria-hidden />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export interface PageHeaderProps {
  title: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  breadcrumb?: Crumb[];
  /** Ações à direita (botões). */
  actions?: ReactNode;
  className?: string;
}

/**
 * Cabeçalho padrão de página.
 * @example <PageHeader title="Informes" description="Rendimentos por ano" actions={<Button>Exportar</Button>} />
 */
export function PageHeader({ title, description, icon: Icon, breadcrumb, actions, className }: PageHeaderProps) {
  return (
    <header className={cn("space-y-3", className)}>
      {breadcrumb && <Breadcrumb items={breadcrumb} />}
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3 min-w-0">
          {Icon && (
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10" aria-hidden>
              <Icon className="h-5 w-5 text-primary" />
            </span>
          )}
          <div className="min-w-0">
            <Text variant="h2" as="h1">{title}</Text>
            {description && <Text variant="small" className="text-muted-foreground">{description}</Text>}
          </div>
        </div>
        {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
      </div>
    </header>
  );
}

/**
 * Cabeçalho de seção interna.
 * @example <SectionHeader title="Dependentes" actions={<Button size="sm">Adicionar</Button>} />
 */
export function SectionHeader({
  title,
  description,
  icon: Icon,
  actions,
  className,
}: Omit<PageHeaderProps, "breadcrumb">) {
  return (
    <div className={cn("flex flex-wrap items-center justify-between gap-2 border-b pb-3", className)}>
      <div className="flex items-center gap-2 min-w-0">
        {Icon && <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />}
        <div className="min-w-0">
          <Text variant="h5" as="h2">{title}</Text>
          {description && <Text variant="caption">{description}</Text>}
        </div>
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
