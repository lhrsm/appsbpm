import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RegistrationNumberInput } from "@/components/RegistrationNumberInput";
import { CpfInput } from "@/components/CpfInput";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { padCpf, padRegistrationNumber } from "@/lib/identity";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Pencil, Trash2, Plus, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { logAudit } from "@/lib/audit";

const SITUACOES_FUNCIONAIS = [
  { value: "ativo", label: "Ativo" },
  { value: "reserva", label: "Reserva" },
  { value: "reformado", label: "Reformado" },
  { value: "civil", label: "Civil" },
];

const STATUS_ASSOCIAÇÃO = [
  { value: "regular", label: "Regular", color: "bg-green-500" },
  { value: "inativo", label: "Inativo", color: "bg-red-500" },
  { value: "suspenso", label: "Suspenso", color: "bg-orange-500" },
  { value: "em_analise", label: "Em análise", color: "bg-yellow-500" },
  { value: "aguardando_reativacao", label: "Aguardando reativação", color: "bg-blue-500" },
  { value: "falecido", label: "Falecido", color: "bg-slate-900" },
];


interface Associado {
  id?: string;
  matricula?: string;
  nome?: string;
  cpf?: string;
  email?: string;
  telefone?: string;
  patente?: string;
  posto_graduacao_id?: string;
  unidade_id?: string;
  situacao_funcional?: string;
  status?: string;
  data_nascimento?: string;
  data_admissao?: string;
  cep?: string;
  cep_residencia?: string;
  endereco?: string;
  numero_residencia?: string;
  complemento_residencia?: string;
  bairro_residencia?: string;
  cidade?: string;
  cidade_residencia?: string;
  estado_residencia?: string;
  foto_url?: string;
  cams_last_sync?: string;
}

const onlyDigits = (v: string) => (v ?? "").replace(/\D/g, "");

