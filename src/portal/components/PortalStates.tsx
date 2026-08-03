import { useNavigate } from "react-router-dom";
import { Button } from "@/design-system/components/Button";
import { icons } from "@/design-system/icons";
import { useAssociado } from "@/contexts/AssociadoContext";

export interface PortalErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
}

/** Estado de erro padronizado do portal (sem detalhes técnicos). */
export function PortalErrorState({
  title = "Não foi possível carregar esta página",
  description = "Tente novamente em instantes. Se o problema continuar, fale com o suporte.",
  onRetry,
}: PortalErrorStateProps) {
  const navigate = useNavigate();
  const Alerta = icons.alerta;

  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10" aria-hidden>
        <Alerta className="h-6 w-6 text-destructive" />
      </span>
      <div>
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2">
        {onRetry && <Button onClick={onRetry}>Tentar novamente</Button>}
        <Button variant="secondary" onClick={() => navigate("/dashboard")}>
          Voltar ao início
        </Button>
        <Button variant="ghost" asChild>
          <a href="https://wa.me/5571985496972" target="_blank" rel="noopener noreferrer">
            Falar com o suporte
          </a>
        </Button>
      </div>
    </div>
  );
}

/** Página exibida quando a rota não é permitida ao perfil atual. */
export function PortalAccessDenied() {
  const navigate = useNavigate();
  const Lock = icons.lgpd;
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-8 text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted" aria-hidden>
        <Lock className="h-6 w-6 text-muted-foreground" />
      </span>
      <div>
        <h2 className="text-lg font-semibold text-foreground">Acesso restrito</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Este recurso não está disponível para o seu perfil de acesso.
        </p>
      </div>
      <Button onClick={() => navigate("/dashboard")}>Voltar ao início</Button>
    </div>
  );
}

/** Estado de carregamento global do portal externo. */
export function PortalLoadingState({ message = "Carregando seu portal..." }: { message?: string }) {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center gap-4 p-8 text-center animate-fade-in" id="portal-loading-state">
      <div className="relative">
        <div className="h-12 w-12 rounded-full border-4 border-primary/20 border-t-primary animate-spin" />
        <icons.dashboard className="absolute left-1/2 top-1/2 h-6 w-6 -translate-x-1/2 -translate-y-1/2 text-primary opacity-50" />
      </div>
      <div className="space-y-1">
        <h2 className="text-lg font-semibold text-foreground">{message}</h2>
        <p className="text-sm text-muted-foreground italic">Garantindo a segurança dos seus dados...</p>
      </div>
    </div>
  );
}

/** Estado exibido quando o perfil não é localizado após a autenticação. */
export function PortalProfileNotFound({ 
  onRetry,
  title = "Não foi possível localizar seu cadastro",
  description = "Identificamos sua conta, mas não conseguimos carregar os dados vinculados ao seu perfil institucional."
}: { 
  onRetry: () => void;
  title?: string;
  description?: string;
}) {
  const navigate = useNavigate();
  const UserSearch = icons.associados;
  const { logout } = useAssociado();
  
  const handleLogout = () => {
    logout();
    navigate('/');
  };
  
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-8 text-center animate-fade-in shadow-sm w-full max-w-2xl" id="portal-profile-not-found">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-muted" aria-hidden>
        <UserSearch className="h-6 w-6 text-muted-foreground" />
      </span>
      <div className="max-w-md">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <div className="mt-2 p-3 bg-destructive/5 border border-destructive/10 rounded-lg text-sm text-muted-foreground leading-relaxed">
          {description}
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-2">
        <Button onClick={onRetry} leftIcon={icons.atualizar}>Tentar novamente</Button>
        <Button variant="secondary" onClick={handleLogout} leftIcon={icons.lgpd}>Sair da conta</Button>
        <Button variant="ghost" onClick={() => navigate("/")}>Página pública</Button>
      </div>
    </div>
  );
}

/** Estado de acesso restrito (LGPD/Segurança). */
export function PortalAccessRestricted({ message }: { message?: string }) {
  const navigate = useNavigate();
  const Lock = icons.lgpd;
  
  return (
    <div className="flex flex-col items-center gap-4 rounded-xl border bg-card p-8 text-center animate-fade-in shadow-sm">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-warning/10" aria-hidden>
        <Lock className="h-6 w-6 text-warning" />
      </span>
      <div className="max-w-md">
        <h2 className="text-lg font-semibold text-foreground">Acesso restrito</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {message || "Seu acesso a esta área está temporariamente restrito por motivos de segurança ou pendência cadastral."}
        </p>
      </div>
      <Button onClick={() => navigate("/dashboard")}>Voltar ao início</Button>
    </div>
  );
}
