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
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="group h-auto gap-3 px-3 py-2 text-inherit border border-white/55 rounded-[14px] bg-white/78 backdrop-blur-[10px] shadow-[0_4px_14px_rgba(15,23,42,0.10)] transition-all duration-[160ms] hover:bg-white/92 hover:border-[#168A49]/38 hover:shadow-[0_6px_18px_rgba(15,23,42,0.14)] hover:-translate-y-[1px] data-[state=open]:bg-white/95 data-[state=open]:border-[#168A49]/46 data-[state=open]:shadow-[0_8px_22px_rgba(15,23,42,0.16)]"
        >
          <div className="flex items-center gap-3">
            <Avatar className="h-[38px] w-[38px] border border-[#168A49]/32 bg-white/92 shadow-sm shrink-0">
              {user.fotoUrl && <AvatarImage src={user.fotoUrl} alt="" />}
              <AvatarFallback className="bg-transparent text-[#166534] text-sm font-bold">
                {iniciais}
              </AvatarFallback>
            </Avatar>
            <div className="hidden sm:flex flex-col items-start leading-[1.15] text-left max-w-[280px]">
              <span className="truncate w-full text-sm font-bold text-[#172033] xl:whitespace-nowrap">
                {user.nome}
              </span>
              <span className="truncate w-full text-[11px] font-medium text-[#64748b] mt-0.5">
                {profile === "dependent" ? "Dependente" : "Associado • Titular"}
              </span>
            </div>
            <icons.expandir className="h-4 w-4 text-[#64748b] transition-colors group-hover:text-[#166534] shrink-0" aria-hidden />
          </div>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent 
        align="end" 
        className="w-72 p-2 bg-white/96 border border-slate-900/10 shadow-[0_10px_28px_rgba(15,23,42,0.14)] rounded-[12px]"
      >
        <DropdownMenuLabel className="flex items-start gap-3 p-3">
          <Avatar className="h-10 w-10 border border-[#168A49]/20">
            {user.fotoUrl && <AvatarImage src={user.fotoUrl} alt="" />}
            <AvatarFallback className="text-xs text-[#166534] font-bold">{iniciais}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <span className="block truncate text-sm font-bold text-[#172033]">{user.nome}</span>
            <span className="block truncate text-[11px] font-medium text-[#64748b]">{vinculo}</span>
            <Badge variant={user.ativo === false ? "destructive" : "secondary"} className="mt-1.5 h-5 text-[10px] px-2 font-semibold">
              {user.ativo === false ? "Vínculo inativo" : "Vínculo ativo"}
            </Badge>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator className="my-1 opacity-50" />
        {contaItens.map((item) => (
          <DropdownMenuItem 
            key={item.label} 
            asChild
            className="flex items-center gap-2.5 px-3 py-2 text-[#263244] font-medium rounded-lg cursor-pointer focus:bg-[#F0FDF4]/92 focus:text-[#166534]"
          >
            <Link to={item.to}>
              <item.icon className="h-4 w-4 text-[#64748b] group-focus:text-[#166534]" aria-hidden />
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator className="my-1 opacity-50" />
        <div className="px-1 py-1">
          <AppearanceSelector />
        </div>

        <DropdownMenuItem
          className="mt-1 flex items-center gap-2.5 px-3 py-2 text-destructive font-semibold rounded-lg cursor-pointer focus:bg-destructive/10 focus:text-destructive"
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
  );
}
