import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Search, ShieldCheck, Download } from "lucide-react";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";

type Beneficiario = {
  nome: string;
  parentesco?: string;
  cpf?: string;
  percentual: number;
};

type Solicitacao = {
  id: string;
  associado_nome: string;
  associado_matricula: string;
  associado_email: string | null;
  associado_telefone: string | null;
  beneficiarios: Beneficiario[];
  status: string;
  observacoes: string | null;
  created_at: string;
  updated_at: string;
};

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "em_analise", label: "Em análise" },
  { value: "aprovado", label: "Aprovado" },
  { value: "rejeitado", label: "Rejeitado" },
];

const statusColor: Record<string, string> = {
  pendente: "bg-amber-100 text-amber-800 border-amber-200",
  em_analise: "bg-blue-100 text-blue-800 border-blue-200",
  aprovado: "bg-green-100 text-green-800 border-green-200",
  rejeitado: "bg-red-100 text-red-800 border-red-200",
};

export default function AdminPeculio() {
  const [rows, setRows] = useState<Solicitacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selected, setSelected] = useState<Solicitacao | null>(null);
  const [editObs, setEditObs] = useState("");
  const [editStatus, setEditStatus] = useState("pendente");

  const load = async () => {
    setLoading(true);
    let q = supabase
      .from("peculio_solicitacoes" as any)
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (statusFilter) q = q.eq("status", statusFilter);
    if (search)
      q = q.or(
        `associado_nome.ilike.%${search}%,associado_matricula.ilike.%${search}%`,
      );
    const { data, error } = await q;
    if (error) toast.error(error.message);
    else setRows((data as any as Solicitacao[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, [search, statusFilter]);

  const openDetail = (row: Solicitacao) => {
    setSelected(row);
    setEditObs(row.observacoes ?? "");
    setEditStatus(row.status);
  };

  const salvar = async () => {
    if (!selected) return;
    const { error } = await supabase
      .from("peculio_solicitacoes" as any)
      .update({ status: editStatus, observacoes: editObs })
      .eq("id", selected.id);
    if (error) return toast.error(error.message);
    await logAudit("update", "peculio_solicitacoes", selected.id, {
      status: editStatus,
    });
    toast.success("Solicitação atualizada");
    setSelected(null);
    load();
  };

  const exportarCSV = () => {
    const header = [
      "Data",
      "Associado",
      "Matrícula",
      "E-mail",
      "Telefone",
      "Status",
      "Beneficiários",
      "Observações",
    ];
    const linhas = rows.map((r) => [
      new Date(r.created_at).toLocaleString("pt-BR"),
      r.associado_nome,
      r.associado_matricula,
      r.associado_email ?? "",
      r.associado_telefone ?? "",
      r.status,
      r.beneficiarios
        .map(
          (b) =>
            `${b.nome} (${b.parentesco ?? "-"}) ${b.percentual.toFixed(2)}%`,
        )
        .join(" | "),
      (r.observacoes ?? "").replace(/\n/g, " "),
    ]);
    const csv = [header, ...linhas]
      .map((r) =>
        r
          .map((c) => `"${String(c).replace(/"/g, '""')}"`)
          .join(","),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `peculio-solicitacoes-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Pecúlio</h1>
            <p className="text-sm text-muted-foreground">
              Solicitações de indicação de beneficiários
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={exportarCSV}>
          <Download className="h-4 w-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      <div className="flex gap-3 flex-wrap">
        <div className="relative max-w-sm flex-1 min-w-[220px]">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input
            placeholder="Buscar por nome ou matrícula..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <select
          className="flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">Todos os status</option>
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </div>

      <Card className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Data</TableHead>
              <TableHead>Associado</TableHead>
              <TableHead>Matrícula</TableHead>
              <TableHead>Beneficiários</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : rows.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={6}
                  className="text-center py-8 text-muted-foreground"
                >
                  Nenhuma solicitação encontrada
                </TableCell>
              </TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="whitespace-nowrap">
                    {new Date(r.created_at).toLocaleDateString("pt-BR")}
                  </TableCell>
                  <TableCell className="max-w-[220px] truncate">
                    {r.associado_nome}
                  </TableCell>
                  <TableCell>{r.associado_matricula}</TableCell>
                  <TableCell>{r.beneficiarios?.length ?? 0}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={statusColor[r.status] ?? ""}
                    >
                      {STATUS_OPTIONS.find((s) => s.value === r.status)?.label ??
                        r.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => openDetail(r)}
                    >
                      <Eye className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={!!selected} onOpenChange={(v) => !v && setSelected(null)}>
        <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Solicitação de Pecúlio</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-5 py-2">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div>
                  <div className="text-muted-foreground">Associado</div>
                  <div className="font-medium">{selected.associado_nome}</div>
                </div>
                <div>
                  <div className="text-muted-foreground">Matrícula</div>
                  <div className="font-medium">
                    {selected.associado_matricula}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">E-mail</div>
                  <div className="font-medium">
                    {selected.associado_email || "-"}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Telefone</div>
                  <div className="font-medium">
                    {selected.associado_telefone || "-"}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">Enviado em</div>
                  <div className="font-medium">
                    {new Date(selected.created_at).toLocaleString("pt-BR")}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-sm font-semibold mb-2">Beneficiários</div>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>#</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Parentesco</TableHead>
                        <TableHead>CPF</TableHead>
                        <TableHead className="text-right">%</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {selected.beneficiarios.map((b, i) => (
                        <TableRow key={i}>
                          <TableCell>{i + 1}</TableCell>
                          <TableCell>{b.nome}</TableCell>
                          <TableCell>{b.parentesco || "-"}</TableCell>
                          <TableCell>{b.cpf || "-"}</TableCell>
                          <TableCell className="text-right">
                            {b.percentual.toFixed(2)}%
                          </TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell
                          colSpan={4}
                          className="text-right font-semibold"
                        >
                          Total
                        </TableCell>
                        <TableCell className="text-right font-semibold">
                          {selected.beneficiarios
                            .reduce((s, b) => s + b.percentual, 0)
                            .toFixed(2)}
                          %
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Status</label>
                  <select
                    className="mt-1 flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value)}
                  >
                    {STATUS_OPTIONS.map((s) => (
                      <option key={s.value} value={s.value}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Observações</label>
                  <textarea
                    className="mt-1 flex min-h-[90px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editObs}
                    onChange={(e) => setEditObs(e.target.value)}
                    placeholder="Observações internas sobre esta solicitação"
                  />
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>
              Fechar
            </Button>
            <Button onClick={salvar}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
