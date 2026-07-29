import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Database, PencilLine, RefreshCw, ShieldCheck } from "lucide-react";

export type Identidade = {
  id: string;
  identificador_institucional: string | null;
  matricula: string | null;
  cpf: string | null;
  codigo_associado: string | null;
  codigo_externo: string | null;
  titular_identificador: string | null;
  origem: string;
  ultima_sincronizacao: string | null;
  situacao_sync: string;
  alterado_manualmente: boolean;
  divergencia_pendente: boolean;
  validado: boolean;
};

export const SITUACAO_SYNC: Record<string, { label: string; className: string }> = {
  nunca_sincronizado: { label: "Nunca sincronizado", className: "bg-muted text-muted-foreground" },
  sincronizado: { label: "Sincronizado", className: "bg-emerald-100 text-emerald-800" },
  desatualizado: { label: "Desatualizado", className: "bg-amber-100 text-amber-800" },
  com_erro: { label: "Com erro", className: "bg-destructive/15 text-destructive" },
  pendente: { label: "Pendente", className: "bg-blue-100 text-blue-800" },
};

const fmt = (d: string | null) =>
  d ? new Date(d).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" }) : "—";

/**
 * Faixa de procedência do dado exibida em cada cadastro:
 * origem, última sincronização, situação, alteração manual e divergência pendente.
 */
export default function OrigemDadoBadge({
  entidade,
  registroId,
  className = "",
}: {
  entidade: "associado" | "dependente";
  registroId: string | null | undefined;
  className?: string;
}) {
  const [ident, setIdent] = useState<Identidade | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let ativo = true;
    (async () => {
      if (!registroId) {
        setLoading(false);
        return;
      }
      const { data } = await supabase
        .from("registro_identidades")
        .select("*")
        .eq("entidade", entidade)
        .eq("registro_id", registroId)
        .maybeSingle();
      if (!ativo) return;
      setIdent((data as Identidade) ?? null);
      setLoading(false);
    })();
    return () => {
      ativo = false;
    };
  }, [entidade, registroId]);

  if (loading || !registroId) return null;

  if (!ident) {
    return (
      <div className={`flex flex-wrap items-center gap-2 text-xs ${className}`}>
        <Badge variant="outline" className="gap-1">
          <Database className="h-3 w-3" aria-hidden="true" /> Origem: cadastro manual
        </Badge>
        <Badge className="bg-muted text-muted-foreground">Sem chave institucional</Badge>
      </div>
    );
  }

  const sit = SITUACAO_SYNC[ident.situacao_sync] ?? SITUACAO_SYNC.nunca_sincronizado;

  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs ${className}`}>
      <Badge variant="outline" className="gap-1">
        <Database className="h-3 w-3" aria-hidden="true" /> Origem: {ident.origem}
      </Badge>
      <Badge variant="outline" className="gap-1">
        <RefreshCw className="h-3 w-3" aria-hidden="true" /> Última sinc.: {fmt(ident.ultima_sincronizacao)}
      </Badge>
      <Badge className={sit.className}>{sit.label}</Badge>
      {ident.alterado_manualmente && (
        <Badge className="bg-blue-100 text-blue-800 gap-1">
          <PencilLine className="h-3 w-3" aria-hidden="true" /> Alterado manualmente
        </Badge>
      )}
      {ident.validado && (
        <Badge className="bg-emerald-100 text-emerald-800 gap-1">
          <ShieldCheck className="h-3 w-3" aria-hidden="true" /> Validado
        </Badge>
      )}
      {ident.divergencia_pendente && (
        <Badge className="bg-destructive/15 text-destructive gap-1">
          <AlertTriangle className="h-3 w-3" aria-hidden="true" /> Divergência pendente
        </Badge>
      )}
    </div>
  );
}
