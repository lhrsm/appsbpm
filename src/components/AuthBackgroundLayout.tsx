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
      <div className="auth-overlay" aria-hidden="true" />
      <div className={align === "right" ? "auth-content" : "auth-content auth-content--center"}>
        {children}
      </div>
    </div>
  );
}
