import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PortalPageContainerProps {
  children: ReactNode;
  /** `laptop` 1400px (padrão), `desktop` 1600px, `narrow` 768px, `full` sem limite. */
  width?: "narrow" | "laptop" | "desktop" | "full";
  className?: string;
}

/** Container padrão das páginas do portal externo. */
export default function PortalPageContainer({
  children,
  width = "desktop",
  className,
}: PortalPageContainerProps) {
  const max = {
    narrow: "max-w-3xl",
    laptop: "max-w-[1400px]",
    desktop: "max-w-[1600px] xl:max-w-[1400px] 2xl:max-w-[1600px]",
    full: "max-w-none",
  }[width];

  return (
    <div className={cn("mx-auto w-full min-w-0 space-y-6 px-4 py-4 sm:px-6 md:py-6 lg:px-8", max, className)}>
      {children}
    </div>
  );
}
