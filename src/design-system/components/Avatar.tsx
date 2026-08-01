import { Avatar as AvatarRoot, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "../utilities";

export interface AvatarProps {
  src?: string | null;
  /** Nome usado para iniciais e texto alternativo. */
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
}

const sizes = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-16 w-16 text-lg",
  xl: "h-24 w-24 text-2xl",
} as const;

function initials(name?: string | null) {
  if (!name) return "?";
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() ?? "")
    .join("");
}

/**
 * Avatar institucional com fallback de iniciais.
 * @example <Avatar src={foto} name="Maria Souza" size="lg" />
 *
 * Uso recomendado: perfil, carteirinha, listas de associados.
 */
export function Avatar({ src, name, size = "md", className }: AvatarProps) {
  return (
    <AvatarRoot className={cn(sizes[size], "border border-border", className)}>
      {src && <AvatarImage src={src} alt={name ? `Foto de ${name}` : "Foto do perfil"} loading="lazy" />}
      <AvatarFallback className="bg-primary/10 font-semibold text-primary">{initials(name)}</AvatarFallback>
    </AvatarRoot>
  );
}
