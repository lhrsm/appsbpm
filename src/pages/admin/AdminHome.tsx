import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  Users, UserPlus, Building2, FileText, Wallet, TrendingUp, Download, Filter, FileDown, Activity,
} from "lucide-react";
import {
  ResponsiveContainer, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, Legend, CartesianGrid, AreaChart, Area,
} from "recharts";
import { format, parseISO, startOfMonth, subMonths, isAfter, isBefore } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const COLORS = ["hsl(var(--primary))", "hsl(var(--destructive))", "hsl(var(--accent))", "#F5B301", "#2E86AB", "#8E44AD"];

type Assoc = { id: string; nome: string; matricula: string; cidade?: string; ativo: boolean; created_at: string; data_admissao: string | null };
type Dep = { id: string; nome: string; tipo: string; ativo: boolean; created_at: string; associado_id: string };
type Clinica = { id: string; nome: string; cidade: string; especialidade: string; ativo: boolean };
type Limite = { id: string; associado_id: string; limite_total: number; limite_utilizado: number };
type Historico = { id: string; associado_id: string; valor: number; data_utilizacao: string; descricao: string | null };

type Pendencias = {
  solicitacoesAbertas: number;
  lgpdPendentes: number;
  lgpdVencidas: number;
  mensalidadesVencidas: number;
  peculioPendente: number;
  privacidadePendente: number;
};

