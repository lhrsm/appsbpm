import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
  { value: "pai", label: "Pai" },
  { value: "mae", label: "Mãe" },
  { value: "outro", label: "Outro" },
];

interface Dependente {
  id?: string;
  associado_id?: string;
  nome?: string;
  cpf?: string;
  data_nascimento?: string;
  tipo?: string;
  foto_url?: string;
  ativo?: boolean;
}

interface AssocOpt { id: string; nome: string; matricula: string; }

export default function AdminDependentes() {
  const [rows, setRows] = useState<Dependente[]>([]);
  const [assocs, setAssocs] = useState<AssocOpt[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterAtivo, setFilterAtivo] = useState("");
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
    if (filterTipo) q = q.eq("tipo", filterTipo);
    if (filterAtivo === "true") q = q.eq("ativo", true);
    if (filterAtivo === "false") q = q.eq("ativo", false);
    const { data, error } = await q;
    if (error) toast.error(error.message);
    else setRows((data as Dependente[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [search, filterTipo, filterAtivo]);

  const openNew = () => { setEditing({ ativo: true, tipo: "outro" }); setOpen(true); };

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
          value={filterAtivo}
          onChange={(e) => setFilterAtivo(e.target.value)}
        >
          <option value="">Ativos e inativos</option>
          <option value="true">Somente ativos</option>
          <option value="false">Somente inativos</option>
        </select>
        {(filterTipo || filterAtivo) && (
          <Button variant="outline" size="sm" onClick={() => { setFilterTipo(""); setFilterAtivo(""); }}>
            Limpar filtros
          </Button>
        )}
      </div>

      <Card className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Titular</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Parentesco</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead className="w-32">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8">Carregando...</TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Nenhum registro</TableCell></TableRow>
            ) : rows.map((r) => {
              const titular = r.associado_id ? assocMap[r.associado_id] : null;
              return (
                <TableRow key={r.id}>
                  <TableCell className="max-w-[220px] truncate">{r.nome}</TableCell>
                  <TableCell className="max-w-[240px] truncate">
                    {titular ? `${titular.matricula} — ${titular.nome}` : <span className="text-muted-foreground">—</span>}
                  </TableCell>
                  <TableCell>{r.cpf}</TableCell>
                  <TableCell>{tipoLabel(r.tipo)}</TableCell>
                  <TableCell>{r.ativo ? "Sim" : "Não"}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(r.id!)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </Card>

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
              <Label>CPF</Label>
              <Input value={editing?.cpf ?? ""} onChange={(e) => setEditing({ ...editing, cpf: e.target.value })} />
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
              <Label>Ativo</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={String(editing?.ativo ?? "true")}
                onChange={(e) => setEditing({ ...editing, ativo: e.target.value === "true" })}
              >
                <option value="true">Sim</option>
                <option value="false">Não</option>
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
