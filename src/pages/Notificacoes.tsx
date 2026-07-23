import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, BellRing, CheckCheck, ExternalLink } from 'lucide-react';
import { useNotificacoes } from '@/hooks/useNotificacoes';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import PageSkeleton from '@/components/PageSkeleton';

const CATEGORIA_LABEL: Record<string, { label: string; className: string }> = {
  geral: { label: 'Geral', className: 'bg-muted text-foreground' },
  aviso: { label: 'Aviso', className: 'bg-sbpm-yellow/20 text-yellow-800' },
  financeiro: { label: 'Financeiro', className: 'bg-sbpm-green/20 text-green-800' },
  evento: { label: 'Evento', className: 'bg-sbpm-blue/20 text-blue-800' },
  urgente: { label: 'Urgente', className: 'bg-sbpm-red/20 text-red-800' },
};

export default function Notificacoes() {
  const { items, loading, naoLidas, marcarLida, marcarTodasLidas } = useNotificacoes();

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BellRing className="h-6 w-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Notificações</h1>
            <p className="text-sm text-muted-foreground">
              {naoLidas > 0 ? `${naoLidas} não lida(s)` : 'Tudo em dia'}
            </p>
          </div>
        </div>
        {naoLidas > 0 && (
          <Button onClick={marcarTodasLidas} variant="outline" size="sm" className="gap-2">
            <CheckCheck className="h-4 w-4" /> Marcar todas como lidas
          </Button>
        )}
      </div>

      {loading && items.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">Carregando...</div>
      ) : items.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground flex flex-col items-center gap-3">
            <Bell className="h-12 w-12 opacity-40" />
            <p>Você ainda não recebeu nenhuma notificação.</p>
            <Link to="/dashboard/perfil" className="text-sm text-primary underline">
              Ativar notificações no perfil
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {items.map((n) => {
            const cat = CATEGORIA_LABEL[n.categoria] ?? CATEGORIA_LABEL.geral;
            return (
              <Card
                key={n.id}
                className={cn(
                  'transition-all hover:shadow-md cursor-pointer',
                  !n.lida && 'border-l-4 border-l-primary bg-primary/5',
                )}
                onClick={() => !n.lida && marcarLida(n.id)}
              >
                <CardContent className="p-4 flex gap-3">
                  <div className={cn('h-2 w-2 mt-2 rounded-full shrink-0', !n.lida ? 'bg-primary' : 'bg-transparent')} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 flex-wrap">
                      <h3 className={cn('font-semibold', !n.lida && 'text-primary')}>{n.titulo}</h3>
                      <Badge className={cn('text-[10px] font-medium', cat.className)} variant="outline">
                        {cat.label}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 whitespace-pre-line">{n.corpo}</p>
                    <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
                      <span>
                        {formatDistanceToNow(new Date(n.created_at), { addSuffix: true, locale: ptBR })}
                      </span>
                      {n.url && (
                        <Link
                          to={n.url.startsWith('http') ? '#' : n.url}
                          onClick={(e) => {
                            if (n.url?.startsWith('http')) {
                              e.preventDefault();
                              window.open(n.url, '_blank');
                            }
                          }}
                          className="flex items-center gap-1 text-primary hover:underline"
                        >
                          Abrir <ExternalLink className="h-3 w-3" />
                        </Link>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
