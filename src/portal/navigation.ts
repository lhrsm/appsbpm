/**
 * Configuração central da navegação do Portal externo (associado e dependente).
 *
 * REGRA: nenhum componente deve repetir manualmente itens de menu.
 * Header, sidebar, drawer, busca e navegação inferior consomem daqui.
 *
 * "Limite disponível" foi removido do portal externo e não deve retornar.
 */
import { icons, type LucideIcon } from "@/design-system/icons";

export type PortalProfile = "associate" | "dependent";

export interface PortalNavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  route: string;
  allowedProfiles: PortalProfile[];
  requiredPermissions?: string[];
  badge?: number;
  status?: "ativo" | "indisponivel";
  keywords?: string[];
  children?: PortalNavItem[];
  order?: number;
}

export interface PortalNavSection {
  id: string;
  section: string;
  items: PortalNavItem[];
  order?: number;
}

const AMBOS: PortalProfile[] = ["associate", "dependent"];
const TITULAR: PortalProfile[] = ["associate"];
const DEPENDENTE: PortalProfile[] = ["dependent"];

export const portalNavigation: PortalNavSection[] = [
  {
    id: "inicio",
    section: "Início",
    order: 1,
    items: [
      {
        id: "visao-geral",
        label: "Visão Geral",
        icon: icons.dashboard,
        route: "/dashboard",
        allowedProfiles: AMBOS,
        keywords: ["início", "home", "painel", "resumo"],
        order: 1,
      },
    ],
  },
  {
    id: "vinculo",
    section: "Meu vínculo",
    order: 2,
    items: [
      {
        id: "carteirinha",
        label: "Carteirinha",
        icon: icons.carteirinha,
        route: "/dashboard/carteirinha",
        allowedProfiles: AMBOS,
        keywords: ["identificação", "cartão", "id digital"],
        order: 1,
      },
      {
        id: "dependentes",
        label: "Dependentes",
        icon: icons.dependentes,
        route: "/dashboard/dependentes",
        allowedProfiles: TITULAR,
        keywords: ["filhos", "cônjuge", "beneficiários"],
        order: 2,
      },
      {
        id: "situacao-vinculo",
        label: "Situação do vínculo",
        icon: icons.previdencia,
        route: "/dashboard/vinculo",
        allowedProfiles: TITULAR,
        keywords: ["vínculo", "situação", "associação", "status"],
        order: 3,
      },
      {
        id: "dados-cadastrais",
        label: "Meus dados",
        icon: icons.perfil,
        route: "/dashboard/meus-dados",
        allowedProfiles: TITULAR,
        keywords: ["cadastro", "endereço", "telefone", "e-mail"],
        order: 4,
      },
      {
        id: "dados-cadastrais-dependente",
        label: "Meus dados",
        icon: icons.perfil,
        route: "/dashboard/perfil",
        allowedProfiles: DEPENDENTE,
        keywords: ["cadastro", "endereço", "telefone", "e-mail"],
        order: 4,
      },
      {
        id: "documentos",
        label: "Meus documentos",
        icon: icons.pasta,
        route: "/dashboard/documentos",
        allowedProfiles: AMBOS,
        keywords: ["arquivos", "declarações", "comprovantes"],
        order: 4,
      },
      {
        id: "associacao-premiada",
        label: "Associação premiada",
        icon: icons.avaliacao,
        route: "/dashboard/associacao-premiada",
        allowedProfiles: TITULAR,
        keywords: ["indicação", "prêmio", "campanha"],
        order: 5,
      },
    ],
  },
  {
    id: "financeiro",
    section: "Financeiro e benefícios",
    order: 3,
    items: [
      {
        id: "financeiro",
        label: "Financeiro",
        icon: icons.financeiro,
        route: "/dashboard/financeiro",
        allowedProfiles: TITULAR,
        keywords: ["mensalidade", "boleto", "pagamento"],
        order: 1,
      },
      {
        id: "informes",
        label: "Informe de rendimentos",
        icon: icons.documento,
        route: "/dashboard/informes",
        allowedProfiles: TITULAR,
        keywords: ["imposto de renda", "ir", "declaração"],
        order: 2,
      },
      {
        id: "beneficios",
        label: "Benefícios e cupons",
        icon: icons.solicitacao,
        route: "/dashboard/beneficios",
        allowedProfiles: TITULAR,
        keywords: ["descontos", "vantagens", "cupom"],
        order: 3,
      },
      {
        id: "simulador",
        label: "Simulador de mensalidade",
        icon: icons.relatorio,
        route: "/dashboard/simulador",
        allowedProfiles: TITULAR,
        keywords: ["simulação", "contribuição", "plano"],
        order: 4,
      },
    ],
  },
  {
    id: "saude",
    section: "Saúde e rede",
    order: 4,
    items: [
      {
        id: "clinicas",
        label: "Clínicas e parceiros",
        icon: icons.saude,
        route: "/dashboard/clinicas",
        allowedProfiles: AMBOS,
        keywords: ["rede credenciada", "convênio", "conveniados"],
        order: 1,
      },
      {
        id: "agenda",
        label: "Agenda de eventos",
        icon: icons.agenda,
        route: "/dashboard/agenda",
        allowedProfiles: AMBOS,
        keywords: ["eventos", "calendário"],
        order: 2,
      },
      {
        id: "avaliar",
        label: "Avaliar parceiros",
        icon: icons.avaliacao,
        route: "/dashboard/avaliar",
        allowedProfiles: AMBOS,
        keywords: ["nota", "opinião", "feedback"],
        order: 3,
      },
      {
        id: "peculio",
        label: "Pecúlio",
        icon: icons.previdencia,
        route: "/dashboard/peculio",
        allowedProfiles: TITULAR,
        keywords: ["beneficiários", "seguro"],
        order: 4,
      },
      {
        id: "solicitar-peculio",
        label: "Solicitar pecúlio",
        icon: icons.previdencia,
        route: "/dashboard/solicitar-peculio",
        allowedProfiles: DEPENDENTE,
        keywords: ["pecúlio", "solicitação"],
        order: 5,
      },
    ],
  },
  {
    id: "servicos",
    section: "Serviços",
    order: 5,
    items: [
      {
        id: "solicitacoes",
        label: "Solicitações",
        icon: icons.solicitacao,
        route: "/dashboard/solicitacoes",
        allowedProfiles: AMBOS,
        keywords: ["chamados", "protocolos", "atendimentos"],
        order: 1,
      },
      {
        id: "indicar-parceiro",
        label: "Indicar parceiro",
        icon: icons.adicionar,
        route: "/dashboard/indicar-parceiro",
        allowedProfiles: TITULAR,
        keywords: ["credenciamento", "sugestão"],
        order: 2,
      },
      {
        id: "atendimento",
        label: "Canais de atendimento",
        icon: icons.whatsapp,
        route: "/dashboard/atendimento",
        allowedProfiles: AMBOS,
        keywords: ["whatsapp", "telefone", "contato", "suporte"],
        order: 3,
      },
    ],
  },
  {
    id: "conta",
    section: "Conta e segurança",
    order: 6,
    items: [
      {
        id: "notificacoes",
        label: "Notificações",
        icon: icons.notificacao,
        route: "/dashboard/notificacoes",
        allowedProfiles: AMBOS,
        keywords: ["avisos", "alertas"],
        order: 1,
      },
      {
        id: "privacidade",
        label: "Privacidade e LGPD",
        icon: icons.lgpd,
        route: "/dashboard/minha-privacidade",
        allowedProfiles: AMBOS,
        keywords: ["dados pessoais", "consentimento", "lgpd"],
        order: 2,
      },
      {
        id: "historico",
        label: "Histórico de acessos",
        icon: icons.horario,
        route: "/dashboard/historico",
        allowedProfiles: AMBOS,
        keywords: ["sessões", "segurança", "logins"],
        order: 3,
      },
      {
        id: "faq",
        label: "Perguntas frequentes",
        icon: icons.ajuda,
        route: "/dashboard/faq",
        allowedProfiles: AMBOS,
        keywords: ["dúvidas", "ajuda", "faq"],
        order: 4,
      },
    ],
  },
];

