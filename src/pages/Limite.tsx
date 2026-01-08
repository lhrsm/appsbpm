import { useAssociado } from '@/contexts/AssociadoContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { DollarSign, TrendingDown, Calendar, History } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Limite() {
  const { limite, historicoLimite } = useAssociado();

  const limiteTotal = limite ? Number(limite.limite_total) : 0;
  const limiteUtilizado = limite ? Number(limite.limite_utilizado) : 0;
  const limiteDisponivel = limiteTotal - limiteUtilizado;
  const percentualUtilizado = limiteTotal > 0 ? (limiteUtilizado / limiteTotal) * 100 : 0;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Limite Disponível</h2>
        <p className="text-muted-foreground">
          Acompanhe seu limite de crédito e histórico de utilização
        </p>
      </div>

      {/* Cards de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Limite Total</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(limiteTotal)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-accent">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <DollarSign className="h-6 w-6 text-accent" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Disponível</p>
                <p className="text-2xl font-bold text-accent">
                  {formatCurrency(limiteDisponivel)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-destructive/10 rounded-lg">
                <TrendingDown className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Utilizado</p>
                <p className="text-2xl font-bold text-destructive">
                  {formatCurrency(limiteUtilizado)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Barra de Progresso */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Utilização do Limite</span>
              <span className="font-medium">{percentualUtilizado.toFixed(1)}%</span>
            </div>
            <Progress value={percentualUtilizado} className="h-3" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>0%</span>
              <span>100%</span>
            </div>
          </div>

          {limite?.data_renovacao && (
            <div className="flex items-center gap-2 mt-4 pt-4 border-t">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Próxima renovação: {' '}
                <span className="font-medium text-foreground">
                  {format(new Date(limite.data_renovacao), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
                </span>
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Utilização
          </CardTitle>
        </CardHeader>
        <CardContent>
          {historicoLimite.length > 0 ? (
            <div className="space-y-3">
              {historicoLimite.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-3 bg-muted/50 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-foreground">
                      {item.descricao || 'Utilização de limite'}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(item.data_utilizacao), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </p>
                  </div>
                  <Badge variant="destructive" className="text-sm">
                    -{formatCurrency(Number(item.valor))}
                  </Badge>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Nenhuma utilização registrada.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
