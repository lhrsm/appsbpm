import { useMemo } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/design-system/components/Button";
import { icons } from "@/design-system/icons";
import { useAssociado } from "@/contexts/AssociadoContext";
import { useNotificacoes } from "@/hooks/useNotificacoes";
import { getNavigationItems, type PortalProfile } from "@/portal/navigation";
import { usePortalDashboardData } from "./useDashboardData";
import {
  DashboardSection,
  DashboardLastUpdated,
  DashboardGridSkeleton,
  DashboardListSkeleton,
} from "./components/DashboardPrimitives";
import { DashboardWelcomeHero } from "./components/DashboardWelcomeHero";
import { DashboardSummaryGrid } from "./components/DashboardSummaryGrid";
import { DashboardQuickActions } from "./components/DashboardQuickActions";
import { DashboardPendingSection, DashboardNotificationList } from "./components/DashboardPendingSection";
import {
  DashboardServicesSection,
  DashboardRelatedPeople,
  DashboardSupportPreview,
} from "./components/DashboardSections";
import { DashboardProfileStatus } from "./components/DashboardProfileStatus";
import { canaisAtendimentoDependente } from "@/portal/dependente/config";
import { linkWhatsApp } from "@/portal/associado/config";
import type { PendingItem, QuickAction, ServiceItem, SummaryItem, SupportChannel } from "./types";

const tipoLabel: Record<string, string> = {
  conjuge: "Cônjuge",
  filho: "Filho(a)",
  pai_mae: "Pai/Mãe",
  outro: "Outro",
};

const canais: SupportChannel[] = [
  {
    id: "previdencia",
    setor: "Previdência",
    horario: "Seg. a sex., 8h às 17h",
    canal: "WhatsApp",
    href: "https://wa.me/5571985496972",
    icon: icons.whatsapp,
  },
  {
    id: "saude",
    setor: "Assistência à Saúde",
    horario: "Seg. a sex., 8h às 17h",
    canal: "WhatsApp",
    href: "https://wa.me/5571987943414",
    icon: icons.whatsapp,
  },
];

/** Canais exibidos ao dependente — atendimento assistencial, sem pauta financeira. */
const canaisDependente: SupportChannel[] = canaisAtendimentoDependente
  .filter((c) => !!c.whatsapp)
  .map((c) => ({
    id: c.id,
    setor: c.setor,
    horario: c.horario,
    canal: "WhatsApp",
    href: linkWhatsApp(c.whatsapp!, `Olá! Sou dependente e preciso de atendimento do setor ${c.setor}.`),
    icon: icons.whatsapp,
  }));

const statusSolicitacao = (s?: string | null) => (s ?? "").toLowerCase();
const emAberto = (s?: string | null) => !["concluida", "concluída", "cancelada", "fechada"].includes(statusSolicitacao(s));

