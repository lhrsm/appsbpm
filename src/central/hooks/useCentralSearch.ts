/**
 * Pesquisa global unificada da Central (Fase 9, §22).
 *
 * Percorre FAQ, tutoriais, downloads, notícias, avisos e protocolos do próprio
 * usuário, devolvendo resultados tipados e ordenados por relevância.
 */
import { useMemo } from "react";
import { ARTIGOS } from "@/lib/tutoriais";
import { interpretarConsultaProtocolo, protocoloCombina } from "../protocolo";
import { getCentralStatus } from "../status";
import { useAvisos, useDownloads, useFaq, useNoticias, useProtocolos } from "./useRelationship";
import type { CentralSearchResult } from "../types";

/** Remove acentos e caixa para comparação tolerante. */
export const slugify = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

/** Pontua um item pelos termos encontrados em título (peso 3) e corpo (peso 1). */
function pontuar(termos: string[], titulo: string, corpo: string) {
  const t = slugify(titulo);
  const c = slugify(corpo);
  let score = 0;
  for (const termo of termos) {
    if (t.includes(termo)) score += 3;
    if (c.includes(termo)) score += 1;
  }
  return termos.every((termo) => t.includes(termo) || c.includes(termo)) ? score : 0;
}

export function useCentralSearch(consulta: string) {
  const { faqs, loading: lFaq } = useFaq();
  const { downloads, loading: lDown } = useDownloads();
  const { noticias, loading: lNot } = useNoticias();
  const { avisos, loading: lAvi } = useAvisos();
  const { protocolos, loading: lProt } = useProtocolos();

  const resultados = useMemo<CentralSearchResult[]>(() => {
    const termos = slugify(consulta).split(/\s+/).filter((t) => t.length >= 2);
    if (!termos.length) return [];

    const itens: CentralSearchResult[] = [];
    const adicionar = (
      base: Omit<CentralSearchResult, "score">,
      titulo: string,
      corpo: string,
      bonus = 0,
    ) => {
      const score = pontuar(termos, titulo, corpo);
      if (score > 0) itens.push({ ...base, score: score + bonus });
    };

    // Protocolo exato tem prioridade máxima.
    const consultaProtocolo = interpretarConsultaProtocolo(consulta);
    protocolos.forEach((p) => {
      const exato = consultaProtocolo ? protocoloCombina(p.protocolo, consultaProtocolo) : false;
      const base = {
        id: p.id,
        tipo: "solicitacao" as const,
        titulo: `${p.protocolo} — ${p.assunto}`,
        descricao: `${getCentralStatus(p.status).label} · ${p.descricao.slice(0, 100)}`,
        route: `/dashboard/central/protocolos/${p.id}`,
      };
      if (exato) itens.push({ ...base, score: 100 });
      else adicionar(base, `${p.protocolo} ${p.assunto}`, p.descricao, 2);
    });

    faqs.forEach((f) =>
      adicionar(
        { id: f.id, tipo: "faq", titulo: f.pergunta, descricao: f.resposta.slice(0, 120), route: `/dashboard/central/faq?q=${encodeURIComponent(f.pergunta)}` },
        f.pergunta,
        `${f.resposta} ${f.tags.join(" ")}`,
        1,
      ),
    );

    ARTIGOS.forEach((a) =>
      adicionar(
        { id: a.id, tipo: "tutorial", titulo: a.titulo, descricao: a.resumo, route: `/dashboard/central/tutoriais?artigo=${a.id}` },
        a.titulo,
        `${a.resumo} ${a.palavras.join(" ")} ${a.categoria}`,
      ),
    );

    downloads.forEach((d) =>
      adicionar(
        { id: d.id, tipo: "documento", titulo: d.nome, descricao: d.descricao ?? d.categoria, route: "/dashboard/central/downloads" },
        d.nome,
        `${d.descricao ?? ""} ${d.categoria}`,
      ),
    );

    noticias.forEach((n) =>
      adicionar(
        { id: n.id, tipo: "noticia", titulo: n.titulo, descricao: n.resumo, route: `/dashboard/central/noticias?id=${n.id}` },
        n.titulo,
        `${n.resumo} ${n.conteudo ?? ""}`,
      ),
    );

    avisos.forEach((a) =>
      adicionar(
        { id: a.id, tipo: "noticia", titulo: a.titulo, descricao: a.mensagem.slice(0, 120), route: "/dashboard/central/avisos" },
        a.titulo,
        a.mensagem,
      ),
    );

    return itens.sort((a, b) => (b.score ?? 0) - (a.score ?? 0)).slice(0, 40);
  }, [consulta, faqs, downloads, noticias, avisos, protocolos]);

  const agrupados = useMemo(() => {
    const mapa = new Map<CentralSearchResult["tipo"], CentralSearchResult[]>();
    resultados.forEach((r) => mapa.set(r.tipo, [...(mapa.get(r.tipo) ?? []), r]));
    return mapa;
  }, [resultados]);

  return {
    resultados,
    agrupados,
    loading: lFaq || lDown || lNot || lAvi || lProt,
    vazio: !!consulta.trim() && resultados.length === 0,
  };
}

export const rotulosTipoBusca: Record<CentralSearchResult["tipo"], string> = {
  faq: "Perguntas frequentes",
  tutorial: "Tutoriais",
  solicitacao: "Minhas solicitações",
  documento: "Downloads",
  noticia: "Notícias e avisos",
  parceiro: "Parceiros",
  beneficio: "Benefícios",
  evento: "Eventos",
};
