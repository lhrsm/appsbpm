import { useEffect, useRef, useState, type ClipboardEvent, type KeyboardEvent } from "react";
import { cn } from "@/design-system/utilities";
import { PortalButton } from "./buttons";

export interface OTPInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  /** Disparado automaticamente ao completar os dígitos. */
  onComplete?: (value: string) => void;
  length?: number;
  disabled?: boolean;
  invalid?: boolean;
  autoFocus?: boolean;
  "aria-describedby"?: string;
  "aria-label"?: string;
}

/**
 * Campo de código de verificação (6 dígitos por padrão).
 * Avança sozinho, aceita colar o código inteiro e navega com setas/Backspace.
 */
export function OTPInput({
  id,
  value,
  onChange,
  onComplete,
  length = 6,
  disabled,
  invalid,
  autoFocus,
  ...aria
}: OTPInputProps) {
  const refs = useRef<Array<HTMLInputElement | null>>([]);
  const digits = value.padEnd(length, " ").slice(0, length).split("");

  useEffect(() => {
    if (value.length === length) onComplete?.(value);
  }, [value, length, onComplete]);

  const setDigit = (index: number, digit: string) => {
    const chars = value.padEnd(length, " ").split("");
    chars[index] = digit || " ";
    onChange(chars.join("").replace(/\s/g, "").slice(0, length));
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    setDigit(index, digit);
    if (digit && index < length - 1) refs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[index].trim() && index > 0) refs.current[index - 1]?.focus();
    if (e.key === "ArrowLeft" && index > 0) refs.current[index - 1]?.focus();
    if (e.key === "ArrowRight" && index < length - 1) refs.current[index + 1]?.focus();
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    refs.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="flex gap-2" role="group" aria-label={aria["aria-label"] ?? "Código de verificação"} aria-describedby={aria["aria-describedby"]}>
      {Array.from({ length }).map((_, i) => (
        <input
          key={i}
          id={i === 0 ? id : undefined}
          ref={(el) => (refs.current[i] = el)}
          value={digits[i].trim()}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onPaste={handlePaste}
          onFocus={(e) => e.target.select()}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          autoFocus={autoFocus && i === 0}
          disabled={disabled}
          maxLength={1}
          aria-label={`Dígito ${i + 1} de ${length}`}
          aria-invalid={invalid || undefined}
          className={cn(
            "h-14 w-11 rounded-lg border bg-background text-center text-xl font-semibold text-foreground transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1",
            invalid ? "border-destructive" : "border-input",
            disabled && "opacity-60",
          )}
        />
      ))}
    </div>
  );
}

export interface ResendCodeButtonProps {
  onResend: () => void | Promise<void>;
  /** Segundos de espera entre reenvios. */
  seconds?: number;
  disabled?: boolean;
}

/** Botão de reenvio com contagem regressiva — evita disparos em excesso. */
export function ResendCodeButton({ onResend, seconds = 60, disabled }: ResendCodeButtonProps) {
  const [remaining, setRemaining] = useState(seconds);

  useEffect(() => {
    if (remaining <= 0) return;
    const timer = setTimeout(() => setRemaining((s) => s - 1), 1000);
    return () => clearTimeout(timer);
  }, [remaining]);

  return (
    <PortalButton
      variant="link"
      size="small"
      disabled={disabled || remaining > 0}
      onClick={async () => {
        await onResend();
        setRemaining(seconds);
      }}
    >
      {remaining > 0 ? `Reenviar código em ${remaining}s` : "Reenviar código"}
    </PortalButton>
  );
}
