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

  console.log("ACTIVE USER MENU COMPONENT: PortalUserMenu.tsx");
  console.log("USER MENU VERSION: user-menu-v5-2026-08-09");

  return (
    <div className="relative" data-component="portal-user-menu-v5">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            className="group flex h-auto items-center gap-3 px-2 md:px-3 py-1.5 md:py-2 text-inherit border border-white/72 rounded-xl md:rounded-[16px] transition-all duration-[160ms] hover:shadow-[0_8px_20px_rgba(15,23,42,0.16)] hover:-translate-y-[1px] w-full md:min-w-[300px] md:max-w-[390px] !bg-[rgba(255,255,255,0.96)] !text-[#172033] !border-[1px_solid_rgba(255,255,255,0.72)] !shadow-[0_6px_18px_rgba(15,23,42,0.14)] pointer-events-auto"
            style={{ 
              backdropFilter: 'blur(12px)', 
              WebkitBackdropFilter: 'blur(12px)' 
            }}
          >
            <div className="flex w-full items-center gap-2 md:gap-3 min-w-0">
              <Avatar className="h-9 w-9 md:h-12 md:w-12 border-2 border-[var(--green-main)] bg-white/96 shadow-sm shrink-0">
                {user.fotoUrl && <AvatarImage src={user.fotoUrl} alt="" />}
                <AvatarFallback className="bg-transparent text-[#166534] text-[13px] md:text-base font-bold">
                  {iniciais}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-start leading-tight text-left flex-1 min-w-0">
                <span className="truncate w-full text-[13px] md:text-lg font-bold !text-[#172033]">
                  {user.nome}
                </span>
                <span className="truncate w-full text-[11px] md:text-sm font-medium !text-slate-500">
                  {profile === "dependent" ? "Dependente • Titular" : "Associado • Titular"}
                </span>
              </div>
              <icons.expandir className="h-3.5 w-3.5 md:h-4 md:w-4 !text-[#64748b] transition-transform duration-160 ease group-data-[state=open]:rotate-180 group-hover:!text-[#166534] shrink-0" aria-hidden />
            </div>
          </Button>

        </DropdownMenuTrigger>

        <DropdownMenuContent 
          align="end" 
          sideOffset={8}
          className="w-[300px] max-w-[calc(100vw-32px)] p-2 !text-[#263244] !opacity-100 border border-slate-900/10 shadow-[0_16px_38px_rgba(15,23,42,0.20)] rounded-[16px] overflow-hidden z-[9999] dark:!text-[#e2e8f0] dark:border-white/10"
          style={{ 
            backgroundColor: 'rgba(255, 255, 255, 0.985)',
            backdropFilter: 'blur(16px)', 
            WebkitBackdropFilter: 'blur(16px)'
          }}
          data-dropdown-version="user-dropdown-v5"
          onPointerDownCapture={(e) => {
            // Teste visual magenta forçado ao clicar no menu
            const el = e.currentTarget;
            if (el.dataset.debug === 'true') el.style.backgroundColor = '#ff00ff';
          }}
        >
          <div className="space-y-0.5">
            {contaItens.map((item) => (
              <DropdownMenuItem 
                key={item.label} 
                asChild
                className="flex items-center gap-2.5 px-3 py-2.5 !text-[#263244] dark:!text-[#e2e8f0] font-medium rounded-lg cursor-pointer focus:!bg-[rgba(240,253,244,0.96)] focus:!text-[#166534] dark:focus:!bg-[rgba(34,197,94,0.14)] dark:focus:!text-[#86efac] transition-colors group"
              >
                <Link to={item.to}>
                  <item.icon className="h-4 w-4 !text-[#64748b] dark:!text-[#94a3b8] group-focus:text-inherit" aria-hidden />
                  {item.label}
                </Link>
              </DropdownMenuItem>
            ))}
          </div>

          <DropdownMenuSeparator className="my-2 bg-slate-900/8 dark:bg-white/8" />
          
          <div className="px-1 py-1">
            <div className="px-2 py-1.5 mb-1 text-[11px] font-bold !text-[#64748b] uppercase tracking-wider">
              Aparência
            </div>
            <AppearanceSelector />
          </div>

          <DropdownMenuSeparator className="my-2 bg-slate-900/8 dark:bg-white/8" />

          <DropdownMenuItem
            className="flex items-center gap-2.5 px-3 py-2.5 text-red-600 dark:text-red-400 font-semibold rounded-lg cursor-pointer focus:bg-red-50/96 focus:text-red-600 dark:focus:bg-red-500/14 transition-colors group"
            onSelect={() => {
              onLogout();
              navigate("/");
            }}
          >
            <Sair className="h-4 w-4 text-red-500 group-focus:text-inherit" aria-hidden />
            Sair
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
