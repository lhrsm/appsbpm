import { useState, type ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export interface SmartImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, "srcSet"> {
  src: string;
  alt: string;
  /** Largura de renderização em CSS px — usada para pedir a menor variante possível. */
  displayWidth?: number;
  /** Larguras alternativas disponíveis (Storage transform / CDN). */
  widths?: number[];
  sizes?: string;
  /** Prioridade: só para a imagem LCP da página. */
  priority?: boolean;
  fallback?: React.ReactNode;
}

/** Storage do backend aceita transformação por querystring; demais origens ficam inalteradas. */
function variant(src: string, width: number): string {
  if (!/\/storage\/v1\/object\/public\//.test(src)) return src;
  const url = new URL(src, window.location.origin);
  url.searchParams.set("width", String(width));
  url.searchParams.set("quality", "70");
  return url.toString();
}

/**
 * Imagem responsiva do Portal: lazy por padrão, dimensões explícitas
 * (sem layout shift), srcset por dispositivo e placeholder de fallback.
 */
export default function SmartImage({
  src,
  alt,
  displayWidth = 320,
  widths,
  sizes,
  priority = false,
  className,
  fallback,
  ...rest
}: SmartImageProps) {
  const [erro, setErro] = useState(false);
  const escala = widths ?? [displayWidth, displayWidth * 2];
  const isTransformable = /\/storage\/v1\/object\/public\//.test(src);

  if (erro && fallback) return <>{fallback}</>;

  return (
    <img
      src={isTransformable ? variant(src, escala[0]) : src}
      srcSet={isTransformable ? escala.map((w) => `${variant(src, w)} ${w}w`).join(", ") : undefined}
      sizes={sizes ?? `${displayWidth}px`}
      alt={alt}
      width={rest.width ?? displayWidth}
      height={rest.height}
      loading={priority ? "eager" : "lazy"}
      decoding={priority ? "sync" : "async"}
      fetchPriority={priority ? "high" : "auto"}
      onError={() => setErro(true)}
      className={cn("object-cover", className)}
      {...rest}
    />
  );
}
