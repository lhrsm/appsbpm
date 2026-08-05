import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatRegistrationNumber, normalizeRegistrationNumber, validateRegistrationNumberFormat } from '@/lib/identity';
import { cn } from '@/lib/utils';

interface RegistrationNumberInputProps extends Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
  showValidation?: boolean;
}

 export const RegistrationNumberInput = React.forwardRef<HTMLInputElement, RegistrationNumberInputProps>(
  ({ value, onChange, error, label, className, id, showValidation = true, onFocus, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(formatRegistrationNumber(value));
    const [internalError, setInternalError] = useState<string | null>(null);

    useEffect(() => {
      // Sincronizar apenas se o valor normalizado mudar externamente
      const currentFormatted = formatRegistrationNumber(value);
      if (currentFormatted !== displayValue) {
        setDisplayValue(currentFormatted);
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, '').slice(0, 9);
      const formatted = formatRegistrationNumber(rawValue);
      const normalized = rawValue;
      
      setDisplayValue(formatted);
      onChange(normalized);

      if (showValidation && normalized.length === 9) {
        if (!validateRegistrationNumberFormat(normalized)) {
          setInternalError("Matrícula inválida.");
        } else {
          setInternalError(null);
        }
      } else {
        setInternalError(null);
      }
    };

    const inputId = id || `reg-${Math.random().toString(36).slice(2, 9)}`;
    const activeError = error || internalError;

    return (
      <div className="space-y-1.5 w-full">
        {label && <Label htmlFor={inputId} className={cn("hidden", activeError && "text-destructive")}>{label}</Label>}
         <Input
          {...props}
          onFocus={onFocus}
          id={inputId}
          ref={ref}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder="00000000-0"
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

RegistrationNumberInput.displayName = "RegistrationNumberInput";