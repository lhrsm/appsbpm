import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCpf, normalizeCpf, validateCpf } from '@/lib/identity';
import { cn } from '@/lib/utils';

interface CpfInputProps extends Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  showValidation?: boolean;
}

export const CpfInput = React.forwardRef<HTMLInputElement, CpfInputProps>(
  ({ value, onChange, error, label, className, id, showValidation = true, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(formatCpf(value));
    const [internalError, setInternalError] = useState<string | null>(null);

    useEffect(() => {
      // Sincronizar apenas se o valor normalizado mudar externamente
      const currentFormatted = formatCpf(value);
      if (currentFormatted !== displayValue) {
        setDisplayValue(currentFormatted);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, '').slice(0, 11);
      const formatted = formatCpf(rawValue);
      const normalized = normalizeCpf(rawValue) || "";
      
      setDisplayValue(formatted);
      onChange(normalized);

      if (showValidation && normalized.length === 11) {
        if (!validateCpf(normalized)) {
          setInternalError("CPF inválido.");
        } else {
          setInternalError(null);
        }
      } else {
        setInternalError(null);
      }
    };

    const inputId = id || `cpf-${Math.random().toString(36).slice(2, 9)}`;
    const activeError = error || internalError;

    return (
      <div className="space-y-2 w-full">
        {label && <Label htmlFor={inputId} className={cn(activeError && "text-destructive")}>{label}</Label>}
        <Input
          {...props}
          id={inputId}
          ref={ref}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder="000.000.000-00"
          className={cn(
            "h-11 font-mono tracking-wider",
            activeError && "border-destructive focus-visible:ring-destructive",
            className
          )}
          aria-invalid={!!activeError}
          aria-describedby={activeError ? `${inputId}-error` : undefined}
        />
        {activeError && (
          <p id={`${inputId}-error`} className="text-xs font-medium text-destructive animate-fade-in">
            {activeError}
          </p>
        )}
      </div>
    );
  }
);

CpfInput.displayName = "CpfInput";
