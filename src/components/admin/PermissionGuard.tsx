import { useEffect, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { usePermissoes } from "@/hooks/usePermissoes";
import { rotaParaModulo, labelModulo } from "@/lib/permissoes";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ShieldAlert } from "lucide-react";
import { logAudit } from "@/lib/audit";

/**
 * Proteção de rota da área administrativa.
 * A checagem no cliente é apenas de navegação — o acesso real aos dados
 * continua sendo validado pelas políticas RLS no banco.
 */
export default function PermissionGuard({ children }: { children: React.ReactNode }) {
  const { loading, perfil, pode } = usePermissoes();
  const location = useLocation();
  const modulo = rotaParaModulo(location.pathname);

  const autorizado = loading ? null : modulo === "*" ? !!perfil?.interno : pode(modulo, "visualizar");

  const registrado = useRef<string | null>(null);
  useEffect(() => {
    if (autorizado === false && registrado.current !== location.pathname) {
      registrado.current = location.pathname;
      logAudit("acesso_negado", "rota_admin", location.pathname, {
        modulo,
        criticidade: "alta",
        detalhes: { rota: location.pathname, perfil: perfil?.codigo ?? null },
      });
    }
  }, [autorizado, location.pathname, modulo, perfil?.codigo]);

  if (loading) {
    return <div className="p-6 text-sm text-muted-foreground">Verificando permissões...</div>;
  }

  if (autorizado) return <>{children}</>;


  return (
    <Card className="max-w-xl mx-auto mt-8 border-destructive/40">
      <CardHeader>
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-destructive" aria-hidden="true" />
          <CardTitle className="text-base">Acesso não autorizado</CardTitle>
        </div>
        <CardDescription>
          Seu perfil ({perfil?.nome ?? "sem perfil"}) não possui permissão de visualização no módulo{" "}
          <strong>{labelModulo(modulo)}</strong>.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild size="sm" variant="outline">
          <Link to="/admin">Voltar à visão geral</Link>
        </Button>
      </CardContent>
    </Card>
  );
}
