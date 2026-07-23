import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Bell, Loader2, Send } from "lucide-react";

type Alvo = "all" | "associado" | "dependente";

export default function AdminNotificacoes() {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [url, setUrl] = useState("/dashboard");
  const [alvo, setAlvo] = useState<Alvo>("all");
  const [alvoId, setAlvoId] = useState<string>("");
  const [associados, setAssociados] = useState<any[]>([]);
  const [dependentes, setDependentes] = useState<any[]>([]);
  const [totalTokens, setTotalTokens] = useState(0);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    (async () => {
      const [{ data: a }, { data: d }, { count }] = await Promise.all([
        supabase.from("associados").select("id,nome,matricula").order("nome"),
        supabase.from("dependentes").select("id,nome,associado_id").order("nome"),
        supabase.from("push_tokens").select("id", { count: "exact", head: true }),
      ]);
      setAssociados(a || []);
      setDependentes(d || []);
      setTotalTokens(count || 0);
    })();
  }, []);

  const handleSend = async () => {
    if (!title.trim() || !body.trim()) {
      toast.error("Preencha título e mensagem.");
      return;
    }
    setSending(true);
    try {
      const payload: any = { title, body, url };
      if (alvo === "all") payload.all = true;
      else if (alvo === "associado") payload.associadoId = alvoId;
      else if (alvo === "dependente") payload.dependenteId = alvoId;

      if (alvo !== "all" && !alvoId) {
        toast.error("Selecione o destinatário.");
        setSending(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("send-push", { body: payload });
      if (error) throw error;
      toast.success(`Enviadas: ${data.sent} • Falhas: ${data.failed}`);
      setTitle(""); setBody("");
    } catch (e: any) {
      console.error(e);
      toast.error(e.message || "Falha ao enviar notificação.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Bell className="h-6 w-6 text-primary" />
        <div>
          <h1 className="text-2xl font-bold">Notificações Push</h1>
          <p className="text-sm text-muted-foreground">
            {totalTokens} dispositivo{totalTokens === 1 ? "" : "s"} inscrito{totalTokens === 1 ? "" : "s"}.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Nova mensagem</CardTitle>
          <CardDescription>Envie um aviso para todos ou para um usuário específico.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Destinatário</Label>
              <Select value={alvo} onValueChange={(v) => { setAlvo(v as Alvo); setAlvoId(""); }}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os usuários</SelectItem>
                  <SelectItem value="associado">Associado (titular)</SelectItem>
                  <SelectItem value="dependente">Dependente</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {alvo === "associado" && (
              <div className="space-y-2">
                <Label>Associado</Label>
                <Select value={alvoId} onValueChange={setAlvoId}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {associados.map((a) => (
                      <SelectItem key={a.id} value={a.id}>{a.matricula} — {a.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
            {alvo === "dependente" && (
              <div className="space-y-2">
                <Label>Dependente</Label>
                <Select value={alvoId} onValueChange={setAlvoId}>
                  <SelectTrigger><SelectValue placeholder="Selecione" /></SelectTrigger>
                  <SelectContent>
                    {dependentes.map((d) => (
                      <SelectItem key={d.id} value={d.id}>{d.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={80} placeholder="Ex: Novo comunicado da SBPM" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="body">Mensagem</Label>
            <Textarea id="body" value={body} onChange={(e) => setBody(e.target.value)} maxLength={250} rows={3} placeholder="Texto que aparecerá na notificação" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="url">Link ao clicar (opcional)</Label>
            <Input id="url" value={url} onChange={(e) => setUrl(e.target.value)} placeholder="/dashboard" />
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSend} disabled={sending} className="gap-2">
              {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              Enviar notificação
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