export default function AdminHome() {
  const [loading, setLoading] = useState(true);
  const [associados, setAssociados] = useState<Assoc[]>([]);
  const [dependentes, setDependentes] = useState<Dep[]>([]);
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [limites, setLimites] = useState<Limite[]>([]);
  const [historico, setHistorico] = useState<Historico[]>([]);
  const [pend, setPend] = useState<Pendencias>({ solicitacoesAbertas: 0, lgpdPendentes: 0, lgpdVencidas: 0, mensalidadesVencidas: 0, peculioPendente: 0, privacidadePendente: 0 });

  // Filtros
  const [dataInicio, setDataInicio] = useState<string>(format(subMonths(new Date(), 11), "yyyy-MM-dd"));
  const [dataFim, setDataFim] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [cidadeFiltro, setCidadeFiltro] = useState<string>("todas");
  const [statusFiltro, setStatusFiltro] = useState<string>("todos");
  const [especialidadeFiltro, setEspecialidadeFiltro] = useState<string>("todas");
  const [tipoRelatorio, setTipoRelatorio] = useState<string>("associados");

  useEffect(() => {
    (async () => {
      setLoading(true);
      const hoje = new Date().toISOString();
      const limite15d = new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString();
      const [a, d, c, l, h, sol, priv, mens, pec] = await Promise.all([
        supabase.from("associados").select("*").order("created_at", { ascending: false }),
        supabase.from("dependentes").select("*"),
        supabase.from("clinicas_parceiros").select("*"),
        supabase.from("limites").select("*"),
        supabase.from("historico_limite").select("*").order("data_utilizacao", { ascending: false }),
        supabase.from("solicitacoes").select("id,status", { count: "exact", head: false }).in("status", ["aberto", "em_andamento"]),
        supabase.from("solicitacoes_privacidade").select("id,status,created_at").eq("status", "pendente"),
        supabase.from("mensalidades").select("id,status,vencimento").eq("status", "pendente").lt("vencimento", hoje.slice(0, 10)),
        supabase.from("peculio_solicitacoes").select("id,status").eq("status", "pendente"),
      ]);
      setAssociados((a.data as any) || []);
      setDependentes((d.data as any) || []);
      setClinicas((c.data as any) || []);
      setLimites((l.data as any) || []);
      setHistorico((h.data as any) || []);
      const privList = (priv.data as any[]) || [];
      setPend({
        solicitacoesAbertas: (sol.data as any[])?.length || 0,
        lgpdPendentes: privList.length,
        lgpdVencidas: privList.filter((p) => p.created_at < limite15d).length,
        mensalidadesVencidas: (mens.data as any[])?.length || 0,
        peculioPendente: (pec.data as any[])?.length || 0,
        privacidadePendente: privList.length,
      });
      setLoading(false);
    })();
  }, []);

  const inRange = (iso: string | null | undefined) => {
    if (!iso) return false;
    const dt = parseISO(iso);
    return !isBefore(dt, parseISO(dataInicio)) && !isAfter(dt, parseISO(dataFim + "T23:59:59"));
  };

  // Listas para filtros
  const cidades = useMemo(() => Array.from(new Set(clinicas.map((c) => c.cidade).filter(Boolean))).sort(), [clinicas]);
  const especialidades = useMemo(() => Array.from(new Set(clinicas.map((c) => c.especialidade).filter(Boolean))).sort(), [clinicas]);

  // Filtragens
  const associadosFiltrados = useMemo(() => associados.filter((a) => {
    if (statusFiltro === "ativos" && !a.ativo) return false;
    if (statusFiltro === "inativos" && a.ativo) return false;
    if (!inRange(a.created_at)) return false;
    return true;
  }), [associados, statusFiltro, dataInicio, dataFim]);

  const clinicasFiltradas = useMemo(() => clinicas.filter((c) => {
    if (cidadeFiltro !== "todas" && c.cidade !== cidadeFiltro) return false;
    if (especialidadeFiltro !== "todas" && c.especialidade !== especialidadeFiltro) return false;
    if (statusFiltro === "ativos" && !c.ativo) return false;
    if (statusFiltro === "inativos" && c.ativo) return false;
    return true;
  }), [clinicas, cidadeFiltro, especialidadeFiltro, statusFiltro]);

  const historicoFiltrado = useMemo(() => historico.filter((h) => inRange(h.data_utilizacao)), [historico, dataInicio, dataFim]);

  // KPIs
  const totalLimite = limites.reduce((s, l) => s + Number(l.limite_total || 0), 0);
  const totalUtilizado = limites.reduce((s, l) => s + Number(l.limite_utilizado || 0), 0);
  const percentUtilizado = totalLimite > 0 ? (totalUtilizado / totalLimite) * 100 : 0;

  // Chart: Associados por mês (baseado em created_at)
  const associadosPorMes = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 11; i >= 0; i--) {
      const d = startOfMonth(subMonths(new Date(), i));
      map.set(format(d, "yyyy-MM"), 0);
    }
    associados.forEach((a) => {
      const key = format(parseISO(a.created_at), "yyyy-MM");
      if (map.has(key)) map.set(key, (map.get(key) || 0) + 1);
    });
    return Array.from(map.entries()).map(([k, v]) => ({
      mes: format(parseISO(k + "-01"), "MMM/yy", { locale: ptBR }),
      novos: v,
    }));
  }, [associados]);

  // Chart: Dependentes por tipo
  const dependentesPorTipo = useMemo(() => {
    const map = new Map<string, number>();
    dependentes.forEach((d) => map.set(d.tipo || "outros", (map.get(d.tipo || "outros") || 0) + 1));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [dependentes]);

  // Chart: Clínicas por cidade (top 8)
  const clinicasPorCidade = useMemo(() => {
    const map = new Map<string, number>();
    clinicasFiltradas.forEach((c) => map.set(c.cidade || "N/D", (map.get(c.cidade || "N/D") || 0) + 1));
    return Array.from(map.entries())
      .map(([cidade, total]) => ({ cidade, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  }, [clinicasFiltradas]);

  // Chart: Utilização mensal
  const utilizacaoMensal = useMemo(() => {
    const map = new Map<string, number>();
    for (let i = 11; i >= 0; i--) {
      const d = startOfMonth(subMonths(new Date(), i));
      map.set(format(d, "yyyy-MM"), 0);
    }
    historico.forEach((h) => {
      const key = format(parseISO(h.data_utilizacao), "yyyy-MM");
      if (map.has(key)) map.set(key, (map.get(key) || 0) + Number(h.valor || 0));
    });
    return Array.from(map.entries()).map(([k, v]) => ({
      mes: format(parseISO(k + "-01"), "MMM/yy", { locale: ptBR }),
      valor: Number(v.toFixed(2)),
    }));
  }, [historico]);

  // Export CSV
  const exportCSV = () => {
    const dataMap: Record<string, { headers: string[]; rows: string[][] }> = {
      associados: {
        headers: ["Matrícula", "Nome", "Status", "Cadastrado em"],
        rows: associadosFiltrados.map((a) => [a.matricula, a.nome, a.ativo ? "Ativo" : "Inativo", format(parseISO(a.created_at), "dd/MM/yyyy")]),
      },
      clinicas: {
        headers: ["Nome", "Cidade", "Especialidade", "Status"],
        rows: clinicasFiltradas.map((c) => [c.nome, c.cidade || "", c.especialidade || "", c.ativo ? "Ativo" : "Inativo"]),
      },
      utilizacao: {
        headers: ["Data", "Descrição", "Valor (R$)"],
        rows: historicoFiltrado.map((h) => [format(parseISO(h.data_utilizacao), "dd/MM/yyyy"), h.descricao || "", Number(h.valor).toFixed(2)]),
      },
    };
    const cfg = dataMap[tipoRelatorio] || dataMap.associados;
    const csv = [cfg.headers.join(","), ...cfg.rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(","))].join("\n");
    const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `relatorio_${tipoRelatorio}_${format(new Date(), "yyyyMMdd")}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("CSV exportado");
  };

  // Export PDF
  const exportPDF = () => {
    const doc = new jsPDF();
    const dataMap: Record<string, { title: string; headers: string[]; rows: any[][] }> = {
      associados: {
        title: "Relatório de Associados",
        headers: ["Matrícula", "Nome", "Status", "Cadastrado em"],
        rows: associadosFiltrados.map((a) => [a.matricula, a.nome, a.ativo ? "Ativo" : "Inativo", format(parseISO(a.created_at), "dd/MM/yyyy")]),
      },
      clinicas: {
        title: "Relatório de Clínicas & Parceiros",
        headers: ["Nome", "Cidade", "Especialidade", "Status"],
        rows: clinicasFiltradas.map((c) => [c.nome, c.cidade || "-", c.especialidade || "-", c.ativo ? "Ativo" : "Inativo"]),
      },
      utilizacao: {
        title: "Relatório de Utilização de Limite",
        headers: ["Data", "Descrição", "Valor (R$)"],
        rows: historicoFiltrado.map((h) => [format(parseISO(h.data_utilizacao), "dd/MM/yyyy"), h.descricao || "-", Number(h.valor).toFixed(2)]),
      },
    };
    const cfg = dataMap[tipoRelatorio] || dataMap.associados;

    // Header
    doc.setFillColor(0, 100, 40);
    doc.rect(0, 0, 210, 25, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.text("SBPM - Painel Administrativo", 14, 12);
    doc.setFontSize(10);
    doc.text(cfg.title, 14, 20);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(9);
    doc.text(`Período: ${format(parseISO(dataInicio), "dd/MM/yyyy")} a ${format(parseISO(dataFim), "dd/MM/yyyy")}`, 14, 32);
    doc.text(`Gerado em: ${format(new Date(), "dd/MM/yyyy HH:mm")}`, 14, 37);
    doc.text(`Total de registros: ${cfg.rows.length}`, 14, 42);

    autoTable(doc, {
      startY: 48,
      head: [cfg.headers],
      body: cfg.rows,
      theme: "striped",
      headStyles: { fillColor: [0, 100, 40] },
      styles: { fontSize: 8 },
    });

    doc.save(`relatorio_${tipoRelatorio}_${format(new Date(), "yyyyMMdd")}.pdf`);
    toast.success("PDF exportado");
  };

  const kpis = [
    { label: "Associados", value: associados.length, sub: `${associados.filter((a) => a.ativo).length} ativos`, icon: Users, color: "text-primary" },
    { label: "Dependentes", value: dependentes.length, sub: `${dependentes.filter((d) => d.ativo).length} ativos`, icon: UserPlus, color: "text-blue-600" },
    { label: "Clínicas & Parceiros", value: clinicas.length, sub: `${clinicas.filter((c) => c.ativo).length} ativos`, icon: Building2, color: "text-amber-600" },
    { label: "Utilização do Limite", value: `${percentUtilizado.toFixed(1)}%`, sub: `R$ ${totalUtilizado.toLocaleString("pt-BR")} usados`, icon: Wallet, color: "text-destructive" },
  ];

  if (loading) return <div className="flex items-center justify-center h-96 text-muted-foreground">Carregando dados...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Painel administrativo</h1>
          <p className="text-muted-foreground">Visão consolidada, análises e relatórios.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={exportCSV}><Download className="w-4 h-4 mr-2" />CSV</Button>
          <Button onClick={exportPDF}><FileDown className="w-4 h-4 mr-2" />PDF</Button>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <Card key={k.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm text-muted-foreground">{k.label}</CardTitle>
              <k.icon className={`w-4 h-4 ${k.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{k.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{k.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base"><Filter className="w-4 h-4" />Filtros & Relatório</CardTitle>
          <CardDescription>Refine os dados para análise e exportação</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <div>
              <Label className="text-xs">Data início</Label>
              <Input type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Data fim</Label>
              <Input type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs">Status</Label>
              <Select value={statusFiltro} onValueChange={setStatusFiltro}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="ativos">Ativos</SelectItem>
                  <SelectItem value="inativos">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Cidade</Label>
              <Select value={cidadeFiltro} onValueChange={setCidadeFiltro}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {cidades.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Especialidade</Label>
              <Select value={especialidadeFiltro} onValueChange={setEspecialidadeFiltro}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas</SelectItem>
                  {especialidades.map((e) => <SelectItem key={e} value={e}>{e}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Tipo de relatório</Label>
              <Select value={tipoRelatorio} onValueChange={setTipoRelatorio}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="associados">Associados</SelectItem>
                  <SelectItem value="clinicas">Clínicas & Parceiros</SelectItem>
                  <SelectItem value="utilizacao">Utilização de Limite</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <Tabs defaultValue="visao">
        <TabsList>
          <TabsTrigger value="visao"><Activity className="w-4 h-4 mr-2" />Visão geral</TabsTrigger>
          <TabsTrigger value="rede"><Building2 className="w-4 h-4 mr-2" />Rede credenciada</TabsTrigger>
          <TabsTrigger value="financeiro"><TrendingUp className="w-4 h-4 mr-2" />Financeiro</TabsTrigger>
          <TabsTrigger value="dados"><FileText className="w-4 h-4 mr-2" />Dados</TabsTrigger>
        </TabsList>

        <TabsContent value="visao" className="space-y-4 mt-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Novos associados por mês</CardTitle>
                <CardDescription>Últimos 12 meses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={associadosPorMes}>
                    <defs>
                      <linearGradient id="colorNovos" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.6} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="mes" fontSize={11} />
                    <YAxis fontSize={11} allowDecimals={false} />
                    <Tooltip />
                    <Area type="monotone" dataKey="novos" stroke="hsl(var(--primary))" fill="url(#colorNovos)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Dependentes por tipo</CardTitle>
                <CardDescription>Distribuição atual</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Pie data={dependentesPorTipo} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label>
                      {dependentesPorTipo.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="rede" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Clínicas & Parceiros por cidade</CardTitle>
              <CardDescription>Top 8 cidades (respeitando filtros)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={340}>
                <BarChart data={clinicasPorCidade}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="cidade" fontSize={11} angle={-20} textAnchor="end" height={70} />
                  <YAxis fontSize={11} allowDecimals={false} />
                  <Tooltip />
                  <Bar dataKey="total" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="financeiro" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Utilização mensal do limite</CardTitle>
              <CardDescription>Valor total utilizado por mês (R$)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={utilizacaoMensal}>
                  <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                  <XAxis dataKey="mes" fontSize={11} />
                  <YAxis fontSize={11} />
                  <Tooltip formatter={(v: number) => `R$ ${v.toLocaleString("pt-BR")}`} />
                  <Line type="monotone" dataKey="valor" stroke="hsl(var(--destructive))" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="dados" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                Prévia — {tipoRelatorio === "associados" ? "Associados" : tipoRelatorio === "clinicas" ? "Clínicas & Parceiros" : "Utilização de Limite"}
              </CardTitle>
              <CardDescription>Mesma base usada nos exports (100 primeiros registros)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto max-h-[500px]">
                {tipoRelatorio === "associados" && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Matrícula</TableHead>
                        <TableHead>Nome</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Cadastrado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {associadosFiltrados.slice(0, 100).map((a) => (
                        <TableRow key={a.id}>
                          <TableCell className="font-mono text-xs">{a.matricula}</TableCell>
                          <TableCell>{a.nome}</TableCell>
                          <TableCell><Badge variant={a.ativo ? "default" : "secondary"}>{a.ativo ? "Ativo" : "Inativo"}</Badge></TableCell>
                          <TableCell>{format(parseISO(a.created_at), "dd/MM/yyyy")}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {tipoRelatorio === "clinicas" && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Cidade</TableHead>
                        <TableHead>Especialidade</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {clinicasFiltradas.slice(0, 100).map((c) => (
                        <TableRow key={c.id}>
                          <TableCell>{c.nome}</TableCell>
                          <TableCell>{c.cidade || "-"}</TableCell>
                          <TableCell>{c.especialidade || "-"}</TableCell>
                          <TableCell><Badge variant={c.ativo ? "default" : "secondary"}>{c.ativo ? "Ativo" : "Inativo"}</Badge></TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
                {tipoRelatorio === "utilizacao" && (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Descrição</TableHead>
                        <TableHead className="text-right">Valor (R$)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {historicoFiltrado.slice(0, 100).map((h) => (
                        <TableRow key={h.id}>
                          <TableCell>{format(parseISO(h.data_utilizacao), "dd/MM/yyyy")}</TableCell>
                          <TableCell>{h.descricao || "-"}</TableCell>
                          <TableCell className="text-right font-mono">{Number(h.valor).toLocaleString("pt-BR", { minimumFractionDigits: 2 })}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
