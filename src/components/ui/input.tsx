import * as React from "react";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    // Tenta obter o local para aplicar estilos específicos no portal público
    let location = { pathname: "" };
    try {
      location = useLocation();
    } catch (e) {
      // Fora de um Router (ex: Storybook ou testes isolados)
    }

    const publicPortalRoutes = ["/", "/entrar", "/primeiro-acesso", "/recuperar-acesso", "/quero-me-associar", "/recuperar-senha"];
    const isPublicPortal = publicPortalRoutes.includes(location.pathname) || location.pathname.startsWith("/bem/");

    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm transition-all",
          isPublicPortal 
            ? "bg-white border-[var(--portal-modal-border-light)] text-slate-900 focus:border-green-600 focus-visible:ring-green-600/18 placeholder:text-slate-400 shadow-sm" 
            : "bg-background border-input text-foreground focus:border-primary focus-visible:ring-ring/10",
          className
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
