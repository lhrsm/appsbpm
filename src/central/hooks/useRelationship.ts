/**
 * Hooks de consumo da Central de Relacionamento (Fase 9).
 *
 * Todas as telas leem daqui — nunca do Supabase nem da edge function direto.
 * Assim a troca para o SBPMSanitas fica restrita a `src/central/service`.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { relationshipService } from "../service";
import { isEmAberto, isFinalizado, normalizeCentralStatus } from "../status";
import type {
  CentralAviso,
  CentralDownload,
  CentralFaq,
  CentralFeedback,
  CentralNoticia,
  CentralProtocolo,
  NovaSolicitacaoInput,
} from "../types";

interface AsyncState<T> {
  data: T;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/** Executa um leitor do serviço com estados de carregamento e erro padronizados. */
function useServiceData<T>(loader: () => Promise<T>, fallback: T, deps: unknown[] = []): AsyncState<T> {
  const [data, setData] = useState<T>(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const loaderRef = useRef(loader);
  loaderRef.current = loader;

  useEffect(() => {
    let ativo = true;
    setLoading(true);
    setError(null);
    loaderRef
      .current()
      .then((resultado) => ativo && setData(resultado))
      .catch((err: unknown) => {
        if (!ativo) return;
        setError(err instanceof Error ? err.message : "Não foi possível carregar as informações.");
      })
      .finally(() => ativo && setLoading(false));
    return () => {
      ativo = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ...deps]);

  const reload = useCallback(() => setTick((t) => t + 1), []);
  return { data, loading, error, reload };
}

/* ---------------------------------------------------------- Protocolos */

export function useProtocolos() {
  const estado = useServiceData<CentralProtocolo[]>(() => relationshipService.listarProtocolos(), []);

  const resumo = useMemo(() => {
    const itens = estado.data;
    return {
      total: itens.length,
      emAberto: itens.filter((p) => isEmAberto(p.status)).length,
      aguardandoDocumentos: itens.filter((p) => p.status === "aguardando_documentos").length,
      respondidos: itens.filter((p) => p.status === "respondido").length,
      concluidos: itens.filter((p) => isFinalizado(p.status)).length,
      semAvaliacao: itens.filter((p) => isFinalizado(p.status) && !p.avaliado).length,
      ultimo: itens[0] ?? null,
    };
  }, [estado.data]);

  return { ...estado, protocolos: estado.data, resumo };
}

export function useProtocolo(idOuNumero?: string) {
  const estado = useServiceData<CentralProtocolo | null>(
    () => (idOuNumero ? relationshipService.obterProtocolo(idOuNumero) : Promise.resolve(null)),
    null,
    [idOuNumero],
  );
  return { ...estado, protocolo: estado.data };
}

/** Criação de solicitação com trava de submissão dupla. */
export function useCriarSolicitacao() {
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  const criar = useCallback(async (input: NovaSolicitacaoInput) => {
    setEnviando(true);
    setErro(null);
    try {
      return await relationshipService.criarSolicitacao(input);
    } catch (err) {
      const mensagem = err instanceof Error ? err.message : "Não foi possível registrar a solicitação.";
      setErro(mensagem);
      throw new Error(mensagem);
    } finally {
      setEnviando(false);
    }
  }, []);

  return { criar, enviando, erro };
}

export function useEnviarFeedback() {
  const [enviando, setEnviando] = useState(false);

  const enviar = useCallback(async (feedback: CentralFeedback) => {
    setEnviando(true);
    try {
      await relationshipService.enviarFeedback(feedback);
    } finally {
      setEnviando(false);
    }
  }, []);

  return { enviar, enviando };
}

/* ---------------------------------------------------------- Conteúdo */

export function useFaq() {
  const estado = useServiceData<CentralFaq[]>(() => relationshipService.listarFaq(), []);
  return { ...estado, faqs: estado.data };
}

export function useDownloads() {
  const estado = useServiceData<CentralDownload[]>(() => relationshipService.listarDownloads(), []);
  return { ...estado, downloads: estado.data };
}

export function useNoticias() {
  const estado = useServiceData<CentralNoticia[]>(() => relationshipService.listarNoticias(), []);
  return { ...estado, noticias: estado.data };
}

export function useAvisos() {
  const estado = useServiceData<CentralAviso[]>(() => relationshipService.listarAvisos(), []);
  const ordenados = useMemo(
    () =>
      [...estado.data].sort((a, b) => {
        if (!!a.fixado !== !!b.fixado) return a.fixado ? -1 : 1;
        return new Date(b.publicadoEm).getTime() - new Date(a.publicadoEm).getTime();
      }),
    [estado.data],
  );
  return { ...estado, avisos: ordenados };
}

export function useAssuntos(modulo?: string) {
  const estado = useServiceData<string[]>(
    () => (modulo ? relationshipService.listarAssuntos(modulo) : Promise.resolve([])),
    [],
    [modulo],
  );
  return { ...estado, assuntos: estado.data };
}

export { normalizeCentralStatus };
