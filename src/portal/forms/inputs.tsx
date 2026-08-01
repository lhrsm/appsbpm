import { forwardRef, useMemo, useState, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/design-system/utilities";
import { icons, type LucideIcon } from "@/design-system/icons";
import { PortalIconButton } from "./buttons";
import {
  brDateToISO,
  defaultPasswordPolicy,
  evaluatePassword,
  isoToBrDate,
  normalizeEmail,
  normalizeRegistration,
  onlyDigits,
  type PasswordPolicy,
} from "./validation";

export const portalInputBase = [
  "flex min-h-11 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm text-foreground",
  "transition-colors placeholder:text-muted-foreground",
  "hover:border-ring/60",
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1 focus-visible:ring-offset-background",
  "disabled:cursor-not-allowed disabled:opacity-60 read-only:bg-muted/50",
].join(" ");

export interface TextInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size" | "prefix"> {
  iconLeft?: LucideIcon;
  iconRight?: LucideIcon;
  prefix?: ReactNode;
  suffix?: ReactNode;
  loading?: boolean;
  success?: boolean;
  /** Exibe botão de limpar quando há valor. */
  clearable?: boolean;
  onClear?: () => void;
}

/**
 * Campo de texto base. O rótulo vem sempre do `FormField` — nunca use
 * placeholder como substituto de label.
 *
 * @example <FormField label="Nome completo">{(f) => <TextInput {...f} autoComplete="name" />}</FormField>
 */
export const TextInput = forwardRef<HTMLInputElement, TextInputProps>(function TextInput(
  { iconLeft: Left, iconRight: Right, prefix, suffix, loading, success, clearable, onClear, className, ...props },
  ref,
) {
  const Spinner = icons.carregando;
  const invalid = props["aria-invalid"];
  const hasRight = Boolean(Right || loading || suffix || (clearable && props.value));
  return (
    <div
      className={cn(
        "flex items-stretch overflow-hidden rounded-lg",
        prefix || suffix ? "border border-input bg-background focus-within:ring-2 focus-within:ring-ring" : "",
      )}
    >
      {prefix && (
        <span className="flex items-center border-r border-input bg-muted/60 px-3 text-sm text-muted-foreground">{prefix}</span>
      )}
      <div className="relative flex-1">
        {Left && <Left className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />}
        <input
          ref={ref}
          className={cn(
            portalInputBase,
            prefix || suffix ? "rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0" : "",
            Left && "pl-9",
            hasRight && "pr-10",
            invalid && "border-destructive focus-visible:ring-destructive",
            success && !invalid && "border-[hsl(var(--success))]",
            className,
          )}
          {...props}
        />
        {loading ? (
          <Spinner className="absolute right-3 top-1/2 size-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden />
        ) : clearable && props.value ? (
          <PortalIconButton
            icon={icons.fechar}
            label="Limpar campo"
            tooltip={false}
            onClick={onClear}
            className="absolute right-0 top-1/2 size-9 min-h-9 min-w-9 -translate-y-1/2"
          />
        ) : Right ? (
          <Right className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        ) : null}
      </div>
      {suffix && <span className="flex items-center border-l border-input bg-muted/60 px-3 text-sm text-muted-foreground">{suffix}</span>}
    </div>
  );
});

/* ------------------------------------------------------------------ */
/* Máscaras                                                            */
/* ------------------------------------------------------------------ */

function applyPattern(value: string, pattern: string) {
  const digits = onlyDigits(value);
  let out = "";
  let i = 0;
  for (const ch of pattern) {
    if (i >= digits.length) break;
    if (ch === "#") out += digits[i++];
    else out += ch;
  }
  return out;
}

export interface MaskedInputProps extends Omit<TextInputProps, "onChange" | "value"> {
  value?: string;
  /** Recebe sempre o valor normalizado (somente dígitos, quando aplicável). */
  onValueChange?: (value: string) => void;
}

