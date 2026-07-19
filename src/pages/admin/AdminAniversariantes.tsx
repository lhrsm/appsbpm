import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Cake, Send, Users, UserPlus, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { format, parseISO, differenceInYears, getMonth, getDate } from "date-fns";
import { ptBR } from "date-fns/locale";

type Pessoa = {
  id: string;
  nome: string;
  telefone?: string | null;
  data_nascimento: string;
  matricula?: string;
  tipo: "associado" | "dependente";
};

const DEFAULT_MSG = "Olá {{nome}}! 🎂 A SBPM deseja um feliz aniversário e um ano repleto de saúde e alegrias!";

const ZAPI_KEY = "sbpm_integracao_zapi";

export default function AdminAniversariantes() {
  const [pessoas, setPessoas] = useState<Pessoa[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<"hoje" | "semana" | "mes">("hoje");
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set());
  const [mensagem, setMensagem] = useState(DEFAULT_MSG);
  const [enviando, setEnviando] = useState(false);
  const [zapi, setZapi] = useState<{ instanceId: string; token: string; clientToken?: string } | null>(null);

  useEffect(() => {
    (async () => {
      const [a, d] = await Promise.all([
        supabase.from("associados").select("id, nome, telefone, data_nascimento, matricula").eq("ativo", true),
        supabase.from("dependentes").select("id, nome, data_nascimento, associado_id, ativo").eq("ativo", true),
      ]);
      const assocList: Pessoa[] = (a.data || []).map((x: any) => ({ ...x, tipo: "associado" as const }));
      const depIds = (d.data || []).map((x: any) => x.associado_id);
      const { data: assocsForDeps } = await supabase.from("associados").select("id, telefone").in("id", depIds.length ? depIds : ["00000000-0000-0000-0000-000000000000"]);
      const phoneMap = new Map((assocsForDeps || []).map((x: any) => [x.id, x.telefone]));
      const depList: Pessoa[] = (d.data || []).map((x: any) => ({
        id: x.id,
        nome: x.nome,
        data_nascimento: x.data_nascimento,
        telefone: phoneMap.get(x.associado_id) || null,
        tipo: "dependente" as const,
      }));
      setPessoas([...assocList, ...depList]);
      setLoading(false);
    })();

    try {
      const raw = localStorage.getItem(ZAPI_KEY);
      if (raw) setZapi(JSON.parse(raw));
    } catch {}
  }, []);

  const aniversariantes = useMemo(() => {
    const hoje = new Date();
    const filtro = pessoas.filter((p) => {
      if (!p.data_nascimento) return false;
      const dt = parseISO(p.data_nascimento);
      if (periodo === "hoje") {
        return getMonth(dt) === getMonth(hoje) && getDate(dt) === getDate(hoje);
      }
      if (periodo === "mes") {
        return getMonth(dt) === getMonth(hoje);
      }
      // semana: próximos 7 dias
      for (let i = 0; i < 7; i++) {
        const d = new Date(hoje);
        d.setDate(hoje.getDate() + i);
        if (getMonth(dt) === getMonth(d) && getDate(dt) === getDate(d)) return true;
      }
      return false;
    });
    return filtro.sort((a, b) => {
      const da = parseISO(a.data_nascimento);
      const db = parseISO(b.data_nascimento);
      const ka = getMonth(da) * 100 + getDate(da);
      const kb = getMonth(db) * 100 + getDate(db);
      return ka - kb;
    });
  }, [pessoas, periodo]);

  const toggle = (id: string) => {
    setSelecionados((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleTodos = () => {
    if (selecionados.size === aniversariantes.length) setSelecionados(new Set());
    else setSelecionados(new Set(aniversariantes.map((a) => a.id)));
  };

  const enviarWhatsApp = async () => {
    if (!zapi?.instanceId || !zapi?.token) {
      toast.error("Configure a Z-API em Admin → Integrações antes de disparar mensagens");
      return;
    }
    const alvos = aniversariantes.filter((a) => selecionados.has(a.id) && a.telefone);
    if (!alvos.length) {
      toast.error("Selecione ao menos um aniversariante com telefone cadastrado");
      return;
    }
    setEnviando(true);
    let ok = 0, fail = 0;
    for (const p of alvos) {
      const primeiroNome = p.nome.split(" ")[0];
      const msg = mensagem.split("{{nome}}").join(primeiroNome);
      try {
        const { data, error } = await supabase.functions.invoke("send-whatsapp", {
          body: { ...zapi, phone: p.telefone!, message: msg },
        });
        if (error || (data as any)?.ok === false) fail++;
        else ok++;
      } catch { fail++; }
    }
    setEnviando(false);
    toast[ok > 0 ? "success" : "error"](`Envio concluído: ${ok} sucesso, ${fail} falha(s)`);
    setSelecionados(new Set());
  };

  const semTelefone = aniversariantes.filter((a) => !a.telefone).length;

  return (
    <div className="max-w-6xl space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2"><Cake className="w-6 h-6 text-primary" />Aniversariantes</h1>
          <p className="text-sm text-muted-foreground">Envie mensagens de aniversário via WhatsApp (Z-API)</p>
        </div>
        <Button onClick={enviarWhatsApp} disabled={enviando || selecionados.size === 0}>
          {enviando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
          Enviar para {selecionados.size} selecionado(s)
        </Button>
      </div>

      {!zapi && (
        <Card className="border-amber-300 bg-amber-50 dark:bg-amber-950/20">
          <CardContent className="pt-6 text-sm">
            ⚠️ Z-API não configurada. Vá em <strong>Admin → Integrações</strong> e informe Instance ID, Token e Client-Token.
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Mensagem</CardTitle>
          <CardDescription>Use <code className="bg-muted px-1 rounded">{"{{nome}}"}</code> para inserir o primeiro nome do aniversariante</CardDescription>
        </CardHeader>
        <CardContent>
          <Textarea rows={3} value={mensagem} onChange={(e) => setMensagem(e.target.value)} />
        </CardContent>
      </Card>

      <Tabs value={periodo} onValueChange={(v) => { setPeriodo(v as any); setSelecionados(new Set()); }}>
        <TabsList>
          <TabsTrigger value="hoje">Hoje</TabsTrigger>
          <TabsTrigger value="semana">Próximos 7 dias</TabsTrigger>
          <TabsTrigger value="mes">Este mês</TabsTrigger>
        </TabsList>
        <TabsContent value={periodo} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                {aniversariantes.length} aniversariante(s)
                {semTelefone > 0 && <Badge variant="secondary">{semTelefone} sem telefone</Badge>}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : aniversariantes.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">Ninguém faz aniversário neste período.</div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox checked={selecionados.size === aniversariantes.length && aniversariantes.length > 0} onCheckedChange={toggleTodos} />
                      </TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Idade</TableHead>
                      <TableHead>Telefone</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {aniversariantes.map((p) => {
                      const dt = parseISO(p.data_nascimento);
                      const idade = differenceInYears(new Date(), dt);
                      return (
                        <TableRow key={p.id} className={!p.telefone ? "opacity-50" : ""}>
                          <TableCell>
                            <Checkbox checked={selecionados.has(p.id)} onCheckedChange={() => toggle(p.id)} disabled={!p.telefone} />
                          </TableCell>
                          <TableCell className="font-medium">{p.nome}</TableCell>
                          <TableCell>
                            {p.tipo === "associado" ? <Badge><Users className="w-3 h-3 mr-1" />Associado</Badge> : <Badge variant="secondary"><UserPlus className="w-3 h-3 mr-1" />Dependente</Badge>}
                          </TableCell>
                          <TableCell>{format(dt, "dd 'de' MMMM", { locale: ptBR })}</TableCell>
                          <TableCell>{idade + 1} anos</TableCell>
                          <TableCell className="font-mono text-xs">{p.telefone || <span className="text-muted-foreground">—</span>}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
