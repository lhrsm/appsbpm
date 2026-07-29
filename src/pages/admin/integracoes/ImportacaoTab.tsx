import { useMemo, useRef, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { Upload, ArrowRight, ArrowLeft, CheckCircle2, AlertTriangle, Copy, Database, RotateCcw } from "lucide-react";
import {
  ENTIDADES, autoMapear, getEntidade, lerArquivo, marcarDuplicidades, processarLinha,
  type ArquivoLido, type LinhaProcessada,
} from "@/lib/importacao";
import { logAudit } from "@/lib/audit";
import { usePermissoes } from "@/hooks/usePermissoes";

const PASSOS = ["Arquivo", "Mapeamento", "Validação", "Confirmação", "Relatório"];

type Relatorio = {
  batchId: string;
  recebidos: number;
  importados: number;
  duplicados: number;
  erros: number;
  ignorados: number;
  tempoMs: number;
};

export default function ImportacaoTab({ onConcluir }: { onConcluir?: () => void }) {
  const { pode } = usePermissoes();
  const podeImportar = pode("integracoes", "criar");
  const inputRef = useRef<HTMLInputElement>(null);

  const [passo, setPasso] = useState(0);
  const [entidadeId, setEntidadeId] = useState("associados");
  const [file, setFile] = useState<File | null>(null);
  const [arquivo, setArquivo] = useState<ArquivoLido | null>(null);
  const [mapeamento, setMapeamento] = useState<Record<string, string>>({});
  const [linhas, setLinhas] = useState<LinhaProcessada[]>([]);
  const [ignorarDuplicados, setIgnorarDuplicados] = useState(true);
  const [processando, setProcessando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [relatorio, setRelatorio] = useState<Relatorio | null>(null);

  const entidade = useMemo(() => getEntidade(entidadeId), [entidadeId]);
  const resumo = useMemo(() => ({
    total: linhas.length,
    validos: linhas.filter((l) => l.status === "valido").length,
    duplicados: linhas.filter((l) => l.status === "duplicado").length,
    erros: linhas.filter((l) => l.status === "erro").length,
  }), [linhas]);

  const reiniciar = () => {
    setPasso(0); setFile(null); setArquivo(null); setMapeamento({});
    setLinhas([]); setRelatorio(null); setProgresso(0);
    if (inputRef.current) inputRef.current.value = "";
  };

  /** Passo 1: upload + identificação de colunas */
  const selecionarArquivo = async (f: File) => {
    try {
      const lido = await lerArquivo(f);
      if (!lido.linhas.length) {
        toast.error("O arquivo não contém linhas de dados");
        return;
      }
      setFile(f);
      setArquivo(lido);
      setMapeamento(autoMapear(lido.colunas, entidade));
      setPasso(1);
    } catch (e: any) {
      toast.error("Não foi possível ler o arquivo", { description: e?.message });
    }
  };

  /** Passo 3: validação + duplicidades (nada é gravado nas tabelas oficiais) */
  const validar = async () => {
    if (!arquivo) return;
    const faltando = entidade.campos.filter((c) => c.obrigatorio && !mapeamento[c.id]);
    if (faltando.length) {
      toast.error(`Mapeie os campos obrigatórios: ${faltando.map((f) => f.label).join(", ")}`);
      return;
    }
    setProcessando(true);
    const processadas = arquivo.linhas.map((l, i) => processarLinha(entidade, mapeamento, l, i + 2));

    const chaves = Array.from(new Set(processadas.map((l) => l.chave).filter(Boolean) as string[]));
    const existentes = new Set<string>();
    for (let i = 0; i < chaves.length; i += 300) {
      const fatia = chaves.slice(i, i + 300);
      const { data } = await supabase
        .from(entidade.tabela as any)
        .select(entidade.chave)
        .in(entidade.chave, fatia);
      (data ?? []).forEach((r: any) => existentes.add(String(r[entidade.chave]).trim().toLowerCase()));
    }
    marcarDuplicidades(processadas, existentes);
    setLinhas([...processadas]);
    setProcessando(false);
    setPasso(2);
  };

  /** Passo 4/5: gravação com staging + relatório */
  const executar = async () => {
    if (!file || !arquivo) return;
    setProcessando(true);
    setProgresso(5);
    const inicio = Date.now();

    const { data: sess } = await supabase.auth.getSession();
    const user = sess.session?.user;

    const { data: batch, error: eBatch } = await supabase
      .from("import_batches")
      .insert({
        entidade: entidade.id,
        origem: "upload_manual",
        arquivo_nome: file.name,
        arquivo_tipo: file.type || file.name.split(".").pop(),
        arquivo_tamanho: file.size,
        status: "importando",
        mapeamento,
        total_recebidos: linhas.length,
        total_validos: resumo.validos,
        criado_por: user?.id ?? null,
        criado_por_email: user?.email ?? null,
      })
      .select("id")
      .single();

    if (eBatch || !batch) {
      setProcessando(false);
      toast.error("Não foi possível iniciar a importação", { description: eBatch?.message });
      return;
    }
    const batchId = batch.id as string;

    // Staging: todas as linhas são gravadas antes de qualquer escrita oficial
    const stagingPayload = linhas.map((l) => ({
      batch_id: batchId,
      linha: l.linha,
      chave: l.chave,
      dados_originais: l.originais,
      dados_normalizados: l.normalizados,
      status: l.status,
      mensagem: l.erros.map((e) => e.mensagem).join(" | ") || null,
    }));
    const stagingIds: Record<number, string> = {};
    for (let i = 0; i < stagingPayload.length; i += 200) {
      const { data } = await supabase
        .from("import_rows")
        .insert(stagingPayload.slice(i, i + 200))
        .select("id, linha");
      (data ?? []).forEach((r: any) => (stagingIds[r.linha] = r.id));
    }
    setProgresso(30);

    // Erros/alertas detalhados
    const errosPayload = linhas.flatMap((l) =>
      l.erros.map((e) => ({
        batch_id: batchId,
        row_id: stagingIds[l.linha] ?? null,
        linha: l.linha,
        campo: e.campo ?? null,
        codigo: e.severidade === "erro" ? "validacao" : "alerta",
        severidade: e.severidade,
        mensagem: e.mensagem,
      })),
    );
    for (let i = 0; i < errosPayload.length; i += 200) {
      await supabase.from("import_errors").insert(errosPayload.slice(i, i + 200));
    }
    setProgresso(45);

    // Seleção do que será gravado
    const aGravar = linhas.filter((l) => l.status === "valido" || (l.status === "duplicado" && !ignorarDuplicados));
    let importados = 0;
    let ignorados = linhas.length - aGravar.length;

    // Resolução de vínculo para dependentes
    let mapaTitulares: Record<string, string> = {};
    if (entidade.id === "dependentes" && aGravar.length) {
      const mats = Array.from(new Set(aGravar.map((l) => String(l.normalizados.associado_matricula))));
      for (let i = 0; i < mats.length; i += 300) {
        const { data } = await supabase.from("associados").select("id, matricula").in("matricula", mats.slice(i, i + 300));
        (data ?? []).forEach((a: any) => (mapaTitulares[String(a.matricula)] = a.id));
      }
    }

    for (let i = 0; i < aGravar.length; i += 100) {
      const bloco = aGravar.slice(i, i + 100);
      const registros: any[] = [];
      const linhasBloco: LinhaProcessada[] = [];

      for (const l of bloco) {
        const registro: any = { ...l.normalizados };
        if (entidade.id === "dependentes") {
          const titular = mapaTitulares[String(registro.associado_matricula)];
          delete registro.associado_matricula;
          if (!titular) {
            ignorados++;
            await supabase.from("import_errors").insert({
              batch_id: batchId,
              row_id: stagingIds[l.linha] ?? null,
              linha: l.linha,
              codigo: "vinculo",
              severidade: "erro",
              mensagem: "Titular não encontrado para a matrícula informada",
            });
            if (stagingIds[l.linha]) {
              await supabase.from("import_rows").update({ status: "erro" }).eq("id", stagingIds[l.linha]);
            }
            continue;
          }
          registro.associado_id = titular;
        }
        registros.push(registro);
        linhasBloco.push(l);
      }

      if (!registros.length) continue;
      const { data: inseridos, error } = await supabase
        .from(entidade.tabela as any)
        .insert(registros)
        .select("id");

      if (error) {
        for (const l of linhasBloco) {
          ignorados++;
          await supabase.from("import_errors").insert({
            batch_id: batchId,
            row_id: stagingIds[l.linha] ?? null,
            linha: l.linha,
            codigo: "gravacao",
            severidade: "erro",
            mensagem: error.message,
          });
          if (stagingIds[l.linha]) {
            await supabase.from("import_rows").update({ status: "erro" }).eq("id", stagingIds[l.linha]);
          }
        }
      } else {
        importados += inseridos?.length ?? 0;
        for (let k = 0; k < linhasBloco.length; k++) {
          const l = linhasBloco[k];
          if (!stagingIds[l.linha]) continue;
          await supabase
            .from("import_rows")
            .update({ status: "importado", acao: "inserido", registro_id: (inseridos as any)?.[k]?.id ?? null })
            .eq("id", stagingIds[l.linha]);
        }
      }
      setProgresso(45 + Math.round(((i + bloco.length) / aGravar.length) * 45));
    }

    const tempoMs = Date.now() - inicio;
    await supabase
      .from("import_batches")
      .update({
        status: importados > 0 ? "concluido" : "erro",
        total_importados: importados,
        total_duplicados: resumo.duplicados,
        total_erros: resumo.erros,
        total_ignorados: ignorados,
        tempo_processamento_ms: tempoMs,
        pode_desfazer: importados > 0,
      })
      .eq("id", batchId);

    logAudit("import", entidade.tabela, batchId, { arquivo: file.name, importados, recebidos: linhas.length });
    setProgresso(100);
    setRelatorio({
      batchId,
      recebidos: linhas.length,
      importados,
      duplicados: resumo.duplicados,
      erros: resumo.erros,
      ignorados,
      tempoMs,
    });
    setProcessando(false);
    setPasso(4);
    onConcluir?.();
    toast.success(`Importação concluída — ${importados} registro(s)`);
  };

  if (!podeImportar) {
    return (
      <Card>
        <CardContent className="p-6 text-sm text-muted-foreground">
          Seu perfil não possui permissão para importar dados no módulo Integrações.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {PASSOS.map((p, i) => (
          <div key={p} className="flex items-center gap-2">
            <Badge variant={i === passo ? "default" : i < passo ? "secondary" : "outline"} className="text-[11px]">
              {i + 1}. {p}
            </Badge>
            {i < PASSOS.length - 1 && <ArrowRight className="h-3 w-3 text-muted-foreground" aria-hidden="true" />}
          </div>
        ))}
      </div>

      {/* PASSO 1 */}
      {passo === 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Enviar arquivo</CardTitle>
            <CardDescription className="text-xs">
              Formatos aceitos: CSV, XLSX e JSON. Nada é gravado nas tabelas oficiais nesta etapa.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="max-w-sm">
              <Label className="text-xs">Entidade destino</Label>
              <Select value={entidadeId} onValueChange={setEntidadeId}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ENTIDADES.map((e) => <SelectItem key={e.id} value={e.id}>{e.label}</SelectItem>)}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">{entidade.descricao}</p>
            </div>
            <label className="flex flex-col items-center justify-center gap-2 border-2 border-dashed rounded-lg p-8 cursor-pointer hover:bg-muted/40 transition-colors">
              <Upload className="h-6 w-6 text-muted-foreground" aria-hidden="true" />
              <span className="text-sm font-medium">Clique para selecionar o arquivo</span>
              <span className="text-xs text-muted-foreground">.csv, .xlsx, .xls ou .json</span>
              <input
                ref={inputRef}
                type="file"
                accept=".csv,.xlsx,.xls,.json,text/csv,application/json"
                className="sr-only"
                onChange={(e) => e.target.files?.[0] && selecionarArquivo(e.target.files[0])}
              />
            </label>
          </CardContent>
        </Card>
      )}

      {/* PASSO 2 */}
      {passo === 1 && arquivo && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Mapeamento de colunas</CardTitle>
            <CardDescription className="text-xs">
              {arquivo.linhas.length} linha(s) e {arquivo.colunas.length} coluna(s) identificadas em{" "}
              <strong className="break-all">{file?.name}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              {entidade.campos.map((campo) => (
                <div key={campo.id}>
                  <Label className="text-xs">
                    {campo.label}
                    {campo.obrigatorio && <span className="text-destructive"> *</span>}
                  </Label>
                  <Select
                    value={mapeamento[campo.id] ?? "__none__"}
                    onValueChange={(v) => {
                      const next = { ...mapeamento };
                      if (v === "__none__") delete next[campo.id];
                      else next[campo.id] = v;
                      setMapeamento(next);
                    }}
                  >
                    <SelectTrigger><SelectValue placeholder="Não importar" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__none__">Não importar</SelectItem>
                      {arquivo.colunas.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={reiniciar}>
                <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" /> Trocar arquivo
              </Button>
              <Button onClick={validar} disabled={processando}>
                Validar dados <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PASSO 3 */}
      {passo === 2 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Prévia e validação</CardTitle>
            <CardDescription className="text-xs">
              Confira os registros antes da gravação. Linhas com erro nunca são importadas.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {[
                { label: "Recebidos", valor: resumo.total, icon: Database },
                { label: "Válidos", valor: resumo.validos, icon: CheckCircle2 },
                { label: "Duplicidades", valor: resumo.duplicados, icon: Copy },
                { label: "Com erro", valor: resumo.erros, icon: AlertTriangle },
              ].map((c) => (
                <div key={c.label} className="rounded-md border p-3">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <c.icon className="h-3 w-3" aria-hidden="true" /> {c.label}
                  </div>
                  <p className="text-lg font-semibold">{c.valor}</p>
                </div>
              ))}
            </div>

            <div className="overflow-x-auto rounded-md border max-h-80 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-16">Linha</TableHead>
                    <TableHead className="w-28">Situação</TableHead>
                    {entidade.campos.filter((c) => mapeamento[c.id]).slice(0, 5).map((c) => (
                      <TableHead key={c.id}>{c.label}</TableHead>
                    ))}
                    <TableHead>Ocorrências</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {linhas.slice(0, 200).map((l) => (
                    <TableRow key={l.linha}>
                      <TableCell className="text-xs">{l.linha}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={
                            l.status === "valido"
                              ? "bg-emerald-100 text-emerald-800"
                              : l.status === "duplicado"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-destructive/15 text-destructive"
                          }
                        >
                          {l.status === "valido" ? "Válido" : l.status === "duplicado" ? "Duplicado" : "Erro"}
                        </Badge>
                      </TableCell>
                      {entidade.campos.filter((c) => mapeamento[c.id]).slice(0, 5).map((c) => (
                        <TableCell key={c.id} className="text-xs max-w-[160px] truncate">
                          {String(l.normalizados[c.id] ?? "—")}
                        </TableCell>
                      ))}
                      <TableCell className="text-xs text-muted-foreground max-w-[240px]">
                        {l.erros.map((e) => e.mensagem).join(" | ") || "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {linhas.length > 200 && (
              <p className="text-xs text-muted-foreground">Exibindo as 200 primeiras linhas de {linhas.length}.</p>
            )}

            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setPasso(1)}>
                <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" /> Ajustar mapeamento
              </Button>
              <Button onClick={() => setPasso(3)} disabled={resumo.validos === 0 && resumo.duplicados === 0}>
                Continuar <ArrowRight className="h-4 w-4 ml-2" aria-hidden="true" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PASSO 4 */}
      {passo === 3 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Confirmação</CardTitle>
            <CardDescription className="text-xs">
              Revise antes de gravar em <strong>{entidade.label}</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="text-sm space-y-1">
              <li>Arquivo: <strong className="break-all">{file?.name}</strong></li>
              <li>Registros recebidos: <strong>{resumo.total}</strong></li>
              <li>Serão gravados: <strong>{resumo.validos + (ignorarDuplicados ? 0 : resumo.duplicados)}</strong></li>
              <li>Duplicidades detectadas: <strong>{resumo.duplicados}</strong></li>
              <li>Linhas com erro (não importadas): <strong>{resumo.erros}</strong></li>
            </ul>
            <div className="flex items-start gap-2">
              <Checkbox
                id="dup"
                checked={ignorarDuplicados}
                onCheckedChange={(v) => setIgnorarDuplicados(!!v)}
              />
              <Label htmlFor="dup" className="text-xs font-normal leading-snug">
                Ignorar registros duplicados (recomendado). Ao desmarcar, os duplicados serão gravados como novos
                registros.
              </Label>
            </div>
            {processando && <Progress value={progresso} />}
            <div className="flex justify-between gap-2">
              <Button variant="outline" onClick={() => setPasso(2)} disabled={processando}>
                <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" /> Voltar
              </Button>
              <Button onClick={executar} disabled={processando}>
                {processando ? "Importando..." : "Confirmar e importar"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* PASSO 5 */}
      {passo === 4 && relatorio && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" /> Relatório final
            </CardTitle>
            <CardDescription className="text-xs break-all">{file?.name}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
              {[
                ["Recebidos", relatorio.recebidos],
                ["Importados", relatorio.importados],
                ["Duplicidades", relatorio.duplicados],
                ["Erros", relatorio.erros],
                ["Ignorados", relatorio.ignorados],
                ["Tempo", `${(relatorio.tempoMs / 1000).toFixed(1)}s`],
              ].map(([k, v]) => (
                <div key={String(k)} className="rounded-md border p-3">
                  <p className="text-muted-foreground">{k}</p>
                  <p className="text-lg font-semibold">{String(v)}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              O lote ficou registrado no histórico, onde é possível consultar as ocorrências e desfazer a importação
              quando tecnicamente seguro.
            </p>
            <Button variant="outline" onClick={reiniciar}>
              <RotateCcw className="h-4 w-4 mr-2" aria-hidden="true" /> Nova importação
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
