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

/** Hero de boas-vindas do portal (associado e dependente) - Versão Refinada Premium. */
export function DashboardWelcomeHero({ profileType, user }: DashboardWelcomeHeroProps) {
  const isDependente = profileType === "dependent";
  const nome = primeiroNome(user.nome).toUpperCase() || "ASSOCIADO";
  const desde = mesAno(user.associadoDesde);

  return (
    <section
      aria-label="Boas-vindas"
      className="relative mb-12 animate-fade-in"
    >
      {/* 2. IMAGEM DO HEADER */}
      <div 
        className={cn(
          "relative w-full overflow-hidden rounded-[24px] shadow-lg transition-all duration-500 animate-in fade-in",
          "h-[160px] md:h-[190px] lg:h-[230px]"
        )}
        style={{
          backgroundImage: `url(/sbpm.jpeg)`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center',
          backgroundRepeat: 'no-repeat',
        }}
      >

        {/* Hero Overlay - Extremamente discreto conforme item 2 e 14 */}
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-black/18 via-black/10 to-transparent" />
      </div>

      {/* 5. CARD DE BOAS-VINDAS (Sobreposição conforme item 9) */}
      <div 
        className={cn(
          "relative z-20 mx-auto -mt-16 w-[92%] sm:w-[85%] md:w-[80%] lg:w-full lg:max-w-none",
          "animate-slide-up-in delay-200"
        )}
      >
        <div 
          className={cn(
            "flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between lg:p-8",
            "rounded-[24px] border border-white/18 bg-[rgba(18,120,60,0.78)] shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-[14px] text-white"
          )}
        >
          <div className="flex items-center gap-5">
            {/* 6. FOTO DO ASSOCIADO */}
            <div className="relative group">
              <Avatar
                src={user.fotoUrl}
                name={user.nome}
                className={cn(
                  "border-2 border-white shadow-md transition-transform duration-300 group-hover:scale-105 shrink-0",
                  "h-14 w-14 md:h-16 w-16 lg:h-[72px] lg:w-[72px]"
                )}
              />
              {!user.fotoUrl && (
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white/10 pointer-events-none">
                  <icons.associados className="h-1/2 w-1/2 text-white/40" />
                </div>
              )}
            </div>

            <div className="min-w-0 flex-1">
              {/* 7. TEXTO */}
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight md:text-[28px] lg:text-[34px]">
                  {saudacao()}, {nome}.
                </h1>
                
                {/* 8. BADGES */}
                <div className="flex items-center gap-2">
                  <Badge className="bg-emerald-500/20 border-emerald-500/30 text-emerald-300 text-[10px] uppercase font-bold py-0 h-5">
                    🟢 Associado Ativo
                  </Badge>
                  <Badge className="bg-blue-500/20 border-blue-500/30 text-blue-300 text-[10px] uppercase font-bold py-0 h-5">
                    🔵 PMBA
                  </Badge>
                </div>
              </div>

              <p className="mt-1 text-sm font-medium text-white/90 md:text-base">
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
