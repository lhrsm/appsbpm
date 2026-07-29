import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Users, UserPlus, ShieldCheck, HeartHandshake, DollarSign, Building2, FileSignature,
  Upload, AlertTriangle, ClipboardCheck, Activity, ArrowRight, Info,
} from "lucide-react";

type ModuleStatus =
  | "implementado"
  | "parcial"
  | "desenvolvimento"
  | "aguardando-integracao"
  | "aguardando-briefing"
  | "homologacao"
  | "producao"
  | "disponivel";

const statusMeta: Record<ModuleStatus, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  implementado: { label: "Implementado", variant: "default" },
  parcial: { label: "Implementado parcialmente", variant: "secondary" },
  desenvolvimento: { label: "Em desenvolvimento", variant: "secondary" },
  "aguardando-integracao": { label: "Aguardando integração", variant: "outline" },
  "aguardando-briefing": { label: "Aguardando briefing", variant: "outline" },
  homologacao: { label: "Em homologação", variant: "secondary" },
  producao: { label: "Em produção", variant: "default" },
  disponivel: { label: "Disponível para desenvolvimento", variant: "outline" },
};

const modulos: {
  nome: string;
  to: string;
  icon: typeof ShieldCheck;
  status: ModuleStatus[];
  observacao: string;
}[] = [
  {
    nome: "Previdência",
    to: "/admin/previdencia",
    icon: ShieldCheck,
    status: ["parcial", "aguardando-integracao"],
    observacao: "Telas operacionais ativas. Aguardando integração com o sistema interno da SBPM.",
  },
  {
    nome: "Assistência à Saúde",
    to: "/admin/saude",
    icon: HeartHandshake,
    status: ["parcial", "aguardando-integracao"],
    observacao: "Aguardando importação e integração com o SBPM Sanitas.",
  },
  {
    nome: "Financeiro",
    to: "/admin/financeiro",
    icon: DollarSign,
    status: ["disponivel"],
    observacao: "Base de mensalidades disponível. Módulo institucional pode evoluir imediatamente.",
  },
  {
    nome: "Patrimonial",
    to: "/admin/patrimonio",
    icon: Building2,
    status: ["disponivel"],
    observacao: "Estrutura de rotas criada. Tabelas de bens ainda não existem no banco.",
  },
  {
    nome: "Contábil",
    to: "/admin/contabilidade",
    icon: FileSignature,
    status: ["aguardando-briefing"],
    observacao: "Estrutura inicial disponível, aguardando briefing do setor de contabilidade.",
  },
];

type Timeline = {
  fase: string;
  titulo: string;
  responsavel: string;
  prazo: string;
  status: ModuleStatus;
  observacao: string;
};

const linhaDoTempo: Timeline[] = [
  {
    fase: "Concluído",
    titulo: "Portal do associado e dependente (carteirinha, limites, informes, rede credenciada)",
    responsavel: "TI / Desenvolvimento",
    prazo: "Concluído",
    status: "implementado",
    observacao: "Em uso pelo público externo.",
  },
  {
    fase: "Concluído",
    titulo: "Área administrativa base (associados, dependentes, comunicados, auditoria)",
    responsavel: "TI / Desenvolvimento",
    prazo: "Concluído",
    status: "implementado",
    observacao: "Operação já realizada pelos setores.",
  },
  {
    fase: "Em desenvolvimento",
    titulo: "Painel institucional e separação de módulos por setor",
    responsavel: "TI / Desenvolvimento",
    prazo: "A definir com a diretoria",
    status: "desenvolvimento",
    observacao: "Esta tela faz parte desta etapa.",
  },
  {
    fase: "Depende de integração",
    titulo: "Carga de dados de Previdência e Assistência à Saúde (SBPM Sanitas)",
    responsavel: "TI + Previdência + Saúde",
    prazo: "Depende da liberação da API",
    status: "aguardando-integracao",
    observacao: "Enquanto não houver carga, os módulos exibem aviso de dados não integrados.",
  },
  {
    fase: "Próxima etapa",
    titulo: "Papéis por setor (financeiro, patrimônio, contábil, saúde, previdência, auditor)",
    responsavel: "TI / Segurança",
    prazo: "Antes do módulo Patrimonial",
    status: "desenvolvimento",
    observacao: "Migration aditiva em app_role e ajuste dos guards do admin.",
  },
  {
    fase: "Próxima etapa",
    titulo: "Módulo Patrimonial (bens, movimentações, manutenções, inventário)",
    responsavel: "Setor Patrimonial + TI",
    prazo: "Após papéis por setor",
    status: "disponivel",
    observacao: "Requer definição do plano de tombamento.",
  },
  {
    fase: "Próxima etapa",
    titulo: "Financeiro institucional (contas, centros de custo, lançamentos)",
    responsavel: "Setor Financeiro + TI",
    prazo: "Em paralelo ao Patrimonial",
    status: "disponivel",
    observacao: "Mantém a tabela de mensalidades do portal externo intacta.",
  },
  {
    fase: "Próxima etapa",
    titulo: "Módulo Contábil (plano de contas e integração)",
    responsavel: "Contabilidade + TI",
    prazo: "Após Financeiro e Patrimonial",
    status: "aguardando-briefing",
    observacao: "Depende do briefing do setor.",
  },
];

