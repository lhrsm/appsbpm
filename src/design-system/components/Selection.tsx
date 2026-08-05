import { forwardRef } from "react";
import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { cn } from "../utilities";
import { icons } from "../icons";

export interface CheckboxProps extends Omit<CheckboxPrimitive.CheckboxProps, 'checked' | 'onCheckedChange'> {
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
}

/**
 * Checkbox institucional auditado.
 */
export const Checkbox = forwardRef<HTMLButtonElement, CheckboxProps>(function Checkbox(
  { className, checked, onCheckedChange, ...props },
  ref
) {
  return (
    <CheckboxPrimitive.Root
      ref={ref}
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={cn(
        "peer h-5 w-5 shrink-0 rounded border border-[var(--field-border)] bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--field-border-focus)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[hsl(var(--success))] data-[state=checked]:border-transparent data-[state=checked]:text-white transition-all",
        className
      )}
      {...props}
    >
      <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
        <icons.sucesso className="h-3.5 w-3.5" />
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  );
});

export const RadioCard = ({
  selected,
  label,
  description,
  onClick,
  className,
}: {
  selected?: boolean;
  label: string;
  description?: string;
  onClick?: () => void;
  className?: string;
}) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex flex-col gap-1 p-4 rounded-xl border transition-all text-left w-full touch-target",
        selected
          ? "bg-[rgba(240,253,244,0.94)] border-[var(--notice-success-border)] shadow-sm"
          : "bg-[rgba(255,255,255,0.76)] border-[rgba(22,163,74,0.34)] hover:border-[var(--field-border-focus)]",
        className
      )}
    >
      <div className="flex items-center justify-between w-full">
        <span className={cn("font-semibold", selected ? "text-[#14532d]" : "text-[var(--field-label)]")}>
          {label}
        </span>
        <div className={cn(
          "h-5 w-5 rounded-full border flex items-center justify-center transition-all",
          selected 
            ? "border-[hsl(var(--success))] bg-[hsl(var(--success))]" 
            : "border-[var(--field-border)] bg-white"
        )}>
          {selected && <div className="h-2 w-2 rounded-full bg-white" />}
        </div>
      </div>
      {description && (
        <span className="text-xs text-[var(--field-helper)] leading-relaxed">
          {description}
        </span>
      )}
    </button>
  );
};