const formatCep = (v: string) => {
  const d = onlyDigits(v).slice(0, 8);
  if (d.length <= 5) return d;
  return `${d.slice(0, 5)}-${d.slice(5)}`;
};

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
  const [filterPatente, setFilterPatente] = useState<string>("");
  const [filterStatus, setFilterStatus] = useState<string>("");
  const [filterCidade, setFilterCidade] = useState<string>("");
  const [editing, setEditing] = useState<Associado | null>(null);
  const [open, setOpen] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [postos, setPostos] = useState<any[]>([]);
  const [unidades, setUnidades] = useState<any[]>([]);

  useEffect(() => {
    supabase.from("cams_postos_graduacoes").select("*").order("hierarquia").then(({ data }) => setPostos(data || []));
    supabase.from("cams_unidades").select("*").order("nome").then(({ data }) => setUnidades(data || []));
  }, []);


  const load = async () => {
    setLoading(true);
    let q = supabase.from("associados").select("*").order("created_at", { ascending: false }).limit(500);
    if (search) q = q.ilike("nome", `%${search}%`);
    if (filterPatente) q = q.eq("patente", filterPatente);
    if (filterStatus) q = q.eq("status", filterStatus as any);
    if (filterCidade) q = q.eq("cidade", filterCidade);
    const { data, error } = await q;
    if (error) toast.error(error.message);
    else setRows((data as Associado[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [search, filterPatente, filterStatus, filterCidade]);

  const [cidadesDisponiveis, setCidadesDisponiveis] = useState<string[]>([]);
  useEffect(() => {
    supabase.from("associados").select("cidade").not("cidade", "is", null).then(({ data }) => {
      const uniq = Array.from(new Set((data ?? []).map((r: any) => r.cidade).filter(Boolean))) as string[];
      setCidadesDisponiveis(uniq.sort());
    });
  }, [open]);

  const openNew = () => {
    setEditing({ status: "regular" });
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
      setEditing((prev) => ({ ...(prev ?? {}), endereco: partes, cidade: data.localidade ?? prev?.cidade }));
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
    
    // Removendo explicitamente o campo redundante 'ativo'
    delete payload.ativo;
    
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
      if ((error as any).code === "42501") {
        return toast.error("Você não possui permissão para salvar este cadastro.");
      }
      return toast.error("Não foi possível salvar o associado. Tente novamente.");
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

      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 absolute left-3 top-3 text-muted-foreground" />
          <Input placeholder="Buscar por nome..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={filterPatente}
          onChange={(e) => setFilterPatente(e.target.value)}
        >
          <option value="">Todas os postos</option>
          {postos.map((p) => <option key={p.id} value={p.nome}>{p.sigla} - {p.nome}</option>)}

        </select>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <option value="">Todos os status</option>
          {STATUS_ASSOCIAÇÃO.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
        <select
          className="h-10 rounded-md border border-input bg-background px-3 text-sm"
          value={filterCidade}
          onChange={(e) => setFilterCidade(e.target.value)}
        >
          <option value="">Todas as cidades</option>
          {cidadesDisponiveis.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
        {(filterPatente || filterStatus || filterCidade) && (
          <Button variant="outline" size="sm" onClick={() => { setFilterPatente(""); setFilterStatus(""); setFilterCidade(""); }}>
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
          {rows.map((r) => (
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
                  <div className="text-xs text-muted-foreground">Matrícula: {r.matricula?.replace(/^(\d{8})(\d{1})/, '$1-$2')}</div>
                  {r.patente && <div className="text-xs text-muted-foreground truncate">{r.patente}</div>}
                </div>
                <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full text-white ${STATUS_ASSOCIAÇÃO.find(s => s.value === r.status)?.color ?? "bg-gray-500"}`}>
                  {STATUS_ASSOCIAÇÃO.find(s => s.value === r.status)?.label ?? r.status}
                </span>
              </div>
              <div className="text-xs space-y-1 text-muted-foreground">
                <div className="truncate"><span className="font-medium text-foreground">CPF:</span> {r.cpf?.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4") ?? "—"}</div>
                <div className="truncate"><span className="font-medium text-foreground">E-mail:</span> {r.email ?? "—"}</div>
                <div className="truncate"><span className="font-medium text-foreground">Telefone:</span> {r.telefone ?? "—"}</div>
                {r.cidade_residencia && <div className="truncate"><span className="font-medium text-foreground">Cidade:</span> {r.cidade_residencia}</div>}
                {r.data_admissao && <div className="truncate"><span className="font-medium text-foreground">Admissão:</span> {isoToBR(r.data_admissao)}</div>}

              </div>
              <div className="flex justify-end gap-1 pt-2 border-t">
                <Button variant="ghost" size="icon" onClick={() => { setEditing({ ...r, data_nascimento: isoToBR(r.data_nascimento), data_admissao: isoToBR(r.data_admissao) }); setOpen(true); }}><Pencil className="w-4 h-4" /></Button>
                <Button variant="ghost" size="icon" onClick={() => remove(r.id!)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Editar" : "Novo"} — Associado</DialogTitle>
          </DialogHeader>
          {editing?.id && <OrigemDadoBadge entidade="associado" registroId={editing.id} className="pb-1" />}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
            <div>
              <RegistrationNumberInput 
                label="Matrícula *" 
                value={editing?.matricula ?? ""} 
                onChange={(v) => setEditing({ ...editing, matricula: v })} 
              />
            </div>
            <div>
              <Label>Nome completo *</Label>
              <Input value={editing?.nome ?? ""} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} />
            </div>
            <div>
              <CpfInput 
                label="CPF *" 
                value={editing?.cpf ?? ""} 
                onChange={(v) => setEditing({ ...editing, cpf: v })} 
              />
            </div>
            <div>
              <Label>Posto / Graduação</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={editing?.posto_graduacao_id ?? ""}
                onChange={(e) => {
                  const p = postos.find(x => x.id === e.target.value);
                  setEditing({ ...editing, posto_graduacao_id: e.target.value, patente: p?.nome });
                }}
              >
                <option value="">Selecione...</option>
                {postos.map((p) => <option key={p.id} value={p.id}>{p.sigla} - {p.nome}</option>)}
              </select>
            </div>
            <div>
              <Label>Unidade / OPM</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={editing?.unidade_id ?? ""}
                onChange={(e) => setEditing({ ...editing, unidade_id: e.target.value })}
              >
                <option value="">Selecione...</option>
                {unidades.map((u) => <option key={u.id} value={u.id}>{u.sigla} - {u.nome}</option>)}
              </select>
            </div>
            <div>
              <Label>Situação Funcional</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={editing?.situacao_funcional ?? "ativo"}
                onChange={(e) => setEditing({ ...editing, situacao_funcional: e.target.value })}
              >
                {SITUACOES_FUNCIONAIS.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
              </select>
            </div>
            <div>
              <Label>Status da Associação</Label>
              <select
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                value={editing?.status ?? "regular"}
                onChange={(e) => {
                  const val = e.target.value;
                  setEditing({ 
                    ...editing, 
                    status: val
                  });
                }}
              >
                {STATUS_ASSOCIAÇÃO.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
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
              <Label>Cidade</Label>
              <Input value={editing?.cidade ?? ""} onChange={(e) => setEditing({ ...editing, cidade: e.target.value })} />
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
