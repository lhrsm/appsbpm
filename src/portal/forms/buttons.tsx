import { forwardRef, type AnchorHTMLAttributes, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/design-system/utilities";
import { icons, type LucideIcon } from "@/design-system/icons";
import { Tooltip } from "@/design-system/components/Overlay";

/**
 * Fase 5 — sistema central de botões do portal externo.
 * Nenhuma página deve criar estilo de botão próprio.
 */
export const portalButtonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg font-medium",
    "transition-colors duration-150 select-none",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
    "disabled:pointer-events-none disabled:opacity-60 [&_svg]:shrink-0",
  ].join(" "),
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground shadow-sm hover:bg-primary/90",
        secondary: "border border-border bg-card text-foreground hover:bg-muted",
        outline: "border border-primary/40 bg-transparent text-primary hover:bg-primary/10",
        ghost: "text-foreground hover:bg-muted",
        danger: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        success: "bg-[hsl(var(--success))] text-primary-foreground shadow-sm hover:bg-[hsl(var(--success)/0.9)]",
        link: "h-auto p-0 text-primary underline-offset-4 hover:underline",
      },
      size: {
        small: "min-h-11 px-3 text-sm [&_svg]:size-4",
        medium: "min-h-11 px-4 text-sm [&_svg]:size-4",
        large: "min-h-[52px] px-6 text-base [&_svg]:size-5",
      },
      fullWidth: { true: "w-full", false: "" },
      state: {
        default: "",
        success: "",
        error: "",
      },
    },
    compoundVariants: [
      { variant: "link", size: "small", class: "min-h-0 px-0" },
      { variant: "link", size: "medium", class: "min-h-0 px-0" },
      { variant: "link", size: "large", class: "min-h-0 px-0" },
      { state: "success", variant: "secondary", class: "border-[hsl(var(--success))] text-[hsl(var(--success))]" },
      { state: "error", variant: "secondary", class: "border-destructive text-destructive" },
    ],
    defaultVariants: { variant: "primary", size: "medium", fullWidth: false, state: "default" },
  },
);

export interface PortalButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "type">,
    VariantProps<typeof portalButtonVariants> {
  iconLeft?: LucideIcon;
  iconRight?: LucideIcon;
  /** Exibe spinner, bloqueia cliques e impede envio duplicado. */
  loading?: boolean;
  /** Rótulo alternativo durante o loading (mantém a largura estável). */
  loadingText?: string;
  type?: "button" | "submit" | "reset";
  ariaLabel?: string;
  asChild?: boolean;
  children?: ReactNode;
}

/**
 * Botão institucional do portal.
 *
 * @example <PortalButton iconLeft={icons.enviar} loading={enviando} loadingText="Enviando...">Enviar</PortalButton>
 * @example <PortalButton variant="secondary">Voltar</PortalButton>
 *
 * Uso recomendado: toda ação clicável textual do portal externo.
 * Uso não recomendado: dois botões `primary` concorrentes na mesma área.
 */
export const PortalButton = forwardRef<HTMLButtonElement, PortalButtonProps>(function PortalButton(
  {
    className,
    variant,
    size,
    fullWidth,
    state,
    loading,
    loadingText,
    iconLeft: Left,
    iconRight: Right,
    type = "button",
    ariaLabel,
    asChild,
    disabled,
    children,
    ...props
  },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  const Spinner = icons.carregando;
  return (
    <Comp
      ref={ref}
      type={asChild ? undefined : type}
      aria-label={ariaLabel}
      aria-busy={loading || undefined}
      aria-disabled={disabled || loading || undefined}
      disabled={asChild ? undefined : disabled || loading}
      className={cn(portalButtonVariants({ variant, size, fullWidth, state }), className)}
      {...props}
    >
      {loading ? <Spinner className="animate-spin" aria-hidden /> : Left ? <Left aria-hidden /> : null}
      <span className="truncate">{loading && loadingText ? loadingText : children}</span>
      {!loading && Right ? <Right aria-hidden /> : null}
    </Comp>
  );
});

export interface PortalIconButtonProps extends Omit<PortalButtonProps, "children" | "iconLeft" | "iconRight" | "loadingText"> {
  icon: LucideIcon;
  /** Obrigatório: vira `aria-label` e tooltip (WCAG 4.1.2). */
  label: string;
  /** Desliga o tooltip quando o contexto já descreve a ação. */
  tooltip?: boolean;
}

/**
 * Botão apenas com ícone: tooltip + `aria-label` obrigatórios e alvo de toque de 44px.
 * @example <PortalIconButton icon={icons.fechar} label="Fechar" variant="ghost" />
 */
export const PortalIconButton = forwardRef<HTMLButtonElement, PortalIconButtonProps>(function PortalIconButton(
  { icon: Icon, label, tooltip = true, variant = "ghost", size = "medium", className, loading, ...props },
  ref,
) {
  const Spinner = icons.carregando;
  const button = (
    <button
      ref={ref}
      type="button"
      aria-label={label}
      aria-busy={loading || undefined}
      className={cn(
        portalButtonVariants({ variant, size }),
        "h-11 w-11 min-h-11 min-w-11 shrink-0 p-0",
        className,
      )}
      disabled={props.disabled || loading}
      {...props}
    >
      {loading ? <Spinner className="animate-spin" aria-hidden /> : <Icon aria-hidden />}
    </button>
  );
  if (!tooltip) return button;
  return <Tooltip content={label}>{button}</Tooltip>;
});

export interface ActionLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  icon?: LucideIcon;
  iconRight?: LucideIcon;
  tone?: "default" | "muted" | "danger";
  asChild?: boolean;
  children: ReactNode;
}

/**
 * Link de ação (navegação, "Ver todos", "Saiba mais").
 * Não use para submissão — nesse caso use `PortalButton`.
 *
 * @example <ActionLink asChild iconRight={icons.proximo}><Link to="/solicitacoes">Ver todas</Link></ActionLink>
 */
export function ActionLink({ icon: Icon, iconRight: Right, tone = "default", asChild, className, children, ...props }: ActionLinkProps) {
  const Comp = asChild ? Slot : "a";
  return (
    <Comp
      className={cn(
        "inline-flex items-center gap-1.5 rounded text-sm font-medium underline-offset-4 transition-colors hover:underline",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        tone === "default" && "text-primary",
        tone === "muted" && "text-muted-foreground hover:text-foreground",
        tone === "danger" && "text-destructive",
        className,
      )}
      {...props}
    >
      {Icon && <Icon className="size-4" aria-hidden />}
      {children}
      {Right && <Right className="size-4" aria-hidden />}
    </Comp>
  );
}
