import { describe, it, expect } from "vitest";
import {
  getNavigationSections,
  getNavigationItems,
  isRouteAllowed,
  getRouteLabel,
  deprecatedPortalRoutes,
  bottomNavIds,
} from "./navigation";
import { maskMatricula, maskNome, maskEmail } from "./mask";

const associate = { profile: "associate" as const };
const dependent = { profile: "dependent" as const };

describe("navegação do portal externo", () => {
  it("nunca expõe 'Limite disponível' em nenhum perfil", () => {
    for (const opts of [associate, dependent]) {
      const items = getNavigationItems(opts);
      expect(items.some((i) => /limite/i.test(i.label))).toBe(false);
      expect(items.some((i) => i.route.includes("/limite"))).toBe(false);
    }
  });

  it("monta o menu do associado com todas as seções", () => {
    const sections = getNavigationSections(associate);
    expect(sections.map((s) => s.id)).toEqual([
      "inicio",
      "vinculo",
      "financeiro",
      "saude",
      "servicos",
      "conta",
    ]);
  });

  it("oculta do dependente os recursos exclusivos do titular", () => {
    const ids = getNavigationItems(dependent).map((i) => i.id);
    for (const proibido of [
      "dependentes",
      "informes",
      "financeiro",
      "beneficios",
      "simulador",
      "associacao-premiada",
      "indicar-parceiro",
      "peculio",
    ]) {
      expect(ids).not.toContain(proibido);
    }
    expect(ids).toContain("solicitar-peculio");
    expect(getNavigationSections(dependent).map((s) => s.id)).not.toContain("financeiro");
  });

  it("protege rotas não autorizadas por perfil", () => {
    expect(isRouteAllowed("/dashboard/informes", associate)).toBe(true);
    expect(isRouteAllowed("/dashboard/informes", dependent)).toBe(false);
    expect(isRouteAllowed("/dashboard/limite", associate)).toBe(false);
    expect(isRouteAllowed("/dashboard", dependent)).toBe(true);
  });

  it("respeita permissões obrigatórias", () => {
    const semPermissao = getNavigationItems({
      profile: "associate",
      disabledFeatures: ["financeiro"],
    }).map((i) => i.id);
    expect(semPermissao).not.toContain("financeiro");
  });

  it("resolve rótulos de breadcrumbs sem rotas técnicas", () => {
    expect(getRouteLabel("/dashboard/carteirinha")).toBe("Carteirinha");
    expect(getRouteLabel("/dashboard/limite")).toBeUndefined();
  });

  it("redireciona rotas depreciadas para a visão geral", () => {
    expect(deprecatedPortalRoutes["/dashboard/limite"]).toBe("/dashboard");
  });

  it("limita a navegação inferior a cinco atalhos", () => {
    expect(bottomNavIds.length).toBeLessThanOrEqual(5);
    const ids = getNavigationItems(dependent).map((i) => i.id);
    const visiveis = bottomNavIds.filter((id) => ids.includes(id));
    expect(visiveis.length).toBeGreaterThanOrEqual(2);
  });
});

describe("máscaras de segurança visual", () => {
  it("mascara matrícula", () => {
    expect(maskMatricula("123456")).toBe("***456");
    expect(maskMatricula(null)).toBe("—");
  });

  it("mascara nome do titular", () => {
    expect(maskNome("João Carlos Silva")).toBe("J*** S****");
  });

  it("mascara e-mail", () => {
    expect(maskEmail("associado@sbpm.com.br")).toContain("@sbpm.com.br");
    expect(maskEmail("associado@sbpm.com.br").startsWith("as*")).toBe(true);
  });
});
