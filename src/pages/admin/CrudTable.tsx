import { useEffect, useState } from "react";
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

export type FieldType = "text" | "number" | "date" | "boolean" | "textarea" | "select";
export interface FieldDef {
  key: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  options?: { value: string; label: string }[];
  hideInTable?: boolean;
  hideInForm?: boolean;
  defaultValue?: any;
}

interface Props {
  title: string;
  table: string;
  fields: FieldDef[];
  searchField?: string;
  orderBy?: string;
}

export default function CrudTable({ title, table, fields, searchField, orderBy = "created_at" }: Props) {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<any | null>(null);
  const [open, setOpen] = useState(false);

  const load = async () => {
    setLoading(true);
    let q = (supabase.from as any)(table).select("*").order(orderBy, { ascending: false }).limit(500);
    if (search && searchField) q = q.ilike(searchField, `%${search}%`);
    const { data, error } = await q;
    if (error) toast.error(error.message);
    else setRows(data ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); }, [search]);

  const openNew = () => {
    const initial: any = {};
    fields.forEach((f) => { if (f.defaultValue !== undefined) initial[f.key] = f.defaultValue; });
    setEditing(initial);
    setOpen(true);
  };

  const save = async () => {
    const payload: any = { ...editing };
    fields.forEach((f) => {
      if (f.type === "number" && payload[f.key] !== undefined && payload[f.key] !== "") payload[f.key] = Number(payload[f.key]);
      if (payload[f.key] === "") payload[f.key] = null;
    });
    const isNew = !payload.id;
    const { data, error } = isNew
      ? await (supabase.from as any)(table).insert(payload).select().maybeSingle()
      : await (supabase.from as any)(table).update(payload).eq("id", payload.id).select().maybeSingle();
    if (error) return toast.error(error.message);
    await logAudit(isNew ? "create" : "update", table, data?.id ?? payload.id, payload);
    toast.success(isNew ? "Criado com sucesso" : "Atualizado");
    setOpen(false);
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Deseja realmente excluir este registro?")) return;
    const { error } = await (supabase.from as any)(table).delete().eq("id", id);
    if (error) return toast.error(error.message);
    await logAudit("delete", table, id);
    toast.success("Excluído");
    load();
  };

  const tableFields = fields.filter((f) => !f.hideInTable);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" />Novo</Button>
      </div>

      {searchField && (
        <div className="relative max-w-sm">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input placeholder="Buscar..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
      )}

      <Card className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {tableFields.map((f) => <TableHead key={f.key}>{f.label}</TableHead>)}
              <TableHead className="w-32">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={tableFields.length + 1} className="text-center py-8">Carregando...</TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={tableFields.length + 1} className="text-center py-8 text-muted-foreground">Nenhum registro</TableCell></TableRow>
            ) : (
              rows.map((r) => (
                <TableRow key={r.id}>
                  {tableFields.map((f) => (
                    <TableCell key={f.key} className="max-w-[240px] truncate">
                      {f.type === "boolean" ? (r[f.key] ? "Sim" : "Não") : String(r[f.key] ?? "")}
                    </TableCell>
                  ))}
                  <TableCell>
                    <Button variant="ghost" size="icon" onClick={() => { setEditing(r); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => remove(r.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar" : "Novo"} — {title}</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            {fields.filter((f) => !f.hideInForm).map((f) => (
              <div key={f.key} className={f.type === "textarea" ? "md:col-span-2" : ""}>
                <Label>{f.label}{f.required && " *"}</Label>
                {f.type === "textarea" ? (
                  <textarea
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editing?.[f.key] ?? ""}
                    onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                  />
                ) : f.type === "boolean" ? (
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={String(editing?.[f.key] ?? "true")}
                    onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value === "true" })}
                  >
                    <option value="true">Sim</option>
                    <option value="false">Não</option>
                  </select>
                ) : f.type === "select" ? (
                  <select
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    value={editing?.[f.key] ?? ""}
                    onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                  >
                    <option value="">Selecione...</option>
                    {f.options?.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                  </select>
                ) : (
                  <Input
                    type={f.type === "number" ? "number" : f.type === "date" ? "date" : "text"}
                    step={f.type === "number" ? "0.01" : undefined}
                    value={editing?.[f.key] ?? ""}
                    onChange={(e) => setEditing({ ...editing, [f.key]: e.target.value })}
                    required={f.required}
                  />
                )}
              </div>
            ))}
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
