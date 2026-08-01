import type { ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  Tooltip as TooltipRoot,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "../utilities";
import type { LucideIcon } from "../icons";

export interface ModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  footer?: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

/**
 * Modal institucional (Radix: foco preso, ESC fecha, ARIA correto).
 *
 * @example
 * <Modal open={aberto} onOpenChange={setAberto} title="Novo dependente" footer={<Button>Salvar</Button>}>
 *   <FormularioDependente />
 * </Modal>
 *
 * Uso não recomendado: fluxos longos no mobile — prefira `Drawer`.
 */
export function Modal({ open, onOpenChange, title, description, children, footer, size = "md", className }: ModalProps) {
  const width = { sm: "sm:max-w-sm", md: "sm:max-w-lg", lg: "sm:max-w-2xl", xl: "sm:max-w-4xl" }[size];
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className={cn(width, "max-h-[90dvh] overflow-y-auto", className)}>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        {children}
        {footer && <DialogFooter>{footer}</DialogFooter>}
      </DialogContent>
    </Dialog>
  );
}

export interface DrawerProps extends Omit<ModalProps, "size"> {
  side?: "left" | "right" | "top" | "bottom";
}

/**
 * Painel lateral. Usado para menus mobile e filtros avançados.
 * @example <Drawer open={o} onOpenChange={setO} title="Filtros" side="right">...</Drawer>
 */
export function Drawer({ open, onOpenChange, title, description, children, footer, side = "right", className }: DrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side={side} className={cn("flex w-full flex-col sm:max-w-md", className)}>
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
          {description && <SheetDescription>{description}</SheetDescription>}
        </SheetHeader>
        <div className="flex-1 overflow-y-auto py-4">{children}</div>
        {footer && <div className="border-t pt-4">{footer}</div>}
      </SheetContent>
    </Sheet>
  );
}

/**
 * Dica contextual. Nunca use como única fonte de informação essencial.
 * @example <Tooltip content="Exportar em PDF"><IconButton icon={icons.baixar} label="Exportar" /></Tooltip>
 */
export function Tooltip({
  content,
  children,
  side = "top",
}: {
  content: ReactNode;
  children: ReactNode;
  side?: "top" | "right" | "bottom" | "left";
}) {
  return (
    <TooltipProvider delayDuration={200}>
      <TooltipRoot>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side}>{content}</TooltipContent>
      </TooltipRoot>
    </TooltipProvider>
  );
}

export interface DropdownItem {
  label: string;
  icon?: LucideIcon;
  onSelect?: () => void;
  danger?: boolean;
  separatorBefore?: boolean;
}

/**
 * Menu de ações padronizado.
 * @example <Dropdown trigger={<IconButton icon={icons.menu} label="Ações" />} label="Ações" items={itens} />
 */
export function Dropdown({
  trigger,
  items,
  label,
  align = "end",
}: {
  trigger: ReactNode;
  items: DropdownItem[];
  label?: string;
  align?: "start" | "center" | "end";
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>{trigger}</DropdownMenuTrigger>
      <DropdownMenuContent align={align}>
        {label && <DropdownMenuLabel>{label}</DropdownMenuLabel>}
        {items.map((item, i) => (
          <div key={item.label}>
            {item.separatorBefore && i > 0 && <DropdownMenuSeparator />}
            <DropdownMenuItem onSelect={item.onSelect} className={cn(item.danger && "text-destructive focus:text-destructive")}>
              {item.icon && <item.icon className="mr-2 h-4 w-4" aria-hidden />}
              {item.label}
            </DropdownMenuItem>
          </div>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
