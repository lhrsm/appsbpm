import { ReactNode, useEffect } from "react";
import "./auth-background.css";

interface AuthBackgroundLayoutProps {
  children: ReactNode;
  /** Alinha o card à direita em telas grandes (padrão) ou sempre centralizado */
  align?: "right" | "center";
}

export default function AuthBackgroundLayout({ children, align = "right" }: AuthBackgroundLayoutProps) {
  useEffect(() => {
    document.body.classList.add("public-portal-root");
    return () => {
      document.body.classList.remove("public-portal-root");
    };
  }, []);

  return (
    <div className="auth-page">
      <div className="auth-background" aria-hidden="true" />
      <div className="auth-overlay" style={{ background: "var(--portal-modal-overlay-light)", backdropFilter: "none", WebkitBackdropFilter: "none" }} aria-hidden="true" />
      <div className="relative z-10 w-full min-h-dvh overflow-x-hidden">
        {children}
      </div>
    </div>
  );
}
