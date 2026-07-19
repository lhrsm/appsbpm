import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { Play, Plus, Trash2, RefreshCw, Copy } from "lucide-react";

type Source = {
  id: string; nome: string; entidade: string; metodo: string; url: string;
  auth_tipo: string; auth_token: string | null; auth_header_name: string | null;
  headers_extras: Record<string, string>; body_template: unknown; response_path: string | null;
  campo_chave: string; mapeamento: Record<string, string>; ativo: boolean;
  frequencia: string; ultima_sincronizacao: string | null;
};
type Webhook = {
  id: string; nome: string; entidade: string; slug: string; secret_token: string;
  ativo: boolean; ultima_chamada: string | null; total_chamadas: number;
};
type Log = {
  id: string; source_id: string; status: string; registros_processados: number;
  mensagem: string | null; iniciado_em: string; finalizado_em: string | null;
};

const ENTIDADES = [
  { value: "associados", label: "Associados" },
  { value: "dependentes", label: "Dependentes" },
  { value: "clinicas_parceiros", label: "Clínicas & Parceiros" },
  { value: "limites", label: "Limites" },
  { value: "carencias", label: "Carências" },
  { value: "informes_rendimentos", label: "Informes de Rendimentos" },
];

const emptySource: Partial<Source> = {
  nome: "", entidade: "associados", metodo: "GET", url: "",
  auth_tipo: "bearer", auth_token: "", auth_header_name: "Authorization",
  headers_extras: {}, response_path: "", campo_chave: "matricula",
  mapeamento: {}, ativo: true, frequencia: "manual",
};

