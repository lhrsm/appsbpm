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
          asChild
          variant="ghost"
          className="h-11 gap-2 px-2 text-primary-foreground hover:bg-primary-foreground/15"
        >
          <button
            type="button"
            aria-label="Abrir menu da conta"
          >
            <Avatar className="h-8 w-8 border border-primary-foreground/30">
              {user.fotoUrl && <AvatarImage src={user.fotoUrl} alt="" />}
              <AvatarFallback className="bg-primary-foreground/20 text-xs text-primary-foreground">
                {iniciais}
              </AvatarFallback>
            </Avatar>
            <span className="hidden max-w-[9rem] flex-col items-start leading-tight sm:flex">
              <span className="truncate text-sm font-medium">{primeiroNome(user.nome)}</span>
              <span className="truncate text-[11px] opacity-80">
                {profile === "dependent" ? "Dependente" : "Titular"}
              </span>
            </span>
            <icons.expandir className="h-4 w-4 opacity-80" aria-hidden />
          </button>
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-72">
        <DropdownMenuLabel className="flex items-start gap-3 py-3">
          <Avatar className="h-10 w-10">
            {user.fotoUrl && <AvatarImage src={user.fotoUrl} alt="" />}
            <AvatarFallback className="text-xs">{iniciais}</AvatarFallback>
          </Avatar>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm font-semibold">{user.nome}</span>
            <span className="block truncate text-xs font-normal text-muted-foreground">{vinculo}</span>
            <Badge variant={user.ativo === false ? "destructive" : "secondary"} className="mt-1 text-[10px]">
              {user.ativo === false ? "Vínculo inativo" : "Vínculo ativo"}
            </Badge>
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {contaItens.map((item) => (
          <DropdownMenuItem key={item.label} asChild>
            <Link to={item.to} className="flex items-center gap-2">
              <item.icon className="h-4 w-4 text-muted-foreground" aria-hidden />
              {item.label}
            </Link>
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="text-destructive focus:text-destructive"
          onSelect={() => {
            onLogout();
            navigate("/");
          }}
        >
          <Sair className="mr-2 h-4 w-4" aria-hidden />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
