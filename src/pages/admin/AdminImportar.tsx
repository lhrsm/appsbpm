import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Upload, FileText, Download, CheckCircle2, AlertCircle, FileDown } from "lucide-react";
import { logAudit } from "@/lib/audit";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

type TargetTable = "associados" | "dependentes" | "clinicas_parceiros" | "limites" | "informes_rendimentos";

const PATENTES = ["Coronel","Tenente-Coronel","Major","Capitão","Tenente","Aspirante a Oficial","Subtenente","Sargento","Cabo","Soldado"];
const PARENTESCOS = [
  { value: "conjuge", label: "Cônjuge" },
  { value: "filho", label: "Filho(a)" },
  { value: "pai_mae", label: "Pai/Mãe" },
  { value: "outro", label: "Outro" },
];

const TABLES: Record<TargetTable, { label: string; required: string[]; sample: string }> = {
  associados: {
    label: "Associados",
    required: ["matricula", "nome", "cpf"],
    sample: "matricula,nome,cpf,email,telefone,data_nascimento,data_admissao,ativo\n001,João da Silva,12345678900,joao@email.com,71999990000,1980-05-10,2015-01-01,true",
  },
  dependentes: {
    label: "Dependentes",
    required: ["associado_matricula", "nome", "cpf"],
    sample: "associado_matricula,nome,cpf,tipo,data_nascimento,ativo\n001,Maria Silva,98765432100,Cônjuge,1985-03-20,true",
  },
  clinicas_parceiros: {
    label: "Clínicas & Parceiros",
    required: ["nome"],
    sample: "nome,categoria,cidade,endereco,telefone,logo_url,ativo\nClínica Exemplo,Laboratório,Salvador,Rua X 123,7130001111,,true",
  },
  limites: {
    label: "Limites",
    required: ["associado_matricula", "valor_total"],
    sample: "associado_matricula,valor_total,valor_utilizado,mes_referencia\n001,1000,250,2026-07",
  },
  informes_rendimentos: {
    label: "Informes de Rendimentos",
    required: ["associado_matricula", "ano_referencia"],
    sample: "associado_matricula,ano_referencia,valor_total\n001,2025,3600",
  },
};

function parseCSV(text: string): { headers: string[]; rows: Record<string, string>[] } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) return { headers: [], rows: [] };
  const parseLine = (line: string): string[] => {
    const out: string[] = [];
    let cur = "";
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (inQuotes) {
        if (ch === '"' && line[i + 1] === '"') { cur += '"'; i++; }
        else if (ch === '"') { inQuotes = false; }
        else cur += ch;
      } else {
        if (ch === ',') { out.push(cur); cur = ""; }
        else if (ch === '"') { inQuotes = true; }
        else cur += ch;
      }
    }
    out.push(cur);
    return out.map((s) => s.trim());
  };
  const headers = parseLine(lines[0]);
  const rows = lines.slice(1).map((l) => {
    const cells = parseLine(l);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = cells[i] ?? ""; });
    return obj;
  });
  return { headers, rows };
}

