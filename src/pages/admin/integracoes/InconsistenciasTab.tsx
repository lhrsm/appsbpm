import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { AlertTriangle, CheckCircle2, EyeOff, GitMerge, RefreshCw, ScrollText, Search } from "lucide-react";
import { logAudit } from "@/lib/audit";
import { usePermissoes } from "@/hooks/usePermissoes";

type Conflito = {
  id: string;
  entidade: string;
  tipo: string;
  severidade: string;
  chave: string | null;
  campo: string;
  valor_atual: string | null;
  valor_novo: string | null;
  valor_escolhido: string | null;
  status: string;
  origem_sistema: string | null;
  registro_id_a: string | null;
  registro_id_b: string | null;
  detalhes: any;
  observacao: string | null;
  ignorar_ate: string | null;
  created_at: string;
  resolvido_em: string | null;
};

type Decisao = {
  id: string;
  acao: string;
  valor_escolhido: string | null;
  observacao: string | null;
  ator_email: string | null;
  created_at: string;
};

export const TIPOS: Record<string, string> = {
  cpf_duplicado: "CPF duplicado",
  matricula_duplicada: "Matrícula duplicada",
  associado_sem_vinculo: "Associado sem vínculo",
  dependente_sem_titular: "Dependente sem titular",
  cadastro_incompleto: "Cadastro incompleto",
  divergencia_nome: "Divergência de nome",
  divergencia_situacao: "Divergência de situação",
  divergencia_data_nascimento: "Divergência de data de nascimento",
  registro_unico_sistema: "Registro existente apenas em um sistema",
  atualizacao_multiplas_fontes: "Registro atualizado em fontes diferentes",
  falha_mapeamento: "Falha no mapeamento",
  divergencia_campo: "Divergência de campo",
};

const STATUS: Record<string, { label: string; className: string }> = {
  aberto: { label: "Aberto", className: "bg-destructive/15 text-destructive" },
  ignorado: { label: "Ignorado temporariamente", className: "bg-muted text-muted-foreground" },
  revisao_solicitada: { label: "Revisão solicitada", className: "bg-amber-100 text-amber-800" },
  mesclado: { label: "Mesclado", className: "bg-blue-100 text-blue-800" },
  resolvido: { label: "Resolvido", className: "bg-emerald-100 text-emerald-800" },
};

const SEVERIDADE: Record<string, string> = {
  alta: "bg-destructive/15 text-destructive",
  media: "bg-amber-100 text-amber-800",
  baixa: "bg-muted text-muted-foreground",
};

const ACOES_LABEL: Record<string, string> = {
  comparado: "Comparação registrada",
  escolha_valor: "Valor correto escolhido",
  mesclagem: "Informações mescladas",
  ignorado: "Ignorado temporariamente",
  revisao_solicitada: "Revisão solicitada",
  observacao: "Observação registrada",
  resolvido: "Marcado como resolvido",
};

/** Campos que podem ser gravados no cadastro oficial após a conciliação. */
const CAMPOS_APLICAVEIS: Record<string, string[]> = {
  associado: ["nome", "cpf", "matricula", "email", "telefone", "endereco", "cidade", "cep", "patente", "data_nascimento"],
  dependente: ["nome", "cpf", "email", "telefone", "endereco", "data_nascimento", "status"],
};

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";

