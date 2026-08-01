import { type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { cn } from "@/design-system/utilities";
import { useBreakpoint } from "@/design-system/hooks";

export type OverlaySize = "sm" | "md" | "lg" | "xl";

const sizeClass: Record<OverlaySize, string> = {
  sm: "sm:max-w-sm",
  md: "sm:max-w-lg",
  lg: "sm:max-w-2xl",
  xl: "sm:max-w-4xl",
};

export interface PortalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  size?: OverlaySize;
  /** Bloqueia fechar por clique fora/ESC (use em envios em andamento). */
  dismissible?: boolean;
  className?: string;
}

/**
 * Modal institucional. Use para confirmações e formulários curtos.
 * Formulários longos no mobile devem usar `PortalDrawer` ou página própria.
 *
 * @example
 * <PortalModal open={open} onOpenChange={setOpen} title="Incluir dependente" footer={<PortalFormActions />}>
 *   ...
 * </PortalModal>
 */
export function PortalModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  size = "md",
  dismissible = true,
  className,
}: PortalModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn("max-h-[90dvh] overflow-y-auto", sizeClass[size], className)}
        onInteractOutside={(e) => !dismissible && e.preventDefault()}
        onEscapeKeyDown={(e) => !dismissible && e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <div className="space-y-4">{children}</div>
        {footer && <DialogFooter className="flex-col-reverse gap-2 sm:flex-row">{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

export interface PortalDrawerProps extends Omit<PortalModalProps, "size"> {
  /** Lado no desktop. No mobile abre sempre por baixo. */
  side?: "right" | "left";
}

/**
 * Drawer institucional: bottom sheet no mobile, painel lateral no desktop.
 * Ideal para filtros e detalhes contextuais.
 */
export function PortalDrawer({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  side = "right",
  dismissible = true,
  className,
}: PortalDrawerProps) {
  const { isMobile } = useBreakpoint();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side={isMobile ? "bottom" : side}
        className={cn("flex flex-col gap-0 p-0", isMobile ? "max-h-[85dvh] rounded-t-2xl" : "w-full sm:max-w-md", className)}
        onInteractOutside={(e) => !dismissible && e.preventDefault()}
        onEscapeKeyDown={(e) => !dismissible && e.preventDefault()}
      >
        {isMobile && <div className="mx-auto mt-3 h-1.5 w-10 rounded-full bg-muted" aria-hidden />}
        <SheetHeader className="border-b border-border p-4 text-left">
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto p-4">{children}</div>
        {footer && <div className="flex flex-col-reverse gap-2 border-t border-border p-4 sm:flex-row sm:justify-end">{footer}</div>}
      </SheetContent>
    </Sheet>
  );
}
