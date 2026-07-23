import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus, Search, ChevronDown, ChevronUp, User, Users } from "lucide-react";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Associado = { id: string; nome: string; matricula: string };
type Dependente = { id: string; nome: string; associado_id: string };
type Carencia = {
  id: string;
  associado_id: string;
  dependente_id: string | null;
  procedimento: string;
  status: string;
  data_liberacao: string | null;
};

export default function AdminCarencias() {
  const [assocList, setAssocList] = useState<Associado[]>([]);
  const [assocMap, setAssocMap] = useState<Record<string, Associado>>({});
  const [depsByAssoc, setDepsByAssoc] = useState<Record<string, Dependente[]>>({});
  const [carencias, setCarencias] = useState<Carencia[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: assocs }, { data: deps }, { data: cars }] = await Promise.all([
      supabase.from("associados").select("id, nome, matricula").order("nome"),
      supabase.from("dependentes").select("id, nome, associado_id"),
      supabase.from("carencias").select("*").order("created_at", { ascending: false }),
    ]);
    const aMap: Record<string, Associado> = {};
    (assocs ?? []).forEach((a: any) => (aMap[a.id] = a));
    const dMap: Record<string, Dependente[]> = {};
    (deps ?? []).forEach((d: any) => {
      dMap[d.associado_id] = dMap[d.associado_id] || [];
      dMap[d.associado_id].push(d);
    });
    setAssocList(assocs ?? []);
    setAssocMap(aMap);
    setDepsByAssoc(dMap);
    setCarencias((cars as Carencia[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = (associado_id?: string) => {
    setEditing({
      associado_id: associado_id ?? "",
      dependente_id: "",
      procedimento: "",
      status: "em_carencia",
      data_liberacao: "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!editing?.associado_id) return toast.error("Selecione o associado");
    if (!editing?.procedimento) return toast.error("Informe o procedimento");
    const payload: any = {
      associado_id: editing.associado_id,
      dependente_id: editing.dependente_id || null,
      procedimento: editing.procedimento,
      status: editing.status,
      data_liberacao: editing.data_liberacao || null,
    };
    const isNew = !editing.id;
    const { data, error } = isNew
      ? await supabase.from("carencias").insert(payload).select().maybeSingle()
      : await supabase.from("carencias").update(payload).eq("id", editing.id).select().maybeSingle();
    if (error) return toast.error(error.message);
    await logAudit(isNew ? "create" : "update", "carencias", data?.id ?? editing.id, payload);
    toast.success(isNew ? "Criado" : "Atualizado");
    setOpen(false);
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir esta carência?")) return;
    const { error } = await supabase.from("carencias").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await logAudit("delete", "carencias", id);
    toast.success("Excluído");
    load();
  };

  // agrupar por associado (apenas associados que possuem carência)
  const byAssoc: Record<string, Carencia[]> = {};
  carencias.forEach((c) => {
    byAssoc[c.associado_id] = byAssoc[c.associado_id] || [];
    byAssoc[c.associado_id].push(c);
  });

  const grouped = Object.entries(byAssoc).filter(([aid]) => {
    const a = assocMap[aid];
    const s = search.toLowerCase().trim();
    if (!s) return true;
    return a?.nome.toLowerCase().includes(s) || a?.matricula?.toLowerCase().includes(s);
  });

  const statusBadge = (s: string) =>
    s === "liberado" ? (
      <Badge className="bg-accent text-accent-foreground">Liberado</Badge>
    ) : (
      <Badge variant="secondary">Em carência</Badge>
    );

  const renderItem = (c: Carencia) => (
    <li
      key={c.id}
      className="flex items-center justify-between text-sm bg-muted/40 rounded px-3 py-2"
    >
      <div>
        <p className="font-medium">{c.procedimento}</p>
        <p className="text-xs text-muted-foreground">
          {c.data_liberacao
            ? `Liberação: ${format(new Date(c.data_liberacao), "dd/MM/yyyy", { locale: ptBR })}`
            : "Sem data de liberação"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {statusBadge(c.status)}
        <Button size="icon" variant="ghost" onClick={() => { setEditing(c); setOpen(true); }}>
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => remove(c.id)}>
          <Trash2 className="w-3.5 h-3.5 text-destructive" />
        </Button>
      </div>
    </li>
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Carências</h1>
        <Button onClick={() => openNew()}>
          <Plus className="w-4 h-4 mr-2" />
          Nova
        </Button>
      </div>

      <div className="relative max-w-sm">
        <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome ou matrícula..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      {loading ? (
        <p className="text-center py-8 text-muted-foreground">Carregando...</p>
      ) : grouped.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">Nenhuma carência cadastrada.</p>
      ) : (
        <div className="grid gap-4">
          {grouped.map(([aid, items]) => {
            const a = assocMap[aid];
            const deps = depsByAssoc[aid] ?? [];
            const doTitular = items.filter((c) => !c.dependente_id);
            const porDep: Record<string, Carencia[]> = {};
            items
              .filter((c) => c.dependente_id)
              .forEach((c) => {
                porDep[c.dependente_id!] = porDep[c.dependente_id!] || [];
                porDep[c.dependente_id!].push(c);
              });
            const isOpen = expanded[aid] ?? true;

            return (
              <Card key={aid}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <CardTitle className="text-lg">{a?.nome ?? "Associado"}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Matrícula: {a?.matricula ?? "—"} · Total: {items.length}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openNew(aid)}>
                        <Plus className="w-4 h-4 mr-1" />
                        Carência
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setExpanded({ ...expanded, [aid]: !isOpen })}
                      >
                        {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                {isOpen && (
                  <CardContent className="space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <User className="w-4 h-4 text-primary" />
                        <h4 className="font-semibold text-sm">Titular</h4>
                        <Badge variant="secondary">{doTitular.length}</Badge>
                      </div>
                      {doTitular.length === 0 ? (
                        <p className="text-xs text-muted-foreground pl-6">Sem carências.</p>
                      ) : (
                        <ul className="space-y-1 pl-6">{doTitular.map(renderItem)}</ul>
                      )}
                    </div>

                    {deps.length > 0 && (
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-4 h-4 text-primary" />
                          <h4 className="font-semibold text-sm">Dependentes</h4>
                        </div>
                        <div className="space-y-3 pl-6">
                          {deps.map((d) => {
                            const list = porDep[d.id] ?? [];
                            return (
                              <div key={d.id}>
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm font-medium">{d.nome}</span>
                                  <Badge variant="secondary">{list.length}</Badge>
                                </div>
                                {list.length === 0 ? (
                                  <p className="text-xs text-muted-foreground pl-2">
                                    Sem carências.
                                  </p>
                                ) : (
                                  <ul className="space-y-1">{list.map(renderItem)}</ul>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar" : "Nova"} carência</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Associado *</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={editing?.associado_id ?? ""}
                onChange={(e) =>
                  setEditing({ ...editing, associado_id: e.target.value, dependente_id: "" })
                }
              >
                <option value="">Selecione...</option>
                {assocList.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.matricula} - {a.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Aplicada a</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={editing?.dependente_id ?? ""}
                onChange={(e) => setEditing({ ...editing, dependente_id: e.target.value })}
              >
                <option value="">Titular</option>
                {(depsByAssoc[editing?.associado_id] ?? []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Procedimento *</Label>
              <Input
                value={editing?.procedimento ?? ""}
                onChange={(e) => setEditing({ ...editing, procedimento: e.target.value })}
              />
            </div>
            <div>
              <Label>Status</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={editing?.status ?? "em_carencia"}
                onChange={(e) => setEditing({ ...editing, status: e.target.value })}
              >
                <option value="em_carencia">Em carência</option>
                <option value="liberado">Liberado</option>
              </select>
            </div>
            <div>
              <Label>Data de liberação</Label>
              <Input
                type="date"
                value={editing?.data_liberacao ?? ""}
                onChange={(e) => setEditing({ ...editing, data_liberacao: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={save}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
