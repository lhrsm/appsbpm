import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { icons } from "@/design-system/icons";

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
        <Button variant="outline" onClick={() => navigate("/dashboard")}>
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
