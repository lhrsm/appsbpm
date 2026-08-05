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
      
      {/* Container Principal */}
      <div className={cn(
        "relative z-10 w-full min-h-dvh flex",
        align === "center" ? "justify-center items-center" : "desktop-grid-layout"
      )}>
        {align === "right" && <div className="hidden xl:block" aria-hidden="true" />}
        
        <div className={cn(
          "w-full flex flex-col items-center",
          align === "right" ? "desktop-auth-column" : "max-w-md mx-auto"
        )}>
          {children}
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @media (min-width: 1280px) {
          .public-portal-root {
            overflow: auto !important;
            height: 100dvh !important;
            max-width: 100% !important;
          }
          
          .auth-page {
            height: 100dvh !important;
            overflow: auto !important;
            width: 100% !important;
            max-width: 100% !important;
            display: block !important;
          }

          .desktop-grid-layout {
            display: grid !important;
            grid-template-columns: 55% 45% !important;
            width: 100% !important;
            min-height: 100dvh !important;
            height: auto !important;
            overflow: visible !important;
          }

          .desktop-auth-column {
            min-height: 100dvh !important;
            height: auto !important;
            display: flex !important;
            flex-direction: column !important;
            justify-content: center !important;
            align-items: center !important;
            padding-right: 6vw !important;
            padding-block: 40px !important;
            width: 100% !important;
            overflow: visible !important;
          }

          .desktop-auth-column .pwa-modal-page {
            display: flex !important;
            align-items: center !important;
            justify-content: center !important;
            min-height: auto !important;
            height: auto !important;
            overflow: visible !important;
            transform: translateY(20px) !important;
            background: transparent !important;
          }

          .desktop-auth-column .pwa-modal-container {
            overflow: visible !important;
            transform: none !important;
          }

          @media (max-height: 900px) {
            .desktop-auth-column .pwa-modal-page {
              transform: translateY(15px) !important;
            }
          }

          @media (max-height: 760px) {
            .desktop-auth-column .pwa-modal-page {
              transform: translateY(0px) !important;
            }
          }

          .desktop-align-right {
            position: static !important;
            top: auto !important;
            right: auto !important;
            transform: none !important;
            width: 100% !important;
          }
        }

        @media (max-height: 700px) and (min-width: 1280px) {
          .public-portal-root {
            overflow-y: auto !important;
            height: auto !important;
          }
          .auth-page {
            height: auto !important;
            min-height: 100dvh !important;
            overflow-y: auto !important;
          }
          .desktop-grid-layout {
            height: auto !important;
            min-height: 100dvh !important;
            overflow: visible !important;
          }
          .desktop-auth-column {
            height: auto !important;
            min-height: 100dvh !important;
            padding-block: 60px !important;
          }
          .desktop-auth-column .pwa-modal-page {
            transform: none !important;
          }
        }
      `}} />
    </div>
  );
}
