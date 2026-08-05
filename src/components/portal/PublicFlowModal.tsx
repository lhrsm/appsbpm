import React, { ReactNode, useEffect, useState } from "react";
import { useMobileVisualViewport } from "@/hooks/useMobileVisualViewport";
import { cn } from "@/lib/utils";

interface PublicFlowModalProps {
  children: ReactNode;
  showLogo?: boolean;
  className?: string;
}

export function PublicFlowModal({ children, className }: PublicFlowModalProps) {
  const { isKeyboardOpen } = useMobileVisualViewport();
  const [isShortScreen, setIsShortScreen] = useState(false);

  useEffect(() => {
    const checkHeight = () => {
      setIsShortScreen(window.innerHeight < 700);
    };
    checkHeight();
    window.addEventListener('resize', checkHeight);
    return () => window.removeEventListener('resize', checkHeight);
  }, []);

  return (
    <div 
      className={cn(
        "pwa-modal-page",
        className
      )}
      data-keyboard-open={isKeyboardOpen}
      data-height-short={isShortScreen}
    >
      <div className="pwa-modal-container">
        {children}
      </div>
    </div>
  );
}

