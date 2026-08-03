import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "../utilities";
import { icons, type LucideIcon } from "../icons";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium rounded-lg transition-colors duration-200 active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        primary: "bg-primary text-primary-foreground hover:bg-primary/90",
        secondary: "border border-border bg-card text-foreground hover:bg-muted",
        ghost: "text-foreground hover:bg-muted",
      },
      tone: {
        default: "",
        danger: "",
        success: "",
      },
      size: {
        sm: "h-8 px-3 text-xs [&_svg]:size-4",
        md: "h-10 px-4 text-sm [&_svg]:size-4",
        lg: "h-12 px-6 text-base [&_svg]:size-5",
        icon: "h-10 w-10 p-0 [&_svg]:size-4",
      },
      fullWidth: { true: "w-full", false: "" },
    },
    compoundVariants: [
      { variant: "primary", tone: "danger", class: "bg-destructive text-destructive-foreground hover:bg-destructive/90" },
      { variant: "primary", tone: "success", class: "bg-[hsl(var(--success))] text-primary-foreground hover:bg-[hsl(var(--success)/0.9)]" },
      { variant: "secondary", tone: "danger", class: "border-destructive/40 text-destructive hover:bg-destructive/10" },
      { variant: "ghost", tone: "danger", class: "text-destructive hover:bg-destructive/10" },
    ],
    defaultVariants: { variant: "primary", tone: "default", size: "md", fullWidth: false },
  },
);

export interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  /** Exibe spinner e desabilita o botão. */
  loading?: boolean;
  /** Ícone à esquerda do rótulo. */
  leftIcon?: LucideIcon;
  /** Ícone à direita do rótulo. */
  rightIcon?: LucideIcon;
  /** Renderiza no elemento filho (ex.: `<Link>`). */
  asChild?: boolean;
  children?: ReactNode;
}

/**
 * Botão institucional. Somente três padrões: `primary`, `secondary`, `ghost`.
 *
 * @example <Button leftIcon={icons.baixar}>Baixar informe</Button>
 * @example <Button variant="secondary" size="sm">Cancelar</Button>
 * @example <Button tone="danger" loading>Excluir</Button>
 *
 * Uso recomendado: toda ação clicável textual.
 * Uso não recomendado: criar variantes novas por página; use `tone`/`size`.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant, tone, size, fullWidth, loading, leftIcon: Left, rightIcon: Right, asChild, children, disabled, ...props },
  ref,
) {
  const Comp = asChild ? Slot : "button";
  const Spinner = icons.carregando;
  if (asChild) {
    return (
      <Slot
        ref={ref}
        disabled={disabled || loading}
        className={cn(buttonVariants({ variant, tone, size, fullWidth }), className)}
        {...props}
      >
        {children}
      </Slot>
    );
  }

  return (
    <button
      ref={ref}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      className={cn(buttonVariants({ variant, tone, size, fullWidth }), className)}
      {...props}
    >
      {loading ? <Spinner className="animate-spin" aria-hidden /> : Left ? <Left aria-hidden /> : null}
      {children}
      {!loading && Right ? <Right aria-hidden /> : null}
    </button>
  );
});

export { buttonVariants };

export interface IconButtonProps extends Omit<ButtonProps, "children" | "leftIcon" | "rightIcon"> {
  icon: LucideIcon;
  /** Obrigatório: nome acessível do botão. */
  label: string;
}

/**
 * Botão apenas com ícone. O `label` vira `aria-label` (WCAG 4.1.2).
 *
 * @example <IconButton icon={icons.fechar} label="Fechar" variant="ghost" />
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { icon: Icon, label, size = "icon", variant = "ghost", className, loading, ...props },
  ref,
) {
  const Spinner = icons.carregando;
  return (
    <Button
      ref={ref}
      aria-label={label}
      title={label}
      variant={variant}
      size={size}
      className={cn("min-h-11 min-w-11", className)}
      {...props}
    >
      {loading ? <Spinner className="animate-spin" aria-hidden /> : <Icon aria-hidden />}
    </Button>
  );
});
