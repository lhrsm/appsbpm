import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { icons } from "@/design-system/icons";
import { AppearanceSelector } from "@/components/AppearanceSelector";

import { maskMatricula, maskNome, primeiroNome } from "../mask";
import type { PortalProfile } from "../navigation";

export interface PortalUser {
  nome: string;
  fotoUrl?: string | null;
  matricula?: string | null;
  titularNome?: string | null;
  ativo?: boolean;
}

export interface PortalUserMenuProps {
  profile: PortalProfile;
  user: PortalUser;
  onLogout: () => void;
}

const contaItens = [
  { label: "Meu perfil", to: "/dashboard/perfil", icon: icons.perfil },
  { label: "Segurança", to: "/dashboard/historico", icon: icons.senha },
  { label: "Privacidade e LGPD", to: "/dashboard/minha-privacidade", icon: icons.lgpd },
  { label: "Histórico de acessos", to: "/dashboard/historico", icon: icons.horario },
  { label: "Central de ajuda", to: "/dashboard/faq", icon: icons.ajuda },
];

/** Menu da conta do portal externo (inclui a ação Sair). */
export default function PortalUserMenu({ profile, user, onLogout }: PortalUserMenuProps) {
  const navigate = useNavigate();
  const Sair = icons.sair;
  const iniciais = primeiroNome(user.nome).slice(0, 2).toUpperCase() || "SB";

  const vinculo =
    profile === "dependent"
      ? `Dependente de ${maskNome(user.titularNome)}`
      : `Matrícula ${maskMatricula(user.matricula)}`;

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="group flex h-auto items-center gap-3 px-3 py-2 text-inherit border border-white/68 rounded-[14px] bg-white/92 backdrop-blur-[12px] shadow-[0_6px_20px_rgba(15,23,42,0.14)] transition-all duration-[160ms] hover:bg-white/96 hover:shadow-[0_8px_24px_rgba(15,23,42,0.18)] hover:-translate-y-[1px] data-[state=open]:bg-white/95 min-w-[300px] max-w-[390px]"
          >
            <div className="flex w-full items-center gap-3">
              <Avatar className="h-[38px] w-[38px] border border-[#168A49]/32 bg-white/92 shadow-sm shrink-0">
                {user.fotoUrl && <AvatarImage src={user.fotoUrl} alt="" />}
                <AvatarFallback className="bg-transparent text-[#166534] text-sm font-bold">
                  {iniciais}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start leading-[1.15] text-left flex-1 min-w-0">
                <span className="truncate w-full text-sm font-bold text-[#172033] dark:md:text-white md:text-[#172033]">
                  {user.nome}
                </span>
                <span className="truncate w-full text-[11px] font-medium text-[#64748b] dark:md:text-white/80 md:text-[#64748b] mt-0.5">
                  {profile === "dependent" ? "Dependente" : "Associado • Titular"}
                </span>
              </div>
              <icons.expandir className="h-4 w-4 text-[#64748b] dark:md:text-white/70 transition-transform duration-160 ease group-data-[state=open]:rotate-180 group-hover:text-[#166534] dark:group-hover:md:text-white shrink-0" aria-hidden />
            </div>
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent 
          align="end" 
          sideOffset={8}
          className="w-[300px] max-w-[calc(100vw-32px)] p-2 bg-white/99 dark:bg-slate-900/99 backdrop-blur-[16px] border border-slate-900/10 dark:border-white/10 shadow-[0_14px_36px_rgba(15,23,42,0.18)] rounded-[14px] overflow-hidden z-[100]"
        >
          <div className="space-y-0.5">
            {contaItens.map((item) => (
              <DropdownMenuItem 
                key={item.label} 
                asChild
                className="flex items-center gap-2.5 px-3 py-2.5 text-[#263244] dark:text-slate-200 font-medium rounded-lg cursor-pointer focus:bg-[#F0FDF4]/96 focus:text-[#166534] dark:focus:bg-green-500/12 dark:focus:text-green-300 transition-colors"
              >
                <Link to={item.to}>
                  <item.icon className="h-4 w-4 text-[#64748b] group-focus:text-inherit" aria-hidden />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuSeparator className="my-2 bg-slate-900/8 dark:bg-white/8" />
          
          <div className="px-1 py-1">
            <div className="px-2 py-1.5 mb-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              Aparência
            </div>
            <AppearanceSelector />
          </div>

          <DropdownMenuSeparator className="my-2 bg-slate-900/8 dark:bg-white/8" />

          <DropdownMenuItem
            className="flex items-center gap-2.5 px-3 py-2.5 text-destructive font-semibold rounded-lg cursor-pointer focus:bg-red-50/96 focus:text-destructive dark:focus:bg-red-500/12 transition-colors"
            onSelect={() => {
              onLogout();
              navigate("/");
            }}
          >
            <Sair className="h-4 w-4" aria-hidden />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
  );
}
