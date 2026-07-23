import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2, HelpCircle } from "lucide-react";
import { toast } from "sonner";

type Faq = { id: string; categoria: string; pergunta: string; resposta: string; ordem: number; publicado: boolean };

export default function AdminFAQ() {
  const [items, setItems] = useState<Faq[]>([]);
  const [editing, setEditing] = useState<Partial<Faq> | null>(null);

  const load = async () => {
    const { data } = await supabase.from("faq_items").select("*").order("categoria").order("ordem");
    setItems((data as Faq[]) ?? []);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!editing?.pergunta || !editing?.resposta) { toast.error("Preencha pergunta e resposta"); return; }
    const payload = {
      categoria: editing.categoria || "geral",
      pergunta: editing.pergunta,
      resposta: editing.resposta,
      ordem: editing.ordem ?? 0,
      publicado: editing.publicado ?? true,
    };
    const res = editing.id
      ? await supabase.from("faq_items").update(payload).eq("id", editing.id)
      : await supabase.from("faq_items").insert(payload);
    if (res.error) { toast.error(res.error.message); return; }
    toast.success("FAQ salvo");
    setEditing(null); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir?")) return;
    const { error } = await supabase.from("faq_items").delete().eq("id", id);
    if (error) { toast.error(error.message); return; }
    load();
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><HelpCircle className="h-6 w-6" /> Perguntas Frequentes</h1>
          <p className="text-sm text-muted-foreground">Estas respostas alimentam a página FAQ e o assistente virtual.</p>
        </div>
        <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditing({ categoria: "geral", ordem: 0, publicado: true })}>
              <Plus className="h-4 w-4 mr-1" /> Nova pergunta
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl">
            <DialogHeader><DialogTitle>{editing?.id ? "Editar" : "Nova"} pergunta</DialogTitle></DialogHeader>
            <div className="grid gap-3">
              <div className="grid gap-3 md:grid-cols-3">
                <div className="md:col-span-2">
                  <Label>Categoria</Label>
                  <Input value={editing?.categoria ?? ""} onChange={(e) => setEditing({ ...editing, categoria: e.target.value })} placeholder="ex.: benefícios, saúde, cadastro" />
                </div>
                <div>
                  <Label>Ordem</Label>
                  <Input type="number" value={editing?.ordem ?? 0} onChange={(e) => setEditing({ ...editing, ordem: +e.target.value })} />
                </div>
              </div>
              <div>
                <Label>Pergunta *</Label>
                <Input value={editing?.pergunta ?? ""} onChange={(e) => setEditing({ ...editing, pergunta: e.target.value })} />
              </div>
              <div>
                <Label>Resposta *</Label>
                <Textarea rows={6} value={editing?.resposta ?? ""} onChange={(e) => setEditing({ ...editing, resposta: e.target.value })} />
              </div>
              <div className="flex items-center gap-2">
                <Switch checked={editing?.publicado ?? true} onCheckedChange={(v) => setEditing({ ...editing, publicado: v })} />
                <Label>Publicado</Label>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditing(null)}>Cancelar</Button>
              <Button onClick={save}>Salvar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-2">
        {items.map((it) => (
          <Card key={it.id}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary" className="capitalize">{it.categoria}</Badge>
                    <Badge variant="outline">ordem {it.ordem}</Badge>
                    {!it.publicado && <Badge variant="destructive">rascunho</Badge>}
                  </div>
                  <CardTitle className="text-base">{it.pergunta}</CardTitle>
                </div>
                <div className="flex gap-1">
                  <Button size="icon" variant="ghost" onClick={() => setEditing(it)}><Pencil className="h-4 w-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(it.id)}><Trash2 className="h-4 w-4" /></Button>
                </div>
              </div>
            </CardHeader>
            <CardContent><p className="text-sm text-muted-foreground whitespace-pre-line">{it.resposta}</p></CardContent>
          </Card>
        ))}
        {items.length === 0 && <Card><CardContent className="py-10 text-center text-muted-foreground">Nenhuma pergunta cadastrada.</CardContent></Card>}
      </div>
    </div>
  );
}
