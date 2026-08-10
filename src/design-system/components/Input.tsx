import { forwardRef, useState, type InputHTMLAttributes, type TextareaHTMLAttributes } from "react";
import { cn } from "../utilities";
import { icons, type LucideIcon } from "../icons";
import { IconButton } from "./Button";

type BaseProps = Omit<InputHTMLAttributes<HTMLInputElement>, "size"> & {
  /** Ícone à esquerda. */
  icon?: LucideIcon;
  /** Marca visualmente estado de erro (use com `Field`). */
  invalid?: boolean;
  /** Marca visualmente estado de sucesso. */
  valid?: boolean;
  /** Exibe spinner à direita. */
  loading?: boolean;
};

const inputBase =
  "flex h-[var(--field-height)] w-full rounded-[var(--field-radius)] border-[var(--field-border-width)] border-[var(--field-border)] bg-[var(--field-bg)] px-[var(--field-padding)] py-2 text-base text-[var(--field-text)] transition-all placeholder:text-[var(--field-placeholder)] focus-visible:outline-none focus-visible:border-[var(--field-border-focus)] focus-visible:ring-4 focus-visible:ring-[var(--field-focus-ring)] focus-visible:ring-offset-0 ds-shadow-xs disabled:cursor-not-allowed disabled:opacity-50";

/**
 * Campo de texto base do Design System.
 * @example <Input placeholder="Nome completo" icon={icons.perfil} />
 */
export const Input = forwardRef<HTMLInputElement, BaseProps>(function Input(
  { icon: Icon, invalid, valid, loading, className, ...props },
  ref,
) {
  const Spinner = icons.carregando;
  return (
    <div className="relative">
      {Icon && (
        <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
      )}
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        className={cn(
          inputBase,
          Icon && "pl-9",
          loading && "pr-9",
          invalid && "border-destructive focus-visible:ring-destructive",
          valid && "border-[hsl(var(--success))]",
          className,
        )}
        {...props}
      />
      {loading && (
        <Spinner className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" aria-hidden />
      )}
    </div>
  );
});

function maskDigits(value: string, pattern: string) {
  const digits = value.replace(/\D/g, "");
  let out = "";
  let i = 0;
  for (const ch of pattern) {
    if (i >= digits.length) break;
    if (ch === "#") {
      out += digits[i++];
    } else {
      out += ch;
    }
  }
  return out;
}

type MaskedProps = Omit<BaseProps, "onChange" | "value"> & {
  value?: string;
  onValueChange?: (value: string) => void;
};

function createMasked(pattern: string, defaults: Partial<BaseProps>, displayName: string) {
  const Comp = forwardRef<HTMLInputElement, MaskedProps>(function Masked({ value, onValueChange, ...props }, ref) {
    return (
      <Input
        ref={ref}
        inputMode="numeric"
        value={value !== undefined ? maskDigits(value, pattern) : undefined}
        onChange={(e) => onValueChange?.(maskDigits(e.target.value, pattern))}
        {...defaults}
        {...props}
      />
    );
  });
  Comp.displayName = displayName;
  return Comp;
}

/** CPF com máscara 000.000.000-00. @example <CPFInput value={cpf} onValueChange={setCpf} /> */
export const CPFInput = createMasked("###.###.###-##", { placeholder: "000.000.000-00", maxLength: 14, icon: icons.perfil }, "CPFInput");

/** Telefone com máscara (00) 00000-0000. */
export const PhoneInput = createMasked("(##) #####-####", { placeholder: "(71) 90000-0000", maxLength: 15, icon: icons.telefone }, "PhoneInput");

/** Data com máscara dd/mm/aaaa (padrão brasileiro). */
export const DateInput = createMasked("##/##/####", { placeholder: "dd/mm/aaaa", maxLength: 10, icon: icons.agenda }, "DateInput");

/** E-mail. @example <EmailInput id="email" /> */
export const EmailInput = forwardRef<HTMLInputElement, BaseProps>(function EmailInput(props, ref) {
  return <Input ref={ref} type="email" inputMode="email" autoComplete="email" icon={icons.email} placeholder="voce@exemplo.com" {...props} />;
});

/** Senha com alternância de visibilidade acessível. */
export const PasswordInput = forwardRef<HTMLInputElement, BaseProps>(function PasswordInput({ className, ...props }, ref) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <Input ref={ref} type={show ? "text" : "password"} icon={icons.senha} className={cn("pr-11", className)} {...props} />
      <IconButton
        type="button"
        icon={show ? icons.ocultar : icons.mostrar}
        label={show ? "Ocultar senha" : "Mostrar senha"}
        onClick={() => setShow((v) => !v)}
        className="absolute right-0 top-1/2 h-10 w-10 min-h-0 min-w-0 -translate-y-1/2"
      />
    </div>
  );
});

/** Campo de busca com ícone e botão de limpar. */
export const SearchInput = forwardRef<HTMLInputElement, BaseProps & { onClear?: () => void }>(function SearchInput(
  { onClear, value, className, ...props },
  ref,
) {
  return (
    <div className="relative">
      <Input ref={ref} type="search" role="searchbox" icon={icons.buscar} placeholder="Buscar..." value={value} className={cn(onClear && "pr-11", className)} {...props} />
      {onClear && !!value && (
        <IconButton
          type="button"
          icon={icons.fechar}
          label="Limpar busca"
          onClick={onClear}
          className="absolute right-0 top-1/2 h-10 w-10 min-h-0 min-w-0 -translate-y-1/2"
        />
      )}
    </div>
  );
});

/** Valor monetário em BRL. @example <MoneyInput value={valor} onValueChange={setValor} /> */
export const MoneyInput = forwardRef<HTMLInputElement, MaskedProps>(function MoneyInput({ value, onValueChange, ...props }, ref) {
  const format = (raw: string) => {
    const digits = raw.replace(/\D/g, "");
    if (!digits) return "";
    return (Number(digits) / 100).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };
  return (
    <Input
      ref={ref}
      inputMode="numeric"
      placeholder="R$ 0,00"
      value={value !== undefined ? format(value) : undefined}
      onChange={(e) => onValueChange?.(e.target.value.replace(/\D/g, ""))}
      {...props}
    />
  );
});

export type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean };

/** Área de texto padronizada. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea({ invalid, className, ...props }, ref) {
  return (
    <textarea
      ref={ref}
      aria-invalid={invalid || undefined}
      className={cn(
        inputBase,
        "min-h-24 resize-y py-2",
        invalid && "border-destructive focus-visible:ring-destructive",
        className,
      )}
      {...props}
    />
  );
});
