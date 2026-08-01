import type { HTMLAttributes, ReactNode } from "react";
import { cn } from "../utilities";

export interface ContainerProps extends HTMLAttributes<HTMLDivElement> {
  /** Largura máxima: `desktop` 1600px, `laptop` 1400px, `narrow` 768px. */
  width?: "narrow" | "laptop" | "desktop" | "full";
  children: ReactNode;
}

/**
 * Container central com padding responsivo.
 * @example <Container width="desktop">...</Container>
 */
export function Container({ width = "desktop", className, children, ...props }: ContainerProps) {
  const max = {
    narrow: "max-w-3xl",
    laptop: "max-w-[1400px]",
    desktop: "max-w-[1600px]",
    full: "max-w-none",
  }[width];
  return (
    <div className={cn("mx-auto w-full px-4 sm:px-6 lg:px-8", max, className)} {...props}>
      {children}
    </div>
  );
}

export interface GridProps extends HTMLAttributes<HTMLDivElement> {
  /** Colunas por faixa: mobile 4, tablet 8, desktop 12. */
  cols?: { mobile?: 1 | 2 | 3 | 4; tablet?: number; desktop?: number };
  gap?: "sm" | "md" | "lg";
  children: ReactNode;
}

const gapMap = { sm: "gap-3", md: "gap-4", lg: "gap-6" } as const;

/**
 * Grid responsivo institucional (4 / 8 / 12 colunas).
 * @example <Grid cols={{ mobile: 1, tablet: 2, desktop: 4 }}>{cards}</Grid>
 */
export function Grid({ cols, gap = "md", className, children, ...props }: GridProps) {
  const m = cols?.mobile ?? 1;
  const t = cols?.tablet ?? 2;
  const d = cols?.desktop ?? 3;
  return (
    <div
      className={cn("grid", gapMap[gap], `grid-cols-${m}`, `md:grid-cols-${t}`, `xl:grid-cols-${d}`, className)}
      style={{ ["--ds-cols" as string]: d }}
      {...props}
    >
      {children}
    </div>
  );
}

/** Empilhamento vertical com espaçamento tokenizado. */
export function Stack({
  gap = "md",
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { gap?: "sm" | "md" | "lg"; children: ReactNode }) {
  const map = { sm: "space-y-3", md: "space-y-4", lg: "space-y-6" } as const;
  return (
    <div className={cn(map[gap], className)} {...props}>
      {children}
    </div>
  );
}

/** Linha flexível com quebra automática. */
export function Row({
  gap = "md",
  align = "center",
  className,
  children,
  ...props
}: HTMLAttributes<HTMLDivElement> & { gap?: "sm" | "md" | "lg"; align?: "start" | "center" | "end"; children: ReactNode }) {
  return (
    <div
      className={cn(
        "flex flex-wrap",
        gapMap[gap],
        align === "start" ? "items-start" : align === "end" ? "items-end" : "items-center",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
