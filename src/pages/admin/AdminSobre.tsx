import {
  Building2,
  DollarSign,
  FileSignature,
  HeartHandshake,
  Info,
  ListChecks,
  Rocket,
  ShieldCheck,
  Users,
  CheckCircle2,
  CircleDashed,
  Clock,
  Smartphone,
  Plug,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const aImplementar = [
  { icon: DollarSign, label: "Folha de pagamento (RH - Fase 3)" },
  { icon: Users, label: "Recrutamento e desempenho (RH - Fase 3)" },
  { icon: FileSignature, label: "Regras contábeis definitivas" },
];

const implementados = [
  { icon: ShieldCheck, label: "Módulo da Previdência" },
  { icon: HeartHandshake, label: "Módulo da Assistência à Saúde" },
  { icon: DollarSign, label: "Módulo Financeiro" },
  { icon: Building2, label: "Módulo Patrimonial" },
  { icon: FileSignature, label: "Módulo Contábil (estrutura inicial)" },
  { icon: Users, label: "Módulo de Recursos Humanos (Fases 1 e 2)" },
];

type Item = { label: string; estado: "concluido" | "parcial" | "previsto" };

const checklist: { titulo: string; icon: typeof Users; itens: Item[] }[] = [
  {
    titulo: "Portal do Associado e Dependente",
    icon: Smartphone,
    itens: [
      { label: "Login por matrícula ou CPF (titular e dependente)", estado: "concluido" },
      { label: "Dashboard com atalhos e canais de WhatsApp por setor", estado: "concluido" },
      { label: "Carteirinha digital com assinatura, compartilhamento e PDF", estado: "concluido" },
      { label: "Limite disponível exibido em percentual", estado: "concluido" },
      { label: "Clínicas e parceiros com filtros, categorias e avaliações", estado: "concluido" },
      { label: "Informe de rendimentos separado por dependente", estado: "concluido" },
      { label: "Pecúlio: explicação, beneficiários e solicitação", estado: "concluido" },
      { label: "Dependentes: inclusão e exclusão com anexos", estado: "concluido" },
      { label: "Associação Premiada: regulamento e indicação", estado: "concluido" },
      { label: "Simulador de mensalidade por patente", estado: "concluido" },
      { label: "Perfil com foto, e-mail, telefone e endereço", estado: "concluido" },
      { label: "Documentos, solicitações, financeiro e histórico de acessos", estado: "concluido" },
      { label: "Notificações push, PWA, modo offline e tema escuro", estado: "concluido" },
      { label: "LGPD, acessibilidade (WCAG 2.1 AA) e consentimento de cookies", estado: "concluido" },
    ],
  },
  {
    titulo: "Painel Administrativo",
    icon: ShieldCheck,
    itens: [
      { label: "Visão geral e painel analítico", estado: "concluido" },
      { label: "Gestão de associados e dependentes (CEP, patente, validações)", estado: "concluido" },
      { label: "Perfis, permissões por módulo e guarda de rotas", estado: "concluido" },
      { label: "Comunicados, eventos, FAQ, avaliações e notificações push", estado: "concluido" },
      { label: "Limites, informes, pecúlio e solicitações", estado: "concluido" },
      { label: "Clínicas e parceiros com especialidades, mapa e logos", estado: "concluido" },
      { label: "Auditoria imutável com comparação de alterações", estado: "concluido" },
      { label: "Central de Tutoriais e Ajuda", estado: "concluido" },
      { label: "Privacidade (LGPD), segurança (2FA) e assinatura ICP-Brasil", estado: "parcial" },
    ],
  },
  {
    titulo: "Módulos Institucionais",
    icon: Building2,
    itens: [
      { label: "Financeiro: lançamentos, mensalidades, aprovação e relatórios", estado: "concluido" },
      { label: "Patrimônio: bens, QR Code, inventários, movimentações e baixas", estado: "concluido" },
      { label: "Contabilidade: plano de contas, lançamentos, períodos e fechamentos", estado: "parcial" },
      { label: "RH Fase 1: estrutura, colaboradores, cargos e vínculos", estado: "concluido" },
      { label: "RH Fase 2: frequência, férias, afastamentos, benefícios e solicitações", estado: "concluido" },
      { label: "RH Fase 3: folha, recrutamento, desempenho e portal do colaborador", estado: "previsto" },
    ],
  },
  {
    titulo: "Integrações e Segurança",
    icon: Plug,
    itens: [
      { label: "Central de integrações, importações e inconsistências", estado: "concluido" },
      { label: "Chave institucional única e conciliação de identidades", estado: "concluido" },
      { label: "Acesso do portal via função segura com sessão assinada", estado: "concluido" },
      { label: "RLS e revogação de acesso público em dados pessoais", estado: "concluido" },
      { label: "Envio de e-mails, WhatsApp e webhooks de ingestão", estado: "concluido" },
      { label: "Servidor MCP para consulta de dados públicos", estado: "concluido" },
      { label: "Integração com SBPM Sanitas e importação da base oficial", estado: "previsto" },
    ],
  },
];

const itemInfo = {
  concluido: { label: "Concluído", Icon: CheckCircle2, cor: "text-primary" },
  parcial: { label: "Parcial", Icon: Clock, cor: "text-muted-foreground" },
  previsto: { label: "Previsto", Icon: CircleDashed, cor: "text-muted-foreground" },
} as const;

type Etapa = { titulo: string; estado: "concluido" | "andamento" | "previsto" };

const etapas: Etapa[] = [
  { titulo: "Portal externo", estado: "concluido" },
  { titulo: "Painel administrativo e permissões", estado: "concluido" },
  { titulo: "Módulos Financeiro, Patrimonial e Contábil", estado: "concluido" },
  { titulo: "Módulo de Recursos Humanos (Fases 1 e 2)", estado: "concluido" },
  { titulo: "Central de Tutoriais e Ajuda", estado: "concluido" },
  { titulo: "Integração institucional", estado: "andamento" },
  { titulo: "Importação SBPM Sanitas", estado: "previsto" },
  { titulo: "Validação dos dados", estado: "previsto" },
  { titulo: "RH Fase 3 e regras contábeis definitivas", estado: "previsto" },
  { titulo: "Homologação", estado: "previsto" },
  { titulo: "Implantação completa", estado: "previsto" },
];

const estadoInfo = {
  concluido: { label: "Concluído", Icon: CheckCircle2, classe: "bg-primary text-primary-foreground border-primary" },
  andamento: { label: "Em andamento", Icon: Clock, classe: "bg-accent text-accent-foreground border-accent" },
  previsto: { label: "Previsto", Icon: CircleDashed, classe: "bg-muted text-muted-foreground border-border" },
} as const;

export default function AdminSobre() {
  const total = checklist.reduce((acc, g) => acc + g.itens.length, 0);
  const concluidos = checklist.reduce(
    (acc, g) => acc + g.itens.filter((i) => i.estado === "concluido").length,
    0,
  );

  return (
    <div className="space-y-6 max-w-5xl">
      <header className="space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-primary">Portal da SBPM</h1>
        <p className="text-muted-foreground max-w-3xl">
          O Portal da SBPM é uma ferramenta de gestão administrativa que abrange a
          instituição como um todo, integrando informações, processos e módulos em um único
          ambiente.
        </p>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary" className="gap-1">
            <Users className="h-3 w-3" /> Conteúdo restrito a usuários internos
          </Badge>
          <Badge variant="outline" className="gap-1">
            <ListChecks className="h-3 w-3" /> {concluidos} de {total} itens concluídos
          </Badge>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <CheckCircle2 className="h-4 w-4 text-primary" /> Módulos implementados
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {implementados.map((m) => (
              <div key={m.label} className="flex items-center gap-3 rounded-md border p-3">
                <m.icon className="h-4 w-4 text-primary shrink-0" />
                <span className="text-sm">{m.label}</span>
                <Badge className="ml-auto text-[10px]">Ativo</Badge>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <ListChecks className="h-4 w-4 text-primary" /> Ainda a implementar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {aImplementar.map((m) => (
              <div key={m.label} className="flex items-center gap-3 rounded-md border p-3">
                <m.icon className="h-4 w-4 text-muted-foreground shrink-0" />
                <span className="text-sm">{m.label}</span>
                <Badge variant="outline" className="ml-auto text-[10px]">Planejado</Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookOpen className="h-4 w-4 text-primary" /> Checklist do que já foi implementado
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          {checklist.map((grupo) => (
            <section key={grupo.titulo} className="space-y-2">
              <h3 className="flex items-center gap-2 text-sm font-semibold">
                <grupo.icon className="h-4 w-4 text-primary" /> {grupo.titulo}
              </h3>
              <ul className="space-y-1.5">
                {grupo.itens.map((item) => {
                  const info = itemInfo[item.estado];
                  return (
                    <li key={item.label} className="flex items-start gap-2 text-sm">
                      <info.Icon className={`mt-0.5 h-4 w-4 shrink-0 ${info.cor}`} />
                      <span className="text-muted-foreground">
                        {item.label}
                        {item.estado !== "concluido" && (
                          <Badge variant="outline" className="ml-2 text-[10px]">
                            {info.label}
                          </Badge>
                        )}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Info className="h-4 w-4 text-primary" /> Situação atual
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              O portal externo, voltado aos associados e dependentes, está operacional, assim como
              o painel administrativo com controle de acesso por perfis e permissões.
            </p>
            <p>
              Os módulos Financeiro, Patrimonial, Contábil (estrutura inicial) e de Recursos
              Humanos já estão disponíveis para uso interno.
            </p>
            <p>
              Para consolidar os dados da Previdência e da Assistência à Saúde, permanece
              necessária a integração com os sistemas internos e a importação da base do
              SBPM Sanitas.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Rocket className="h-4 w-4 text-primary" /> Próximas etapas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              Concluir a Fase 3 do RH: folha de pagamento, recrutamento, desempenho, saúde
              ocupacional, relatórios e portal do colaborador.
            </p>
            <p>
              Realizar a integração com o SBPM Sanitas e a validação dos dados importados junto
              aos setores responsáveis.
            </p>
            <p>
              Definir as regras definitivas do Módulo Contábil em reuniões de levantamento de
              requisitos com o setor responsável.
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Linha do tempo do projeto</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="relative border-l pl-6 space-y-5">
            {etapas.map((e, i) => {
              const info = estadoInfo[e.estado];
              return (
                <li key={e.titulo} className="relative">
                  <span
                    className={`absolute -left-[34px] flex h-6 w-6 items-center justify-center rounded-full border ${info.classe}`}
                  >
                    <info.Icon className="h-3.5 w-3.5" />
                  </span>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-muted-foreground font-mono">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span className="text-sm font-medium">{e.titulo}</span>
                    <Badge variant="outline" className="text-[10px]">
                      {info.label}
                    </Badge>
                  </div>
                </li>
              );
            })}
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
