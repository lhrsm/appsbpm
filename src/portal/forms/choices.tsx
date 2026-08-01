import { type ReactNode } from "react";
import { RadioGroup as RadioGroupRoot, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/design-system/utilities";
import type { LucideIcon } from "@/design-system/icons";

export interface ChoiceOption {
  value: string;
  label: ReactNode;
  description?: ReactNode;
  icon?: LucideIcon;
  disabled?: boolean;
}

export interface RadioGroupFieldProps {
  name?: string;
  value?: string;
  onValueChange: (value: string) => void;
  options: ChoiceOption[];
  /** `list` (padrão), `cards` para escolhas destacadas, `inline` para 2–3 opções curtas. */
  variant?: "list" | "cards" | "inline";
  disabled?: boolean;
  columns?: 1 | 2;
  "aria-describedby"?: string;
  "aria-invalid"?: boolean;
  "aria-labelledby"?: string;
  className?: string;
}

/**
 * Grupo de opções exclusivas — navegável por teclado (Radix).
 * Use `variant="cards"` nas perguntas de validação de identidade.
 */
export function RadioGroupField({
  name,
  value,
  onValueChange,
  options,
  variant = "list",
  disabled,
  columns = 1,
  className,
  ...aria
}: RadioGroupFieldProps) {
  return (
    <RadioGroupRoot
      name={name}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      className={cn(
        variant === "inline" ? "flex flex-wrap gap-4" : "grid gap-2",
        variant !== "inline" && columns === 2 && "sm:grid-cols-2",
        className,
      )}
      {...aria}
    >
      {options.map((opt) => {
        const id = `${name ?? "radio"}-${opt.value}`;
        const checked = value === opt.value;
        if (variant === "inline") {
          return (
            <div key={opt.value} className="flex min-h-11 items-center gap-2">
              <RadioGroupItem value={opt.value} id={id} disabled={opt.disabled} />
              <label htmlFor={id} className="cursor-pointer text-sm text-foreground">
                {opt.label}
              </label>
            </div>
          );
        }
        return (
          <label
            key={opt.value}
            htmlFor={id}
            className={cn(
              "flex min-h-11 cursor-pointer items-start gap-3 rounded-lg border p-3 transition-colors",
              "focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-1",
              checked ? "border-primary bg-primary/5" : "border-border hover:bg-muted/50",
              opt.disabled && "cursor-not-allowed opacity-60",
              variant === "cards" && "p-4",
            )}
          >
            <RadioGroupItem value={opt.value} id={id} disabled={opt.disabled} className="mt-0.5" />
            <span className="min-w-0 flex-1">
              <span className="flex items-center gap-2 text-sm font-medium text-foreground">
                {opt.icon && <opt.icon className="size-4 text-muted-foreground" aria-hidden />}
                {opt.label}
              </span>
              {opt.description && <span className="mt-0.5 block text-xs text-muted-foreground">{opt.description}</span>}
            </span>
          </label>
        );
      })}
    </RadioGroupRoot>
  );
}

export interface CheckboxFieldProps {
  id?: string;
  checked?: boolean | "indeterminate";
  onCheckedChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  error?: ReactNode;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

/**
 * Checkbox com label clicável. Consentimentos nunca vêm marcados por padrão.
 * Links dentro do label não alternam o estado (stopPropagation no `<a>`).
 */
export function CheckboxField({
  id,
  checked,
  onCheckedChange,
  label,
  description,
  error,
  disabled,
  required,
  className,
}: CheckboxFieldProps) {
  const fieldId = id ?? `check-${String(label).slice(0, 12)}`;
  const errorId = `${fieldId}-error`;
  return (
    <div className={cn("space-y-1", className)}>
      <div
        className={cn(
          "flex items-start gap-3 rounded-lg border p-3 transition-colors",
          error ? "border-destructive" : checked === true ? "border-primary bg-primary/5" : "border-border",
        )}
      >
        <Checkbox
          id={fieldId}
          checked={checked}
          onCheckedChange={(v) => onCheckedChange(v === true)}
          disabled={disabled}
          aria-required={required || undefined}
          aria-invalid={Boolean(error) || undefined}
          aria-describedby={error ? errorId : undefined}
          className="mt-0.5"
        />
        <label htmlFor={fieldId} className="min-w-0 flex-1 cursor-pointer text-sm text-foreground [&_a]:text-primary [&_a]:underline">
          <span onClick={(e) => (e.target as HTMLElement).tagName === "A" && e.preventDefault()}>{label}</span>
          {required && (
            <span className="ml-0.5 text-destructive" aria-hidden>
              *
            </span>
          )}
          {description && <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>}
        </label>
      </div>
      {error && (
        <p id={errorId} role="alert" className="text-xs font-medium text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}

export interface SwitchFieldProps {
  id?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  label: ReactNode;
  description?: ReactNode;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

/**
 * Preferência reversível (notificações, segurança).
 * Não use para salvar formulário, excluir ou consentimento jurídico.
 */
export function SwitchField({ id, checked, onCheckedChange, label, description, disabled, loading, className }: SwitchFieldProps) {
  const fieldId = id ?? `switch-${String(label).slice(0, 12)}`;
  return (
    <div className={cn("flex min-h-11 items-center justify-between gap-4 rounded-lg border border-border p-3", className)}>
      <label htmlFor={fieldId} className="min-w-0 flex-1 cursor-pointer">
        <span className="block text-sm font-medium text-foreground">{label}</span>
        {description && <span className="mt-0.5 block text-xs text-muted-foreground">{description}</span>}
      </label>
      <Switch id={fieldId} checked={checked} onCheckedChange={onCheckedChange} disabled={disabled || loading} />
    </div>
  );
}
