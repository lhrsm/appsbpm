import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { History, Undo2, FileText } from "lucide-react";
import { getEntidade } from "@/lib/importacao";
import { logAudit } from "@/lib/audit";
import { usePermissoes } from "@/hooks/usePermissoes";

type Batch = {
  id: string;
  entidade: string;
  origem: string;
  arquivo_nome: string;
  arquivo_tipo: string | null;
  arquivo_tamanho: number | null;
  status: string;
  total_recebidos: number;
  total_importados: number;
  total_duplicados: number;
  total_erros: number;
  total_ignorados: number;
  tempo_processamento_ms: number | null;
  pode_desfazer: boolean;
  criado_por_email: string | null;
  created_at: string;
  revertido_em: string | null;
};

const STATUS: Record<string, { label: string; className: string }> = {
  rascunho: { label: "Rascunho", className: "bg-muted text-muted-foreground" },
  validando: { label: "Validando", className: "bg-blue-100 text-blue-800" },
  validado: { label: "Validado", className: "bg-blue-100 text-blue-800" },
  importando: { label: "Importando", className: "bg-blue-100 text-blue-800" },
  concluido: { label: "Concluído", className: "bg-emerald-100 text-emerald-800" },
  erro: { label: "Com erro", className: "bg-destructive/15 text-destructive" },
  revertido: { label: "Revertido", className: "bg-amber-100 text-amber-800" },
  cancelado: { label: "Cancelado", className: "bg-secondary text-secondary-foreground" },
};

