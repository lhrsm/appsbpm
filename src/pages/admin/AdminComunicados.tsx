import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Megaphone, Plus, Pencil, Trash2, Info, AlertTriangle, Gift } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";

type Comunicado = {
  id: string;
  titulo: string;
  mensagem: string;
  tipo: "informativo" | "alerta" | "promocao";
  segmento: "todos" | "cidade" | "aniversariantes";
  cidade_alvo: string | null;
  data_inicio: string;
  data_fim: string | null;
  ativo: boolean;
};

const empty: Partial<Comunicado> = {
  titulo: "",
  mensagem: "",
  tipo: "informativo",
  segmento: "todos",
  cidade_alvo: "",
  data_inicio: format(new Date(), "yyyy-MM-dd"),
  data_fim: "",
  ativo: true,
};

const tipoIcon = { informativo: Info, alerta: AlertTriangle, promocao: Gift };
const tipoLabel = { informativo: "Informativo", alerta: "Alerta", promocao: "Promoção" };

export default function AdminComunicados() {
  const [items, setItems] = useState<Comunicado[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<Partial<Comunicado>>(empty);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase.from("comunicados").select("*").order("created_at", { ascending: false });
    setItems((data as any) || []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!form.titulo || !form.mensagem) { toast.error("Preencha título e mensagem"); return; }
    const payload: any = {
      titulo: form.titulo,
      mensagem: form.mensagem,
      tipo: form.tipo,
      segmento: form.segmento,
      cidade_alvo: form.segmento === "cidade" ? form.cidade_alvo : null,
      data_inicio: form.data_inicio || format(new Date(), "yyyy-MM-dd"),
      data_fim: form.data_fim || null,
      ativo: form.ativo ?? true,
    };
    const { error } = form.id
      ? await supabase.from("comunicados").update(payload).eq("id", form.id)
      : await supabase.from("comunicados").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(form.id ? "Comunicado atualizado" : "Comunicado criado");
    setOpen(false); setForm(empty); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este comunicado?")) return;
    const { error } = await supabase.from("comunicados").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removido"); load();
  };

  const edit = (c: Comunicado) => { setForm(c); setOpen(true); };
  const novo = () => { setForm(empty); setOpen(true); };

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Megaphone className="w-6 h-6 text-primary" />Comunicados</h1>
          <p className="text-sm text-muted-foreground">Avisos exibidos no painel dos associados</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={novo}><Plus className="w-4 h-4 mr-2" />Novo comunicado</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader><DialogTitle>{form.id ? "Editar" : "Novo"} comunicado</DialogTitle></DialogHeader>
            <div className="space-y-3">
              <div>
                <Label>Título</Label>
                <Input value={form.titulo || ""} onChange={(e) => setForm({ ...form, titulo: e.target.value })} />
              </div>
              <div>
                <Label>Mensagem</Label>
                <Textarea rows={4} value={form.mensagem || ""} onChange={(e) => setForm({ ...form, mensagem: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Tipo</Label>
                  <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="informativo">Informativo</SelectItem>
                      <SelectItem value="alerta">Alerta</SelectItem>
                      <SelectItem value="promocao">Promoção</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Segmento</Label>
                  <Select value={form.segmento} onValueChange={(v) => setForm({ ...form, segmento: v as any })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="cidade">Cidade específica</SelectItem>
                      <SelectItem value="aniversariantes">Aniversariantes do mês</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {form.segmento === "cidade" && (
                <div>
                  <Label>Cidade alvo</Label>
                  <Input value={form.cidade_alvo || ""} onChange={(e) => setForm({ ...form, cidade_alvo: e.target.value })} />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Início</Label>
                  <Input type="date" value={form.data_inicio || ""} onChange={(e) => setForm({ ...form, data_inicio: e.target.value })} />
                </div>
                <div>
                  <Label>Fim (opcional)</Label>
                  <Input type="date" value={form.data_fim || ""} onChange={(e) => setForm({ ...form, data_fim: e.target.value })} />
                </div>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border">
                <Label>Ativo</Label>
                <Switch checked={form.ativo ?? true} onCheckedChange={(v) => setForm({ ...form, ativo: v })} />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancelar</Button>
              <Button onClick={save}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Todos os comunicados</CardTitle>
          <CardDescription>Aparecem no topo do painel dos associados enquanto estiverem ativos e vigentes</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Carregando...</div>
          ) : items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">Nenhum comunicado cadastrado.</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Segmento</TableHead>
                  <TableHead>Período</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((c) => {
                  const Icon = tipoIcon[c.tipo];
                  return (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{c.titulo}</TableCell>
                      <TableCell><Badge variant="outline"><Icon className="w-3 h-3 mr-1" />{tipoLabel[c.tipo]}</Badge></TableCell>
                      <TableCell className="capitalize">{c.segmento}{c.cidade_alvo ? ` — ${c.cidade_alvo}` : ""}</TableCell>
                      <TableCell className="text-xs">
                        {format(parseISO(c.data_inicio), "dd/MM/yyyy")}
                        {c.data_fim && ` → ${format(parseISO(c.data_fim), "dd/MM/yyyy")}`}
                      </TableCell>
                      <TableCell>
                        <Badge variant={c.ativo ? "default" : "secondary"}>{c.ativo ? "Ativo" : "Inativo"}</Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm" onClick={() => edit(c)}><Pencil className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="sm" onClick={() => remove(c.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
