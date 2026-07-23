import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Pencil, Trash2, Plus, Search, ChevronDown, ChevronUp, User, Users } from "lucide-react";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

type Associado = { id: string; nome: string; matricula: string };
type Dependente = { id: string; nome: string; associado_id: string };
type Limite = {
  id: string;
  associado_id: string;
  limite_total: number;
  limite_utilizado: number;
  data_renovacao: string | null;
};
type Historico = {
  id: string;
  associado_id: string;
  dependente_id: string | null;
  valor: number;
  descricao: string | null;
  data_utilizacao: string;
};

const brl = (v: number) =>
  Number(v || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });

export default function AdminLimites() {
  const [limites, setLimites] = useState<Limite[]>([]);
  const [assocMap, setAssocMap] = useState<Record<string, Associado>>({});
  const [assocList, setAssocList] = useState<Associado[]>([]);
  const [depsByAssoc, setDepsByAssoc] = useState<Record<string, Dependente[]>>({});
  const [historicoByAssoc, setHistoricoByAssoc] = useState<Record<string, Historico[]>>({});
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const [openHist, setOpenHist] = useState(false);
  const [histForm, setHistForm] = useState<any | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: assocs }, { data: deps }, { data: lims }, { data: hist }] = await Promise.all([
      supabase.from("associados").select("id, nome, matricula").order("nome"),
      supabase.from("dependentes").select("id, nome, associado_id"),
      supabase.from("limites").select("*").order("updated_at", { ascending: false }),
      supabase.from("historico_limite").select("*").order("data_utilizacao", { ascending: false }),
    ]);
    const aMap: Record<string, Associado> = {};
    (assocs ?? []).forEach((a: any) => (aMap[a.id] = a));
    const dMap: Record<string, Dependente[]> = {};
    (deps ?? []).forEach((d: any) => {
      dMap[d.associado_id] = dMap[d.associado_id] || [];
      dMap[d.associado_id].push(d);
    });
    const hMap: Record<string, Historico[]> = {};
    (hist ?? []).forEach((h: any) => {
      hMap[h.associado_id] = hMap[h.associado_id] || [];
      hMap[h.associado_id].push(h);
    });
    setAssocList(assocs ?? []);
    setAssocMap(aMap);
    setDepsByAssoc(dMap);
    setHistoricoByAssoc(hMap);
    setLimites(lims ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = () => {
    setEditing({ associado_id: "", limite_total: 0, limite_utilizado: 0, data_renovacao: "" });
    setOpen(true);
  };

  const saveLimite = async () => {
    if (!editing?.associado_id) return toast.error("Selecione o associado");
    const payload: any = {
      associado_id: editing.associado_id,
      limite_total: Number(editing.limite_total || 0),
      limite_utilizado: Number(editing.limite_utilizado || 0),
      data_renovacao: editing.data_renovacao || null,
    };
    const isNew = !editing.id;
    const { data, error } = isNew
      ? await supabase.from("limites").insert(payload).select().maybeSingle()
      : await supabase.from("limites").update(payload).eq("id", editing.id).select().maybeSingle();
    if (error) return toast.error(error.message);
    await logAudit(isNew ? "create" : "update", "limites", data?.id ?? editing.id, payload);
    toast.success(isNew ? "Criado" : "Atualizado");
    setOpen(false);
    setEditing(null);
    load();
  };

  const removeLimite = async (id: string) => {
    if (!confirm("Excluir este limite?")) return;
    const { error } = await supabase.from("limites").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await logAudit("delete", "limites", id);
    toast.success("Excluído");
    load();
  };

  const openHistNew = (associado_id: string) => {
    setHistForm({
      associado_id,
      dependente_id: "",
      valor: 0,
      descricao: "",
      data_utilizacao: new Date().toISOString().slice(0, 16),
    });
    setOpenHist(true);
  };

  const saveHist = async () => {
    const payload: any = {
      associado_id: histForm.associado_id,
      dependente_id: histForm.dependente_id || null,
      valor: Number(histForm.valor || 0),
      descricao: histForm.descricao || null,
      data_utilizacao: new Date(histForm.data_utilizacao).toISOString(),
    };
    const { data, error } = await supabase.from("historico_limite").insert(payload).select().maybeSingle();
    if (error) return toast.error(error.message);
    await logAudit("create", "historico_limite", data?.id, payload);
    toast.success("Utilização registrada");
    setOpenHist(false);
    setHistForm(null);
    load();
  };

  const removeHist = async (id: string) => {
    if (!confirm("Excluir esta utilização?")) return;
    const { error } = await supabase.from("historico_limite").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await logAudit("delete", "historico_limite", id);
    toast.success("Excluído");
    load();
  };

  const filtered = limites.filter((l) => {
    const a = assocMap[l.associado_id];
    if (!a) return true;
    const s = search.toLowerCase().trim();
    if (!s) return true;
    return a.nome.toLowerCase().includes(s) || a.matricula?.toLowerCase().includes(s);
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Limites</h1>
        <Button onClick={openNew}>
          <Plus className="w-4 h-4 mr-2" />
          Novo
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
      ) : filtered.length === 0 ? (
        <p className="text-center py-8 text-muted-foreground">Nenhum limite cadastrado.</p>
      ) : (
        <div className="grid gap-4">
          {filtered.map((l) => {
            const a = assocMap[l.associado_id];
            const deps = depsByAssoc[l.associado_id] ?? [];
            const hist = historicoByAssoc[l.associado_id] ?? [];
            const total = Number(l.limite_total);
            const used = Number(l.limite_utilizado);
            const pct = total > 0 ? (used / total) * 100 : 0;
            const isOpen = expanded[l.id];

            // agrupar histórico por usuário (titular + dependentes)
            const usoTitular = hist.filter((h) => !h.dependente_id);
            const usoPorDep: Record<string, Historico[]> = {};
            hist
              .filter((h) => h.dependente_id)
              .forEach((h) => {
                usoPorDep[h.dependente_id!] = usoPorDep[h.dependente_id!] || [];
                usoPorDep[h.dependente_id!].push(h);
              });

            return (
              <Card key={l.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <CardTitle className="text-lg">{a?.nome ?? "Associado"}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        Matrícula: {a?.matricula ?? "—"}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => openHistNew(l.associado_id)}>
                        <Plus className="w-4 h-4 mr-1" />
                        Utilização
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => { setEditing(l); setOpen(true); }}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => removeLimite(l.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total</p>
                      <p className="font-semibold">{brl(total)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Utilizado</p>
                      <p className="font-semibold text-destructive">{brl(used)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Disponível</p>
                      <p className="font-semibold text-accent">{brl(total - used)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Renovação</p>
                      <p className="font-semibold">
                        {l.data_renovacao
                          ? format(new Date(l.data_renovacao), "dd/MM/yyyy", { locale: ptBR })
                          : "—"}
                      </p>
                    </div>
                  </div>
                  <Progress value={pct} className="h-2" />

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpanded({ ...expanded, [l.id]: !isOpen })}
                    className="w-full justify-between"
                  >
                    <span>
                      Utilizações ({hist.length}) — Titular: {usoTitular.length} · Dependentes:{" "}
                      {hist.length - usoTitular.length}
                    </span>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>

                  {isOpen && (
                    <div className="space-y-4 pt-2 border-t">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <User className="w-4 h-4 text-primary" />
                          <h4 className="font-semibold text-sm">Titular</h4>
                          <Badge variant="secondary">{usoTitular.length}</Badge>
                        </div>
                        {usoTitular.length === 0 ? (
                          <p className="text-xs text-muted-foreground pl-6">Sem utilizações.</p>
                        ) : (
                          <ul className="space-y-1 pl-6">
                            {usoTitular.map((h) => (
                              <li key={h.id} className="flex items-center justify-between text-sm bg-muted/40 rounded px-3 py-2">
                                <div>
                                  <p>{h.descricao || "Utilização"}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {format(new Date(h.data_utilizacao), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Badge variant="destructive">-{brl(Number(h.valor))}</Badge>
                                  <Button size="icon" variant="ghost" onClick={() => removeHist(h.id)}>
                                    <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                  </Button>
                                </div>
                              </li>
                            ))}
                          </ul>
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
                              const uso = usoPorDep[d.id] ?? [];
                              return (
                                <div key={d.id}>
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-medium">{d.nome}</span>
                                    <Badge variant="secondary">{uso.length}</Badge>
                                  </div>
                                  {uso.length === 0 ? (
                                    <p className="text-xs text-muted-foreground pl-2">Sem utilizações.</p>
                                  ) : (
                                    <ul className="space-y-1">
                                      {uso.map((h) => (
                                        <li key={h.id} className="flex items-center justify-between text-sm bg-muted/40 rounded px-3 py-2">
                                          <div>
                                            <p>{h.descricao || "Utilização"}</p>
                                            <p className="text-xs text-muted-foreground">
                                              {format(new Date(h.data_utilizacao), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                                            </p>
                                          </div>
                                          <div className="flex items-center gap-2">
                                            <Badge variant="destructive">-{brl(Number(h.valor))}</Badge>
                                            <Button size="icon" variant="ghost" onClick={() => removeHist(h.id)}>
                                              <Trash2 className="w-3.5 h-3.5 text-destructive" />
                                            </Button>
                                          </div>
                                        </li>
                                      ))}
                                    </ul>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Editar/criar limite */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar" : "Novo"} limite</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Associado *</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={editing?.associado_id ?? ""}
                onChange={(e) => setEditing({ ...editing, associado_id: e.target.value })}
                disabled={!!editing?.id}
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
              <Label>Limite total (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={editing?.limite_total ?? 0}
                onChange={(e) => setEditing({ ...editing, limite_total: e.target.value })}
              />
            </div>
            <div>
              <Label>Limite utilizado (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={editing?.limite_utilizado ?? 0}
                onChange={(e) => setEditing({ ...editing, limite_utilizado: e.target.value })}
              />
            </div>
            <div>
              <Label>Data de renovação</Label>
              <Input
                type="date"
                value={editing?.data_renovacao ?? ""}
                onChange={(e) => setEditing({ ...editing, data_renovacao: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={saveLimite}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Nova utilização */}
      <Dialog open={openHist} onOpenChange={setOpenHist}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Registrar utilização</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>Utilizado por</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={histForm?.dependente_id ?? ""}
                onChange={(e) => setHistForm({ ...histForm, dependente_id: e.target.value })}
              >
                <option value="">Titular</option>
                {(depsByAssoc[histForm?.associado_id] ?? []).map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.nome}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <Label>Descrição</Label>
              <Input
                value={histForm?.descricao ?? ""}
                onChange={(e) => setHistForm({ ...histForm, descricao: e.target.value })}
                placeholder="Ex.: Consulta cardiologia"
              />
            </div>
            <div>
              <Label>Valor (R$)</Label>
              <Input
                type="number"
                step="0.01"
                value={histForm?.valor ?? 0}
                onChange={(e) => setHistForm({ ...histForm, valor: e.target.value })}
              />
            </div>
            <div>
              <Label>Data / hora</Label>
              <Input
                type="datetime-local"
                value={histForm?.data_utilizacao ?? ""}
                onChange={(e) => setHistForm({ ...histForm, data_utilizacao: e.target.value })}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenHist(false)}>Cancelar</Button>
            <Button onClick={saveHist}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
