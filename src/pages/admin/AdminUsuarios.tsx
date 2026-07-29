import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ShieldCheck, Users, Info } from "lucide-react";

type Row = { user_id: string; papel: string; desde: string };

export default function AdminUsuarios() {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<Row[]>([]);
  const [meuId, setMeuId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data: sess } = await supabase.auth.getSession();
      setMeuId(sess.session?.user.id ?? null);
      const [roles, prev] = await Promise.all([
        supabase.from("user_roles").select("user_id,role,created_at"),
        supabase.from("previdencia_admins").select("user_id,created_at"),
      ]);
      const list: Row[] = [
        ...(((roles.data as any[]) || []).map((r) => ({ user_id: r.user_id, papel: r.role, desde: r.created_at }))),
        ...(((prev.data as any[]) || []).map((r) => ({ user_id: r.user_id, papel: "previdencia", desde: r.created_at }))),
      ];
      setRows(list);
      setLoading(false);
    })();
  }, []);

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-bold">Usuários e Permissões</h1>
        <p className="text-sm text-muted-foreground max-w-3xl">
          Papéis internos com acesso à área administrativa. As permissões são validadas no banco de dados
          (RLS), não na interface.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-base">Administrador</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xs">
              Acesso total a todos os módulos administrativos, integrações, auditoria e configurações.
            </CardDescription>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" aria-hidden="true" />
              <CardTitle className="text-base">Previdência</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <CardDescription className="text-xs">
              Acesso restrito a associados, dependentes, pecúlio, informes, solicitações, documentos e
              financeiro.
            </CardDescription>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Acessos concedidos</CardTitle>
          <CardDescription className="text-xs">
            Concessão e revogação de papéis são feitas por migration/backend por segurança.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              <Skeleton className="h-8 w-full" />
              <Skeleton className="h-8 w-full" />
            </div>
          ) : rows.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum papel visível com o seu nível de acesso.</p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Papel</TableHead>
                    <TableHead>Desde</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {rows.map((r) => (
                    <TableRow key={`${r.user_id}-${r.papel}`}>
                      <TableCell className="font-mono text-xs">
                        {r.user_id.slice(0, 8)}…
                        {r.user_id === meuId && <Badge variant="secondary" className="ml-2 text-[10px]">você</Badge>}
                      </TableCell>
                      <TableCell><Badge className="text-[10px]">{r.papel}</Badge></TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {r.desde ? new Date(r.desde).toLocaleDateString("pt-BR") : "—"}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="border-dashed">
        <CardContent className="flex items-start gap-3 py-4">
          <Info className="h-4 w-4 mt-0.5 text-primary shrink-0" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Próxima etapa: papéis por setor (financeiro, patrimônio, contábil, saúde, previdência e auditor)
            via migration aditiva, permitindo acesso segmentado aos novos módulos institucionais.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