/** Rotas do portal externo desativadas — redirecionam para a visão geral. */
export const deprecatedPortalRoutes: Record<string, string> = {
  "/dashboard/limite": "/dashboard",
};

export interface NavFilterOptions {
  profile: PortalProfile;
  /** Permissões concedidas ao vínculo (quando aplicável). */
  permissions?: string[];
  /** Flags de módulos indisponíveis. */
  disabledFeatures?: string[];
}

function itemAllowed(item: PortalNavItem, { profile, permissions, disabledFeatures }: NavFilterOptions) {
  if (!item.allowedProfiles.includes(profile)) return false;
  if (item.status === "indisponivel") return false;
  if (disabledFeatures?.includes(item.id)) return false;
  if (item.requiredPermissions?.length) {
    const granted = permissions ?? [];
    if (!item.requiredPermissions.every((p) => granted.includes(p))) return false;
  }
  return true;
}

/** Retorna as seções visíveis para o perfil/permissões informados. */
export function getNavigationSections(options: NavFilterOptions): PortalNavSection[] {
  return portalNavigation
    .map((section) => ({
      ...section,
      items: section.items
        .filter((item) => itemAllowed(item, options))
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0)),
    }))
    .filter((section) => section.items.length > 0)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
}

/** Lista plana de itens autorizados (usada pela busca global). */
export function getNavigationItems(options: NavFilterOptions): PortalNavItem[] {
  return getNavigationSections(options).flatMap((s) => s.items);
}

/** Verifica se uma rota do portal é permitida ao perfil. */
export function isRouteAllowed(pathname: string, options: NavFilterOptions): boolean {
  if (pathname === "/dashboard") return true;
  const items = getNavigationItems(options);
  return items.some((i) => i.route.split("#")[0] === pathname);
}

/** Rótulo legível de uma rota (breadcrumbs). */
export function getRouteLabel(pathname: string): string | undefined {
  for (const section of portalNavigation) {
    for (const item of section.items) {
      if (item.route.split("#")[0] === pathname) return item.label;
    }
  }
  return undefined;
}

/** Itens da navegação inferior no mobile (máx. 5). */
export const bottomNavIds = ["visao-geral", "carteirinha", "solicitacoes", "atendimento", "dados-cadastrais"];
