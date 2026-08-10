import { forwardRef, type HTMLAttributes, type ReactNode } from "react";
import { cn } from "../utilities";

export interface AuthCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * AuthCard padronizado para telas de acesso (Login, Primeiro Acesso, etc).
 * Unifica width, border-radius, blur e sombras.
 */
export const AuthCard = forwardRef<HTMLDivElement, AuthCardProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "public-auth-theme w-full max-w-[480px] border-[var(--portal-modal-border-light)] shadow-[var(--portal-modal-shadow-light)] !bg-white/95 overflow-hidden ds-animate-slide-in-up rounded-[26px]",
          className
        )}
        style={{ backdropFilter: 'blur(10px)', WebkitBackdropFilter: 'blur(10px)' }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AuthCard.displayName = "AuthCard";
