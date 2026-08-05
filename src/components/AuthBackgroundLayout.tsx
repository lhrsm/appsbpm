import { ReactNode, useEffect } from "react";
import { cn } from "@/lib/utils";
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
      <div className={cn(
        "relative z-10 w-full min-h-dvh overflow-x-hidden flex",
        align === "right" ? "justify-end" : "justify-center"
      )}>
        <div className={cn(
          "w-full flex flex-col items-center",
          align === "right" && "desktop-align-right"
        )}>
          {children}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 1280px) {
          .desktop-align-right {
            position: absolute !important;
            top: 50% !important;
            right: clamp(80px, 8vw, 180px) !important;
            left: auto !important;
            transform: translateY(-50%) !important;
            width: clamp(520px, 34vw, 590px) !important;
            align-items: center !important;
            padding-right: 0 !important;
            display: flex !important;
            flex-direction: column !important;
          }
        }
      `}} />
    </div>
  );
}
