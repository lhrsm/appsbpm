import { useState, useEffect } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { formatDateForDisplay, normalizeBirthDate, validateBirthDate } from "@/lib/identity";

interface BirthDateInputProps {
  label?: string;
  value: string; // ISO format (YYYY-MM-DD) or empty
  onChange: (value: string) => void; // Sends ISO format
  className?: string;
  required?: boolean;
}

export function BirthDateInput({ label = "Data de nascimento", value, onChange, className, required }: BirthDateInputProps) {
  const [displayValue, setDisplayValue] = useState("");

  useEffect(() => {
    // Sincroniza valor ISO externo com exibição BR
    if (value) {
      const formatted = formatDateForDisplay(value);
      if (formatted !== displayValue) {
        setDisplayValue(formatted);
      }
    } else if (displayValue !== "") {
      setDisplayValue("");
    }
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "").slice(0, 8);
    
    // Máscara progressiva DD/MM/YYYY
    let masked = v;
    if (v.length > 2) masked = v.slice(0, 2) + "/" + v.slice(2);
    if (v.length > 4) masked = masked.slice(0, 5) + "/" + v.slice(4);
    
    setDisplayValue(masked);

    // Se completou a data, normaliza para ISO e envia
    if (v.length === 8) {
      if (validateBirthDate(masked)) {
        onChange(normalizeBirthDate(masked) || "");
      } else {
        onChange(""); // Valor inválido
      }
    } else {
      onChange(""); // Incompleto
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}{required && " *"}</Label>}
      <Input
        placeholder="DD/MM/AAAA"
        value={displayValue}
        onChange={handleChange}
        maxLength={10}
        className={className}
        inputMode="numeric"
      />
    </div>
  );
}
