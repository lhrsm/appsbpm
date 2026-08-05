import { useState, useEffect } from "react";

export function useMobileVisualViewport() {
  const [viewportHeight, setViewportHeight] = useState<number | null>(null);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || !window.visualViewport) return;

    const updateViewport = () => {
      const viewport = window.visualViewport!;
      const height = viewport.height;
      const offsetTop = viewport.offsetTop;

      setViewportHeight(height);
      
      // Detect keyboard open: innerHeight is significantly larger than visualViewport height
      const threshold = 120;
      const isOpen = window.innerHeight - height > threshold;
      setIsKeyboardOpen(isOpen);

      document.documentElement.style.setProperty("--visual-viewport-height", `${height}px`);
      document.documentElement.style.setProperty("--visual-viewport-offset-top", `${offsetTop}px`);
      document.documentElement.setAttribute("data-keyboard-open", isOpen.toString());
    };

    window.visualViewport.addEventListener("resize", updateViewport);
    window.visualViewport.addEventListener("scroll", updateViewport);
    
    // Initial update
    updateViewport();

    return () => {
      window.visualViewport?.removeEventListener("resize", updateViewport);
      window.visualViewport?.removeEventListener("scroll", updateViewport);
    };
  }, []);

  return { viewportHeight, isKeyboardOpen };
}
