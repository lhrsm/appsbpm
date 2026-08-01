import type { ReactNode } from "react";
import { cn } from "../utilities";
import { Container } from "../components/Grid";

export interface AppShellProps {
  header?: ReactNode;
  sidebar?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  /** Largura máxima do conteúdo. */
  width?: "narrow" | "laptop" | "desktop" | "full";
  className?: string;
}

/**
 * Shell base compartilhado por todos os layouts (Header + Sidebar + Content + Footer).
 * Renderiza exatamente um `<main>` por página (WCAG landmarks).
 *
 * @example <AppShell header={<Topo />} sidebar={<Menu />}>{conteudo}</AppShell>
 */
export function AppShell({ header, sidebar, footer, children, width = "desktop", className }: AppShellProps) {
  return (
    <div className={cn("flex min-h-dvh w-full flex-col bg-background", className)}>
      {header}
      <div className="flex flex-1 min-w-0">
        {sidebar}
        <main id="conteudo-principal" className="flex-1 min-w-0 py-6">
          <Container width={width}>{children}</Container>
        </main>
      </div>
      {footer}
    </div>
  );
}

/** Layout do Portal do Associado/Dependente. */
export function PortalLayout(props: AppShellProps) {
  return <AppShell width="laptop" {...props} />;
}

/** Layout de painéis analíticos (largura máxima ampla). */
export function DashboardLayout(props: AppShellProps) {
  return <AppShell width="desktop" {...props} />;
}

/** Layout administrativo (sidebar fixa + conteúdo fluido). */
export function AdminShellLayout(props: AppShellProps) {
  return <AppShell width="full" {...props} />;
}

/** Layout público institucional (sem sidebar). */
export function PublicLayout({ sidebar: _sidebar, ...props }: AppShellProps) {
  return <AppShell width="laptop" {...props} />;
}

export interface AuthenticationLayoutProps {
  children: ReactNode;
  /** Marca/identidade exibida acima do cartão. */
  brand?: ReactNode;
  footer?: ReactNode;
  className?: string;
}

/**
 * Layout de autenticação (login, primeiro acesso, recuperação).
 * Cartão centralizado, responsivo e com `<main>` único.
 */
export function AuthenticationLayout({ children, brand, footer, className }: AuthenticationLayoutProps) {
  return (
    <div className={cn("flex min-h-dvh w-full flex-col items-center justify-center bg-background px-4 py-8", className)}>
      <main className="w-full max-w-md space-y-6">
        {brand && <div className="flex justify-center">{brand}</div>}
        {children}
      </main>
      {footer && <footer className="pt-6 text-center text-xs text-muted-foreground">{footer}</footer>}
    </div>
  );
}
