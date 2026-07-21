import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Plus, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";

const PATENTES = [
  "Coronel",
  "Tenente-Coronel",
  "Major",
  "Capitão",
  "Tenente",
  "Aspirante a Oficial",
  "Subtenente",
  "Sargento",
  "Cabo",
  "Soldado",
];

interface Associado {
  id?: string;
  matricula?: string;
  nome?: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  patente?: string;
  data_nascimento?: string;
  data_admissao?: string;
  cep?: string;
  endereco?: string;
  cidade?: string;
  foto_url?: string;
  ativo?: boolean;
}

const onlyDigits = (v: string) => (v ?? "").replace(/\D/g, "");
const formatCep = (v: string) => {
  const d = onlyDigits(v).slice(0, 8);
  return d.length > 5 ? `${d.slice(0, 5)}-${d.slice(5)}` : d;
};
// Máscara dd/mm/aaaa
const formatDateBR = (v: string) => {
  const d = onlyDigits(v).slice(0, 8);
  if (d.length <= 2) return d;
  if (d.length <= 4) return `${d.slice(0, 2)}/${d.slice(2)}`;
  return `${d.slice(0, 2)}/${d.slice(2, 4)}/${d.slice(4)}`;
};
// Converte ISO (yyyy-mm-dd) -> dd/mm/yyyy
const isoToBR = (iso?: string | null) => {
  if (!iso) return "";
  const s = String(iso).slice(0, 10);
  const [y, m, d] = s.split("-");
  if (!y || !m || !d) return "";
  return `${d}/${m}/${y}`;
};
// Converte dd/mm/yyyy -> ISO (yyyy-mm-dd). Retorna null se inválido/vazio.
const brToISO = (br?: string | null) => {
  if (!br) return null;
  const m = String(br).trim().match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!m) return null;
  const [, d, mo, y] = m;
  const dt = new Date(`${y}-${mo}-${d}T00:00:00`);
  if (isNaN(dt.getTime())) return null;
  return `${y}-${mo}-${d}`;
};

