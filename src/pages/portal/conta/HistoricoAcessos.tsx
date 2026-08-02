import { useCallback, useEffect, useState } from "react";
import { icons } from "@/design-system/icons";
import { Badge } from "@/design-system/components/Badge";
import { Text } from "@/design-system/components/Text";
import PortalPageHeader from "@/portal/components/PortalPageHeader";
import { PortalCard } from "@/portal/ui/PortalCard";
import { PortalAlert, ConfirmationDialog, portalToast } from "@/portal/ui/feedback";
import { PortalEmptyState } from "@/portal/ui/PortalEmptyState";
import { SectionErrorState } from "@/portal/ui/errorStates";
import { ListSkeleton } from "@/portal/ui/skeletons";
import { PortalButton } from "@/portal/forms/buttons";
import { contaCall, dataHoraBR, rotuloEvento } from "@/lib/conta";

interface Sessao {
  id: string;
  dispositivo: string | null;
  navegador: string | null;
  sistema: string | null;
  localizacao: string | null;
  iniciada_em: string;
  ultima_atividade: string;
  confiavel: boolean;
  atual: boolean;
}

interface Dispositivo {
  id: string;
  device_name: string | null;
  browser: string | null;
  operating_system: string | null;
  last_seen_at: string;
  expires_at: string | null;
}

interface Evento {
  id: string;
  event_type: string;
  result: string;
  device_summary: string | null;
  location_summary: string | null;
  created_at: string;
}

const FILTROS = [
  { id: "", label: "Tudo" },
  { id: "login", label: "Acessos" },
  { id: "password_change", label: "Senha" },
  { id: "mfa_enabled", label: "2FA" },
  { id: "privacy_request", label: "Privacidade" },
];

/**
 * Histórico de acessos, sessões ativas e dispositivos confiáveis (Fase 10).
 * Nenhum IP completo é exibido — apenas resumo de dispositivo e origem.
 */
