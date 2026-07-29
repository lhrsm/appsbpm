import { useEffect, useState } from 'react';
import { portalCall } from '@/lib/portal';
import { useAssociado } from '@/contexts/AssociadoContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, XCircle, Monitor } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

type Row = {
  id: string;
  tipo_usuario: string;
  metodo_login: string;
  ip: string | null;
  user_agent: string | null;
  sucesso: boolean;
  created_at: string;
};

export default function HistoricoAcessos() {
  const { associado, dependenteLogado, isDependente } = useAssociado();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!associado?.id) return;
    (async () => {
      setLoading(true);
      const { acessos } = await portalCall<{ acessos: Row[] }>('privacidade').catch(() => ({ acessos: [] }));
      setRows(acessos ?? []);
      setLoading(false);
    })();
  }, [associado?.id, dependenteLogado?.id, isDependente]);

  return (
    <main className="max-w-4xl mx-auto p-4 md:p-6 space-y-4">
      <header>
        <h1 className="text-2xl font-bold">Histórico de acessos</h1>
        <p className="text-sm text-muted-foreground">
          Últimos 50 acessos à sua conta. Se identificar algo suspeito, altere sua senha e contate a SBPM.
        </p>
      </header>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Atividade recente</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-4 space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-14 w-full" />
              ))}
            </div>
          ) : rows.length === 0 ? (
            <p className="p-6 text-center text-sm text-muted-foreground">Sem registros ainda.</p>
          ) : (
            <ul className="divide-y">
              {rows.map((r) => (
                <li key={r.id} className="p-4 flex items-start gap-3">
                  <div className={r.sucesso ? 'text-sbpm-green' : 'text-destructive'}>
                    {r.sucesso ? <CheckCircle2 className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">
                        {r.sucesso ? 'Acesso bem-sucedido' : 'Tentativa falha'}
                      </span>
                      <Badge variant="outline" className="uppercase text-[10px]">
                        {r.metodo_login}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px]">
                        {r.tipo_usuario}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {format(new Date(r.created_at), "dd 'de' MMMM 'de' yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                    {r.user_agent && (
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1 truncate">
                        <Monitor className="h-3 w-3 shrink-0" />
                        <span className="truncate">{r.user_agent}</span>
                      </p>
                    )}
                    {r.ip && <p className="text-xs text-muted-foreground">IP: {r.ip}</p>}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