export default function AdminSincronizacao() {
  const [sources, setSources] = useState<Source[]>([]);
  const [webhooks, setWebhooks] = useState<Webhook[]>([]);
  const [logs, setLogs] = useState<Log[]>([]);
  const [openSrc, setOpenSrc] = useState(false);
  const [openWh, setOpenWh] = useState(false);
  const [editing, setEditing] = useState<Partial<Source>>(emptySource);
  const [newWh, setNewWh] = useState({ nome: "", entidade: "associados", slug: "" });
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [projectRef, setProjectRef] = useState<string>("");

  useEffect(() => {
    setProjectRef(import.meta.env.VITE_SUPABASE_PROJECT_ID || "");
    load();
  }, []);

  const load = async () => {
    const [s, w, l] = await Promise.all([
      supabase.from("sync_sources").select("*").order("created_at", { ascending: false }),
      supabase.from("webhook_endpoints").select("*").order("created_at", { ascending: false }),
      supabase.from("sync_logs").select("*").order("iniciado_em", { ascending: false }).limit(30),
    ]);
    setSources((s.data as Source[]) || []);
    setWebhooks((w.data as Webhook[]) || []);
    setLogs((l.data as Log[]) || []);
  };

  const saveSource = async () => {
    const payload = {
      ...editing,
      headers_extras: typeof editing.headers_extras === "string"
        ? JSON.parse(editing.headers_extras || "{}") : editing.headers_extras || {},
      mapeamento: typeof editing.mapeamento === "string"
        ? JSON.parse(editing.mapeamento || "{}") : editing.mapeamento || {},
    };
    const { error } = editing.id
      ? await supabase.from("sync_sources").update(payload).eq("id", editing.id)
      : await supabase.from("sync_sources").insert(payload as never);
    if (error) return toast.error(error.message);
    toast.success("Fonte salva");
    setOpenSrc(false); setEditing(emptySource); load();
  };

  const removeSource = async (id: string) => {
    if (!confirm("Excluir esta fonte?")) return;
    await supabase.from("sync_sources").delete().eq("id", id);
    load();
  };

  const runSync = async (id: string) => {
    setSyncingId(id);
    const { data, error } = await supabase.functions.invoke("sync-external", { body: { source_id: id } });
    setSyncingId(null);
    if (error) return toast.error(error.message);
    if (data?.error) return toast.error(data.error);
    toast.success(`Sincronizado: ${data?.processados ?? 0} registros`);
    load();
  };

  const createWebhook = async () => {
    const secret = crypto.randomUUID().replace(/-/g, "");
    const slug = newWh.slug.trim() || `${newWh.entidade}-${Math.random().toString(36).slice(2, 8)}`;
    const { error } = await supabase.from("webhook_endpoints").insert({
      nome: newWh.nome, entidade: newWh.entidade, slug, secret_token: secret,
    } as never);
    if (error) return toast.error(error.message);
    toast.success("Webhook criado");
    setOpenWh(false); setNewWh({ nome: "", entidade: "associados", slug: "" }); load();
  };

  const removeWebhook = async (id: string) => {
    if (!confirm("Excluir este webhook?")) return;
    await supabase.from("webhook_endpoints").delete().eq("id", id);
    load();
  };

  const copyText = (t: string) => { navigator.clipboard.writeText(t); toast.success("Copiado"); };

  const webhookUrl = (slug: string) =>
    projectRef ? `https://${projectRef}.supabase.co/functions/v1/webhook-ingest/${slug}` : "";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Sincronização com Sistema Interno</h1>
        <p className="text-muted-foreground text-sm">
          Configure fontes de API (pull) ou webhooks (push) para que o desenvolvedor do sistema interno alimente a plataforma automaticamente.
        </p>
      </div>

      <Tabs defaultValue="fontes">
        <TabsList>
          <TabsTrigger value="fontes">Fontes de API (Pull)</TabsTrigger>
          <TabsTrigger value="webhooks">Webhooks (Push)</TabsTrigger>
          <TabsTrigger value="logs">Histórico</TabsTrigger>
        </TabsList>

        {/* FONTES */}
        <TabsContent value="fontes" className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              O app consulta a URL configurada, mapeia os campos e grava na tabela correspondente.
            </p>
            <Dialog open={openSrc} onOpenChange={setOpenSrc}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditing(emptySource)}>
                  <Plus className="w-4 h-4 mr-2" /> Nova fonte
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-auto">
                <DialogHeader><DialogTitle>{editing.id ? "Editar" : "Nova"} fonte de API</DialogTitle></DialogHeader>
                <div className="grid gap-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Nome</Label>
                      <Input value={editing.nome || ""} onChange={(e) => setEditing({ ...editing, nome: e.target.value })} />
                    </div>
                    <div>
                      <Label>Entidade destino</Label>
                      <Select value={editing.entidade} onValueChange={(v) => setEditing({ ...editing, entidade: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {ENTIDADES.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    <div>
                      <Label>Método</Label>
                      <Select value={editing.metodo} onValueChange={(v) => setEditing({ ...editing, metodo: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="GET">GET</SelectItem><SelectItem value="POST">POST</SelectItem></SelectContent>
                      </Select>
                    </div>
                    <div className="col-span-3">
                      <Label>URL do endpoint</Label>
                      <Input placeholder="https://api.sbpm.com/associados"
                        value={editing.url || ""} onChange={(e) => setEditing({ ...editing, url: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <Label>Autenticação</Label>
                      <Select value={editing.auth_tipo} onValueChange={(v) => setEditing({ ...editing, auth_tipo: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="none">Nenhuma</SelectItem>
                          <SelectItem value="bearer">Bearer Token</SelectItem>
                          <SelectItem value="apikey">API Key</SelectItem>
                          <SelectItem value="basic">Basic (user:pass)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Nome do header</Label>
                      <Input value={editing.auth_header_name || ""} onChange={(e) => setEditing({ ...editing, auth_header_name: e.target.value })} />
                    </div>
                    <div>
                      <Label>Token / credencial</Label>
                      <Input type="password" value={editing.auth_token || ""} onChange={(e) => setEditing({ ...editing, auth_token: e.target.value })} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label>Caminho da lista na resposta (opcional)</Label>
                      <Input placeholder="ex: data.items" value={editing.response_path || ""} onChange={(e) => setEditing({ ...editing, response_path: e.target.value })} />
                    </div>
                    <div>
                      <Label>Campo-chave (upsert)</Label>
                      <Input value={editing.campo_chave || ""} onChange={(e) => setEditing({ ...editing, campo_chave: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label>Mapeamento (destino ← origem) — JSON</Label>
                    <Textarea rows={5} className="font-mono text-xs"
                      placeholder={`{\n  "matricula": "codigo",\n  "nome": "nome_completo",\n  "cpf": "documento"\n}`}
                      value={typeof editing.mapeamento === "string" ? editing.mapeamento : JSON.stringify(editing.mapeamento, null, 2)}
                      onChange={(e) => setEditing({ ...editing, mapeamento: e.target.value as never })} />
                  </div>
                  <div>
                    <Label>Headers extras — JSON (opcional)</Label>
                    <Textarea rows={2} className="font-mono text-xs"
                      value={typeof editing.headers_extras === "string" ? editing.headers_extras : JSON.stringify(editing.headers_extras, null, 2)}
                      onChange={(e) => setEditing({ ...editing, headers_extras: e.target.value as never })} />
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch checked={editing.ativo} onCheckedChange={(v) => setEditing({ ...editing, ativo: v })} />
                    <Label>Ativa</Label>
                  </div>
                  <Button onClick={saveSource}>Salvar</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-3">
            {sources.length === 0 && (
              <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">
                Nenhuma fonte configurada ainda. Clique em "Nova fonte" para começar.
              </CardContent></Card>
            )}
            {sources.map((s) => (
              <Card key={s.id}>
                <CardContent className="pt-4 flex flex-col md:flex-row md:items-center gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-semibold">{s.nome}</p>
                      <Badge variant={s.ativo ? "default" : "secondary"}>{s.ativo ? "Ativa" : "Inativa"}</Badge>
                      <Badge variant="outline">{s.entidade}</Badge>
                      <Badge variant="outline">{s.metodo}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground truncate">{s.url}</p>
                    {s.ultima_sincronizacao && (
                      <p className="text-xs text-muted-foreground">Última: {new Date(s.ultima_sincronizacao).toLocaleString("pt-BR")}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => runSync(s.id)} disabled={syncingId === s.id}>
                      {syncingId === s.id ? <RefreshCw className="w-4 h-4 mr-1 animate-spin" /> : <Play className="w-4 h-4 mr-1" />}
                      Sincronizar
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => { setEditing(s); setOpenSrc(true); }}>Editar</Button>
                    <Button size="sm" variant="ghost" onClick={() => removeSource(s.id)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* WEBHOOKS */}
        <TabsContent value="webhooks" className="space-y-3">
          <div className="flex justify-between items-center">
            <p className="text-sm text-muted-foreground">
              O sistema interno envia dados via POST para a URL abaixo com o token no header <code>X-Webhook-Token</code>.
            </p>
            <Dialog open={openWh} onOpenChange={setOpenWh}>
              <DialogTrigger asChild><Button><Plus className="w-4 h-4 mr-2" /> Novo webhook</Button></DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Novo webhook</DialogTitle></DialogHeader>
                <div className="grid gap-3">
                  <div>
                    <Label>Nome</Label>
                    <Input value={newWh.nome} onChange={(e) => setNewWh({ ...newWh, nome: e.target.value })} />
                  </div>
                  <div>
                    <Label>Entidade destino</Label>
                    <Select value={newWh.entidade} onValueChange={(v) => setNewWh({ ...newWh, entidade: v })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{ENTIDADES.map((e) => <SelectItem key={e.value} value={e.value}>{e.label}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Slug (opcional)</Label>
                    <Input placeholder="associados-prod" value={newWh.slug} onChange={(e) => setNewWh({ ...newWh, slug: e.target.value })} />
                  </div>
                  <Button onClick={createWebhook}>Criar e gerar token</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-3">
            {webhooks.length === 0 && (
              <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">
                Nenhum webhook criado ainda.
              </CardContent></Card>
            )}
            {webhooks.map((w) => (
              <Card key={w.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base">{w.nome}</CardTitle>
                    <Badge variant={w.ativo ? "default" : "secondary"}>{w.ativo ? "Ativo" : "Inativo"}</Badge>
                    <Badge variant="outline">{w.entidade}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-16">URL:</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">{webhookUrl(w.slug)}</code>
                    <Button size="sm" variant="ghost" onClick={() => copyText(webhookUrl(w.slug))}><Copy className="w-3 h-3" /></Button>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-16">Token:</span>
                    <code className="text-xs bg-muted px-2 py-1 rounded flex-1 truncate">{w.secret_token}</code>
                    <Button size="sm" variant="ghost" onClick={() => copyText(w.secret_token)}><Copy className="w-3 h-3" /></Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Chamadas: {w.total_chamadas} {w.ultima_chamada && `· Última: ${new Date(w.ultima_chamada).toLocaleString("pt-BR")}`}
                  </p>
                  <Button size="sm" variant="ghost" onClick={() => removeWebhook(w.id)}><Trash2 className="w-4 h-4 mr-1" /> Excluir</Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* LOGS */}
        <TabsContent value="logs">
          <div className="grid gap-2">
            {logs.length === 0 && (
              <Card><CardContent className="py-8 text-center text-muted-foreground text-sm">
                Nenhum registro de sincronização ainda.
              </CardContent></Card>
            )}
            {logs.map((l) => (
              <Card key={l.id}>
                <CardContent className="pt-4 flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Badge variant={l.status === "sucesso" ? "default" : l.status === "erro" ? "destructive" : "secondary"}>
                        {l.status}
                      </Badge>
                      <span className="text-sm">{l.registros_processados} registros</span>
                    </div>
                    {l.mensagem && <p className="text-xs text-muted-foreground mt-1">{l.mensagem}</p>}
                  </div>
                  <p className="text-xs text-muted-foreground">{new Date(l.iniciado_em).toLocaleString("pt-BR")}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
