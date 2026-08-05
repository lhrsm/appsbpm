import { useState, useEffect } from "react";

export function useMobileVisualViewport() {
  const [viewportHeight, setViewportHeight] = useState("100dvh");
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  useEffect(() => {
    if (!window.visualViewport) return;

    const handleResize = () => {
      const vv = window.visualViewport!;
      const height = vv.height;
      const isKeyboard = height < window.innerHeight * 0.85;
      
      setIsKeyboardOpen(isKeyboard);
      setViewportHeight(`${height}px`);
      
      document.documentElement.style.setProperty("--visual-viewport-height", `${height}px`);
    };

    window.visualViewport.addEventListener("resize", handleResize);
    handleResize();

    return () => window.visualViewport?.removeEventListener("resize", handleResize);
  }, []);

  return { viewportHeight, isKeyboardOpen };
}