export default function AdminAssociados() {
  const [rows, setRows] = useState<Associado[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Associado | null>(null);
  const [open, setOpen] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);

  const load = async () => {
    setLoading(true);
    let q = supabase.from("associados").select("*").order("created_at", { ascending: false }).limit(500);
    if (search) q = q.ilike("nome", `%${search}%`);
    const { data, error } = await q;
    if (error) toast.error(error.message);
    else setRows((data as Associado[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [search]);

  const openNew = () => {
    setEditing({ ativo: true });
    setOpen(true);
  };

  const buscarCep = async (cepValue: string) => {
    const cepClean = onlyDigits(cepValue);
    if (cepClean.length !== 8) return;
    setCepLoading(true);
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cepClean}/json/`);
      const data = await res.json();
      if (data.erro) {
        toast.error("CEP não encontrado");
        return;
      }
      const partes = [data.logradouro, data.bairro, data.localidade, data.uf].filter(Boolean).join(", ");
      setEditing((prev) => ({ ...(prev ?? {}), endereco: partes }));
      toast.success("Endereço preenchido");
    } catch {
      toast.error("Falha ao buscar CEP");
    } finally {
      setCepLoading(false);
    }
  };

  const save = async () => {
    if (!editing) return;

    // Validação de duplicidade (matrícula e CPF)
    const matricula = (editing.matricula ?? "").trim();
    const cpf = (editing.cpf ?? "").trim();
    if (!matricula) return toast.error("Matrícula é obrigatória");
    if (!cpf) return toast.error("CPF é obrigatório");

    const dupChecks = await Promise.all([
      supabase.from("associados").select("id").eq("matricula", matricula).maybeSingle(),
      supabase.from("associados").select("id").eq("cpf", cpf).maybeSingle(),
    ]);
    const matriculaDup = dupChecks[0].data;
    const cpfDup = dupChecks[1].data;
    if (matriculaDup && matriculaDup.id !== editing.id) return toast.error("Já existe um associado com essa matrícula");
    if (cpfDup && cpfDup.id !== editing.id) return toast.error("Já existe um associado com esse CPF");

    // Validação/conversão de datas
    const payload: any = { ...editing };
    for (const k of ["data_nascimento", "data_admissao"] as const) {
      const v = payload[k];
      if (v) {
        const iso = brToISO(v);
        if (!iso) return toast.error(`${k === "data_nascimento" ? "Data de nascimento" : "Data de admissão"} inválida (use dd/mm/aaaa)`);
        payload[k] = iso;
      } else {
        payload[k] = null;
      }
    }
    Object.keys(payload).forEach((k) => { if (payload[k] === "") payload[k] = null; });

    const isNew = !payload.id;
    const { data, error } = isNew
      ? await supabase.from("associados").insert(payload).select().maybeSingle()
      : await supabase.from("associados").update(payload).eq("id", payload.id).select().maybeSingle();
    if (error) {
      if ((error as any).code === "23505") {
        const msg = error.message.includes("matricula") ? "Já existe um associado com essa matrícula" : "Já existe um associado com esse CPF";
        return toast.error(msg);
      }
      return toast.error(error.message);
    }
    await logAudit(isNew ? "create" : "update", "associados", (data as any)?.id ?? payload.id, payload);
    toast.success(isNew ? "Criado com sucesso" : "Atualizado");
    setOpen(false);
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Deseja realmente excluir este registro?")) return;
    const { error } = await supabase.from("associados").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await logAudit("delete", "associados", id);
    toast.success("Excluído");
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Associados</h1>
        <Button onClick={openNew}><Plus className="w-4 h-4 mr-2" />Novo</Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
        <Input placeholder="Buscar por nome..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
      </div>

      <Card className="overflow-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Matrícula</TableHead>
              <TableHead>Nome</TableHead>
              <TableHead>CPF</TableHead>
              <TableHead>Patente</TableHead>
              <TableHead>E-mail</TableHead>
              <TableHead>Telefone</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead className="w-32">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8">Carregando...</TableCell></TableRow>
            ) : rows.length === 0 ? (
              <TableRow><TableCell colSpan={8} className="text-center py-8 text-muted-foreground">Nenhum registro</TableCell></TableRow>
            ) : rows.map((r) => (
              <TableRow key={r.id}>
                <TableCell>{r.matricula}</TableCell>
                <TableCell className="max-w-[220px] truncate">{r.nome}</TableCell>
                <TableCell>{r.cpf}</TableCell>
                <TableCell>{r.patente ?? ""}</TableCell>
                <TableCell className="max-w-[200px] truncate">{r.email}</TableCell>
                <TableCell>{r.telefone}</TableCell>
                <TableCell>{r.ativo ? "Sim" : "Não"}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="icon" onClick={() => { setEditing({ ...r, data_nascimento: isoToBR(r.data_nascimento), data_admissao: isoToBR(r.data_admissao) }); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                  <Button variant="ghost" size="icon" onClick={() => remove(r.id!)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar" : "Novo"} — Associado</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div>
              <Label>Matrícula *</Label>
              <Input value={editing?.matricula ?? ""} onChange={(e) => setEditing({ ...editing, matricula: e.target.value })} />
            </div>
            <div>
              <Label>Nome completo *</Label>
              <Input value={editing?.nome ?? ""} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} />
            </div>
            <div>
              <Label>CPF *</Label>
              <Input value={editing?.cpf ?? ""} onChange={(e) => setEditing({ ...editing, cpf: e.target.value })} />
            </div>
            <div>
              <Label>Patente</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={editing?.patente ?? ""}
                onChange={(e) => setEditing({ ...editing, patente: e.target.value })}
              >
                <option value="">Selecione...</option>
                {PATENTES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div>
              <Label>E-mail</Label>
              <Input type="email" value={editing?.email ?? ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
            </div>
            <div>
              <Label>Telefone</Label>
              <Input value={editing?.telefone ?? ""} onChange={(e) => setEditing({ ...editing, telefone: e.target.value })} />
            </div>
            <div>
              <Label>Data de nascimento</Label>
              <Input
                placeholder="dd/mm/aaaa"
                maxLength={10}
                value={editing?.data_nascimento ?? ""}
                onChange={(e) => setEditing({ ...editing, data_nascimento: formatDateBR(e.target.value) })}
              />
            </div>
            <div>
              <Label>Data de admissão</Label>
              <Input
                placeholder="dd/mm/aaaa"
                maxLength={10}
                value={editing?.data_admissao ?? ""}
                onChange={(e) => setEditing({ ...editing, data_admissao: formatDateBR(e.target.value) })}
              />
            </div>
            <div>
              <Label>CEP</Label>
              <div className="relative">
                <Input
                  value={editing?.cep ?? ""}
                  placeholder="00000-000"
                  maxLength={9}
                  onChange={(e) => {
                    const formatted = formatCep(e.target.value);
                    setEditing({ ...editing, cep: formatted });
                    if (onlyDigits(formatted).length === 8) buscarCep(formatted);
                  }}
                  onBlur={(e) => buscarCep(e.target.value)}
                />
                {cepLoading && <Loader2 className="w-4 h-4 absolute right-3 top-3 animate-spin text-muted-foreground" />}
              </div>
            </div>
            <div>
              <Label>URL da foto</Label>
              <Input value={editing?.foto_url ?? ""} onChange={(e) => setEditing({ ...editing, foto_url: e.target.value })} />
            </div>
            <div className="md:col-span-2">
              <Label>Endereço</Label>
              <textarea
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={editing?.endereco ?? ""}
                onChange={(e) => setEditing({ ...editing, endereco: e.target.value })}
              />
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
