import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Star, Check, Trash2, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

type Row = {
  id: string; clinica_id: string; autor_nome: string; nota: number; comentario: string | null;
  aprovado: boolean; created_at: string; clinicas_parceiros?: { nome: string } | null;
};

export default function AdminAvaliacoes() {
  const [rows, setRows] = useState<Row[]>([]);

  const load = async () => {
    const { data } = await supabase
      .from("avaliacoes_parceiros")
      .select("*, clinicas_parceiros(nome)")
      .order("created_at", { ascending: false });
    setRows((data as any) ?? []);
  };
  useEffect(() => { load(); }, []);

  const aprovar = async (id: string) => {
    const { error } = await supabase
      .from("avaliacoes_parceiros")
      .update({ aprovado: true, moderado_em: new Date().toISOString() })
      .eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Avaliação aprovada");
    load();
  };
  const remove = async (id: string) => {
    if (!confirm("Excluir avaliação?")) return;
    const { error } = await supabase.from("avaliacoes_parceiros").delete().eq("id", id);
    if (error) return toast.error(error.message);
    load();
  };

  const pendentes = rows.filter((r) => !r.aprovado);
  const aprovadas = rows.filter((r) => r.aprovado);

  const Card1 = ({ r }: { r: Row }) => (
    <Card>
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-2">
          <div>
            <CardTitle className="text-base">{r.clinicas_parceiros?.nome ?? "—"}</CardTitle>
            <p className="text-xs text-muted-foreground">por {r.autor_nome} · {new Date(r.created_at).toLocaleDateString("pt-BR")}</p>
          </div>
          <div className="flex items-center gap-0.5">
            {[1,2,3,4,5].map((i) => (
              <Star key={i} className={cn("h-4 w-4", i <= r.nota ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground")} />
            ))}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {r.comentario && <p className="text-sm whitespace-pre-line">{r.comentario}</p>}
        <div className="flex gap-2">
          {!r.aprovado && (
            <Button size="sm" onClick={() => aprovar(r.id)}><Check className="h-3 w-3 mr-1" /> Aprovar</Button>
          )}
          <Button size="sm" variant="ghost" onClick={() => remove(r.id)}><Trash2 className="h-3 w-3 mr-1" /> Excluir</Button>
          {r.aprovado && <Badge variant="secondary">Publicada</Badge>}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><MessageSquare className="h-6 w-6" /> Avaliações de Parceiros</h1>
        <p className="text-sm text-muted-foreground">Modere as avaliações antes de exibi-las aos demais associados.</p>
      </div>

      <Tabs defaultValue="pendentes">
        <TabsList>
          <TabsTrigger value="pendentes">Pendentes ({pendentes.length})</TabsTrigger>
          <TabsTrigger value="aprovadas">Aprovadas ({aprovadas.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pendentes" className="space-y-3 pt-3">
          {pendentes.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-muted-foreground">Nenhuma avaliação pendente.</CardContent></Card>
          ) : pendentes.map((r) => <Card1 key={r.id} r={r} />)}
        </TabsContent>
        <TabsContent value="aprovadas" className="space-y-3 pt-3">
          {aprovadas.length === 0 ? (
            <Card><CardContent className="py-10 text-center text-muted-foreground">Nenhuma avaliação aprovada ainda.</CardContent></Card>
          ) : aprovadas.map((r) => <Card1 key={r.id} r={r} />)}
        </TabsContent>
      </Tabs>
    </div>
  );
}
