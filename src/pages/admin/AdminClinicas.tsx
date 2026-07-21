import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Pencil, Trash2, Plus, Search, Upload, MapPin, Phone, MessageCircle, Building2 } from "lucide-react";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";

const ESPECIALIDADES = [
  "Clínica Geral", "Cardiologia", "Dermatologia", "Endocrinologia", "Gastroenterologia",
  "Ginecologia", "Neurologia", "Oftalmologia", "Ortopedia", "Otorrinolaringologia",
  "Pediatria", "Psicologia", "Psiquiatria", "Urologia", "Fisioterapia",
  "Nutrição", "Odontologia", "Laboratório", "Radiologia", "Ultrassonografia",
  "Fonoaudiologia", "Terapia Ocupacional", "Educação Física", "Farmácia", "Ótica",
];

const DIAS = [
  { key: "seg", label: "Segunda" },
  { key: "ter", label: "Terça" },
  { key: "qua", label: "Quarta" },
  { key: "qui", label: "Quinta" },
  { key: "sex", label: "Sexta" },
  { key: "sab", label: "Sábado" },
  { key: "dom", label: "Domingo" },
];

interface Estado { id: number; sigla: string; nome: string; }
interface Municipio { id: number; nome: string; }
interface Clinica {
  id: string;
  nome: string;
  especialidade: string | null;
  especialidades: string[] | null;
  estado: string | null;
  cidade: string;
  endereco: string | null;
  telefone: string | null;
  whatsapp: string | null;
  email: string | null;
  horario_funcionamento: string | null;
  horarios: any;
  logo_url: string | null;
  ativo: boolean;
}

const emptyClinica = (): Partial<Clinica> => ({
  nome: "", especialidade: "", especialidades: [], estado: "", cidade: "",
  endereco: "", telefone: "", whatsapp: "", email: "",
  horario_funcionamento: "", horarios: {}, logo_url: "", ativo: true,
});

