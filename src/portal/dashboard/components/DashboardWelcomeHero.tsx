import { Link } from "react-router-dom";
import { Text } from "@/design-system/components/Text";
import { Button } from "@/design-system/components/Button";
import { Badge } from "@/design-system/components/Badge";
import { Avatar } from "@/design-system/components/Avatar";
import { icons } from "@/design-system/icons";
import { maskMatricula, maskNome, primeiroNome } from "@/portal/mask";
import type { PortalProfile } from "@/portal/navigation";
import type { DashboardUser } from "../types";
import { DashboardLastUpdated } from "./DashboardPrimitives";

function saudacao(date = new Date()) {
  const h = date.getHours();
  if (h < 12) return "Bom dia";
  if (h < 18) return "Boa tarde";
  return "Boa noite";
}

function mesAno(iso?: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("pt-BR", { month: "long", year: "numeric" });
}

export interface DashboardWelcomeHeroProps {
  profileType: PortalProfile;
  user: DashboardUser;
  /** Permite exibir a ação de atualização cadastral. */
  canEditProfile?: boolean;
}

/** Hero de boas-vindas do portal (associado e dependente). */
export function DashboardWelcomeHero({ profileType, user, canEditProfile = true }: DashboardWelcomeHeroProps) {
  const isDependente = profileType === "dependent";
  const nome = primeiroNome(user.nome) || "associado";
  const desde = mesAno(user.associadoDesde);

  const detalhes = isDependente
    ? [
        user.parentesco ? `Vínculo: ${user.parentesco}` : null,
        user.titularNome ? `Dependente de ${maskNome(user.titularNome)}` : null,
        user.vinculoAtivo === false ? "Vínculo inativo" : "Vínculo ativo",
      ]
    : [
        user.matricula ? `Matrícula ${maskMatricula(user.matricula)}` : null,
        user.vinculoAtivo === false ? "Vínculo inativo" : "Vínculo ativo",
        desde ? `Associado desde ${desde}` : null,
      ];

  return (
    <section
      aria-label="Boas-vindas"
      className="relative overflow-hidden rounded-2xl border border-primary/20 bg-gradient-to-br from-primary via-primary/95 to-primary/75 p-5 text-primary-foreground md:p-7"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-primary-foreground/10"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-24 right-24 h-48 w-48 rounded-full bg-primary-foreground/5"
      />

      <div className="relative flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <Avatar
            src={user.fotoUrl}
            name={user.nome}
            size="lg"
            className="hidden border-primary-foreground/40 sm:flex"
          />
          <div className="min-w-0 space-y-1">
            <Text variant="h3" as="h1" className="text-primary-foreground">
              {saudacao()}, {nome}.
            </Text>
            <Text variant="body" className="text-primary-foreground/90">
              {isDependente ? "Bem-vindo(a) ao seu Portal da SBPM." : "Bem-vindo ao seu Portal da SBPM."}
            </Text>
            <p className="hidden text-sm text-primary-foreground/80 sm:block">
              {detalhes.filter(Boolean).join(" · ")}
            </p>
            {isDependente && (
              <Badge tone="neutral" className="border-primary-foreground/30 bg-primary-foreground/15 text-primary-foreground sm:hidden">
                Dependente
              </Badge>
            )}
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
          <Button variant="secondary" size="md" leftIcon={icons.perfil} asChild className="w-full sm:w-auto">
            <Link to="/dashboard/perfil">Ver meu perfil</Link>
          </Button>
          {canEditProfile && (
            <Button
              variant="ghost"
              size="md"
              leftIcon={icons.editar}
              asChild
              className="w-full text-primary-foreground hover:bg-primary-foreground/15 sm:w-auto"
            >
              <Link to="/dashboard/perfil">Atualizar meus dados</Link>
            </Button>
          )}
        </div>
      </div>

      {user.atualizadoEm && (
        <div className="relative mt-4 hidden text-primary-foreground/80 sm:block">
          <DashboardLastUpdated date={user.atualizadoEm} />
        </div>
      )}
    </section>
  );
}
