import { useState } from "react";
import { icons } from "@/design-system/icons";
import { PortalButton } from "@/portal/forms/buttons";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { portalToast } from "@/portal/ui/feedback";
import { visibleColumns, type DataColumn, type PermissionSet } from "./types";

export type ExportFormat = "csv" | "xlsx" | "pdf" | "print";

/** Evita injeção de fórmula em planilhas (CSV injection). */
export function sanitizeCell(value: unknown): string {
  const text = value === null || value === undefined ? "" : String(value);
  return /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
}

function formatValue(value: unknown): string {
  if (value instanceof Date) return value.toLocaleDateString("pt-BR");
  return sanitizeCell(value);
}

/** Monta as linhas exportáveis respeitando permissões, sensibilidade e `exportable`. */
export function buildExportRows<T>(
  columns: DataColumn<T>[],
  rows: T[],
  permissions?: PermissionSet,
  includeSensitive = false,
): { headers: string[]; body: string[][]; columns: DataColumn<T>[] } {
  const cols = visibleColumns(columns, permissions).filter(
    (c) => c.exportable !== false && (includeSensitive || !c.sensitive),
  );
  return {
    columns: cols,
    headers: cols.map((c) => (typeof c.header === "string" ? c.header : c.id)),
    body: rows.map((row) => cols.map((c) => formatValue(c.accessor?.(row)))),
  };
}

export function toCSV(headers: string[], body: string[][]): string {
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  return [headers, ...body].map((line) => line.map(escape).join(";")).join("\r\n");
}

function download(content: BlobPart, filename: string, mime: string) {
  const url = URL.createObjectURL(new Blob([content], { type: mime }));
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function fileName(base: string, ext: string) {
  const date = new Date().toISOString().slice(0, 10);
  return `${base.toLowerCase().replace(/[^a-z0-9]+/g, "-")}-${date}.${ext}`;
}

export interface DataExportMenuProps<T> {
  columns: DataColumn<T>[];
  /** Registros a exportar — normalmente os resultados filtrados. */
  rows: T[];
  /** Nome base do arquivo (ex.: "solicitacoes"). */
  baseName: string;
  /** Título impresso no PDF/impressão. */
  title?: string;
  formats?: ExportFormat[];
  permissions?: PermissionSet;
  /** Permite exportar colunas marcadas como sensíveis (requer autorização). */
  includeSensitive?: boolean;
  disabled?: boolean;
  className?: string;
}

/**
 * Menu de exportação das listagens (CSV, planilha, PDF e impressão).
 * Exporta o que está filtrado, nunca dados que o usuário não pode ver.
 *
 * @example <DataExportMenu baseName="solicitacoes" title="Minhas solicitações" columns={colunas} rows={filtrados} />
 */
export function DataExportMenu<T>({
  columns,
  rows,
  baseName,
  title,
  formats = ["csv", "pdf", "print"],
  permissions,
  includeSensitive = false,
  disabled,
  className,
}: DataExportMenuProps<T>) {
  const [busy, setBusy] = useState(false);
  const empty = rows.length === 0;

  const run = async (format: ExportFormat) => {
    if (empty) return portalToast.info("Não há registros para exportar.");
    setBusy(true);
    try {
      const { headers, body } = buildExportRows(columns, rows, permissions, includeSensitive);

      if (format === "csv") {
        download("\uFEFF" + toCSV(headers, body), fileName(baseName, "csv"), "text/csv;charset=utf-8");
      } else if (format === "xlsx") {
        const { utils, writeFile } = await import("xlsx");
        const sheet = utils.aoa_to_sheet([headers, ...body]);
        const book = utils.book_new();
        utils.book_append_sheet(book, sheet, "Dados");
        writeFile(book, fileName(baseName, "xlsx"));
      } else {
        printTable(title ?? baseName, headers, body, format === "pdf");
      }
      portalToast.success(
        format === "print" ? "Enviado para impressão." : "Exportação concluída. Verifique seus downloads.",
      );
    } catch {
      portalToast.error("Não foi possível concluir a exportação. Tente novamente.");
    } finally {
      setBusy(false);
    }
  };

  const labels: Record<ExportFormat, string> = {
    csv: "Exportar CSV",
    xlsx: "Exportar planilha (XLSX)",
    pdf: "Exportar PDF",
    print: "Imprimir",
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <PortalButton
          variant="outline"
          size="small"
          iconLeft={icons.baixar}
          loading={busy}
          loadingText="Exportando..."
          disabled={disabled || empty}
          className={className}
        >
          Exportar
        </PortalButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[14rem]">
        <DropdownMenuLabel className="text-xs font-normal text-muted-foreground">
          {rows.length} registro(s) filtrado(s)
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {formats.map((format) => (
          <DropdownMenuItem key={format} className="gap-2" onSelect={() => run(format)}>
            {format === "print" ? (
              <icons.imprimir className="h-4 w-4" aria-hidden />
            ) : (
              <icons.documento className="h-4 w-4" aria-hidden />
            )}
            {labels[format]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/** Abre a janela de impressão com uma tabela institucional simples. */
export function printTable(title: string, headers: string[], body: string[][], asPdfHint = false) {
  const win = window.open("", "_blank", "width=1024,height=768");
  if (!win) throw new Error("popup-blocked");
  const escape = (v: string) => v.replace(/[&<>]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;" })[c] as string);
  win.document.write(`<!doctype html><html lang="pt-BR"><head><meta charset="utf-8" />
<title>${escape(title)}</title>
<style>
  body { font-family: system-ui, sans-serif; color: #1a1a1a; padding: 24px; }
  h1 { font-size: 18px; margin: 0 0 4px; }
  p.meta { font-size: 12px; color: #555; margin: 0 0 16px; }
  table { width: 100%; border-collapse: collapse; font-size: 12px; }
  th, td { border: 1px solid #ddd; padding: 6px 8px; text-align: left; }
  thead { background: #f2f4f7; }
  @media print { @page { margin: 12mm; } }
</style></head><body>
<h1>${escape(title)}</h1>
<p class="meta">SBPM — gerado em ${new Date().toLocaleString("pt-BR")}${asPdfHint ? " — selecione \"Salvar como PDF\"" : ""}</p>
<table><thead><tr>${headers.map((h) => `<th>${escape(h)}</th>`).join("")}</tr></thead>
<tbody>${body.map((r) => `<tr>${r.map((c) => `<td>${escape(c)}</td>`).join("")}</tr>`).join("")}</tbody></table>
</body></html>`);
  win.document.close();
  win.focus();
  win.print();
}
