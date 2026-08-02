import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { portalCall } from "@/lib/portal";
import { useAssociado } from "@/contexts/AssociadoContext";
import { icons } from "@/design-system/icons";
import PortalPageHeader from "@/portal/components/PortalPageHeader";
import { PortalCard } from "@/portal/ui/PortalCard";
import { PortalAlert } from "@/portal/ui/feedback";
import { PortalButton } from "@/portal/forms/buttons";
import { PortalEmptyState } from "@/portal/ui/PortalEmptyState";
import { SectionErrorState } from "@/portal/ui/errorStates";
import { ListSkeleton } from "@/portal/ui/skeletons";
import { Badge } from "@/design-system/components/Badge";

interface AcessoRegistro {
  id: string;
  metodo_login?: string | null;
  ip?: string | null;
  user_agent?: string | null;
  sucesso?: boolean | null;
  created_at: string;
}

const dataHora = (v?: string | null) =>
  v
    ? new Date(v).toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

/** Extrai navegador e sistema a partir do user agent, sem expor a string bruta. */
function dispositivo(ua?: string | null) {
  if (!ua) return { navegador: "Navegador não identificado", sistema: "Dispositivo desconhecido" };
  const navegador = /Edg\//.test(ua)
    ? "Microsoft Edge"
    : /Chrome\//.test(ua)
      ? "Google Chrome"
      : /Safari\//.test(ua)
        ? "Safari"
        : /Firefox\//.test(ua)
          ? "Mozilla Firefox"
          : "Outro navegador";
  const sistema = /Android/.test(ua)
    ? "Android"
    : /iPhone|iPad|iOS/.test(ua)
      ? "iPhone / iPad"
      : /Windows/.test(ua)
        ? "Windows"
        : /Mac OS/.test(ua)
          ? "macOS"
          : /Linux/.test(ua)
            ? "Linux"
            : "Dispositivo desconhecido";
  return { navegador, sistema };
}

/**
 * Segurança da conta do dependente (§13 e §14 da Fase 8).
 *
 * Apenas leitura e orientação: nenhum fluxo de autenticação, 2FA ou
 * primeiro acesso é alterado aqui.
 */
export default function SegurancaDependente() {
  const { associado, dependenteLogado } = useAssociado();
  const [acessos, setAcessos] = useState<AcessoRegistro[]>([]);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    setLoading(true);
    setErro(null);
    try {
      const res = await portalCall<{ itens?: AcessoRegistro[]; acessos?: AcessoRegistro[] }>("acessos");
      setAcessos(res?.itens ?? res?.acessos ?? []);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível carregar seu histórico de acessos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (associado) void carregar();
  }, [associado, dependenteLogado?.id, carregar]);

  const ultimo = acessos.find((a) => a.sucesso !== false);

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Segurança"
        description="Acompanhe os acessos à sua conta e mantenha seus dados protegidos."
        updatedAt={ultimo?.created_at ?? null}
        source="Registros de acesso"
      />

      <PortalAlert tone="info" title="Proteja sua conta" icon={icons.lgpd}>
        Use uma senha exclusiva, não compartilhe códigos de verificação e sempre encerre a sessão em dispositivos de
        terceiros.
      </PortalAlert>

      <div className="grid gap-4 md:grid-cols-2">
        <PortalCard title="Senha de acesso" description="Alterada pelo fluxo oficial de recuperação." icon={icons.senha}>
          <p className="text-sm text-muted-foreground">
            Por segurança, a troca de senha acontece pelo fluxo institucional com verificação por e-mail.
          </p>
          <div className="mt-4">
            <PortalButton variant="outline" iconLeft={icons.senha} asChild>
              <Link to="/recuperar-acesso">Alterar minha senha</Link>
            </PortalButton>
          </div>
        </PortalCard>

        <PortalCard
          title="Verificação em duas etapas"
          description="Código enviado ao seu e-mail cadastrado."
          icon={icons.previdencia}
        >
          <div className="flex items-center gap-2">
            <Badge tone="success" icon={icons.sucesso}>
              Ativa
            </Badge>
            <span className="text-sm text-muted-foreground">Aplicada no primeiro acesso e na recuperação de senha.</span>
          </div>
          <p className="mt-3 text-sm text-muted-foreground">
            Mantenha seu e-mail atualizado em Meus dados para continuar recebendo os códigos.
          </p>
          <div className="mt-4">
            <PortalButton variant="ghost" iconLeft={icons.perfil} asChild>
              <Link to="/dashboard/meus-dados">Conferir meu e-mail</Link>
            </PortalButton>
          </div>
        </PortalCard>
      </div>

      <PortalCard
        title="Sessão atual"
        description="Dispositivo em uso neste momento."
        icon={icons.dashboard}
      >
        <dl className="grid gap-2 text-sm sm:grid-cols-2">
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Navegador:</dt>
            <dd>{dispositivo(navigator.userAgent).navegador}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Sistema:</dt>
            <dd>{dispositivo(navigator.userAgent).sistema}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Último acesso:</dt>
            <dd>{dataHora(ultimo?.created_at)}</dd>
          </div>
          <div className="flex gap-2">
            <dt className="text-muted-foreground">Situação:</dt>
            <dd>
              <Badge tone="success">Sessão ativa</Badge>
            </dd>
          </div>
        </dl>
      </PortalCard>

      <section aria-labelledby="historico-acessos" className="space-y-3">
        <h2 id="historico-acessos" className="text-lg font-semibold">
          Histórico de acessos
        </h2>

        {loading ? (
          <ListSkeleton items={4} />
        ) : erro ? (
          <SectionErrorState description={erro} onRetry={carregar} />
        ) : !acessos.length ? (
          <PortalEmptyState
            icon={icons.horario}
            title="Nenhum acesso registrado"
            description="Os acessos à sua conta aparecerão aqui."
          />
        ) : (
          <ul className="space-y-3">
            {acessos.slice(0, 20).map((a, index) => {
              const info = dispositivo(a.user_agent);
              return (
                <li key={a.id} className="rounded-xl border bg-card p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="font-medium">
                        {info.navegador} · {info.sistema}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {dataHora(a.created_at)} · Localização aproximada:{" "}
                        {a.ip ? `IP ${a.ip.split(".").slice(0, 2).join(".")}.*.*` : "não disponível"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      {index === 0 && <Badge tone="info">Sessão atual</Badge>}
                      <Badge tone={a.sucesso === false ? "danger" : "success"}>
                        {a.sucesso === false ? "Falhou" : "Sucesso"}
                      </Badge>
                    </div>
                  </div>
                  <div className="mt-3">
                    <PortalButton variant="ghost" size="small" iconLeft={icons.alerta} asChild>
                      <Link
                        to="/dashboard/solicitacoes/nova"
                        aria-label={`Não reconheço o acesso de ${dataHora(a.created_at)}`}
                      >
                        Não reconheço este acesso
                      </Link>
                    </PortalButton>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}
