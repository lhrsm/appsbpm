import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, Calendar, Users } from "lucide-react";
import { toast } from "sonner";

type Ev = {
  id: string; titulo: string; descricao: string | null; categoria: string;
  local: string | null; endereco: string | null; data_inicio: string; data_fim: string | null;
  capacidade: number | null; imagem_url: string | null; permite_rsvp: boolean; ativo: boolean;
};

const CATS = ["geral", "assembleia", "saúde", "esporte", "capacitação", "confraternização"];

function toLocal(iso: string | null) {
  if (!iso) return "";
  const d = new Date(iso);
  const p = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
}

export default function AdminEventos() {
  const [items, setItems] = useState<Ev[]>([]);
  const [editing, setEditing] = useState<Partial<Ev> | null>(null);
  const [counts, setCounts] = useState<Record<string, number>>({});

  const load = async () => {
    const { data } = await supabase.from("eventos").select("*").order("data_inicio", { ascending: false });
    setItems((data as Ev[]) ?? []);
    const { data: rs } = await supabase.from("evento_rsvps").select("evento_id");
    const c: Record<string, number> = {};
    (rs ?? []).forEach((r: any) => { c[r.evento_id] = (c[r.evento_id] ?? 0) + 1; });
    setCounts(c);
  };

  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.titulo || !editing?.data_inicio) {
      toast.error("Preencha título e data de início");
      return;
    }
    const payload = {
      titulo: editing.titulo,
      descricao: editing.descricao ?? null,
      categoria: editing.categoria ?? "geral",
      local: editing.local ?? null,
      endereco: editing.endereco ?? null,
      data_inicio: new Date(editing.data_inicio!).toISOString(),
      data_fim: editing.data_fim ? new Date(editing.data_fim).toISOString() : null,
      capacidade: editing.capacidade ?? null,
      imagem_url: editing.imagem_url ?? null,
      permite_rsvp: editing.permite_rsvp ?? true,
      ativo: editing.ativo ?? true,
    };
    const res = editing.id
      ? await supabase.from("eventos").update(payload).eq("id", editing.id)
      : await supabase.from("eventos").insert(payload);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success("Evento salvo");
    setEditing(null);
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir evento?")) return;
    const { error } = await supabase.from("eventos").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    toast.success("Evento removido");
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Calendar className="h-6 w-6" /> Eventos</h1>
          <p className="text-sm text-muted-foreground">Gerencie a agenda institucional publicada aos associados.</p>
        </div>
        <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing({ categoria: "geral", permite_rsvp: true, ativo: true })}>
              <Plus className="h-4 w-4 mr-1" /> Novo evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader><DialogTitle>{editing?.id ? "Editar" : "Novo"} evento</DialogTitle></DialogHeader>
            <div className="grid gap-3 md:grid-cols-2">
              <div className="md:col-span-2">
                <Label>Título *</Label>
                <Input value={editing?.titulo ?? ""} onChange={(e) => setEditing({ ...editing, titulo: e.target.value })} />
              </div>
              <div>
                <Label>Categoria</Label>
                <Select value={editing?.categoria ?? "geral"} onValueChange={(v) => setEditing({ ...editing, categoria: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATS.map(c => <SelectItem key={c} value={c} className="capitalize">{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label>Capacidade</Label>
                <Input type="number" value={editing?.capacidade ?? ""} onChange={(e) => setEditing({ ...editing, capacidade: e.target.value ? +e.target.value : null })} />
              </div>
              <div>
                <Label>Início *</Label>
                <Input type="datetime-local" value={toLocal(editing?.data_inicio as any)} onChange={(e) => setEditing({ ...editing, data_inicio: e.target.value })} />
              </div>
              <div>
                <Label>Fim</Label>
                <Input type="datetime-local" value={toLocal(editing?.data_fim as any)} onChange={(e) => setEditing({ ...editing, data_fim: e.target.value })} />
              </div>
              <div>
                <Label>Local</Label>
                <Input value={editing?.local ?? ""} onChange={(e) => setEditing({ ...editing, local: e.target.value })} />
              </div>
              <div>
                <Label>Endereço</Label>
                <Input value={editing?.endereco ?? ""} onChange={(e) => setEditing({ ...editing, endereco: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label>URL da imagem</Label>
                <Input value={editing?.imagem_url ?? ""} onChange={(e) => setEditing({ ...editing, imagem_url: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label>Descrição</Label>
                <Textarea rows={4} value={editing?.descricao ?? ""} onChange={(e) => setEditing({ ...editing, descricao: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editing?.permite_rsvp ?? true} onCheckedChange={(v) => setEditing({ ...editing, permite_rsvp: v })} />
                <Label>Permitir confirmação de presença</Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editing?.ativo ?? true} onCheckedChange={(v) => setEditing({ ...editing, ativo: v })} />
                <Label>Ativo (visível)</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button onClick={save}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {items.map((ev) => (
          <Card key={ev.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{ev.titulo}</CardTitle>
                <div className="flex gap-1">
                  <Badge variant="secondary" className="capitalize">{ev.categoria}</Badge>
                  {!ev.ativo && <Badge variant="outline">Inativo</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>{new Date(ev.data_inicio).toLocaleString("pt-BR")}</p>
              {ev.local && <p className="text-muted-foreground">{ev.local}</p>}
              <p className="flex items-center gap-1 text-muted-foreground">
                <Users className="h-3 w-3" /> {counts[ev.id] ?? 0} confirmações
                {ev.capacidade ? ` / ${ev.capacidade}` : ""}
              </p>
              <div className="flex gap-2 pt-2">
                <Button size="sm" variant="outline" onClick={() => setEditing(ev)}>
                  <Pencil className="h-3 w-3 mr-1" /> Editar
                </Button>
                <Button size="sm" variant="ghost" onClick={() => remove(ev.id)}>
                  <Trash2 className="h-3 w-3 mr-1" /> Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {items.length === 0 && (
          <Card><CardContent className="py-10 text-center text-muted-foreground">Nenhum evento cadastrado.</CardContent></Card>
        )}
      </div>
    </div>
  );
}
