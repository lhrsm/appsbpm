import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatRegistrationNumber, normalizeRegistrationNumber } from '@/lib/identity';
import { cn } from '@/lib/utils';

interface RegistrationNumberInputProps extends Omit<React.ComponentProps<typeof Input>, 'onChange' | 'value'> {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  label?: string;
}

export const RegistrationNumberInput = React.forwardRef<HTMLInputElement, RegistrationNumberInputProps>(
  ({ value, onChange, error, label, className, id, ...props }, ref) => {
    const [displayValue, setDisplayValue] = useState(formatRegistrationNumber(value));

    useEffect(() => {
      setDisplayValue(formatRegistrationNumber(value));
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value.replace(/\D/g, '').slice(0, 9);
      const formatted = formatRegistrationNumber(rawValue);
      const normalized = normalizeRegistrationNumber(rawValue) || "";
      
      setDisplayValue(formatted);
      onChange(normalized);
    };

    const inputId = id || `registration-${Math.random().toString(36).slice(2, 9)}`;

    return (
      <div className="space-y-2 w-full">
        {label && <Label htmlFor={inputId} className={cn(error && "text-destructive")}>{label}</Label>}
        <Input
          {...props}
          id={inputId}
          ref={ref}
          type="text"
          inputMode="numeric"
          value={displayValue}
          onChange={handleChange}
          placeholder="00000000-0"
          className={cn(
            "h-11 font-mono tracking-wider",
            error && "border-destructive focus-visible:ring-destructive",
            className
          )}
          aria-invalid={!!error}
          aria-describedby={error ? `${inputId}-error` : undefined}
        />
        {error && (
          <p id={`${inputId}-error`} className="text-xs font-medium text-destructive animate-fade-in">
            {error}
          </p>
        )}
      </div>
    );
  }
);

RegistrationNumberInput.displayName = "RegistrationNumberInput";