type Metrics = {
  associadosAtivos: number;
  dependentes: number;
  pendentesValidacao: number;
  importacoesPendentes: number | null;
  inconsistencias: number;
  pendenciasFinanceiras: number;
  bensPatrimoniais: number | null;
  solicitacoesSaude: number;
  atualizacoesRecentes: number;
};

export default function AdminVisaoGeral() {
  const [loading, setLoading] = useState(true);
  const [m, setM] = useState<Metrics | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const desde = new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString();
      const hoje = new Date().toISOString().slice(0, 10);

      const [assocAtivos, assocTodos, deps, solicPend, syncLogs, mensal, peculio, audit] = await Promise.all([
        supabase.from("associados").select("id", { count: "exact", head: true }).eq("ativo", true),
        supabase.from("associados").select("id,cpf,matricula,nome,data_nascimento,ativo"),
        supabase.from("dependentes").select("id", { count: "exact", head: true }).eq("ativo", true),
        supabase.from("solicitacoes").select("id", { count: "exact", head: true }).in("status", ["aberto", "em_andamento"]),
        supabase.from("sync_logs").select("id", { count: "exact", head: true }).eq("status", "pendente"),
        supabase.from("mensalidades").select("id", { count: "exact", head: true }).eq("status", "pendente").lt("vencimento", hoje),
        supabase.from("peculio_solicitacoes").select("id", { count: "exact", head: true }).eq("status", "pendente"),
        supabase.from("audit_logs").select("id", { count: "exact", head: true }).gte("created_at", desde),
      ]);

      const lista = (assocTodos.data as any[]) || [];
      const inconsistencias = lista.filter(
        (a) => !a.cpf || !a.matricula || !a.nome || !a.data_nascimento,
      ).length;

      setM({
        associadosAtivos: assocAtivos.count ?? 0,
        dependentes: deps.count ?? 0,
        pendentesValidacao: solicPend.count ?? 0,
        importacoesPendentes: syncLogs.error ? null : syncLogs.count ?? 0,
        inconsistencias,
        pendenciasFinanceiras: mensal.count ?? 0,
        bensPatrimoniais: null,
        solicitacoesSaude: peculio.count ?? 0,
        atualizacoesRecentes: audit.count ?? 0,
      });
      setLoading(false);
    })();
  }, []);

  const cards = [
    { label: "Associados ativos", value: m?.associadosAtivos, icon: Users, to: "/admin/associados", nota: "Base institucional atual" },
    { label: "Dependentes ativos", value: m?.dependentes, icon: UserPlus, to: "/admin/dependentes", nota: "Vínculos ativos" },
    { label: "Registros pendentes de validação", value: m?.pendentesValidacao, icon: ClipboardCheck, to: "/admin/solicitacoes", nota: "Solicitações em aberto" },
    { label: "Importações pendentes", value: m?.importacoesPendentes, icon: Upload, to: "/admin/sincronizacao", nota: "Cargas aguardando processamento" },
    { label: "Inconsistências de dados", value: m?.inconsistencias, icon: AlertTriangle, to: "/admin/associados", nota: "Cadastros com campos obrigatórios vazios" },
    { label: "Pendências financeiras", value: m?.pendenciasFinanceiras, icon: DollarSign, to: "/admin/financeiro", nota: "Mensalidades vencidas em aberto" },
    { label: "Bens patrimoniais cadastrados", value: m?.bensPatrimoniais, icon: Building2, to: "/admin/patrimonio", nota: "Aguardando integração com a base institucional" },
    { label: "Solicitações de saúde", value: m?.solicitacoesSaude, icon: HeartHandshake, to: "/admin/peculio", nota: "Solicitações de pecúlio/saúde pendentes" },
    { label: "Atualizações recentes", value: m?.atualizacoesRecentes, icon: Activity, to: "/admin/auditoria", nota: "Registros de auditoria (7 dias)" },
  ];

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Visão Geral Institucional</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Panorama da gestão da SBPM: cadastros, pendências operacionais e situação de cada módulo
          administrativo.
        </p>
      </header>

      <Card className="border-dashed">
        <CardContent className="flex items-start gap-3 py-4">
          <Info className="h-4 w-4 mt-0.5 text-primary shrink-0" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Os indicadores abaixo refletem apenas os dados já existentes na base do portal. Módulos sem
            carga oficial exibem <strong>“Aguardando integração com a base institucional”</strong> — nenhum
            número é estimado ou fictício.
          </p>
        </CardContent>
      </Card>

      <section aria-labelledby="indicadores">
        <h2 id="indicadores" className="sr-only">Indicadores</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((c) => (
            <Link key={c.label} to={c.to} className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-lg">
              <Card className="h-full transition-colors hover:border-primary">
                <CardHeader className="pb-2 flex-row items-start justify-between space-y-0 gap-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
                  <c.icon className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
                </CardHeader>
                <CardContent className="space-y-1">
                  {loading ? (
                    <Skeleton className="h-8 w-20" />
                  ) : c.value === null || c.value === undefined ? (
                    <Badge variant="outline" className="text-[10px] whitespace-normal text-left">
                      Aguardando integração com a base institucional
                    </Badge>
                  ) : (
                    <p className="text-3xl font-bold tabular-nums">{c.value}</p>
                  )}
                  <p className="text-xs text-muted-foreground">{c.nota}</p>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      <section aria-labelledby="situacao-modulos" className="space-y-3">
        <h2 id="situacao-modulos" className="text-lg font-semibold">Situação dos módulos</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {modulos.map((mod) => (
            <Card key={mod.nome} className="h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                  <mod.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <CardTitle className="text-base">{mod.nome}</CardTitle>
                </div>
                <div className="flex flex-wrap gap-1 pt-2">
                  {mod.status.map((s) => (
                    <Badge key={s} variant={statusMeta[s].variant} className="text-[10px]">
                      {statusMeta[s].label}
                    </Badge>
                  ))}
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <CardDescription className="text-xs">{mod.observacao}</CardDescription>
                <Link to={mod.to} className="text-xs font-medium text-primary inline-flex items-center gap-1 hover:underline">
                  Abrir módulo <ArrowRight className="h-3 w-3" aria-hidden="true" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      <section aria-labelledby="linha-do-tempo" className="space-y-3">
        <h2 id="linha-do-tempo" className="text-lg font-semibold">Linha do tempo do projeto</h2>
        <Card>
          <CardContent className="pt-6">
            <ol className="relative border-l border-border pl-6 space-y-6">
              {linhaDoTempo.map((item) => (
                <li key={item.titulo} className="relative">
                  <span
                    className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-primary ring-4 ring-background"
                    aria-hidden="true"
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs uppercase tracking-wide text-muted-foreground">{item.fase}</span>
                    <Badge variant={statusMeta[item.status].variant} className="text-[10px]">
                      {statusMeta[item.status].label}
                    </Badge>
                  </div>
                  <p className="font-medium text-sm pt-1">{item.titulo}</p>
                  <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-2 pt-2 text-xs text-muted-foreground">
                    <div className="flex gap-1">
                      <dt className="font-medium text-foreground">Responsável:</dt>
                      <dd>{item.responsavel}</dd>
                    </div>
                    <div className="flex gap-1">
                      <dt className="font-medium text-foreground">Prazo estimado:</dt>
                      <dd>{item.prazo}</dd>
                    </div>
                    <div className="flex gap-1 sm:col-span-2">
                      <dt className="font-medium text-foreground">Observações:</dt>
                      <dd>{item.observacao}</dd>
                    </div>
                  </dl>
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