export default function AdminClinicas() {
  const [rows, setRows] = useState<Clinica[]>([]);
  const [loading, setLoading] = useState(true);
  const [estados, setEstados] = useState<Estado[]>([]);
  const [municipios, setMunicipios] = useState<Record<string, Municipio[]>>({});

  // filtros hierárquicos
  const [fEstado, setFEstado] = useState<string>("all");
  const [fCidade, setFCidade] = useState<string>("all");
  const [fEspecialidade, setFEspecialidade] = useState<string>("all");
  const [search, setSearch] = useState("");

  // form
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Partial<Clinica> | null>(null);
  const [formCidades, setFormCidades] = useState<Municipio[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome")
      .then((r) => r.json()).then(setEstados).catch(() => setEstados([]));
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("clinicas_parceiros").select("*").order("cidade").limit(1000);
    if (error) toast.error(error.message);
    else setRows((data ?? []) as any);
    setLoading(false);
  };

  const loadMunicipios = async (uf: string) => {
    if (!uf) return [];
    if (municipios[uf]) return municipios[uf];
    const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios`);
    const data: Municipio[] = await res.json();
    setMunicipios((m) => ({ ...m, [uf]: data }));
    return data;
  };

  // ao selecionar um estado no filtro, buscar cidades do IBGE
  useEffect(() => {
    if (fEstado !== "all") loadMunicipios(fEstado);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fEstado]);

  // filtros hierárquicos: cidades = cidades do IBGE do estado + cidades já cadastradas
  const cidadesDisponiveis = useMemo(() => {
    if (fEstado === "all") {
      return Array.from(new Set(rows.map((r) => r.cidade).filter(Boolean))).sort();
    }
    const cadastradas = rows.filter((r) => r.estado === fEstado).map((r) => r.cidade).filter(Boolean) as string[];
    const ibge = (municipios[fEstado] ?? []).map((m) => m.nome);
    return Array.from(new Set([...ibge, ...cadastradas])).sort();
  }, [rows, fEstado, municipios]);

  const especialidadesDisponiveis = useMemo(() => {
    let src = rows;
    if (fEstado !== "all") src = src.filter((r) => r.estado === fEstado);
    if (fCidade !== "all") src = src.filter((r) => r.cidade === fCidade);
    const set = new Set<string>();
    src.forEach((r) => {
      (r.especialidades ?? []).forEach((e) => set.add(e));
      if (r.especialidade) set.add(r.especialidade);
    });
    return Array.from(set).sort();
  }, [rows, fEstado, fCidade]);

  const filtered = useMemo(() => {
    return rows.filter((r) => {
      if (fEstado !== "all" && r.estado !== fEstado) return false;
      if (fCidade !== "all" && r.cidade !== fCidade) return false;
      if (fEspecialidade !== "all") {
        const lista = [...(r.especialidades ?? []), r.especialidade].filter(Boolean) as string[];
        if (!lista.includes(fEspecialidade)) return false;
      }
      if (search) {
        const s = search.toLowerCase();
        if (!r.nome.toLowerCase().includes(s) && !(r.cidade ?? "").toLowerCase().includes(s)) return false;
      }
      return true;
    });
  }, [rows, fEstado, fCidade, fEspecialidade, search]);

  const openNew = () => { setEditing(emptyClinica()); setFormCidades([]); setOpen(true); };
  const openEdit = async (r: Clinica) => {
    setEditing({ ...r, especialidades: r.especialidades ?? [], horarios: r.horarios ?? {} });
    if (r.estado) setFormCidades(await loadMunicipios(r.estado));
    setOpen(true);
  };

  const save = async () => {
    if (!editing?.nome || !editing?.cidade) { toast.error("Nome e cidade são obrigatórios"); return; }
    const payload: any = { ...editing };
    // primeira especialidade também salva no campo antigo para compat
    payload.especialidade = (editing.especialidades && editing.especialidades[0]) || editing.especialidade || null;
    // resumo textual de horarios para o campo legado
    if (editing.horarios && Object.keys(editing.horarios).length) {
      payload.horario_funcionamento = DIAS.map((d) => {
        const h = (editing.horarios as any)[d.key];
        if (!h || h.fechado) return null;
        if (!h.abre || !h.fecha) return null;
        return `${d.label}: ${h.abre}-${h.fecha}`;
      }).filter(Boolean).join(" • ");
    }

    const isNew = !editing.id;
    const { error } = isNew
      ? await supabase.from("clinicas_parceiros").insert(payload)
      : await supabase.from("clinicas_parceiros").update(payload).eq("id", editing.id!);
    if (error) { toast.error(error.message); return; }
    await logAudit(isNew ? "create" : "update", "clinicas_parceiros", editing.id ?? null, payload);
    toast.success("Salvo com sucesso");
    setOpen(false); setEditing(null); load();
  };

  const remove = async (r: Clinica) => {
    if (!confirm(`Excluir ${r.nome}?`)) return;
    const { error } = await supabase.from("clinicas_parceiros").delete().eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    await logAudit("delete", "clinicas_parceiros", r.id, { nome: r.nome });
    toast.success("Excluído");
    load();
  };

  const toggleAtivo = async (r: Clinica) => {
    const { error } = await supabase.from("clinicas_parceiros").update({ ativo: !r.ativo }).eq("id", r.id);
    if (error) { toast.error(error.message); return; }
    setRows((rs) => rs.map((x) => x.id === r.id ? { ...x, ativo: !r.ativo } : x));
  };

  const onLogoFile = async (file: File) => {
    if (!editing) return;
    setUploading(true);
    try {
      const ext = file.name.split(".").pop() || "png";
      const path = `clinicas/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("profile-photos").upload(path, file, { upsert: true, contentType: file.type });
      if (upErr) throw upErr;
      const { data } = supabase.storage.from("profile-photos").getPublicUrl(path);
      setEditing({ ...editing, logo_url: data.publicUrl });
      toast.success("Logo enviada");
    } catch (e: any) {
      toast.error(e.message ?? "Falha ao enviar logo");
    } finally { setUploading(false); }
  };

  const setEsp = (esp: string, checked: boolean) => {
    if (!editing) return;
    const cur = new Set(editing.especialidades ?? []);
    if (checked) cur.add(esp); else cur.delete(esp);
    setEditing({ ...editing, especialidades: Array.from(cur) });
  };

  const setHor = (dia: string, campo: string, valor: any) => {
    if (!editing) return;
    const h = { ...(editing.horarios ?? {}) };
    h[dia] = { ...(h[dia] ?? {}), [campo]: valor };
    setEditing({ ...editing, horarios: h });
  };

  const mapEmbed = editing?.endereco
    ? `https://www.google.com/maps?q=${encodeURIComponent(`${editing.endereco}, ${editing.cidade ?? ""} ${editing.estado ?? ""}`)}&output=embed`
    : "";

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-2xl font-bold">Clínicas e Parceiros</h2>
          <p className="text-sm text-muted-foreground">Gerencie a rede credenciada</p>
        </div>
        <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" /> Nova clínica</Button>
      </div>

      {/* Filtros hierárquicos */}
      <Card>
        <CardContent className="pt-6 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <Label>Estado</Label>
            <Select value={fEstado} onValueChange={(v) => { setFEstado(v); setFCidade("all"); setFEspecialidade("all"); }}>
              <SelectTrigger><SelectValue placeholder="Todos" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {estados.map((e) => <SelectItem key={e.sigla} value={e.sigla}>{e.sigla} — {e.nome}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Cidade</Label>
            <Select value={fCidade} onValueChange={(v) => { setFCidade(v); setFEspecialidade("all"); }}>
              <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {cidadesDisponiveis.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Especialidade</Label>
            <Select value={fEspecialidade} onValueChange={setFEspecialidade}>
              <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {especialidadesDisponiveis.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input className="pl-9" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Nome ou cidade" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Carregando…</div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Nenhuma clínica encontrada</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((r) => (
            <Card key={r.id} className={`${!r.ativo ? "opacity-60" : ""}`}>
              <CardContent className="pt-6 space-y-3">
                <div className="flex items-start gap-3">
                  {r.logo_url ? (
                    <img src={r.logo_url} alt={r.nome} className="w-16 h-16 rounded object-contain bg-white border" />
                  ) : (
                    <div className="w-16 h-16 rounded bg-primary/10 flex items-center justify-center">
                      <Building2 className="h-8 w-8 text-primary" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{r.nome}</h3>
                    <p className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="h-3 w-3" />{r.cidade}{r.estado ? ` / ${r.estado}` : ""}</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(r.especialidades ?? []).slice(0, 3).map((e) => <Badge key={e} variant="secondary" className="text-xs">{e}</Badge>)}
                      {(r.especialidades?.length ?? 0) > 3 && <Badge variant="outline" className="text-xs">+{(r.especialidades!.length - 3)}</Badge>}
                    </div>
                  </div>
                  <Switch checked={r.ativo} onCheckedChange={() => toggleAtivo(r)} />
                </div>
                {r.whatsapp && (
                  <a href={`https://wa.me/55${r.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-green-700">
                    <MessageCircle className="h-4 w-4" /> {r.whatsapp}
                  </a>
                )}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" onClick={() => openEdit(r)}><Pencil className="h-3 w-3 mr-1" /> Editar</Button>
                  <Button size="sm" variant="outline" onClick={() => remove(r)}><Trash2 className="h-3 w-3 mr-1" /> Excluir</Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Form */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar" : "Nova"} clínica/parceiro</DialogTitle>
          </DialogHeader>
          {editing && (
            <ScrollArea className="flex-1 pr-4">
              <Tabs defaultValue="dados" className="w-full">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="dados">Dados</TabsTrigger>
                  <TabsTrigger value="esp">Especialidades</TabsTrigger>
                  <TabsTrigger value="hor">Horários</TabsTrigger>
                  <TabsTrigger value="end">Endereço</TabsTrigger>
                </TabsList>

                <TabsContent value="dados" className="space-y-4 mt-4">
                  <div>
                    <Label>Nome *</Label>
                    <Input value={editing.nome ?? ""} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Telefone</Label>
                      <Input value={editing.telefone ?? ""} onChange={(e) => setEditing({ ...editing, telefone: e.target.value })} placeholder="(71) 3000-0000" />
                    </div>
                    <div>
                      <Label>WhatsApp</Label>
                      <Input value={editing.whatsapp ?? ""} onChange={(e) => setEditing({ ...editing, whatsapp: e.target.value })} placeholder="(71) 90000-0000" />
                    </div>
                  </div>
                  <div>
                    <Label>E-mail</Label>
                    <Input value={editing.email ?? ""} onChange={(e) => setEditing({ ...editing, email: e.target.value })} />
                  </div>
                  <div>
                    <Label>Logo</Label>
                    <div className="flex items-center gap-3">
                      {editing.logo_url && <img src={editing.logo_url} alt="" className="w-14 h-14 rounded object-contain border bg-white" />}
                      <Input placeholder="URL da logo" value={editing.logo_url ?? ""} onChange={(e) => setEditing({ ...editing, logo_url: e.target.value })} />
                      <label className="cursor-pointer">
                        <input type="file" accept="image/*" className="hidden"
                          onChange={(e) => e.target.files?.[0] && onLogoFile(e.target.files[0])} />
                        <Button asChild type="button" variant="outline" disabled={uploading}>
                          <span><Upload className="h-4 w-4 mr-1" />{uploading ? "..." : "Anexar"}</span>
                        </Button>
                      </label>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={!!editing.ativo} onCheckedChange={(v) => setEditing({ ...editing, ativo: v })} />
                    <Label>{editing.ativo ? "Ativo" : "Inativo"}</Label>
                  </div>
                </TabsContent>

                <TabsContent value="esp" className="mt-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {ESPECIALIDADES.map((esp) => {
                      const checked = editing.especialidades?.includes(esp) ?? false;
                      return (
                        <label key={esp} className="flex items-center gap-2 text-sm cursor-pointer">
                          <Checkbox checked={checked} onCheckedChange={(v) => setEsp(esp, !!v)} />
                          {esp}
                        </label>
                      );
                    })}
                  </div>
                </TabsContent>

                <TabsContent value="hor" className="mt-4 space-y-2">
                  {DIAS.map((d) => {
                    const h = (editing.horarios as any)?.[d.key] ?? {};
                    return (
                      <div key={d.key} className="grid grid-cols-[110px_1fr_1fr_auto] items-center gap-2">
                        <Label>{d.label}</Label>
                        <Input type="time" value={h.abre ?? ""} disabled={h.fechado} onChange={(e) => setHor(d.key, "abre", e.target.value)} />
                        <Input type="time" value={h.fecha ?? ""} disabled={h.fechado} onChange={(e) => setHor(d.key, "fecha", e.target.value)} />
                        <label className="flex items-center gap-1 text-xs">
                          <Checkbox checked={!!h.fechado} onCheckedChange={(v) => setHor(d.key, "fechado", !!v)} />
                          Fechado
                        </label>
                      </div>
                    );
                  })}
                </TabsContent>

                <TabsContent value="end" className="mt-4 space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Estado</Label>
                      <Select value={editing.estado ?? ""} onValueChange={async (uf) => {
                        setEditing({ ...editing, estado: uf, cidade: "" });
                        setFormCidades(await loadMunicipios(uf));
                      }}>
                        <SelectTrigger><SelectValue placeholder="UF" /></SelectTrigger>
                        <SelectContent>
                          {estados.map((e) => <SelectItem key={e.sigla} value={e.sigla}>{e.sigla} — {e.nome}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Cidade *</Label>
                      <Select value={editing.cidade ?? ""} onValueChange={(v) => setEditing({ ...editing, cidade: v })}
                        disabled={!editing.estado}>
                        <SelectTrigger><SelectValue placeholder={editing.estado ? "Selecione" : "Selecione o estado"} /></SelectTrigger>
                        <SelectContent>
                          {formCidades.map((m) => <SelectItem key={m.id} value={m.nome}>{m.nome}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label>Endereço</Label>
                    <Input value={editing.endereco ?? ""} onChange={(e) => setEditing({ ...editing, endereco: e.target.value })} placeholder="Rua, número, bairro" />
                  </div>
                  {mapEmbed && (
                    <div className="rounded-lg overflow-hidden border">
                      <iframe title="Mapa" src={mapEmbed} className="w-full h-64" loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </ScrollArea>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button onClick={save}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