/** Home do Portal (associado e dependente), montada por perfil. */
export default function ExternalDashboard({ profileType }: { profileType: PortalProfile }) {
  console.log("[ExternalDashboard] Mount", { profileType });
  const { associado, dependentes, dependenteLogado } = useAssociado();
  const isDependente = profileType === "dependent";
  const { items: notificacoes, loading: loadingNotificacoes } = useNotificacoes();
  const { solicitacoes, documentos, eventos, parceiros } = usePortalDashboardData(!!associado);

  const permitido = useMemo(
    () => new Set(getNavigationItems({ profile: profileType }).map((i) => i.route)),
    [profileType],
  );
  const podeVer = (route: string) => permitido.has(route);

  const abertas = solicitacoes.data.filter((s) => emAberto(s.status));
  const naoLidas = notificacoes.filter((n) => !n.lida).length;

  const summary: SummaryItem[] = [
    {
      id: "vinculo",
      icon: icons.carteirinha,
      title: "Situação do vínculo",
      value: (isDependente ? dependenteLogado?.status : associado?.status) !== 'regular' ? "Inativo" : "Ativo",
      context: isDependente ? "Dependente vinculado ao titular" : "Associado titular",
      status: {
        label: (isDependente ? dependenteLogado?.status : associado?.status) !== 'regular' ? "Regularizar" : "Em dia",
        tone: (isDependente ? dependenteLogado?.status : associado?.status) !== 'regular' ? "warning" : "success",
      },
      route: "/dashboard/carteirinha",
      actionLabel: "Ver carteirinha",
    },
    isDependente
      ? {
          id: "documentos",
          icon: icons.pasta,
          title: "Meus documentos",
          value: documentos.data.length,
          context: "Documentos disponíveis para você",
          route: "/dashboard/documentos",
          actionLabel: "Abrir documentos",
          loading: documentos.loading,
          error: !!documentos.error,
          empty: !documentos.data.length,
        }
      : {
          id: "dependentes",
          icon: icons.dependentes,
          title: "Dependentes ativos",
          value: dependentes.filter((d) => d.status === 'regular').length,
          context: dependentes.length ? `${dependentes.length} cadastrado(s)` : "Nenhum dependente cadastrado",
          route: "/dashboard/dependentes",
          actionLabel: "Gerenciar",
          empty: !dependentes.length,
        },
    {
      id: "solicitacoes",
      icon: icons.solicitacao,
      title: "Solicitações em aberto",
      value: abertas.length,
      context: abertas.length ? "Acompanhe o andamento" : "Nenhuma solicitação em aberto",
      route: "/dashboard/solicitacoes",
      actionLabel: "Acompanhar",
      loading: solicitacoes.loading,
      error: !!solicitacoes.error,
      empty: !abertas.length,
    },
    {
      id: "rede",
      icon: icons.saude,
      title: "Rede credenciada",
      value: parceiros.data.total,
      context: parceiros.data.cidades ? `${parceiros.data.cidades} cidade(s) atendida(s)` : "Parceiros conveniados",
      route: "/dashboard/clinicas",
      actionLabel: "Consultar rede",
      loading: parceiros.loading,
      error: !!parceiros.error,
      empty: !parceiros.data.total,
    },
  ];

  const todasAcoes: QuickAction[] = [
    { id: "carteirinha", icon: icons.carteirinha, title: "Carteirinha", description: "Identificação digital", route: "/dashboard/carteirinha", profiles: ["associate", "dependent"] },
    { id: "solicitacoes", icon: icons.solicitacao, title: "Solicitações", description: "Abrir e acompanhar", route: "/dashboard/solicitacoes", badge: abertas.length || undefined, profiles: ["associate", "dependent"] },
    { id: "documentos", icon: icons.pasta, title: "Documentos", description: "Arquivos e declarações", route: "/dashboard/documentos", profiles: ["associate", "dependent"] },
    { id: "dependentes", icon: icons.dependentes, title: "Dependentes", description: "Gestão do núcleo", route: "/dashboard/dependentes", profiles: ["associate"] },
    { id: "informes", icon: icons.documento, title: "Informe de rendimentos", description: "Imposto de renda", route: "/dashboard/informes", profiles: ["associate"] },
    { id: "financeiro", icon: icons.financeiro, title: "Financeiro", description: "Mensalidades", route: "/dashboard/financeiro", profiles: ["associate"] },
    { id: "peculio", icon: icons.previdencia, title: "Pecúlio", description: "Beneficiários", route: "/dashboard/peculio", profiles: ["associate"] },
    { id: "solicitar-peculio", icon: icons.previdencia, title: "Solicitar pecúlio", description: "Abrir pedido", route: "/dashboard/solicitar-peculio", profiles: ["dependent"] },
    { id: "clinicas", icon: icons.saude, title: "Rede credenciada", description: "Clínicas e parceiros", route: "/dashboard/clinicas", profiles: ["associate", "dependent"] },
    { id: "notificacoes", icon: icons.notificacao, title: "Notificações", description: "Avisos da SBPM", route: "/dashboard/notificacoes", badge: naoLidas || undefined, profiles: ["associate", "dependent"] },
    { id: "meu-titular", icon: icons.associados, title: "Meu titular", description: "Vínculo responsável", route: "/dashboard/meu-titular", profiles: ["dependent"] },
    { id: "perfil", icon: icons.perfil, title: "Meus dados", description: "Cadastro e contato", route: "/dashboard/perfil", profiles: ["associate", "dependent"] },
    { id: "faq", icon: icons.ajuda, title: "Ajuda", description: "Perguntas frequentes", route: "/dashboard/faq", profiles: ["associate", "dependent"] },
  ].filter((a) => a.profiles.includes(profileType) && podeVer(a.route)) as QuickAction[];

  const servicos: ServiceItem[] = [
    { id: "clinicas", icon: icons.saude, title: "Clínicas e parceiros", description: "Consulte a rede credenciada por especialidade e cidade.", route: "/dashboard/clinicas", profiles: ["associate", "dependent"] },
    { id: "beneficios", icon: icons.solicitacao, title: "Benefícios e cupons", description: "Vantagens exclusivas para associados.", route: "/dashboard/beneficios", profiles: ["associate"] },
    { id: "agenda", icon: icons.agenda, title: "Agenda de eventos", description: "Programação institucional da SBPM.", route: "/dashboard/agenda", profiles: ["associate", "dependent"] },
    { id: "peculio", icon: icons.previdencia, title: "Pecúlio", description: "Entenda o benefício e indique beneficiários.", route: "/dashboard/peculio", profiles: ["associate"] },
    { id: "solicitar-peculio", icon: icons.previdencia, title: "Solicitar pecúlio", description: "Abra a solicitação com os documentos exigidos.", route: "/dashboard/solicitar-peculio", profiles: ["dependent"] },
    { id: "simulador", icon: icons.relatorio, title: "Simulador de mensalidade", description: "Simule a contribuição do seu plano.", route: "/dashboard/simulador", profiles: ["associate"] },
    { id: "avaliar", icon: icons.avaliacao, title: "Avaliar parceiros", description: "Compartilhe sua experiência com a rede.", route: "/dashboard/avaliar", profiles: ["associate", "dependent"] },
    { id: "associacao-premiada", icon: icons.avaliacao, title: "Associação premiada", description: "Indique novos associados e concorra a prêmios.", route: "/dashboard/associacao-premiada", profiles: ["associate"] },
  ].filter((s) => s.profiles.includes(profileType) && podeVer(s.route)) as ServiceItem[];

  const pendencias: PendingItem[] = [];
  if (!isDependente && !associado?.email) {
    pendencias.push({ id: "email", icon: icons.email, title: "Confirme seu e-mail de contato", description: "Necessário para receber avisos e informes oficiais.", priority: "critica", route: "/dashboard/perfil", actionLabel: "Atualizar" });
  }
  if (!isDependente && !associado?.telefone) {
    pendencias.push({ id: "telefone", icon: icons.telefone, title: "Cadastre um telefone de contato", description: "Usado pela Previdência e Assistência à Saúde.", priority: "pendente", route: "/dashboard/perfil", actionLabel: "Atualizar" });
  }
  abertas.slice(0, 3).forEach((s) =>
    pendencias.push({
      id: `sol-${s.id}`,
      icon: icons.solicitacao,
      title: s.assunto || "Solicitação em andamento",
      description: s.protocolo ? `Protocolo ${s.protocolo}` : undefined,
      date: s.updated_at ?? s.created_at,
      priority: "informativa",
      statusLabel: s.status ?? "Em análise",
      route: "/dashboard/solicitacoes",
      actionLabel: "Acompanhar",
    }),
  );
  eventos.data.slice(0, 1).forEach((e) =>
    pendencias.push({
      id: `ev-${e.id}`,
      icon: icons.agenda,
      title: e.titulo,
      description: e.local ?? "Evento institucional",
      date: e.data_inicio,
      priority: "informativa",
      statusLabel: "Evento",
      route: "/dashboard/agenda",
      actionLabel: "Ver agenda",
    }),
  );

  const perfilStatus = {
    cadastroAtualizado: !!(associado?.endereco && associado?.nome),
    emailConfirmado: isDependente ? !!dependenteLogado?.email : !!associado?.email,
    telefoneConfirmado: isDependente ? !!dependenteLogado?.telefone : !!associado?.telefone,
    doisFatoresAtivo: true,
    origem: "Cadastro institucional SBPM",
    ultimaSincronizacao: null,
    pendencias: pendencias.filter((p) => p.priority !== "informativa").map((p) => p.title),
  };

  return (
    <div className="space-y-8 animate-fade-in">
      <DashboardWelcomeHero
        profileType={profileType}
        user={{
          nome: isDependente && dependenteLogado ? dependenteLogado.nome : associado?.nome ?? "",
          fotoUrl: isDependente && dependenteLogado ? dependenteLogado.foto_url : associado?.foto_url,
          matricula: associado?.matricula,
          titularNome: associado?.nome,
          vinculoAtivo: isDependente ? dependenteLogado?.status === 'regular' : associado?.status === 'regular',
          associadoDesde: associado?.data_admissao,
          parentesco: isDependente && dependenteLogado ? tipoLabel[dependenteLogado.tipo] : null,
        }}
      />

      <DashboardSection
        title="Resumo do seu vínculo"
        description="Indicadores principais do seu perfil na SBPM."
        level={1}
        loading={false}
        skeleton={<DashboardGridSkeleton />}
      >
        <DashboardSummaryGrid items={summary} />
      </DashboardSection>

      <DashboardSection title="Ações rápidas" description="Atalhos para o que você mais usa.">
        <DashboardQuickActions actions={todasAcoes} />
      </DashboardSection>

      <DashboardSection
        title="Para você"
        description="Pendências, avisos e acompanhamentos."
        loading={solicitacoes.loading}
        error={solicitacoes.error}
        onRetry={solicitacoes.reload}
        fullPageRoute="/dashboard/solicitacoes"
        skeleton={<DashboardListSkeleton />}
      >
        <DashboardPendingSection items={pendencias} />
      </DashboardSection>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
        <DashboardSection
          title={isDependente ? "Meu titular" : "Meus dependentes"}
          description={isDependente ? "Vínculo responsável pelo seu cadastro." : "Pessoas vinculadas ao seu cadastro."}
          action={
            !isDependente ? (
              <Button size="sm" variant="ghost" rightIcon={icons.proximo} asChild>
                <Link to="/dashboard/dependentes">Ver todos</Link>
              </Button>
            ) : undefined
          }
        >
          <DashboardRelatedPeople
            maskNames={isDependente}
            people={
              isDependente
                ? associado
                  ? [{ id: associado.id, nome: associado.nome, parentesco: "Associado titular", ativo: associado.status === 'regular' }]
                  : []
                : dependentes.slice(0, 6).map((d) => ({
                    id: d.id,
                    nome: d.nome,
                    parentesco: tipoLabel[d.tipo],
                    ativo: d.status === 'regular',
                    fotoUrl: d.foto_url,
                  }))
            }
            emptyTitle={isDependente ? "Titular não identificado." : "Nenhum dependente cadastrado."}
            emptyDescription={
              isDependente ? "Procure a Previdência para regularizar seu vínculo." : "Você pode solicitar a inclusão de dependentes."
            }
            actionLabel={isDependente ? undefined : "Incluir dependente"}
            actionRoute={isDependente ? undefined : "/dashboard/dependentes"}
          />
        </DashboardSection>

        <DashboardSection
          title="Mensagens recentes"
          description="Comunicados e avisos da SBPM."
          action={
            <Button size="sm" variant="ghost" rightIcon={icons.proximo} asChild>
              <Link to="/dashboard/notificacoes">Ver todas</Link>
            </Button>
          }
          loading={loadingNotificacoes && !notificacoes.length}
          skeleton={<DashboardListSkeleton />}
        >
          <DashboardNotificationList items={notificacoes} />
        </DashboardSection>
      </div>

      <DashboardSection title="Serviços disponíveis" description="Recursos liberados para o seu perfil.">
        <DashboardServicesSection services={servicos} />
      </DashboardSection>

      <DashboardSection title="Minha conta" description="Situação cadastral e segurança." level={3}>
        <DashboardProfileStatus data={perfilStatus} />
      </DashboardSection>

      <DashboardSection
        id="atendimento"
        title="Precisa de ajuda?"
        description="Canais oficiais de atendimento da SBPM."
        level={3}
        action={
          <Button size="sm" variant="ghost" rightIcon={icons.proximo} asChild>
            <Link to="/dashboard/faq">Perguntas frequentes</Link>
          </Button>
        }
      >
        <DashboardSupportPreview channels={isDependente ? canaisDependente : canais} />
      </DashboardSection>

      <DashboardLastUpdated date={new Date().toISOString()} />
    </div>
  );
}
