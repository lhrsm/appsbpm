import React, { ReactNode } from "react";
import { useMobileVisualViewport } from "@/hooks/useMobileVisualViewport";
import { cn } from "@/lib/utils";

interface PublicFlowModalProps {
  children: ReactNode;
  showLogo?: boolean;
  className?: string;
}

export function PublicFlowModal({ children, showLogo = true, className }: PublicFlowModalProps) {
  const { isKeyboardOpen } = useMobileVisualViewport();

  return (
    <div 
      className={cn(
        "pwa-modal-page",
        className
      )}
      data-keyboard-open={isKeyboardOpen}
    >
      <div className="pwa-modal-container">
        {children}
      </div>
    </div>
  );
}
