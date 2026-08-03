import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { useA11y } from "./preferences";

const SUFFIX = "Portal da SBPM";

/** Títulos legíveis por rota (WCAG 2.4.2). */
const TITLES: Record<string, string> = {
  "/": "Boas-vindas",
  "/entrar": "Entrar na conta",
  "/primeiro-acesso": "Primeiro acesso",
  "/recuperar-acesso": "Recuperar acesso",
  "/quero-me-associar": "Quero me associar",
  "/redefinir-senha": "Redefinir senha",
  "/acessibilidade": "Acessibilidade",
  "/privacidade": "Privacidade e LGPD",
  "/dashboard": "Painel",
  "/dashboard/carteirinha": "Carteirinha digital",
  "/dashboard/clinicas": "Clínicas e parceiros",
  "/dashboard/informes": "Informe de rendimentos",
  "/dashboard/dependentes": "Dependentes",
  "/dashboard/beneficios": "Benefícios",
  "/dashboard/agenda": "Eventos e agenda",
  "/dashboard/financeiro": "Financeiro",
  "/dashboard/documentos": "Meus documentos",
  "/dashboard/solicitacoes": "Solicitações",
  "/dashboard/solicitacoes/nova": "Nova solicitação",
  "/dashboard/atendimento": "Central de atendimento",
  "/dashboard/faq": "Perguntas frequentes",
  "/dashboard/perfil": "Meu perfil",
  "/dashboard/meus-dados": "Meus dados",
  "/dashboard/meu-titular": "Meu titular",
  "/dashboard/vinculo": "Meu vínculo",
  "/dashboard/seguranca": "Segurança da conta",
  "/dashboard/historico": "Histórico de acessos",
  "/dashboard/minha-privacidade": "Privacidade e LGPD",
  "/dashboard/preferencias": "Preferências",
  "/dashboard/notificacoes": "Notificações",
  "/dashboard/peculio": "Pecúlio",
  "/dashboard/solicitar-peculio": "Solicitar pecúlio",
  "/dashboard/associacao-premiada": "Associação premiada",
  "/dashboard/avaliar": "Avaliar clínicas",
  "/dashboard/simulador": "Simulador",
  "/dashboard/indicar-parceiro": "Indicar parceiro",
};

function titleFor(pathname: string): string {
  if (TITLES[pathname]) return TITLES[pathname];
  if (/^\/dashboard\/solicitacoes\/.+/.test(pathname)) return "Detalhes da solicitação";
  if (pathname.startsWith("/admin")) return "Administração";
  const last = pathname.split("/").filter(Boolean).pop();
  if (!last) return SUFFIX;
  return last.replace(/-/g, " ").replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * Atualiza o `document.title`, move o foco para o conteúdo principal e
 * anuncia a nova página a cada mudança de rota (WCAG 2.4.2, 3.2.3, 4.1.3).
 */
export default function RouteAnnouncer() {
  const { pathname } = useLocation();
  const first = useRef(true);
  const { announce } = useA11y();

  useEffect(() => {
    const label = titleFor(pathname);
    document.title = `${label} | ${SUFFIX}`;

    if (first.current) {
      first.current = false;
      return;
    }

    announce(`${label}. Página carregada.`);

    // Move o foco para o início do conteúdo, sem rolar bruscamente.
    const target =
      (document.getElementById("conteudo-principal") as HTMLElement | null) ??
      (document.querySelector("main") as HTMLElement | null);
    if (target) {
      if (!target.hasAttribute("tabindex")) target.setAttribute("tabindex", "-1");
      target.focus({ preventScroll: true });
    }
  }, [pathname, announce]);

  return null;
}
