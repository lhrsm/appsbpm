import { Link } from "react-router-dom";
import { Text } from "@/design-system/components/Text";
import { Badge } from "@/design-system/components/Badge";
import { Avatar } from "@/design-system/components/Avatar";
import { Button } from "@/design-system/components/Button";
import { icons } from "@/design-system/icons";
import { maskNome } from "@/portal/mask";
import type { RelatedPerson, ServiceItem, SupportChannel } from "../types";
import { DashboardEmptyState } from "./DashboardPrimitives";

/** Serviços disponíveis para o perfil atual. */
export function DashboardServicesSection({ services }: { services: ServiceItem[] }) {
  if (!services.length) {
    return <DashboardEmptyState icon={icons.pasta} title="Nenhum serviço disponível no momento." />;
  }
  return (
    <ul className="grid grid-cols-1 gap-4 md:gap-3 md:grid-cols-2 xl:grid-cols-3">
      {services.map((s) => {
        const Icon = s.icon;
        return (
          <li key={s.id}>
            <Link
              to={s.route}
              className="flex h-full gap-3 rounded-[18px] md:rounded-xl border bg-card p-4 md:p-4 transition-colors hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 shadow-sm md:shadow-none"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10" aria-hidden>
                <Icon className="h-5 w-5 text-primary" />
              </span>
              <div className="min-w-0 space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Text variant="small" className="font-semibold">
                    {s.title}
                  </Text>
                  {s.status && <Badge tone={s.status.tone}>{s.status.label}</Badge>}
                </div>
                <Text variant="caption">{s.description}</Text>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/** Pessoas vinculadas: dependentes (titular) ou titular (dependente). */
export function DashboardRelatedPeople({
  people,
  emptyTitle,
  emptyDescription,
  actionLabel,
  actionRoute,
  maskNames,
}: {
  people: RelatedPerson[];
  emptyTitle: string;
  emptyDescription?: string;
  actionLabel?: string;
  actionRoute?: string;
  maskNames?: boolean;
}) {
  if (!people.length) {
    return (
      <DashboardEmptyState
        icon={icons.dependentes}
        title={emptyTitle}
        description={emptyDescription}
        actionLabel={actionLabel}
        actionRoute={actionRoute}
      />
    );
  }

  return (
    <ul className="grid grid-cols-1 gap-4 md:gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {people.map((p) => (
        <li key={p.id} className="flex items-center gap-3 rounded-[18px] md:rounded-xl border bg-card p-4 md:p-4 shadow-sm md:shadow-none">
          <Avatar src={p.fotoUrl} name={p.nome} size="sm" />
          <div className="min-w-0 flex-1">
            <Text variant="small" className="truncate font-medium">
              {maskNames ? maskNome(p.nome) : p.nome}
            </Text>
            <Text variant="caption">{p.parentesco ?? "Vínculo familiar"}</Text>
          </div>
          <Badge tone={p.ativo === false ? "neutral" : "success"}>{p.ativo === false ? "Inativo" : "Ativo"}</Badge>
        </li>
      ))}
    </ul>
  );
}

/** Prévia dos canais oficiais de atendimento. */
export function DashboardSupportPreview({ channels }: { channels: SupportChannel[] }) {
  return (
    <div className="grid grid-cols-1 gap-4 md:gap-3 md:grid-cols-2">
      {channels.map((c) => {
        const Icon = c.icon;
        return (
          <div key={c.id} className="flex items-center gap-3 rounded-[18px] md:rounded-xl border bg-card p-4 md:p-4 shadow-sm md:shadow-none">
            <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10" aria-hidden>
              <Icon className="h-5 w-5 text-primary" />
            </span>
            <div className="min-w-0 flex-1">
              <Text variant="small" className="font-semibold">
                {c.setor}
              </Text>
              <Text variant="caption">{c.horario}</Text>
            </div>
            <Button size="sm" variant="secondary" asChild>
              <a href={c.href} target="_blank" rel="noopener noreferrer">
                {c.canal}
              </a>
            </Button>
          </div>
        );
      })}
    </div>
  );
}
