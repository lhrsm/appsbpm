import { useEffect, useState } from "react";
import { mediaQuery } from "../tokens/breakpoints";

function useMedia(query: string) {
  const [matches, setMatches] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia(query).matches : false,
  );
  useEffect(() => {
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    setMatches(mql.matches);
    mql.addEventListener("change", handler);
    return () => mql.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

export { useMedia };

/** Estado responsivo derivado dos breakpoints institucionais. */
export function useBreakpoint() {
  const isMobileSmall = useMedia(mediaQuery.mobileSmall);
  const isTablet = useMedia(mediaQuery.tablet);
  const isLaptop = useMedia(mediaQuery.laptop);
  const isDesktop = useMedia(mediaQuery.desktop);
  const isDesktopLarge = useMedia(mediaQuery.desktopLarge);
  const isUltrawide = useMedia(mediaQuery.ultrawide);
  const isPWA = useMedia(mediaQuery.pwa);
  const isLandscape = useMedia(mediaQuery.landscape);
  const isLandscapeShort = useMedia(mediaQuery.landscapeShort);

  return {
    isMobileSmall,
    isMobile: !isTablet,
    isTablet: isTablet && !isLaptop,
    isLaptop: isLaptop && !isDesktop,
    isDesktop,
    isDesktopLarge,
    isUltrawide,
    isPWA,
    isLandscape,
    isLandscapeShort,
    /** Colunas do grid conforme a faixa atual. */
    columns: isLaptop ? 12 : isTablet ? 8 : 4,
  };
}
