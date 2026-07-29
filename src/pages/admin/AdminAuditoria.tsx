import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, RefreshCw, Download, Eye, ShieldCheck, FileJson } from "lucide-react";
import { AUDIT_ACOES, AUDIT_MODULOS, AUDIT_CRITICIDADES, acaoLabel, logAudit } from "@/lib/audit";

const TODOS = "__todos__";

const criticidadeVariant: Record<string, "secondary" | "outline" | "destructive" | "default"> = {
  baixa: "outline",
  media: "secondary",
  alta: "default",
  critica: "destructive",
};

export default function AdminAuditoria() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modulo, setModulo] = useState(TODOS);
  const [acao, setAcao] = useState(TODOS);
  const [criticidade, setCriticidade] = useState(TODOS);
  const [registro, setRegistro] = useState("");
  const [usuario, setUsuario] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [detail, setDetail] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    let q = supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(1000);
    if (modulo !== TODOS) q = q.eq("modulo", modulo);
    if (acao !== TODOS) q = q.eq("action", acao);
    if (criticidade !== TODOS) q = q.eq("criticidade", criticidade);
    if (usuario) q = q.ilike("user_email", `%${usuario}%`);
    if (registro) q = q.or(`entity.ilike.%${registro}%,entity_id.ilike.%${registro}%`);
    if (from) q = q.gte("created_at", new Date(from).toISOString());
    if (to) q = q.lte("created_at", new Date(to + "T23:59:59").toISOString());
    const { data, error } = await q;
    if (error) toast.error(error.message);
    else setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const limparFiltros = () => {
    setModulo(TODOS); setAcao(TODOS); setCriticidade(TODOS);
    setRegistro(""); setUsuario(""); setFrom(""); setTo("");
  };

  const resumo = useMemo(() => {
    const criticos = rows.filter((r) => r.criticidade === "critica" || r.criticidade === "alta").length;
    const usuarios = new Set(rows.map((r) => r.user_email).filter(Boolean)).size;
    return { total: rows.length, criticos, usuarios };
  }, [rows]);

  const baixar = (conteudo: string, nome: string, mime: string) => {
    const blob = new Blob([conteudo], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = nome;
    a.click();
    URL.revokeObjectURL(url);
  };

  const registrarExportacao = (formato: string) =>
    logAudit("exportacao", "audit_logs", null, {
      modulo: "auditoria",
      criticidade: "media",
      detalhes: {
        formato,
        registros: rows.length,
        filtros: { modulo, acao, criticidade, registro, usuario, de: from, ate: to },
      },
    });

  const exportCSV = async () => {
    if (!rows.length) return toast.error("Nada para exportar");
    const header = [
      "Data/Hora", "Usuário", "Perfil", "Módulo", "Ação", "Criticidade", "Registro", "ID do registro",
      "Valor anterior", "Valor posterior", "Justificativa", "Origem", "IP", "Dispositivo", "Operação",
    ];
    const csv = [header.join(";")]
      .concat(rows.map((r) => [
        new Date(r.created_at).toLocaleString("pt-BR"),
        r.user_email ?? "",
        r.perfil ?? "",
        r.modulo ?? "",
        acaoLabel(r.action),
        r.criticidade ?? "",
        r.entity ?? "",
        r.entity_id ?? "",
        r.valor_anterior ? JSON.stringify(r.valor_anterior) : "",
        r.valor_posterior ? JSON.stringify(r.valor_posterior) : "",
        r.justificativa ?? "",
        r.origem ?? "",
        r.ip_address ?? "",
        r.user_agent ?? "",
        r.operacao_id ?? "",
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")))
      .join("\n");
    baixar("\ufeff" + csv, `auditoria_${new Date().toISOString().slice(0, 10)}.csv`, "text/csv;charset=utf-8");
    await registrarExportacao("csv");
    toast.success("Exportação registrada na auditoria");
  };

  const exportJSON = async () => {
    if (!rows.length) return toast.error("Nada para exportar");
    baixar(JSON.stringify(rows, null, 2), `auditoria_${new Date().toISOString().slice(0, 10)}.json`, "application/json");
    await registrarExportacao("json");
    toast.success("Exportação registrada na auditoria");
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Auditoria e rastreabilidade</h1>
          <p className="text-sm text-muted-foreground">
            Registro imutável das ações realizadas no sistema administrativo
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-2" />CSV</Button>
          <Button variant="outline" onClick={exportJSON}><FileJson className="w-4 h-4 mr-2" />JSON</Button>
          <Button variant="outline" onClick={load}><RefreshCw className="w-4 h-4 mr-2" />Atualizar</Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Registros no filtro</p>
          <p className="text-2xl font-bold">{resumo.total}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Ações de alta criticidade</p>
          <p className="text-2xl font-bold text-destructive">{resumo.criticos}</p>
        </Card>
        <Card className="p-4">
          <p className="text-xs text-muted-foreground">Usuários envolvidos</p>
          <p className="text-2xl font-bold">{resumo.usuarios}</p>
        </Card>
      </div>

      <Card className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="space-y-1">
            <Label className="text-xs">Período — de</Label>
            <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Período — até</Label>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Usuário</Label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" aria-hidden="true" />
              <Input placeholder="E-mail" value={usuario} onChange={(e) => setUsuario(e.target.value)} className="pl-9" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Registro afetado</Label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" aria-hidden="true" />
              <Input placeholder="Entidade ou ID" value={registro} onChange={(e) => setRegistro(e.target.value)} className="pl-9" />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Módulo</Label>
            <Select value={modulo} onValueChange={setModulo}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todos os módulos</SelectItem>
                {AUDIT_MODULOS.map((m) => <SelectItem key={m} value={m}>{m}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Tipo de ação</Label>
            <Select value={acao} onValueChange={setAcao}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todas as ações</SelectItem>
                {AUDIT_ACOES.map((a) => <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <Label className="text-xs">Criticidade</Label>
            <Select value={criticidade} onValueChange={setCriticidade}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value={TODOS}>Todas</SelectItem>
                {AUDIT_CRITICIDADES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={load} className="flex-1">Filtrar</Button>
            <Button variant="ghost" onClick={limparFiltros}>Limpar</Button>
          </div>
        </div>
        <p className="text-xs text-muted-foreground flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5" aria-hidden="true" />
          Os registros são imutáveis e não contêm senhas, tokens ou credenciais.
        </p>
      </Card>

      <Card className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Usuário</TableHead>
              <TableHead>Perfil</TableHead>
              <TableHead>Módulo</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Criticidade</TableHead>
              <TableHead>Registro</TableHead>
              <TableHead>Origem</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8">Carregando...</TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={9} className="text-center py-8 text-muted-foreground">Nenhum registro</TableCell></TableRow>
            ) : rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="whitespace-nowrap text-xs">{new Date(r.created_at).toLocaleString("pt-BR")}</TableCell>
                <TableCell className="text-xs">{r.user_email ?? "—"}</TableCell>
                <TableCell className="text-xs">{r.perfil ?? "—"}</TableCell>
                <TableCell className="text-xs">{r.modulo ?? "—"}</TableCell>
                <TableCell className="text-xs font-semibold">{acaoLabel(r.action)}</TableCell>
                <TableCell>
                  <Badge variant={criticidadeVariant[r.criticidade] ?? "outline"} className="text-[10px] uppercase">
                    {r.criticidade ?? "baixa"}
                  </Badge>
                </TableCell>
                <TableCell className="text-xs max-w-[200px] truncate">
                  {r.entity}
                  {r.entity_id ? <span className="font-mono text-muted-foreground"> · {r.entity_id}</span> : null}
                </TableCell>
                <TableCell className="text-xs">{r.origem ?? "—"}</TableCell>
                <TableCell>
                  <Button size="sm" variant="ghost" onClick={() => setDetail(r)} aria-label="Ver detalhes">
                    <Eye className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do registro de auditoria</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <div><span className="text-muted-foreground">Data:</span> {new Date(detail.created_at).toLocaleString("pt-BR")}</div>
                <div><span className="text-muted-foreground">Usuário:</span> {detail.user_email ?? "—"}</div>
                <div><span className="text-muted-foreground">Perfil:</span> {detail.perfil ?? "—"}</div>
                <div><span className="text-muted-foreground">Módulo:</span> {detail.modulo ?? "—"}</div>
                <div><span className="text-muted-foreground">Ação:</span> {acaoLabel(detail.action)}</div>
                <div><span className="text-muted-foreground">Criticidade:</span> {detail.criticidade}</div>
                <div><span className="text-muted-foreground">Origem:</span> {detail.origem ?? "—"}</div>
                <div><span className="text-muted-foreground">IP:</span> {detail.ip_address ?? "não registrado"}</div>
                <div className="sm:col-span-2 break-all"><span className="text-muted-foreground">Dispositivo:</span> {detail.user_agent ?? "—"}</div>
                <div className="sm:col-span-2"><span className="text-muted-foreground">Registro:</span> {detail.entity} <span className="font-mono text-xs">{detail.entity_id ?? ""}</span></div>
                <div className="sm:col-span-2"><span className="text-muted-foreground">Operação:</span> <span className="font-mono text-xs">{detail.operacao_id ?? "—"}</span></div>
                {detail.justificativa && (
                  <div className="sm:col-span-2"><span className="text-muted-foreground">Justificativa:</span> {detail.justificativa}</div>
                )}
              </div>

              {(detail.valor_anterior || detail.valor_posterior || detail.details?.before || detail.details?.after) && (
                <DiffView
                  before={detail.valor_anterior ?? detail.details?.before}
                  after={detail.valor_posterior ?? detail.details?.after}
                />
              )}

              {detail.details && (
                <div>
                  <div className="text-muted-foreground mb-1">Detalhes:</div>
                  <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-[300px]">{JSON.stringify(detail.details, null, 2)}</pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function DiffView({ before, after }: { before: any; after: any }) {
  const b = before ?? {};
  const a = after ?? {};
  const keys = Array.from(new Set([...Object.keys(b), ...Object.keys(a)])).sort();
  return (
    <div>
      <div className="text-muted-foreground mb-2">Valor anterior × valor posterior:</div>
      <div className="rounded border divide-y text-xs">
        {keys.map((k) => {
          const bv = JSON.stringify(b[k]);
          const av = JSON.stringify(a[k]);
          const changed = bv !== av;
          return (
            <div key={k} className={`grid grid-cols-[140px_1fr_1fr] gap-2 p-2 ${changed ? "bg-accent/10" : ""}`}>
              <div className="font-mono font-semibold">{k}</div>
              <div className={`font-mono break-all ${changed ? "text-destructive line-through" : "text-muted-foreground"}`}>
                {bv ?? "—"}
              </div>
              <div className={`font-mono break-all ${changed ? "text-primary font-semibold" : "text-muted-foreground"}`}>
                {av ?? "—"}
              </div>
            </div>
          );
        })}
        {keys.length === 0 && <div className="p-3 text-center text-muted-foreground">Nenhum campo alterado</div>}
      </div>
      <div className="grid grid-cols-[140px_1fr_1fr] gap-2 mt-1 text-[10px] uppercase text-muted-foreground px-2">
        <div>Campo</div><div>Antes</div><div>Depois</div>
      </div>
    </div>
  );
}
