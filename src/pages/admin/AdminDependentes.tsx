import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CpfInput } from "@/components/CpfInput";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";

const TIPOS = [
  { value: "conjuge", label: "Cônjuge" },
  { value: "filho", label: "Filho(a)" },
  { value: "pai_mae", label: "Pai / Mãe" },
  { value: "outro", label: "Outro" },
] as const;

interface Dependente {
  id?: string;
  associado_id?: string;
  nome?: string;
  cpf?: string;
  data_nascimento?: string;
  tipo?: string;
  foto_url?: string;
  status?: string;
}

interface AssocOpt { id: string; nome: string; matricula: string; }

export default function AdminDependentes() {
  const [rows, setRows] = useState<Dependente[]>([]);
  const [assocs, setAssocs] = useState<AssocOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [editing, setEditing] = useState<Dependente | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    supabase.from("associados").select("id, nome, matricula").order("nome").then(({ data }) => {
      setAssocs((data as AssocOpt[]) ?? []);
    });
  }, []);

  const assocMap = useMemo(() => {
    const m: Record<string, AssocOpt> = {};
    assocs.forEach((a) => { m[a.id] = a; });
    return m;
  }, [assocs]);

  const load = async () => {
    setLoading(true);
    let q = supabase.from("dependentes").select("*").order("created_at", { ascending: false }).limit(500);
    if (search) q = q.ilike("nome", `%${search}%`);
    if (filterTipo) q = q.eq("tipo", filterTipo as any);
    if (filterStatus) q = q.eq("status", filterStatus as any);
    const { data, error } = await q;
    if (error) toast.error(error.message);
    else setRows((data as Dependente[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [search, filterTipo, filterStatus]);

  const openNew = () => { setEditing({ status: "regular", tipo: "outro" }); setOpen(true); };

  const save = async () => {
    if (!editing) return;
    const payload: any = { ...editing };
    Object.keys(payload).forEach((k) => { if (payload[k] === "") payload[k] = null; });
    const isNew = !payload.id;
    const { data, error } = isNew
      ? await supabase.from("dependentes").insert(payload).select().maybeSingle()
      : await supabase.from("dependentes").update(payload).eq("id", payload.id).select().maybeSingle();
    if (error) return toast.error(error.message);
    await logAudit(isNew ? "create" : "update", "dependentes", (data as any)?.id ?? payload.id, payload);
    toast.success(isNew ? "Criado com sucesso" : "Atualizado");
    setOpen(false); setEditing(null); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Deseja realmente excluir este registro?")) return;
    const { error } = await supabase.from("dependentes").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await logAudit("delete", "dependentes", id);
    toast.success("Excluído");
    load();
  };

  const tipoLabel = (v?: string) => TIPOS.find((t) => t.value === v)?.label ?? v ?? "";

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Dependentes</h1>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" />Novo</Button>
      </div>

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input placeholder="Buscar por nome..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={filterTipo}
          onChange={(e) => setFilterTipo(e.target.value)}
        >
          <option value="">Todos os graus de parentesco</option>
          {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Todos os status</option>
          <option value="regular">Regular</option>
          <option value="inativo">Inativo</option>
          <option value="suspenso">Suspenso</option>
          <option value="em_analise">Em análise</option>
          <option value="aguardando_reativacao">Aguardando reativação</option>
          <option value="falecido">Falecido</option>
        </select>
        {(filterTipo || filterStatus) && (
          <Button variant="outline" size="sm" onClick={() => { setFilterTipo(""); setFilterStatus(""); }}>
            Limpar filtros
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : rows.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nenhum registro</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {rows.map((r) => {
            const titular = r.associado_id ? assocMap[r.associado_id] : null;
            return (
              <Card key={r.id} className="p-4 flex flex-col gap-3 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3">
                  <div className="w-14 h-14 rounded-full bg-muted flex items-center justify-center overflow-hidden shrink-0">
                    {r.foto_url ? (
                      <img src={r.foto_url} alt={r.nome} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-lg font-semibold text-muted-foreground">
                        {(r.nome ?? "?").charAt(0).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold truncate">{r.nome}</div>
                    <div className="text-xs text-muted-foreground">{tipoLabel(r.tipo)}</div>
                  </div>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full text-white ${r.status === "regular" ? "bg-green-500" : "bg-gray-500"}`}>
                    {r.status === "regular" ? "Ativo" : r.status || "Inativo"}
                  </span>
                </div>
                <div className="text-xs space-y-1 text-muted-foreground">
                  <div className="truncate">
                    <span className="font-medium text-foreground">Titular:</span>{" "}
                    {titular ? `${titular.matricula} — ${titular.nome}` : "—"}
                  </div>
                  <div className="truncate"><span className="font-medium text-foreground">CPF:</span> {r.cpf ?? "—"}</div>
                  {r.data_nascimento && (
                    <div className="truncate">
                      <span className="font-medium text-foreground">Nascimento:</span>{" "}
                      {new Date(r.data_nascimento).toLocaleDateString("pt-BR")}
                    </div>
                  )}
                </div>
                <div className="flex justify-end gap-1 pt-2 border-t">
                  <Button variant="ghost" size="icon" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(r.id!)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar" : "Novo"} — Dependente</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div className="md:col-span-2">
              <Label>Associado (titular) *</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={editing?.associado_id ?? ""}
                onChange={(e) => setEditing({ ...editing, associado_id: e.target.value })}
              >
                <option value="">Selecione...</option>
                {assocs.map((a) => <option key={a.id} value={a.id}>{a.matricula} — {a.nome}</option>)}
              </select>
            </div>
            <div>
              <Label>Nome *</Label>
              <Input value={editing?.nome ?? ""} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} />
            </div>
            <div>
              <CpfInput 
                label="CPF" 
                value={editing?.cpf ?? ""} 
                onChange={(v) => setEditing({ ...editing, cpf: v })} 
              />
            </div>
            <div>
              <Label>Data de nascimento</Label>
              <Input type="date" value={editing?.data_nascimento ?? ""} onChange={(e) => setEditing({ ...editing, data_nascimento: e.target.value })} />
            </div>
            <div>
              <Label>Grau de parentesco</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={editing?.tipo ?? "outro"}
                onChange={(e) => setEditing({ ...editing, tipo: e.target.value })}
              >
                {TIPOS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
            </div>
            <div>
              <Label>URL da foto</Label>
              <Input value={editing?.foto_url ?? ""} onChange={(e) => setEditing({ ...editing, foto_url: e.target.value })} />
            </div>
            <div>
              <Label>Status da Associação</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={editing?.status ?? "regular"}
                onChange={(e) => setEditing({ ...editing, status: e.target.value })}
              >
                <option value="regular">Regular</option>
                <option value="inativo">Inativo</option>
                <option value="suspenso">Suspenso</option>
                <option value="em_analise">Em análise</option>
                <option value="aguardando_reativacao">Aguardando reativação</option>
                <option value="falecido">Falecido</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