/** CPF com máscara progressiva. Emite somente dígitos. */
export const CPFInput = forwardRef<HTMLInputElement, MaskedInputProps>(function CPFInput({ value, onValueChange, ...props }, ref) {
  return (
    <TextInput
      ref={ref}
      inputMode="numeric"
      autoComplete="off"
      placeholder="000.000.000-00"
      maxLength={14}
      iconLeft={icons.perfil}
      value={applyPattern(value ?? "", "###.###.###-##")}
      onChange={(e) => onValueChange?.(onlyDigits(e.target.value).slice(0, 11))}
      {...props}
    />
  );
});

/** Matrícula militar ou institucional. Sem máscara rígida. */
export const RegistrationInput = forwardRef<HTMLInputElement, MaskedInputProps>(function RegistrationInput(
  { value, onValueChange, ...props },
  ref,
) {
  return (
    <TextInput
      ref={ref}
      inputMode="text"
      autoComplete="off"
      placeholder="Ex.: 123456"
      maxLength={20}
      iconLeft={icons.carteirinha}
      value={value ?? ""}
      onChange={(e) => onValueChange?.(normalizeRegistration(e.target.value))}
      {...props}
    />
  );
});

export interface PhoneInputProps extends MaskedInputProps {
  /** Código do país exibido como prefixo. */
  countryCode?: string;
  /** Mostra o ícone de WhatsApp no campo. */
  whatsapp?: boolean;
}

/** Telefone/WhatsApp brasileiro. Emite somente dígitos (sem o código do país). */
export const PhoneInput = forwardRef<HTMLInputElement, PhoneInputProps>(function PhoneInput(
  { value, onValueChange, countryCode = "+55", whatsapp, ...props },
  ref,
) {
  const digits = onlyDigits(value ?? "");
  const pattern = digits.length > 10 ? "(##) #####-####" : "(##) ####-#####";
  return (
    <TextInput
      ref={ref}
      inputMode="tel"
      autoComplete="tel"
      placeholder="(71) 90000-0000"
      maxLength={15}
      prefix={countryCode}
      iconRight={whatsapp ? icons.whatsapp : undefined}
      value={applyPattern(digits, pattern)}
      onChange={(e) => onValueChange?.(onlyDigits(e.target.value).slice(0, 11))}
      {...props}
    />
  );
});

/** E-mail normalizado para minúsculas e sem espaços. */
export const EmailInput = forwardRef<HTMLInputElement, MaskedInputProps>(function EmailInput({ value, onValueChange, ...props }, ref) {
  return (
    <TextInput
      ref={ref}
      type="email"
      inputMode="email"
      autoComplete="email"
      spellCheck={false}
      placeholder="voce@exemplo.com"
      iconLeft={icons.email}
      value={value ?? ""}
      onChange={(e) => onValueChange?.(normalizeEmail(e.target.value))}
      {...props}
    />
  );
});

export interface PasswordInputProps extends Omit<TextInputProps, "type"> {
  /** Exibe a lista de requisitos e o indicador de força. */
  showStrength?: boolean;
  policy?: PasswordPolicy;
  /** Valor a comparar (confirmação de senha). */
  compareTo?: string;
  newPassword?: boolean;
}

