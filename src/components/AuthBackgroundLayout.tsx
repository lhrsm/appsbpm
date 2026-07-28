import { ReactNode } from "react";
import "./auth-background.css";

interface AuthBackgroundLayoutProps {
  children: ReactNode;
  /** Alinha o card à direita em telas grandes (padrão) ou sempre centralizado */
  align?: "right" | "center";
}

export default function AuthBackgroundLayout({ children, align = "right" }: AuthBackgroundLayoutProps) {
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
