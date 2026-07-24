import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Pencil, Trash2, Plus, Search, ChevronDown, ChevronUp, User, Users, FileText, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";

type Associado = { id: string; nome: string; matricula: string };
type Dependente = { id: string; nome: string; associado_id: string };
type Informe = {
  id: string;
  associado_id: string;
  dependente_id: string | null;
  ano: number;
  arquivo_url: string | null;
};

export default function AdminInformes() {
  const [assocList, setAssocList] = useState<Associado[]>([]);
  const [assocMap, setAssocMap] = useState<Record<string, Associado>>({});
  const [depsByAssoc, setDepsByAssoc] = useState<Record<string, Dependente[]>>({});
  const [informes, setInformes] = useState<Informe[]>([]);
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<any | null>(null);

  const load = async () => {
    setLoading(true);
    const [{ data: assocs }, { data: deps }, { data: infs }] = await Promise.all([
      supabase.from("associados").select("id, nome, matricula").order("nome"),
      supabase.from("dependentes").select("id, nome, associado_id"),
      supabase.from("informes_rendimentos").select("*").order("ano", { ascending: false }),
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
    setInformes((infs as Informe[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const openNew = (associado_id?: string) => {
    setEditing({
      associado_id: associado_id ?? "",
      dependente_id: "",
      ano: new Date().getFullYear() - 1,
      arquivo_url: "",
    });
    setOpen(true);
  };

  const save = async () => {
    if (!editing?.associado_id) return toast.error("Selecione o associado");
    if (!editing?.ano) return toast.error("Informe o ano");
    const payload: any = {
      associado_id: editing.associado_id,
      dependente_id: editing.dependente_id || null,
      ano: Number(editing.ano),
      arquivo_url: editing.arquivo_url || null,
    };
    const isNew = !editing.id;
    const { data, error } = isNew
      ? await supabase.from("informes_rendimentos").insert(payload).select().maybeSingle()
      : await supabase.from("informes_rendimentos").update(payload).eq("id", editing.id).select().maybeSingle();
    if (error) return toast.error(error.message);
    await logAudit(isNew ? "create" : "update", "informes_rendimentos", data?.id ?? editing.id, payload);
    toast.success(isNew ? "Criado" : "Atualizado");
    setOpen(false);
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este informe?")) return;
    const { error } = await supabase.from("informes_rendimentos").delete().eq("id", id);
    if (error) return toast.error(error.message);
    await logAudit("delete", "informes_rendimentos", id);
    toast.success("Excluído");
    load();
  };

  const byAssoc: Record<string, Informe[]> = {};
  informes.forEach((i) => {
    byAssoc[i.associado_id] = byAssoc[i.associado_id] || [];
    byAssoc[i.associado_id].push(i);
  });

  const grouped = Object.entries(byAssoc).filter(([aid]) => {
    const a = assocMap[aid];
    const s = search.toLowerCase().trim();
    if (!s) return true;
    return a?.nome.toLowerCase().includes(s) || a?.matricula?.toLowerCase().includes(s);
  });

  const renderItem = (i: Informe) => (
    <li
      key={i.id}
      className="flex items-center justify-between text-sm bg-muted/40 rounded px-3 py-2"
    >
      <div className="flex items-center gap-2">
        <FileText className="w-4 h-4 text-primary" />
        <div>
          <p className="font-medium">Ano-base {i.ano}</p>
          {i.arquivo_url ? (
            <a
              href={i.arquivo_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-primary hover:underline inline-flex items-center gap-1"
            >
              Abrir PDF <ExternalLink className="w-3 h-3" />
            </a>
          ) : (
            <p className="text-xs text-muted-foreground">Sem arquivo anexado</p>
          )}
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Badge variant="secondary">{i.ano}</Badge>
        <Button size="icon" variant="ghost" onClick={() => { setEditing(i); setOpen(true); }}>
          <Pencil className="w-3.5 h-3.5" />
        </Button>
        <Button size="icon" variant="ghost" onClick={() => remove(i.id)}>
          <Trash2 className="w-3.5 h-3.5 text-destructive" />
        </Button>
      </div>
    </li>
  );

  const anosDisponiveis = Array.from(new Set(informes.map((i) => i.ano))).sort((a, b) => b - a);
  const [anoLote, setAnoLote] = useState<number | "">(anosDisponiveis[0] ?? "");

  const baixarLote = async () => {
    const ano = Number(anoLote);
    if (!ano) return toast.error("Escolha o ano");
    const alvo = informes.filter((i) => i.ano === ano && i.arquivo_url);
    if (!alvo.length) return toast.error("Nenhum informe com arquivo neste ano");
    toast.info(`Iniciando download de ${alvo.length} arquivos…`);
    for (const inf of alvo) {
      const nomeAssoc = assocMap[inf.associado_id]?.nome?.replace(/[^\w\-]+/g, "_") ?? inf.associado_id;
      const link = document.createElement("a");
      link.href = inf.arquivo_url!;
      link.download = `informe_${ano}_${nomeAssoc}.pdf`;
      link.target = "_blank";
      link.rel = "noopener";
      document.body.appendChild(link);
      link.click();
      link.remove();
      await new Promise((r) => setTimeout(r, 250));
    }
    toast.success("Downloads iniciados");
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h1 className="text-2xl font-bold">Informes de Rendimentos</h1>
        <div className="flex items-center gap-2">
          <select
            className="h-9 rounded-md border bg-background px-2 text-sm"
            value={anoLote}
            onChange={(e) => setAnoLote(e.target.value ? Number(e.target.value) : "")}
          >
            <option value="">Ano p/ lote</option>
            {anosDisponiveis.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <Button variant="outline" onClick={baixarLote}>
            <FileText className="w-4 h-4 mr-2" /> Baixar tudo do ano
          </Button>
          <Button onClick={() => openNew()}>
            <Plus className="w-4 h-4 mr-2" />
            Novo
          </Button>
        </div>
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
        <p className="text-center py-8 text-muted-foreground">Nenhum informe cadastrado.</p>
      ) : (
        <div className="grid gap-4">
          {grouped.map(([aid, items]) => {
            const a = assocMap[aid];
            const deps = depsByAssoc[aid] ?? [];
            const doTitular = items.filter((i) => !i.dependente_id);
            const porDep: Record<string, Informe[]> = {};
            items
              .filter((i) => i.dependente_id)
              .forEach((i) => {
                porDep[i.dependente_id!] = porDep[i.dependente_id!] || [];
                porDep[i.dependente_id!].push(i);
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
                        Informe
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
                        <p className="text-xs text-muted-foreground pl-6">Sem informes.</p>
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
                                    Sem informes.
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
            <DialogTitle>{editing?.id ? "Editar" : "Novo"} informe</DialogTitle>
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
              <Label>Aplicado a</Label>
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
              <Label>Ano-base *</Label>
              <Input
                type="number"
                value={editing?.ano ?? ""}
                onChange={(e) => setEditing({ ...editing, ano: e.target.value })}
              />
            </div>
            <div>
              <Label>URL do PDF</Label>
              <Input
                value={editing?.arquivo_url ?? ""}
                onChange={(e) => setEditing({ ...editing, arquivo_url: e.target.value })}
                placeholder="https://..."
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
