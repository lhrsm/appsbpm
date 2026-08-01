import { Link } from "react-router-dom";
import { Text } from "@/design-system/components/Text";
import { Badge } from "@/design-system/components/Badge";
import { Button } from "@/design-system/components/Button";
import { icons } from "@/design-system/icons";
import type { ProfileStatusData } from "../types";

const linhas = [
  { key: "cadastroAtualizado", label: "Cadastro revisado" },
  { key: "emailConfirmado", label: "E-mail confirmado" },
  { key: "telefoneConfirmado", label: "Telefone confirmado" },
  { key: "doisFatoresAtivo", label: "Verificação em duas etapas" },
] as const;

/** Situação cadastral e de segurança da conta (sem exibir dados sensíveis). */
export function DashboardProfileStatus({ data }: { data: ProfileStatusData }) {
  return (
    <div className="space-y-4 rounded-xl border bg-card p-4">
      <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {linhas.map((l) => {
          const ok = data[l.key];
          return (
            <li key={l.key} className="flex items-center justify-between gap-3 rounded-lg border bg-background px-3 py-2">
              <Text variant="small">{l.label}</Text>
              <Badge tone={ok ? "success" : "warning"} icon={ok ? icons.sucesso : icons.alerta}>
                {ok ? "Em dia" : "Pendente"}
              </Badge>
            </li>
          );
        })}
      </ul>

      {data.pendencias.length > 0 && (
        <ul className="list-inside list-disc text-sm text-muted-foreground">
          {data.pendencias.map((p) => (
            <li key={p}>{p}</li>
          ))}
        </ul>
      )}

      <div className="flex flex-wrap items-center justify-between gap-2 border-t pt-3">
        <Text variant="caption">
          Origem dos dados: {data.origem}
          {data.ultimaSincronizacao
            ? ` · Sincronizado em ${new Date(data.ultimaSincronizacao).toLocaleDateString("pt-BR")}`
            : ""}
        </Text>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="secondary" leftIcon={icons.editar} asChild>
            <Link to="/dashboard/perfil">Atualizar dados</Link>
          </Button>
          <Button size="sm" variant="ghost" leftIcon={icons.lgpd} asChild>
            <Link to="/dashboard/privacidade">Privacidade</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