export default function InconsistenciasTab() {
  const { pode } = usePermissoes();
  const podeEditar = pode("integracoes", "editar");

  const [loading, setLoading] = useState(true);
  const [rodando, setRodando] = useState(false);
  const [conflitos, setConflitos] = useState<Conflito[]>([]);
  const [busca, setBusca] = useState("");
  const [fTipo, setFTipo] = useState("todos");
  const [fStatus, setFStatus] = useState("aberto");

  const [detalhe, setDetalhe] = useState<Conflito | null>(null);
  const [decisoes, setDecisoes] = useState<Decisao[]>([]);
  const [escolha, setEscolha] = useState<"atual" | "novo" | "manual">("atual");
  const [valorManual, setValorManual] = useState("");
  const [observacao, setObservacao] = useState("");
  const [salvando, setSalvando] = useState(false);

  const carregar = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("data_conflicts")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (error) toast.error("Não foi possível carregar as inconsistências.");
    setConflitos((data as Conflito[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    void carregar();
  }, []);

  const executarVerificacao = async () => {
    setRodando(true);
    const { data, error } = await supabase.rpc("detectar_inconsistencias");
    setRodando(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    const total = ((data as any[]) ?? []).reduce((s, r) => s + (r.criadas ?? 0), 0);
    toast.success(total > 0 ? `${total} nova(s) inconsistência(s) identificada(s).` : "Nenhuma nova inconsistência encontrada.");
    void logAudit("verificacao_inconsistencias", "data_conflicts", null, data);
    void carregar();
  };

  const abrirDetalhe = async (c: Conflito) => {
    setDetalhe(c);
    setEscolha("atual");
    setValorManual(c.valor_escolhido ?? "");
    setObservacao("");
    const { data } = await supabase
      .from("data_conflict_decisoes")
      .select("id,acao,valor_escolhido,observacao,ator_email,created_at")
      .eq("conflict_id", c.id)
      .order("created_at", { ascending: false });
    setDecisoes((data as Decisao[]) ?? []);
    if (podeEditar) void registrarDecisao(c, "comparado", null, null, false);
  };

  const registrarDecisao = async (
    c: Conflito,
    acao: string,
    valor: string | null,
    obs: string | null,
    notificar = true,
  ) => {
    const { data: sess } = await supabase.auth.getSession();
    const user = sess.session?.user;
    if (!user) return false;
    const { error } = await supabase.from("data_conflict_decisoes").insert({
      conflict_id: c.id,
      acao,
      valor_escolhido: valor,
      observacao: obs,
      ator_user_id: user.id,
      ator_email: user.email ?? null,
    });
    if (error) {
      if (notificar) toast.error("Não foi possível registrar a decisão.");
      return false;
    }
    void logAudit(`inconsistencia_${acao}`, "data_conflicts", c.id, {
      tipo: c.tipo,
      entidade: c.entidade,
      campo: c.campo,
      valor_escolhido: valor,
      observacao: obs,
    });
    return true;
  };

  const atualizarConflito = async (c: Conflito, patch: Record<string, any>) => {
    const { data: sess } = await supabase.auth.getSession();
    const { error } = await supabase
      .from("data_conflicts")
      .update({ ...patch, resolvido_por: sess.session?.user.id ?? null })
      .eq("id", c.id);
    if (error) {
      toast.error(error.message);
      return false;
    }
    return true;
  };

  const valorSelecionado = () => {
    if (!detalhe) return null;
    if (escolha === "atual") return detalhe.valor_atual;
    if (escolha === "novo") return detalhe.valor_novo;
    return valorManual.trim() || null;
  };

  const aplicarValor = async (mesclar: boolean) => {
    if (!detalhe) return;
    const valor = valorSelecionado();
    setSalvando(true);

    // Não substitui silenciosamente: só grava no cadastro oficial em campos permitidos
    // e sempre deixando o rastro da decisão no histórico de auditoria.
    const tabela = detalhe.entidade === "dependente" ? "dependentes" : "associados";
    const permitidos = CAMPOS_APLICAVEIS[detalhe.entidade] ?? [];
    let aplicado = false;
    if (detalhe.registro_id_a && permitidos.includes(detalhe.campo) && valor) {
      const { error } = await supabase
        .from(tabela as any)
        .update({ [detalhe.campo]: valor })
        .eq("id", detalhe.registro_id_a);
      if (error) {
        setSalvando(false);
        toast.error(`Não foi possível gravar o cadastro: ${error.message}`);
        return;
      }
      aplicado = true;
      await supabase
        .from("registro_identidades")
        .update({ alterado_manualmente: true, alterado_manualmente_em: new Date().toISOString(), validado: true })
        .eq("entidade", detalhe.entidade)
        .eq("registro_id", detalhe.registro_id_a);
    }

    const ok = await registrarDecisao(detalhe, mesclar ? "mesclagem" : "escolha_valor", valor, observacao || null);
    if (ok) {
      await atualizarConflito(detalhe, {
        status: mesclar ? "mesclado" : "resolvido",
        valor_escolhido: valor,
        observacao: observacao || detalhe.observacao,
        resolvido_em: new Date().toISOString(),
      });
      toast.success(aplicado ? "Dado conciliado e gravado no cadastro." : "Decisão registrada na auditoria.");
      setDetalhe(null);
      void carregar();
    }
    setSalvando(false);
  };

  const acaoSimples = async (acao: "ignorado" | "revisao_solicitada" | "observacao") => {
    if (!detalhe) return;
    setSalvando(true);
    const ok = await registrarDecisao(detalhe, acao, null, observacao || null);
    if (ok) {
      const patch: Record<string, any> =
        acao === "observacao"
          ? { observacao: observacao || detalhe.observacao }
          : {
              status: acao,
              observacao: observacao || detalhe.observacao,
              ignorar_ate:
                acao === "ignorado" ? new Date(Date.now() + 30 * 864e5).toISOString() : detalhe.ignorar_ate,
            };
      await atualizarConflito(detalhe, patch);
      toast.success(ACOES_LABEL[acao]);
      setDetalhe(null);
      void carregar();
    }
    setSalvando(false);
  };

  const filtrados = useMemo(() => {
    const q = busca.trim().toLowerCase();
    return conflitos.filter((c) => {
      if (fStatus !== "todos" && c.status !== fStatus) return false;
      if (fTipo !== "todos" && c.tipo !== fTipo) return false;
      if (!q) return true;
      return [c.chave, c.campo, c.valor_atual, c.valor_novo, TIPOS[c.tipo]]
        .filter(Boolean)
        .some((v) => String(v).toLowerCase().includes(q));
    });
  }, [conflitos, busca, fTipo, fStatus]);

  const abertos = conflitos.filter((c) => c.status === "aberto").length;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" /> Central de inconsistências
            </CardTitle>
            <CardDescription>
              Conciliação dos dados recebidos dos sistemas institucionais. Nenhum dado já validado é substituído
              silenciosamente — toda decisão fica registrada na auditoria.
            </CardDescription>
          </div>
          <Button onClick={executarVerificacao} disabled={rodando} size="sm">
            <RefreshCw className={`mr-2 h-4 w-4 ${rodando ? "animate-spin" : ""}`} aria-hidden="true" />
            Executar verificação
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="bg-destructive/15 text-destructive">{abertos} em aberto</Badge>
            <Badge variant="outline">{conflitos.length} no total</Badge>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" aria-hidden="true" />
              <Input
                className="pl-8"
                placeholder="Buscar por chave, campo ou valor"
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                aria-label="Buscar inconsistências"
              />
            </div>
            <Select value={fTipo} onValueChange={setFTipo}>
              <SelectTrigger aria-label="Filtrar por tipo"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos os tipos</SelectItem>
                {Object.entries(TIPOS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={fStatus} onValueChange={setFStatus}>
              <SelectTrigger aria-label="Filtrar por situação"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todas as situações</SelectItem>
                {Object.entries(STATUS).map(([k, v]) => (
                  <SelectItem key={k} value={k}>{v.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : filtrados.length === 0 ? (
            <p className="rounded-md border border-dashed p-6 text-center text-sm text-muted-foreground">
              Nenhuma inconsistência para os filtros selecionados.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Entidade</TableHead>
                    <TableHead>Chave</TableHead>
                    <TableHead>Campo</TableHead>
                    <TableHead>Gravidade</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead>Detectada em</TableHead>
                    <TableHead className="text-right">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filtrados.map((c) => (
                    <TableRow key={c.id}>
                      <TableCell className="font-medium">{TIPOS[c.tipo] ?? c.tipo}</TableCell>
                      <TableCell className="capitalize">{c.entidade}</TableCell>
                      <TableCell className="max-w-[180px] truncate">{c.chave ?? "—"}</TableCell>
                      <TableCell>{c.campo}</TableCell>
                      <TableCell>
                        <Badge className={SEVERIDADE[c.severidade] ?? SEVERIDADE.media}>{c.severidade}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={(STATUS[c.status] ?? STATUS.aberto).className}>
                          {(STATUS[c.status] ?? STATUS.aberto).label}
                        </Badge>
                      </TableCell>
                      <TableCell className="whitespace-nowrap text-xs text-muted-foreground">
                        {fmt(c.created_at)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" variant="outline" onClick={() => abrirDetalhe(c)}>
                          Comparar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!detalhe} onOpenChange={(o) => !o && setDetalhe(null)}>
        <DialogContent className="max-h-[90vh] max-w-2xl overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{detalhe ? TIPOS[detalhe.tipo] ?? detalhe.tipo : ""}</DialogTitle>
            <DialogDescription>
              Compare os registros, escolha o dado correto ou registre uma observação. Todas as decisões entram no
              histórico de auditoria.
            </DialogDescription>
          </DialogHeader>

          {detalhe && (
            <div className="space-y-4">
              <div className="grid gap-2 rounded-md border p-3 text-sm sm:grid-cols-2">
                <div><span className="text-muted-foreground">Entidade:</span> <span className="capitalize">{detalhe.entidade}</span></div>
                <div><span className="text-muted-foreground">Campo:</span> {detalhe.campo}</div>
                <div><span className="text-muted-foreground">Chave institucional:</span> {detalhe.chave ?? "—"}</div>
                <div><span className="text-muted-foreground">Sistema de origem:</span> {detalhe.origem_sistema ?? "Base institucional"}</div>
                {detalhe.detalhes && Object.keys(detalhe.detalhes).length > 0 && (
                  <div className="sm:col-span-2">
                    <span className="text-muted-foreground">Detalhes:</span>{" "}
                    <code className="text-xs">{JSON.stringify(detalhe.detalhes)}</code>
                  </div>
                )}
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setEscolha("atual")}
                  className={`rounded-md border p-3 text-left text-sm transition ${escolha === "atual" ? "border-primary ring-1 ring-primary" : ""}`}
                >
                  <p className="text-xs font-medium text-muted-foreground">Valor atual (base institucional)</p>
                  <p className="break-words font-medium">{detalhe.valor_atual ?? "—"}</p>
                </button>
                <button
                  type="button"
                  onClick={() => setEscolha("novo")}
                  className={`rounded-md border p-3 text-left text-sm transition ${escolha === "novo" ? "border-primary ring-1 ring-primary" : ""}`}
                >
                  <p className="text-xs font-medium text-muted-foreground">Valor recebido do sistema de origem</p>
                  <p className="break-words font-medium">{detalhe.valor_novo ?? "—"}</p>
                </button>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="valor-manual">Ou informe o valor correto manualmente</Label>
                <Input
                  id="valor-manual"
                  value={valorManual}
                  onFocus={() => setEscolha("manual")}
                  onChange={(e) => { setEscolha("manual"); setValorManual(e.target.value); }}
                  placeholder="Valor consolidado"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="obs">Observação</Label>
                <Textarea
                  id="obs"
                  value={observacao}
                  onChange={(e) => setObservacao(e.target.value)}
                  placeholder="Justificativa da decisão, fonte consultada, etc."
                  rows={3}
                />
              </div>

              {decisoes.length > 0 && (
                <div className="space-y-2">
                  <p className="flex items-center gap-2 text-sm font-medium">
                    <ScrollText className="h-4 w-4" aria-hidden="true" /> Histórico de decisões
                  </p>
                  <ul className="max-h-48 space-y-1.5 overflow-y-auto rounded-md border p-2 text-xs">
                    {decisoes.map((d) => (
                      <li key={d.id} className="border-b pb-1.5 last:border-0">
                        <span className="font-medium">{ACOES_LABEL[d.acao] ?? d.acao}</span>{" "}
                        <span className="text-muted-foreground">— {d.ator_email ?? "sistema"} em {fmt(d.created_at)}</span>
                        {d.valor_escolhido && <div>Valor: {d.valor_escolhido}</div>}
                        {d.observacao && <div className="text-muted-foreground">{d.observacao}</div>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <DialogFooter className="flex-wrap gap-2">
            <Button variant="outline" size="sm" disabled={!podeEditar || salvando} onClick={() => acaoSimples("observacao")}>
              Registrar observação
            </Button>
            <Button variant="outline" size="sm" disabled={!podeEditar || salvando} onClick={() => acaoSimples("ignorado")}>
              <EyeOff className="mr-2 h-4 w-4" aria-hidden="true" /> Ignorar por 30 dias
            </Button>
            <Button variant="outline" size="sm" disabled={!podeEditar || salvando} onClick={() => acaoSimples("revisao_solicitada")}>
              Solicitar revisão
            </Button>
            <Button variant="secondary" size="sm" disabled={!podeEditar || salvando} onClick={() => aplicarValor(true)}>
              <GitMerge className="mr-2 h-4 w-4" aria-hidden="true" /> Mesclar
            </Button>
            <Button size="sm" disabled={!podeEditar || salvando} onClick={() => aplicarValor(false)}>
              <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" /> Confirmar dado correto
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
