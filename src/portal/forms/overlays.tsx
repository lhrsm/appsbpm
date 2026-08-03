import { type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
  trigger?: ReactNode;
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
  trigger,
}: PortalModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn(
          "flex max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] flex-col gap-4 overflow-hidden p-4 sm:w-full sm:p-6",
          "pb-[max(1rem,env(safe-area-inset-bottom))] sm:pb-6",
          sizeClass[size],
          className,
        )}
        onInteractOutside={(e) => !dismissible && e.preventDefault()}
        onEscapeKeyDown={(e) => !dismissible && e.preventDefault()}
      >

        <DialogHeader className="shrink-0 text-left">
          <DialogTitle className="break-anywhere">{title}</DialogTitle>
          {description && <DialogDescription className="break-anywhere">{description}</DialogDescription>}
        </DialogHeader>
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">{children}</div>
        {footer && (
          <DialogFooter className="shrink-0 flex-col-reverse gap-2 sm:flex-row">{footer}</DialogFooter>
        )}

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
  trigger,
}: PortalDrawerProps) {
  const { isMobile } = useBreakpoint();
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      {trigger && <SheetTrigger asChild>{trigger}</SheetTrigger>}
      <SheetContent
        side={isMobile ? "bottom" : side}
        className={cn(
          "flex flex-col gap-0 p-0",
          isMobile
            ? "max-h-[88dvh] rounded-t-2xl pb-[env(safe-area-inset-bottom)]"
            : "w-full sm:max-w-md lg:max-w-lg xl:max-w-xl",
          className,
        )}
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
