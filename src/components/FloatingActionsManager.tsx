import { useState, useEffect, lazy, Suspense } from "react";
import { useMobileVisualViewport } from "@/hooks/useMobileVisualViewport";
import { cn } from "@/lib/utils";
import BackToTop from "./BackToTop";
import AccessibilityWidget from "./AccessibilityWidget";

const ChatbotWidget = lazy(() => import("./ChatbotWidget"));

export function FloatingActionsManager() {
  const { isKeyboardOpen } = useMobileVisualViewport();
  const [showBackToTop, setShowBackToTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (isKeyboardOpen) return null;
  
  // A classe .lgpd-open no body afasta os botões para cima quando o banner de cookies está aberto
  return (
    <>
      <div 
        className={cn(
          "fixed right-4 z-50 flex flex-col items-end gap-3 transition-all duration-300",
          "bottom-[calc(var(--bottom-navigation-height,72px)+env(safe-area-inset-bottom)+18px)] md:bottom-8",
          "body-lgpd-open:bottom-[calc(var(--lgpd-sheet-height,180px)+env(safe-area-inset-bottom)+18px)]"
        )}
      >
        {showBackToTop && <BackToTop />}
        <Suspense fallback={null}>
          <ChatbotWidget />
        </Suspense>
      </div>
    </>
  );
}
