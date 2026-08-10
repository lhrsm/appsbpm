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
          "auth-card w-full max-w-[440px] border-0 animate-fade-in shadow-xl overflow-hidden p-0 flex flex-col bg-white/95 backdrop-blur-[12px] rounded-[26px]",
          className
        )}
        {...props}
      >
        {children}
      </div>
    );
  }
);

AuthCard.displayName = "AuthCard";