/**
 * Senha com mostrar/ocultar, alerta de Caps Lock e indicador de força.
 * O valor nunca é registrado em log.
 */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(function PasswordInput(
  { showStrength, policy = defaultPasswordPolicy, compareTo, newPassword, className, value, ...props },
  ref,
) {
  const [show, setShow] = useState(false);
  const [caps, setCaps] = useState(false);
  const text = typeof value === "string" ? value : "";
  const strength = useMemo(() => evaluatePassword(text, policy), [text, policy]);

  return (
    <div className="space-y-2">
      <div className="relative">
        <TextInput
          ref={ref}
          type={show ? "text" : "password"}
          autoComplete={newPassword ? "new-password" : "current-password"}
          iconLeft={icons.senha}
          value={value}
          onKeyUp={(e) => setCaps(e.getModifierState?.("CapsLock") ?? false)}
          className={cn("pr-12", className)}
          {...props}
        />
        <PortalIconButton
          icon={show ? icons.ocultar : icons.mostrar}
          label={show ? "Ocultar senha" : "Mostrar senha"}
          tooltip={false}
          onClick={() => setShow((v) => !v)}
          className="absolute right-0 top-1/2 size-10 min-h-10 min-w-10 -translate-y-1/2"
        />
      </div>

      {caps && (
        <p className="text-xs text-muted-foreground" role="status">
          Caps Lock está ativado.
        </p>
      )}

      {showStrength && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-muted">
              <div
                className={cn(
                  "h-full rounded-full transition-all",
                  strength.nivel === "forte" && "bg-[hsl(var(--success))]",
                  strength.nivel === "media" && "bg-[hsl(var(--warning,38_92%_50%))]",
                  strength.nivel === "fraca" && "bg-destructive",
                )}
                style={{ width: `${Math.max(strength.score * 100, 8)}%` }}
              />
            </div>
            <span className="text-xs capitalize text-muted-foreground">{strength.nivel}</span>
          </div>
          <ul className="grid gap-1 sm:grid-cols-2">
            {strength.requirements.map((r) => {
              const Icon = r.ok ? icons.sucesso : icons.info;
              return (
                <li
                  key={r.id}
                  className={cn("flex items-center gap-1.5 text-xs", r.ok ? "text-[hsl(var(--success))]" : "text-muted-foreground")}
                >
                  <Icon className="size-3.5" aria-hidden />
                  {r.label}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {compareTo !== undefined && text.length > 0 && (
        <p className={cn("text-xs", compareTo === text ? "text-[hsl(var(--success))]" : "text-muted-foreground")} role="status">
          {compareTo === text ? "As senhas conferem." : "Repita a mesma senha."}
        </p>
      )}
    </div>
  );
});

export interface DateInputProps extends Omit<TextInputProps, "value" | "onChange" | "type"> {
  /** Valor no formato ISO (aaaa-mm-dd). */
  value?: string;
  onValueChange?: (iso: string) => void;
  /** Bloqueia datas futuras (ex.: nascimento). */
  disableFuture?: boolean;
  min?: string;
  max?: string;
  /** Usa input nativo `date` (padrão) ou máscara textual dd/mm/aaaa. */
  native?: boolean;
}

/**
 * Data. Exibe padrão brasileiro, armazena ISO (aaaa-mm-dd), sem timezone.
 * O input nativo fica dentro de um wrapper — nunca aplique padding direto nele (iOS).
 */
export const DateInput = forwardRef<HTMLInputElement, DateInputProps>(function DateInput(
  { value, onValueChange, disableFuture, min, max, native = true, className, ...props },
  ref,
) {
  const today = new Date().toISOString().slice(0, 10);
  const [text, setText] = useState(() => isoToBrDate(value));

  if (native) {
    return (
      <div className={cn("relative flex min-h-11 w-full items-center rounded-lg border border-input bg-background px-3 focus-within:ring-2 focus-within:ring-ring", className)}>
        <input
          ref={ref}
          type="date"
          value={value ?? ""}
          min={min}
          max={disableFuture ? today : max}
          onChange={(e) => onValueChange?.(e.target.value)}
          className="w-full appearance-none border-0 bg-transparent py-2 text-sm text-foreground outline-none"
          {...props}
        />
      </div>
    );
  }

  return (
    <TextInput
      ref={ref}
      inputMode="numeric"
      placeholder="dd/mm/aaaa"
      maxLength={10}
      iconLeft={icons.agenda}
      value={applyPattern(text, "##/##/####")}
      onChange={(e) => {
        const masked = applyPattern(e.target.value, "##/##/####");
        setText(masked);
        onValueChange?.(brDateToISO(masked) ?? "");
      }}
      className={className}
      {...props}
    />
  );
});
