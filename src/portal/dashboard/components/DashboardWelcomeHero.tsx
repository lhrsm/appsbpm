import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
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
}

/** Hero de boas-vindas do portal (associado e dependente) - Versão Institucional Premium V3. */
export function DashboardWelcomeHero({ profileType, user }: DashboardWelcomeHeroProps) {
  const isDependente = profileType === "dependent";
  const nome = isDependente ? user.nome : (primeiroNome(user.nome).toUpperCase() || "ASSOCIADO");
  const desde = mesAno(user.associadoDesde);

  return (
    <section 
      aria-label="Boas-vindas"
      className="dashboard-hero relative animate-fade-in"
    >
      <div className="hero-card">
        <div className="flex flex-col gap-6 p-1 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-5">
            {/* Foto do Associado */}
            <div className="relative shrink-0">
              <Avatar
                src={user.fotoUrl}
                name={user.nome}
                className={cn(
                  "border-2 border-white shadow-md",
                  "h-14 w-14 md:h-16 w-16 lg:h-[72px] lg:w-[72px]"
                )}
              />
              {!user.fotoUrl && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/10 pointer-events-none">
                  <icons.associados className="h-1/2 w-1/2 text-white/40" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1 text-white">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl md:text-[28px] lg:text-[34px]">
                  {saudacao()}, {nome}
                </h1>
                
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/20 border-emerald-500/30 text-emerald-300 text-[10px] uppercase font-bold py-0 h-5">
                    🟢 Associado Ativo
                  </Badge>
                  <Badge className="bg-blue-500/20 border-blue-500/30 text-blue-300 text-[10px] uppercase font-bold py-0 h-5">
                    🔵 {user.tipoMilitar || "PMBA"}
                  </Badge>
                </div>
              </div>

              <p className="mt-0.5 text-sm font-medium text-white/90 md:text-base">
                Bem-vindo ao Portal da SBPM
              </p>

              <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs font-medium text-white/80 md:text-sm">
                {user.matricula && (
                  <>
                    <span>Matrícula {maskMatricula(user.matricula)}</span>
                    <span className="opacity-40">•</span>
                  </>
                )}
                <span>Situação Regular</span>
                <span className="opacity-40">•</span>
                <span>Associação {desde || "—"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