export default function HistoricoAcessos() {
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [dispositivos, setDispositivos] = useState<Dispositivo[]>([]);
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [total, setTotal] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [filtro, setFiltro] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [confirmarPanico, setConfirmarPanico] = useState(false);
  const [processando, setProcessando] = useState(false);
  const tamanho = 15;

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [s, d, e] = await Promise.all([
        contaCall<{ itens: Sessao[] }>("sessoes"),
        contaCall<{ itens: Dispositivo[] }>("dispositivos"),
        contaCall<{ itens: Evento[]; total: number }>("eventos", { pagina, tamanho, tipo: filtro || undefined }),
      ]);
      setSessoes(s.itens ?? []);
      setDispositivos(d.itens ?? []);
      setEventos(e.itens ?? []);
      setTotal(e.total ?? 0);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível carregar seu histórico.");
    } finally {
      setCarregando(false);
    }
  }, [pagina, filtro]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const acao = async (fn: () => Promise<void>, sucesso: string) => {
    if (processando) return;
    setProcessando(true);
    try {
      await fn();
      portalToast.success(sucesso);
      await carregar();
    } catch (e) {
      portalToast.error(e instanceof Error ? e.message : "Não foi possível concluir a operação.");
    } finally {
      setProcessando(false);
    }
  };

  const paginas = Math.max(1, Math.ceil(total / tamanho));

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Histórico de acessos"
        description="Acompanhe suas sessões, dispositivos confiáveis e todas as atividades de segurança da conta."
        secondaryActions={
          <PortalButton variant="secondary" iconLeft={icons.atualizar} onClick={carregar} loading={carregando}>
            Atualizar
          </PortalButton>
        }
      />

      <PortalAlert
        tone="warning"
        title="Não reconhece um acesso?"
        action={
          <PortalButton variant="danger" iconLeft={icons.alerta} onClick={() => setConfirmarPanico(true)}>
            Reportar acesso suspeito
          </PortalButton>
        }
      >
        Encerramos todas as sessões, removemos os dispositivos confiáveis e abrimos um protocolo de segurança.
      </PortalAlert>

      {erro && <SectionErrorState description={erro} onRetry={carregar} />}

      <PortalCard
        title="Sessões ativas"
        icon={icons.dashboard}
        subtitle={`${sessoes.length} sessão(ões) em andamento`}
        action={
          sessoes.length > 1 ? (
            <PortalButton
              variant="secondary"
              onClick={() => acao(() => contaCall("sessoes_revogar_outras"), "Outras sessões encerradas.")}
            >
              Encerrar outras sessões
            </PortalButton>
          ) : undefined
        }
      >
        {carregando ? (
          <ListSkeleton />
        ) : sessoes.length === 0 ? (
          <PortalEmptyState size="compact" title="Nenhuma sessão ativa registrada" />
        ) : (
          <ul className="divide-y">
            {sessoes.map((s) => (
              <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Text variant="small" className="font-medium">
                      {s.dispositivo ?? "Dispositivo não identificado"}
                    </Text>
                    {s.atual && <Badge tone="success">Esta sessão</Badge>}
                    {s.confiavel && <Badge tone="info">Confiável</Badge>}
                  </div>
                  <Text variant="caption" className="text-muted-foreground">
                    {[s.navegador, s.sistema, s.localizacao].filter(Boolean).join(" · ")} · Última atividade em{" "}
                    {dataHoraBR(s.ultima_atividade)}
                  </Text>
                </div>
                {!s.atual && (
                  <PortalButton
                    variant="ghost"
                    size="small"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => acao(() => contaCall("sessao_revogar", { sessao_id: s.id }), "Sessão encerrada.")}
                  >
                    Encerrar
                  </PortalButton>
                )}
              </li>
            ))}
          </ul>
        )}
      </PortalCard>

      <PortalCard title="Dispositivos confiáveis" icon={icons.previdencia} subtitle="Dispositivos que dispensam o segundo fator por um período">
        {carregando ? (
          <ListSkeleton />
        ) : dispositivos.length === 0 ? (
          <PortalEmptyState size="compact" title="Nenhum dispositivo confiável cadastrado" />
        ) : (
          <ul className="divide-y">
            {dispositivos.map((d) => (
              <li key={d.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <Text variant="small" className="font-medium">
                    {d.device_name ?? "Dispositivo"}
                  </Text>
                  <Text variant="caption" className="text-muted-foreground">
                    {[d.browser, d.operating_system].filter(Boolean).join(" · ")} · Visto em {dataHoraBR(d.last_seen_at)}
                    {d.expires_at ? ` · Expira em ${dataHoraBR(d.expires_at)}` : ""}
                  </Text>
                </div>
                <PortalButton
                  variant="ghost"
                  size="small"
                  className="text-destructive hover:bg-destructive/10"
                  onClick={() =>
                    acao(() => contaCall("dispositivo_revogar", { dispositivo_id: d.id }), "Dispositivo removido.")
                  }
                >
                  Remover
                </PortalButton>
              </li>
            ))}
          </ul>
        )}
      </PortalCard>

      <PortalCard title="Atividades da conta" icon={icons.horario} subtitle={`${total} registro(s)`}>
        <div className="mb-3 flex flex-wrap gap-2">
          {FILTROS.map((f) => (
            <PortalButton
              key={f.id || "todos"}
              size="small"
              variant={filtro === f.id ? "primary" : "secondary"}
              onClick={() => {
                setPagina(1);
                setFiltro(f.id);
              }}
            >
              {f.label}
            </PortalButton>
          ))}
        </div>

        {carregando ? (
          <ListSkeleton />
        ) : eventos.length === 0 ? (
          <PortalEmptyState size="compact" title="Nenhuma atividade registrada neste filtro" />
        ) : (
          <ul className="divide-y">
            {eventos.map((e) => (
              <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Text variant="small" className="font-medium">
                      {rotuloEvento(e.event_type)}
                    </Text>
                    <Badge tone={e.result === "success" ? "success" : "danger"}>
                      {e.result === "success" ? "Concluído" : "Falhou"}
                    </Badge>
                  </div>
                  <Text variant="caption" className="text-muted-foreground">
                    {dataHoraBR(e.created_at)} · {e.device_summary ?? "Dispositivo não identificado"} ·{" "}
                    {e.location_summary ?? "Origem não identificada"}
                  </Text>
                </div>
              </li>
            ))}
          </ul>
        )}

        {paginas > 1 && (
          <div className="mt-4 flex items-center justify-between">
            <PortalButton variant="secondary" size="small" disabled={pagina <= 1} onClick={() => setPagina((p) => p - 1)}>
              Anterior
            </PortalButton>
            <Text variant="caption" className="text-muted-foreground">
              Página {pagina} de {paginas}
            </Text>
            <PortalButton
              variant="secondary"
              size="small"
              disabled={pagina >= paginas}
              onClick={() => setPagina((p) => p + 1)}
            >
              Próxima
            </PortalButton>
          </div>
        )}
      </PortalCard>

      <ConfirmationDialog
        open={confirmarPanico}
        onOpenChange={setConfirmarPanico}
        title="Reportar acesso suspeito"
        description="Todas as sessões e dispositivos confiáveis serão encerrados e um protocolo de segurança será aberto. Você precisará entrar novamente."
        confirmLabel="Confirmar e proteger conta"
        tone="danger"
        onConfirm={() =>
          acao(async () => {
            const r = await contaCall<{ protocolo: string | null }>("reportar_acesso_suspeito");
            if (r.protocolo) portalToast.info(`Protocolo ${r.protocolo} registrado.`);
          }, "Conta protegida. Altere sua senha em seguida.")
        }
      />
    </div>
  );
}
