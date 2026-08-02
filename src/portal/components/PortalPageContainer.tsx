import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export interface PortalPageContainerProps {
  children: ReactNode;
  /**
   * `laptop` 1400px, `desktop` 1600px (padrão, 1800px em ultrawide),
   * `narrow` 768px (formulários/fluxos), `full` sem limite.
   */
  width?: "narrow" | "laptop" | "desktop" | "full";
  /** Limita a largura de leitura de conteúdos textuais (~72 caracteres). */
  readable?: boolean;
  className?: string;
}

/**
 * Container padrão das páginas do portal externo.
 *
 * Padding lateral: 16px (mobile) → 24/32px (tablet) → 32/48px (desktop).
 * Ultrawide: largura máxima controlada para evitar linhas longas demais.
 */
export default function PortalPageContainer({
  children,
  width = "desktop",
  readable = false,
  className,
}: PortalPageContainerProps) {
  const max = {
    narrow: "max-w-3xl",
    laptop: "max-w-[1400px]",
    desktop: "max-w-[1400px] 2xl:max-w-[1600px] 3xl:max-w-portal-ultrawide",
    full: "max-w-none",
  }[width];

  return (
    <div
      className={cn(
        "mx-auto w-full min-w-0 space-y-5 md:space-y-6",
        // padding lateral progressivo + safe areas laterais (landscape com notch)
        "px-4 ms:px-5 md:px-6 lg:px-8 xl:px-10 2xl:px-12",
        "pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] md:pl-6 md:pr-6 lg:pl-8 lg:pr-8 xl:pl-10 xl:pr-10 2xl:pl-12 2xl:pr-12",
        "py-4 md:py-6",
        max,
        readable && "[&_p]:max-w-readable",
        className,
      )}
    >
      {children}
    </div>
  );
}
