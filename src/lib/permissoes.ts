export type PermAcao =
  | "visualizar"
  | "criar"
  | "editar"
  | "excluir"
  | "aprovar"
  | "exportar"
  | "configurar";

export const ACOES: { value: PermAcao; label: string }[] = [
  { value: "visualizar", label: "Visualização" },
  { value: "criar", label: "Criação" },
  { value: "editar", label: "Edição" },
  { value: "excluir", label: "Exclusão" },
  { value: "aprovar", label: "Aprovação" },
  { value: "exportar", label: "Exportação" },
  { value: "configurar", label: "Configuração" },
];

export const MODULOS: { value: string; label: string }[] = [
  { value: "previdencia", label: "Previdência" },
  { value: "saude", label: "Assistência à Saúde" },
  { value: "financeiro", label: "Financeiro" },
  { value: "patrimonio", label: "Patrimônio" },
  { value: "contabilidade", label: "Contabilidade" },
  { value: "associados", label: "Associados" },
  { value: "dependentes", label: "Dependentes" },
  { value: "peculio", label: "Pecúlio" },
  { value: "informes", label: "Informes" },
  { value: "limites", label: "Limites" },
  { value: "carencias", label: "Carências" },
  { value: "clinicas", label: "Clínicas e parceiros" },
  { value: "avaliacoes", label: "Avaliações" },
  { value: "documentos", label: "Documentos" },
  { value: "solicitacoes", label: "Solicitações" },
  { value: "comunicados", label: "Comunicados" },
  { value: "eventos", label: "Eventos" },
  { value: "faq", label: "FAQ" },
  { value: "notificacoes", label: "Notificações" },
  { value: "relatorios", label: "Relatórios" },
  { value: "integracoes", label: "Integrações" },
  { value: "importacoes", label: "Importações" },
  { value: "auditoria", label: "Auditoria" },
  { value: "privacidade", label: "Privacidade (LGPD)" },
  { value: "seguranca", label: "Segurança" },
  { value: "usuarios", label: "Usuários e permissões" },
  { value: "configuracoes", label: "Configurações" },
];

/** Mapa rota do admin -> módulo exigido para visualização. */
export const ROTA_MODULO: Record<string, string> = {
  "/admin": "*",
  "/admin/previdencia": "previdencia",
  "/admin/saude": "saude",
  "/admin/financeiro": "financeiro",
  "/admin/patrimonio": "patrimonio",
  "/admin/contabilidade": "contabilidade",
  "/admin/associados": "associados",
  "/admin/dependentes": "dependentes",
  "/admin/integracoes": "integracoes",
  "/admin/relatorios": "relatorios",
  "/admin/auditoria": "auditoria",
  "/admin/usuarios": "usuarios",
  "/admin/configuracoes": "configuracoes",
  "/admin/painel": "relatorios",
  "/admin/analytics": "relatorios",
  "/admin/comunicados": "comunicados",
  "/admin/eventos": "eventos",
  "/admin/faq": "faq",
  "/admin/avaliacoes": "avaliacoes",
  "/admin/notificacoes": "notificacoes",
  "/admin/solicitacoes": "solicitacoes",
  "/admin/documentos": "documentos",
  "/admin/limites": "limites",
  "/admin/carencias": "carencias",
  "/admin/clinicas": "clinicas",
  "/admin/informes": "informes",
  "/admin/peculio": "peculio",
  "/admin/importar": "importacoes",
  "/admin/sincronizacao": "integracoes",
  "/admin/automacoes": "integracoes",
  "/admin/privacidade": "privacidade",
  "/admin/seguranca": "seguranca",
  "/admin/assinatura-icp": "configuracoes",
  "/admin/componentes": "configuracoes",
  "/admin/aniversariantes": "associados",
  "/admin/sobre": "*",
};

export const rotaParaModulo = (pathname: string): string => {
  if (ROTA_MODULO[pathname]) return ROTA_MODULO[pathname];
  const base = Object.keys(ROTA_MODULO)
    .filter((r) => r !== "/admin" && pathname.startsWith(r + "/"))
    .sort((a, b) => b.length - a.length)[0];
  return base ? ROTA_MODULO[base] : "*";
};

export const labelModulo = (m: string) =>
  m === "*" ? "Todos os módulos" : MODULOS.find((x) => x.value === m)?.label ?? m;

export const labelAcao = (a: string) =>
  ACOES.find((x) => x.value === a)?.label ?? a;
