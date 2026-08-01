import { useCallback, useId, useRef, useState, type DragEvent } from "react";
import { cn } from "@/design-system/utilities";
import { icons } from "@/design-system/icons";
import { PortalButton, PortalIconButton } from "./buttons";
import { validationMessages } from "./validation";

export interface UploadedFile {
  id: string;
  file: File;
  progress?: number;
  error?: string;
}

export interface FileUploadFieldProps {
  id?: string;
  value: UploadedFile[];
  onChange: (files: UploadedFile[]) => void;
  /** Extensões aceitas (atributo accept). */
  accept?: string;
  /** MIME types permitidos — validação real, não confiar só na extensão. */
  allowedMimeTypes?: string[];
  maxFiles?: number;
  /** Tamanho máximo por arquivo, em MB. */
  maxSizeMB?: number;
  multiple?: boolean;
  disabled?: boolean;
  helperText?: string;
  "aria-describedby"?: string;
}

const DEFAULT_MIME = ["application/pdf", "image/png", "image/jpeg"];

const formatSize = (bytes: number) => (bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`);

/** Nome seguro para armazenamento. */
export const safeFileName = (name: string) => name.replace(/[^\w.\-]+/g, "_").slice(-120);

/**
 * Upload com seleção, arrastar/soltar, prévia, progresso e remoção.
 * A validação aqui é de UX — o backend continua validando tipo e tamanho.
 */
export function FileUploadField({
  id,
  value,
  onChange,
  accept = ".pdf,.png,.jpg,.jpeg",
  allowedMimeTypes = DEFAULT_MIME,
  maxFiles = 5,
  maxSizeMB = 10,
  multiple = true,
  disabled,
  helperText,
  ...aria
}: FileUploadFieldProps) {
  const generated = useId();
  const inputId = id ?? generated;
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const validate = useCallback(
    (file: File): string | null => {
      if (allowedMimeTypes.length && !allowedMimeTypes.includes(file.type)) return validationMessages.arquivoTipo;
      if (file.size > maxSizeMB * 1024 * 1024) return `${validationMessages.arquivoTamanho} (máx. ${maxSizeMB} MB)`;
      return null;
    },
    [allowedMimeTypes, maxSizeMB],
  );

  const addFiles = useCallback(
    (list: FileList | null) => {
      if (!list || disabled) return;
      const incoming = Array.from(list);
      if (value.length + incoming.length > maxFiles) {
        setErro(`${validationMessages.arquivoQuantidade} (máx. ${maxFiles}).`);
        return;
      }
      const next: UploadedFile[] = [];
      let firstError: string | null = null;
      for (const file of incoming) {
        const error = validate(file);
        if (error && !firstError) firstError = error;
        next.push({ id: `${Date.now()}-${file.name}-${Math.random().toString(36).slice(2, 7)}`, file, error: error ?? undefined });
      }
      setErro(firstError);
      onChange([...value, ...next]);
    },
    [disabled, maxFiles, onChange, validate, value],
  );

  const onDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  };

  const Upload = icons.enviar;
  const Doc = icons.documento;

  return (
    <div className="space-y-3">
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        className={cn(
          "rounded-lg border-2 border-dashed p-5 text-center transition-colors",
          dragging ? "border-primary bg-primary/5" : "border-border bg-muted/20",
          disabled && "opacity-60",
        )}
      >
        <Upload className="mx-auto size-6 text-muted-foreground" aria-hidden />
        <p className="mt-2 text-sm text-foreground">Arraste os arquivos aqui ou selecione no dispositivo.</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {helperText ?? `Até ${maxFiles} arquivos, ${maxSizeMB} MB cada. Formatos: ${accept.replaceAll(".", "").toUpperCase()}.`}
        </p>
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          className="sr-only"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
          {...aria}
        />
        <PortalButton variant="secondary" size="small" className="mt-3" disabled={disabled} onClick={() => inputRef.current?.click()}>
          Selecionar arquivos
        </PortalButton>
      </div>

      {erro && (
        <p role="alert" className="text-xs font-medium text-destructive">
          {erro}
        </p>
      )}

      {value.length > 0 && (
        <ul className="space-y-2">
          {value.map((item) => (
            <li
              key={item.id}
              className={cn("flex items-center gap-3 rounded-lg border p-2.5", item.error ? "border-destructive/50 bg-destructive/5" : "border-border")}
            >
              <Doc className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm text-foreground">{item.file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {formatSize(item.file.size)}
                  {item.error ? ` — ${item.error}` : ""}
                </p>
                {typeof item.progress === "number" && item.progress < 100 && (
                  <div className="mt-1 h-1 overflow-hidden rounded-full bg-muted">
                    <div className="h-full bg-primary transition-all" style={{ width: `${item.progress}%` }} />
                  </div>
                )}
              </div>
              <PortalIconButton
                icon={icons.excluir}
                label={`Remover ${item.file.name}`}
                variant="ghost"
                className="size-9 min-h-9 min-w-9"
                onClick={() => onChange(value.filter((f) => f.id !== item.id))}
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
