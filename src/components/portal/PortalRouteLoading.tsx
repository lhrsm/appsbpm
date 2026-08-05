import React from "react";
import { useNavigationState } from "@/hooks/useNavigationState";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export const PortalRouteLoading = () => {
  const { isNavigating, message } = useNavigationState();

  if (!isNavigating) return null;

  return (
    <div 
      className={cn(
        "public-route-loading fixed inset-0 z-[9999] flex items-center justify-center animate-in fade-in duration-200"
      )}
      role="status"
      aria-live="polite"
    >
      <div className="loading-card flex flex-col items-center gap-4 text-center">
        <img 
          src="/logo-sbpm.png" 
          alt="SBPM" 
          className="w-20 h-20 object-contain mb-2 animate-pulse"
        />
        <Loader2 className="h-8 w-8 text-primary animate-spin" />
        <div className="space-y-1">
          <p className="font-semibold text-foreground text-lg">
            {message || "Carregando..."}
          </p>
          <p className="text-sm text-muted-foreground">
            Aguarde um momento
          </p>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .public-route-loading {
          background: linear-gradient(
            rgba(255, 255, 255, 0.34),
            rgba(255, 255, 255, 0.34)
          ), var(--portal-background-image);
          background-size: cover;
          background-position: center;
          backdrop-filter: blur(4px);
          -webkit-backdrop-filter: blur(4px);
        }

        .loading-card {
          width: min(calc(100% - 32px), 320px);
          padding: 32px 24px;
          border-radius: 28px;
          background: rgba(255, 255, 255, 0.85);
          border: 1.5px solid rgba(22, 163, 74, 0.66);
          backdrop-filter: blur(8px);
          box-shadow: 0 12px 40px rgba(15, 23, 42, 0.12);
        }
      `}} />
    </div>
  );
};
