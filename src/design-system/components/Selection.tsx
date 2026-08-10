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
        "peer h-5 w-5 shrink-0 rounded border border-[var(--field-border)] bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--field-border-focus)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[hsl(var(--success))] data-[state=checked]:border-transparent data-[state=checked]:text-white transition-all [color-scheme:light]",
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
      data-ui-version="sbpm-radio-card-v6"
      className={cn(
        "flex flex-col gap-1 p-4 rounded-xl border transition-all text-left w-full touch-target",
        selected
          ? "bg-[#f0fdf4] border-[#168A49] shadow-sm text-[#166534]"
          : "bg-[#ffffff] border-[rgba(22,138,73,0.34)] hover:border-[#168A49] text-[#263244]",
        className
      )}
    >
      <div className="flex items-center justify-between w-full">
        <span className={cn(
          "font-bold text-[15px] leading-tight",
          selected ? "text-[#166534]" : "text-[#263244]"
        )}>
          {label}
        </span>
        <div className={cn(
          "h-5 w-5 rounded-full border-[1.5px] flex items-center justify-center transition-all shrink-0",
          selected 
            ? "border-[#168A49] bg-[#168A49]" 
            : "border-[#168A49] bg-white"
        )}>
          {selected && <div className="h-2 w-2 rounded-full bg-white" />}
        </div>
      </div>
      {description && (
        <span className={cn(
          "text-xs leading-relaxed mt-0.5",
          selected ? "text-[#166534]/80" : "text-[#64748B]"
        )}>
          {description}
        </span>
      )}
    </button>
  );
};