export default function HistoricoTab({ refreshKey = 0 }: { refreshKey?: number }) {
  const { pode } = usePermissoes();
  const [loading, setLoading] = useState(true);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [detalhe, setDetalhe] = useState<Batch | null>(null);
  const [erros, setErros] = useState<any[]>([]);
  const [desfazer, setDesfazer] = useState<Batch | null>(null);
  const [processando, setProcessando] = useState(false);

  const carregar = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("import_batches")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(100);
    setBatches((data as any) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    carregar();
  }, [refreshKey]);

  const abrirDetalhe = async (b: Batch) => {
    setDetalhe(b);
    const { data } = await supabase
      .from("import_errors")
      .select("*")
      .eq("batch_id", b.id)
      .order("linha")
      .limit(200);
    setErros(data ?? []);
  };

  const executarDesfazer = async () => {
    if (!desfazer) return;
    setProcessando(true);
    const ent = getEntidade(desfazer.entidade);
    const { data: rows } = await supabase
      .from("import_rows")
      .select("id, registro_id")
      .eq("batch_id", desfazer.id)
      .eq("acao", "inserido")
      .not("registro_id", "is", null);

    const ids = (rows ?? []).map((r: any) => r.registro_id).filter(Boolean);
    let removidos = 0;
    if (ids.length) {
      const { error } = await supabase.from(ent.tabela as any).delete().in("id", ids);
      if (error) {
        setProcessando(false);
        toast.error("Não foi possível desfazer", { description: error.message });
        return;
      }
      removidos = ids.length;
      await supabase.from("import_rows").update({ status: "revertido" }).eq("batch_id", desfazer.id).eq("acao", "inserido");
    }

    const { data: sess } = await supabase.auth.getSession();
    await supabase
      .from("import_batches")
      .update({
        status: "revertido",
        pode_desfazer: false,
        revertido_em: new Date().toISOString(),
        revertido_por: sess.session?.user.id ?? null,
      })
      .eq("id", desfazer.id);

    logAudit("undo_import", "import_batches", desfazer.id, { removidos });
    toast.success(`Importação desfeita — ${removidos} registro(s) removido(s)`);
    setProcessando(false);
    setDesfazer(null);
    carregar();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <History className="h-4 w-4 text-primary" aria-hidden="true" /> Histórico de importações
          </CardTitle>
          <CardDescription className="text-xs">
            Cada lote registra arquivo, usuário, data, origem, quantidades e tempo de processamento.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-2">
              {[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}
            </div>
          ) : batches.length === 0 ? (
            <p className="p-6 text-sm text-muted-foreground">Nenhuma importação registrada até o momento.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data</TableHead>
                    <TableHead>Arquivo</TableHead>
                    <TableHead>Entidade</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead className="text-right">Recebidos</TableHead>
                    <TableHead className="text-right">Importados</TableHead>
                    <TableHead className="text-right">Duplic.</TableHead>
                    <TableHead className="text-right">Erros</TableHead>
                    <TableHead>Situação</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batches.map((b) => {
                    const st = STATUS[b.status] ?? STATUS.rascunho;
                    return (
                      <TableRow key={b.id}>
                        <TableCell className="whitespace-nowrap text-xs">
                          {new Date(b.created_at).toLocaleString("pt-BR")}
                        </TableCell>
                        <TableCell className="max-w-[180px] truncate text-xs">{b.arquivo_nome}</TableCell>
                        <TableCell className="text-xs capitalize">{b.entidade}</TableCell>
                        <TableCell className="text-xs">{b.criado_por_email ?? "—"}</TableCell>
                        <TableCell className="text-right text-xs">{b.total_recebidos}</TableCell>
                        <TableCell className="text-right text-xs font-medium">{b.total_importados}</TableCell>
                        <TableCell className="text-right text-xs">{b.total_duplicados}</TableCell>
                        <TableCell className="text-right text-xs">{b.total_erros}</TableCell>
                        <TableCell><Badge variant="secondary" className={st.className}>{st.label}</Badge></TableCell>
                        <TableCell className="text-right whitespace-nowrap">
                          <Button size="sm" variant="ghost" onClick={() => abrirDetalhe(b)}>
                            <FileText className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">Ver relatório</span>
                          </Button>
                          {b.pode_desfazer && b.status === "concluido" && pode("integracoes", "excluir") && (
                            <Button size="sm" variant="ghost" onClick={() => setDesfazer(b)}>
                              <Undo2 className="h-4 w-4" aria-hidden="true" />
                              <span className="sr-only">Desfazer</span>
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!detalhe} onOpenChange={(o) => !o && setDetalhe(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Relatório da importação</DialogTitle>
            <DialogDescription className="break-all">{detalhe?.arquivo_nome}</DialogDescription>
          </DialogHeader>
          {detalhe && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                {[
                  ["Origem", detalhe.origem],
                  ["Entidade", detalhe.entidade],
                  ["Recebidos", detalhe.total_recebidos],
                  ["Importados", detalhe.total_importados],
                  ["Duplicidades", detalhe.total_duplicados],
                  ["Erros", detalhe.total_erros],
                  ["Ignorados", detalhe.total_ignorados],
                  ["Tempo", detalhe.tempo_processamento_ms != null ? `${(detalhe.tempo_processamento_ms / 1000).toFixed(1)}s` : "—"],
                  ["Usuário", detalhe.criado_por_email ?? "—"],
                ].map(([k, v]) => (
                  <div key={String(k)} className="rounded-md border p-2">
                    <dt className="text-muted-foreground">{k}</dt>
                    <dd className="font-medium">{String(v)}</dd>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-sm font-medium mb-2">Ocorrências ({erros.length})</h4>
                {erros.length === 0 ? (
                  <p className="text-xs text-muted-foreground">Nenhuma ocorrência registrada.</p>
                ) : (
                  <div className="max-h-64 overflow-y-auto rounded-md border divide-y">
                    {erros.map((e) => (
                      <div key={e.id} className="p-2 text-xs flex gap-2">
                        <Badge variant="outline" className="shrink-0">Linha {e.linha ?? "—"}</Badge>
                        <span className={e.severidade === "erro" ? "text-destructive" : "text-muted-foreground"}>
                          {e.campo ? `${e.campo}: ` : ""}{e.mensagem}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!desfazer} onOpenChange={(o) => !o && setDesfazer(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desfazer esta importação?</AlertDialogTitle>
            <AlertDialogDescription>
              Serão removidos apenas os registros criados por este lote ({desfazer?.total_importados} registro(s)).
              Registros atualizados por outras rotinas não são afetados e a ação é registrada na auditoria.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={executarDesfazer} disabled={processando}>Desfazer</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
