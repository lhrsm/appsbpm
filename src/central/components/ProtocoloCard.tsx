import { Link } from "react-router-dom";
import { Text } from "@/design-system/components/Text";
import { Badge } from "@/design-system/components/Badge";
import { icons } from "@/design-system/icons";
import { cn } from "@/lib/utils";
import { PortalCard } from "@/portal/ui";
import { getCentralStatus, getPrioridade } from "../status";
import type { CentralProtocolo } from "../types";
import { getModulo } from "../catalog";

const formatarData = (iso?: string | null) =>
  iso ? new Date(iso).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

/** Dias corridos restantes até o prazo (negativo = atrasado). */
export function diasRestantes(prazo?: string | null) {
  if (!prazo) return null;
  const diff = new Date(prazo).getTime() - Date.now();
  return Math.ceil(diff / 86_400_000);
}

export interface ProtocoloCardProps {
  protocolo: CentralProtocolo;
  className?: string;
}

/** Card resumo de um protocolo — usado nas listagens da Central. */
export default function ProtocoloCard({ protocolo, className }: ProtocoloCardProps) {
  const status = getCentralStatus(protocolo.status);
  const prioridade = getPrioridade(protocolo.prioridade);
  const modulo = getModulo(protocolo.modulo);
  const restantes = diasRestantes(protocolo.prazoEm);

  return (
    <Link
      to={`/dashboard/central/protocolos/${protocolo.id}`}
      className={cn("block rounded-[16px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2", className)}
      aria-label={`Abrir protocolo ${protocolo.protocolo}`}
    >
      <PortalCard interactive density="compact">
        <div className="flex flex-wrap items-start justify-between gap-2">
          <div className="min-w-0">
            <Text variant="caption" as="p" className="font-mono">
              {protocolo.protocolo}
            </Text>
            <Text variant="h6" as="p" className="truncate">
              {protocolo.assunto}
            </Text>
          </div>
          <Badge tone={status.tone} icon={status.icon}>
            {status.label}
          </Badge>
        </div>

        <Text variant="small" className="mt-2 line-clamp-2 text-muted-foreground">
          {protocolo.descricao}
        </Text>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <Badge tone="neutral" icon={modulo.icon}>
            {modulo.label}
          </Badge>
          <Badge tone={prioridade.tone} icon={prioridade.icon}>
            {prioridade.label}
          </Badge>
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <icons.horario className="h-3.5 w-3.5" aria-hidden />
            Aberto em {formatarData(protocolo.criadoEm)}
          </span>
          {restantes !== null && !status.finalizado && (
            <Badge tone={restantes < 0 ? "danger" : restantes <= 2 ? "warning" : "neutral"}>
              {restantes < 0 ? `Atrasado ${Math.abs(restantes)} dia(s)` : `Prazo em ${restantes} dia(s)`}
            </Badge>
          )}
          {status.finalizado && !protocolo.avaliado && <Badge tone="primary">Avalie o atendimento</Badge>}
        </div>
      </PortalCard>
    </Link>
  );
}
