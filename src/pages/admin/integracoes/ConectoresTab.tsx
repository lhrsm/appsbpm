import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Plug, Settings2, ShieldQuestion } from "lucide-react";
import { logAudit } from "@/lib/audit";
import { usePermissoes } from "@/hooks/usePermissoes";

type Conector = {
  id: string;
  codigo: string;
  nome: string;
  sistema: string;
  descricao: string | null;
  tipo_fonte: string;
  status: string;
  entidades: string[];
  config: Record<string, any>;
  ultimo_erro: string | null;
  ultima_sincronizacao: string | null;
};

export const STATUS_META: Record<string, { label: string; className: string }> = {
  nao_configurado: { label: "Não configurado", className: "bg-muted text-muted-foreground" },
  em_configuracao: { label: "Em configuração", className: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200" },
  conectado: { label: "Conectado", className: "bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200" },
  sincronizando: { label: "Sincronizando", className: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200" },
  com_erro: { label: "Com erro", className: "bg-destructive/15 text-destructive" },
  pausado: { label: "Pausado", className: "bg-secondary text-secondary-foreground" },
};

const TIPOS_FONTE = [
  { value: "indefinido", label: "A definir" },
  { value: "api", label: "API" },
  { value: "banco", label: "Acesso ao banco" },
  { value: "planilha", label: "Planilha" },
  { value: "csv", label: "CSV" },
  { value: "arquivo", label: "Arquivo estruturado" },
  { value: "exportacao_manual", label: "Exportação manual" },
  { value: "intermediaria", label: "Integração intermediária" },
];

export default function ConectoresTab() {
  const { pode } = usePermissoes();
  const podeEditar = pode("integracoes", "editar");
  const [loading, setLoading] = useState(true);
  const [conectores, setConectores] = useState<Conector[]>([]);
  const [editando, setEditando] = useState<Conector | null>(null);
  const [form, setForm] = useState({ tipo_fonte: "indefinido", status: "nao_configurado", descricao: "", responsavel: "", endpoint: "", observacoes: "" });
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("integration_connectors")
      .select("*")
      .order("nome");
    if (error) toast.error("Não foi possível carregar os conectores");
    setConectores((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    carregar();
  }, []);

  const abrir = (c: Conector) => {
    setEditando(c);
    setForm({
      tipo_fonte: c.tipo_fonte,
      status: c.status,
      descricao: c.descricao ?? "",
      responsavel: c.config?.responsavel ?? "",
      endpoint: c.config?.endpoint ?? "",
      observacoes: c.config?.observacoes ?? "",
    });
  };

  const salvar = async () => {
    if (!editando) return;
    setSalvando(true);
    const { error } = await supabase
      .from("integration_connectors")
      .update({
        tipo_fonte: form.tipo_fonte as any,
        status: form.status as any,
        descricao: form.descricao || null,
        config: {
          ...(editando.config ?? {}),
          responsavel: form.responsavel || null,
          endpoint: form.endpoint || null,
          observacoes: form.observacoes || null,
        },
      })
      .eq("id", editando.id);
    setSalvando(false);
    if (error) {
      toast.error("Não foi possível salvar", { description: error.message });
      return;
    }
    await supabase.from("integration_runs").insert({
      connector_id: editando.id,
      tipo: "configuracao",
      status: "sucesso",
      mensagem: `Configuração atualizada (status: ${STATUS_META[form.status]?.label ?? form.status})`,
      finalizado_em: new Date().toISOString(),
      duracao_ms: 0,
    });
    logAudit("update", "integration_connectors", editando.id, { status: form.status, tipo_fonte: form.tipo_fonte });
    toast.success("Conector atualizado");
    setEditando(null);
    carregar();
  };

  return (
    <div className="space-y-4">
      <Card className="bg-muted/30">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <ShieldQuestion className="h-4 w-4 text-primary" aria-hidden="true" /> Arquitetura preparada, sem integração ativa
          </CardTitle>
          <CardDescription className="text-xs">
            Os conectores abaixo são estruturas abstratas. Nenhuma credencial ou dado fictício é utilizado — a forma
            definitiva de acesso (API, banco, planilha, CSV, arquivo, exportação ou camada intermediária) pode ser
            registrada aqui quando for definida pela instituição. Até lá, os dados podem entrar pela importação manual
            validada.
          </CardDescription>
        </CardHeader>
      </Card>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2">
          {[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-40 w-full" />)}
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {conectores.map((c) => {
            const meta = STATUS_META[c.status] ?? STATUS_META.nao_configurado;
            return (
              <Card key={c.id}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <div className="w-9 h-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                        <Plug className="h-4 w-4" aria-hidden="true" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{c.nome}</CardTitle>
                        <p className="text-xs text-muted-foreground capitalize">{c.sistema}</p>
                      </div>
                    </div>
                    <Badge className={meta.className} variant="secondary">{meta.label}</Badge>
                  </div>
                  <CardDescription className="pt-2 text-xs">{c.descricao}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex flex-wrap gap-1">
                    {c.entidades?.map((e) => (
                      <Badge key={e} variant="outline" className="text-[10px] font-normal">{e}</Badge>
                    ))}
                  </div>
                  <dl className="text-xs text-muted-foreground space-y-1">
                    <div className="flex justify-between gap-2">
                      <dt>Forma de acesso</dt>
                      <dd className="font-medium text-foreground">
                        {TIPOS_FONTE.find((t) => t.value === c.tipo_fonte)?.label ?? c.tipo_fonte}
                      </dd>
                    </div>
                    <div className="flex justify-between gap-2">
                      <dt>Última sincronização</dt>
                      <dd className="font-medium text-foreground">
                        {c.ultima_sincronizacao
                          ? new Date(c.ultima_sincronizacao).toLocaleString("pt-BR")
                          : "Aguardando integração"}
                      </dd>
                    </div>
                  </dl>
                  {c.ultimo_erro && (
                    <p className="text-xs text-destructive">Último erro: {c.ultimo_erro}</p>
                  )}
                  <Button size="sm" variant="outline" className="w-full" disabled={!podeEditar} onClick={() => abrir(c)}>
                    <Settings2 className="h-4 w-4 mr-2" aria-hidden="true" /> Configurar
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <Dialog open={!!editando} onOpenChange={(o) => !o && setEditando(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editando?.nome}</DialogTitle>
            <DialogDescription>
              Registre a forma de acesso e a situação atual. Credenciais reais devem ser armazenadas como segredos no
              backend, nunca neste formulário.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Forma de acesso</Label>
                <Select value={form.tipo_fonte} onValueChange={(v) => setForm({ ...form, tipo_fonte: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIPOS_FONTE.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Situação</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_META).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Responsável técnico</Label>
              <Input value={form.responsavel} onChange={(e) => setForm({ ...form, responsavel: e.target.value })} placeholder="Nome / setor" />
            </div>
            <div>
              <Label className="text-xs">Endpoint ou origem (sem credenciais)</Label>
              <Input value={form.endpoint} onChange={(e) => setForm({ ...form, endpoint: e.target.value })} placeholder="https://... ou descrição da origem" />
            </div>
            <div>
              <Label className="text-xs">Descrição</Label>
              <Textarea rows={2} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Observações / especificações pendentes</Label>
              <Textarea rows={3} value={form.observacoes} onChange={(e) => setForm({ ...form, observacoes: e.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditando(null)}>Cancelar</Button>
            <Button onClick={salvar} disabled={salvando}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
