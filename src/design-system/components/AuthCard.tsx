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
          "public-auth-theme w-full border-[var(--portal-modal-border-light)] shadow-[var(--portal-modal-shadow-light)] !bg-[var(--portal-modal-bg-light)] overflow-hidden ds-animate-slide-in-up rounded-[var(--portal-modal-radius)] mx-auto xl:max-w-none",
          className
        )}
        style={{ 
          backdropFilter: 'blur(var(--portal-modal-blur)) saturate(115%)', 
          WebkitBackdropFilter: 'blur(var(--portal-modal-blur)) saturate(115%)', 
          boxSizing: 'border-box' 
        }}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AuthCard.displayName = "AuthCard";
