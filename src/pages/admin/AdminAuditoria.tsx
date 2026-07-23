import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { Search, RefreshCw, Download, Eye } from "lucide-react";

export default function AdminAuditoria() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [entity, setEntity] = useState("");
  const [action, setAction] = useState("");
  const [email, setEmail] = useState("");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [detail, setDetail] = useState<any>(null);

  const load = async () => {
    setLoading(true);
    let q = supabase.from("audit_logs").select("*").order("created_at", { ascending: false }).limit(500);
    if (entity) q = q.ilike("entity", `%${entity}%`);
    if (action) q = q.ilike("action", `%${action}%`);
    if (email) q = q.ilike("user_email", `%${email}%`);
    if (from) q = q.gte("created_at", new Date(from).toISOString());
    if (to) q = q.lte("created_at", new Date(to + "T23:59:59").toISOString());
    const { data, error } = await q;
    if (error) toast.error(error.message);
    else setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const exportCSV = () => {
    if (!rows.length) return toast.error("Nada para exportar");
    const header = ["Data/Hora", "Admin", "Ação", "Entidade", "ID", "Detalhes"];
    const csv = [header.join(";")]
      .concat(rows.map((r) => [
        new Date(r.created_at).toLocaleString("pt-BR"),
        r.user_email ?? "",
        r.action ?? "",
        r.entity ?? "",
        r.entity_id ?? "",
        r.details ? JSON.stringify(r.details).replace(/;/g, ",") : "",
      ].map((v) => `"${String(v).replace(/"/g, '""')}"`).join(";")))
      .join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `auditoria_${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Auditoria</h1>
          <p className="text-sm text-muted-foreground">Registro de ações administrativas ({rows.length})</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-2" />CSV</Button>
          <Button variant="outline" onClick={load}><RefreshCw className="w-4 h-4 mr-2" />Atualizar</Button>
        </div>
      </div>

      <Card className="p-4 grid grid-cols-1 md:grid-cols-6 gap-3">
        <div className="relative md:col-span-2">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input placeholder="Entidade" value={entity} onChange={(e) => setEntity(e.target.value)} className="pl-9" />
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input placeholder="Ação" value={action} onChange={(e) => setAction(e.target.value)} className="pl-9" />
        </div>
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input placeholder="E-mail admin" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-9" />
        </div>
        <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
        <Input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
        <Button onClick={load} className="md:col-span-6">Filtrar</Button>
      </Card>

      <Card className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data/Hora</TableHead>
              <TableHead>Admin</TableHead>
              <TableHead>Ação</TableHead>
              <TableHead>Entidade</TableHead>
              <TableHead>ID</TableHead>
              <TableHead>Detalhes</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8">Carregando...</TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={7} className="text-center py-8 text-muted-foreground">Nenhum registro</TableCell></TableRow>
            ) : rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="whitespace-nowrap text-xs">{new Date(r.created_at).toLocaleString("pt-BR")}</TableCell>
                <TableCell className="text-xs">{r.user_email ?? "—"}</TableCell>
                <TableCell><span className="text-xs font-semibold uppercase">{r.action}</span></TableCell>
                <TableCell className="text-xs">{r.entity}</TableCell>
                <TableCell className="text-xs font-mono max-w-[160px] truncate">{r.entity_id ?? "—"}</TableCell>
                <TableCell className="text-xs max-w-[320px] truncate text-muted-foreground">
                  {r.details ? JSON.stringify(r.details) : "—"}
                </TableCell>
                <TableCell>
                  {r.details && (
                    <Button size="sm" variant="ghost" onClick={() => setDetail(r)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!detail} onOpenChange={(o) => !o && setDetail(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do registro</DialogTitle>
          </DialogHeader>
          {detail && (
            <div className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div><span className="text-muted-foreground">Data:</span> {new Date(detail.created_at).toLocaleString("pt-BR")}</div>
                <div><span className="text-muted-foreground">Admin:</span> {detail.user_email ?? "—"}</div>
                <div><span className="text-muted-foreground">Ação:</span> {detail.action}</div>
                <div><span className="text-muted-foreground">Entidade:</span> {detail.entity}</div>
                <div className="col-span-2"><span className="text-muted-foreground">ID:</span> <span className="font-mono text-xs">{detail.entity_id ?? "—"}</span></div>
              </div>
              <div>
                <div className="text-muted-foreground mb-1">Payload:</div>
                <pre className="bg-muted p-3 rounded text-xs overflow-auto max-h-[400px]">{JSON.stringify(detail.details, null, 2)}</pre>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