export default function AdminImportar() {
  const [target, setTarget] = useState<TargetTable>("associados");
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<{ headers: string[]; rows: Record<string, string>[] } | null>(null);
  const [importing, setImporting] = useState(false);
  const [result, setResult] = useState<{ success: number; failed: number; errors: string[] } | null>(null);
  const [filtroPatente, setFiltroPatente] = useState<string>("todos");
  const [filtroStatus, setFiltroStatus] = useState<string>("todos");
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [filtroCidade, setFiltroCidade] = useState<string>("");
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const cfg = TABLES[target];

  const onFile = async (f: File) => {
    setFile(f);
    setResult(null);
    const text = await f.text();
    const parsed = parseCSV(text);
    setPreview(parsed);
    const missing = cfg.required.filter((r) => !parsed.headers.includes(r));
    if (missing.length) toast.warning(`Colunas obrigatórias ausentes: ${missing.join(", ")}`);
    else toast.success(`${parsed.rows.length} linhas prontas para importar`);
  };

  const downloadSample = () => {
    const blob = new Blob([cfg.sample], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `modelo_${target}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const downloadPdf = async () => {
    setGeneratingPdf(true);
    try {
      const doc = new jsPDF();
      const now = new Date().toLocaleString("pt-BR");
      let head: string[][] = [];
      let body: any[][] = [];
      let title = cfg.label;
      let subtitle = "";

      if (target === "associados") {
        let q = supabase.from("associados").select("nome,matricula,cpf,patente,ativo,cidade").order("nome");
        if (filtroPatente !== "todos") q = q.eq("patente", filtroPatente);
        if (filtroStatus !== "todos") q = q.eq("ativo", filtroStatus === "ativo");
        if (filtroCidade.trim()) q = q.ilike("cidade", `%${filtroCidade.trim()}%`);
        const { data, error } = await q;
        if (error) throw error;
        head = [["Nome", "Matrícula", "CPF", "Patente", "Status"]];
        body = (data ?? []).map((r: any) => [r.nome, r.matricula, r.cpf, r.patente ?? "-", r.ativo ? "Ativo" : "Inativo"]);
        subtitle = `Patente: ${filtroPatente === "todos" ? "Todas" : filtroPatente} · Status: ${filtroStatus === "todos" ? "Todos" : filtroStatus} · Cidade: ${filtroCidade || "Todas"}`;
      } else if (target === "dependentes") {
        let q = supabase.from("dependentes").select("nome,cpf,tipo,ativo,associados(nome,matricula)").order("nome");
        if (filtroTipo !== "todos") q = q.eq("tipo", filtroTipo as any);
        if (filtroStatus !== "todos") q = q.eq("ativo", filtroStatus === "ativo");
        const { data, error } = await q;
        if (error) throw error;
        head = [["Nome", "CPF", "Parentesco", "Titular", "Status"]];
        body = (data ?? []).map((r: any) => [r.nome, r.cpf, PARENTESCOS.find(p => p.value === r.tipo)?.label ?? r.tipo, r.associados ? `${r.associados.nome} (${r.associados.matricula})` : "-", r.ativo ? "Ativo" : "Inativo"]);
        subtitle = `Parentesco: ${filtroTipo === "todos" ? "Todos" : PARENTESCOS.find(p => p.value === filtroTipo)?.label} · Status: ${filtroStatus === "todos" ? "Todos" : filtroStatus}`;
      } else if (target === "clinicas_parceiros") {
        let q = supabase.from("clinicas_parceiros").select("nome,categoria,cidade,estado,telefone,ativo").order("nome");
        if (filtroStatus !== "todos") q = q.eq("ativo", filtroStatus === "ativo");
        if (filtroCidade.trim()) q = q.ilike("cidade", `%${filtroCidade.trim()}%`);
        const { data, error } = await q;
        if (error) throw error;
        head = [["Nome", "Categoria", "Cidade/UF", "Telefone", "Status"]];
        body = (data ?? []).map((r: any) => [r.nome, r.categoria ?? "-", `${r.cidade ?? "-"}/${r.estado ?? "-"}`, r.telefone ?? "-", r.ativo ? "Ativo" : "Inativo"]);
        subtitle = `Cidade: ${filtroCidade || "Todas"} · Status: ${filtroStatus === "todos" ? "Todos" : filtroStatus}`;
      } else {
        toast.info("Exportação em PDF disponível para Associados, Dependentes e Clínicas.");
        setGeneratingPdf(false);
        return;
      }

      doc.setFontSize(14);
      doc.text(`SBPM — ${title}`, 14, 15);
      doc.setFontSize(9);
      doc.setTextColor(100);
      if (subtitle) doc.text(subtitle, 14, 21);
      doc.text(`Gerado em ${now} · ${body.length} registro(s)`, 14, 26);

      autoTable(doc, {
        head,
        body,
        startY: 30,
        styles: { fontSize: 9 },
        headStyles: { fillColor: [16, 122, 60] },
      });

      doc.save(`${target}_${Date.now()}.pdf`);
      await logAudit("export_pdf", target, null, { count: body.length, filtros: { filtroPatente, filtroStatus, filtroTipo, filtroCidade } });
      toast.success(`${body.length} registro(s) exportado(s) em PDF`);
    } catch (e: any) {
      toast.error(e.message ?? "Falha ao gerar PDF");
    } finally {
      setGeneratingPdf(false);
    }
  };

  const normalizeRow = async (row: Record<string, string>): Promise<any> => {
    const out: any = {};
    for (const [k, v] of Object.entries(row)) {
      if (v === "" || v == null) continue;
      if (v.toLowerCase() === "true") out[k] = true;
      else if (v.toLowerCase() === "false") out[k] = false;
      else if (/^-?\d+(\.\d+)?$/.test(v) && !["matricula", "cpf", "telefone", "cep"].includes(k)) out[k] = Number(v);
      else out[k] = v;
    }
    if (target === "dependentes" && out.associado_matricula) {
      const { data } = await supabase.from("associados").select("id").eq("matricula", String(out.associado_matricula)).maybeSingle();
      if (!data) throw new Error(`Matrícula não encontrada: ${out.associado_matricula}`);
      out.associado_id = data.id;
      delete out.associado_matricula;
    }
    if ((target === "limites" || target === "informes_rendimentos") && out.associado_matricula) {
      const { data } = await supabase.from("associados").select("id").eq("matricula", String(out.associado_matricula)).maybeSingle();
      if (!data) throw new Error(`Matrícula não encontrada: ${out.associado_matricula}`);
      out.associado_id = data.id;
      delete out.associado_matricula;
    }
    return out;
  };

  const doImport = async () => {
    if (!preview) return;
    setImporting(true);
    setResult(null);
    let success = 0;
    let failed = 0;
    const errors: string[] = [];
    for (let i = 0; i < preview.rows.length; i++) {
      try {
        const payload = await normalizeRow(preview.rows[i]);
        const { error } = await (supabase.from as any)(target).insert(payload);
        if (error) throw error;
        success++;
      } catch (e: any) {
        failed++;
        errors.push(`Linha ${i + 2}: ${e.message ?? String(e)}`);
      }
    }
    setResult({ success, failed, errors: errors.slice(0, 20) });
    await logAudit("import_csv", target, null, { total: preview.rows.length, success, failed });
    if (failed === 0) toast.success(`${success} registros importados`);
    else toast.warning(`${success} importados, ${failed} falharam`);
    setImporting(false);
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Importações</h1>
        <p className="text-sm text-muted-foreground">Suba planilhas CSV ou baixe modelos e relatórios em PDF</p>
      </div>

      <Card className="p-6 space-y-4">
        <div>
          <Label>Entidade de destino</Label>
          <select
            className="mt-1 flex h-10 w-full max-w-sm rounded-md border border-input bg-background px-3 py-2 text-sm"
            value={target}
            onChange={(e) => { setTarget(e.target.value as TargetTable); setPreview(null); setFile(null); setResult(null); }}
          >
            {Object.entries(TABLES).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground mt-2">
            Colunas obrigatórias: <span className="font-mono">{cfg.required.join(", ")}</span>
          </p>
        </div>

        {(target === "associados" || target === "dependentes" || target === "clinicas_parceiros") && (
          <div className="border rounded-md p-4 bg-muted/30 space-y-3">
            <p className="text-sm font-semibold">Filtros para exportação em PDF</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {target === "associados" && (
                <div>
                  <Label className="text-xs">Patente</Label>
                  <select className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={filtroPatente} onChange={(e) => setFiltroPatente(e.target.value)}>
                    <option value="todos">Todas</option>
                    {PATENTES.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              )}
              {target === "dependentes" && (
                <div>
                  <Label className="text-xs">Grau de parentesco</Label>
                  <select className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
                    <option value="todos">Todos</option>
                    {PARENTESCOS.map((p) => <option key={p.value} value={p.value}>{p.label}</option>)}
                  </select>
                </div>
              )}
              <div>
                <Label className="text-xs">Status</Label>
                <select className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={filtroStatus} onChange={(e) => setFiltroStatus(e.target.value)}>
                  <option value="todos">Todos</option>
                  <option value="ativo">Ativos</option>
                  <option value="inativo">Inativos</option>
                </select>
              </div>
              {(target === "associados" || target === "clinicas_parceiros") && (
                <div>
                  <Label className="text-xs">Cidade (contém)</Label>
                  <input className="mt-1 h-9 w-full rounded-md border border-input bg-background px-2 text-sm" value={filtroCidade} onChange={(e) => setFiltroCidade(e.target.value)} placeholder="Ex: Salvador" />
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={downloadSample}>
            <Download className="w-4 h-4 mr-2" />Baixar modelo CSV
          </Button>
          <Button variant="outline" onClick={downloadPdf} disabled={generatingPdf}>
            <FileDown className="w-4 h-4 mr-2" />{generatingPdf ? "Gerando PDF..." : "Baixar modelo PDF"}
          </Button>
          <label className="inline-flex">
            <input type="file" accept=".csv,text/csv" className="hidden" onChange={(e) => e.target.files?.[0] && onFile(e.target.files[0])} />
            <span className="inline-flex items-center gap-2 h-10 px-4 rounded-md bg-primary text-primary-foreground text-sm cursor-pointer hover:opacity-90">
              <Upload className="w-4 h-4" />Selecionar arquivo
            </span>
          </label>
          {file && <div className="flex items-center gap-2 text-sm text-muted-foreground"><FileText className="w-4 h-4" />{file.name}</div>}
        </div>

        {preview && (
          <div className="space-y-2">
            <p className="text-sm font-semibold">Prévia — {preview.rows.length} linhas / {preview.headers.length} colunas</p>
            <div className="overflow-auto max-h-72 border rounded">
              <table className="text-xs w-full">
                <thead className="bg-muted sticky top-0">
                  <tr>{preview.headers.map((h) => <th key={h} className="text-left p-2 font-medium">{h}</th>)}</tr>
                </thead>
                <tbody>
                  {preview.rows.slice(0, 20).map((r, i) => (
                    <tr key={i} className="border-t">
                      {preview.headers.map((h) => <td key={h} className="p-2 truncate max-w-[160px]">{r[h]}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <Button onClick={doImport} disabled={importing}>
              {importing ? "Importando..." : `Importar ${preview.rows.length} registros`}
            </Button>
          </div>
        )}

        {result && (
          <Card className="p-4 bg-muted/50 space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <CheckCircle2 className="w-4 h-4 text-primary" />
              <span><b>{result.success}</b> importados com sucesso</span>
            </div>
            {result.failed > 0 && (
              <>
                <div className="flex items-center gap-2 text-sm">
                  <AlertCircle className="w-4 h-4 text-destructive" />
                  <span><b>{result.failed}</b> falharam</span>
                </div>
                <div className="text-xs font-mono bg-background p-2 rounded max-h-40 overflow-auto">
                  {result.errors.map((e, i) => <div key={i}>{e}</div>)}
                </div>
              </>
            )}
          </Card>
        )}
      </Card>
    </div>
  );
}
