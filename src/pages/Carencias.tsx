import { useAssociado } from '@/contexts/AssociadoContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, CheckCircle, AlertCircle, Calendar } from 'lucide-react';
import { format, isPast, isFuture } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Carencias() {
  const { carencias } = useAssociado();

  const carenciasLiberadas = carencias.filter((c) => c.status === 'liberado');
  const carenciasEmEspera = carencias.filter((c) => c.status === 'em_carencia');

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Carência de Exames</h2>
        <p className="text-muted-foreground">
          Confira o status de carência dos seus procedimentos
        </p>
      </div>

      {/* Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border-l-4 border-l-primary">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Liberados</p>
                <p className="text-3xl font-bold text-primary">{carenciasLiberadas.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-warning">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <Clock className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Em Carência</p>
                <p className="text-3xl font-bold text-warning">{carenciasEmEspera.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Procedimentos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Procedimentos
          </CardTitle>
        </CardHeader>
        <CardContent>
          {carencias.length > 0 ? (
            <div className="space-y-3">
              {carencias.map((carencia) => {
                const liberado = carencia.status === 'liberado';
                const dataLiberacao = carencia.data_liberacao 
                  ? new Date(carencia.data_liberacao) 
                  : null;
                const jaLiberado = dataLiberacao ? isPast(dataLiberacao) : false;

                return (
                  <div
                    key={carencia.id}
                    className={`flex items-center justify-between p-4 rounded-lg border ${
                      liberado || jaLiberado 
                        ? 'bg-primary/5 border-primary/20' 
                        : 'bg-warning/5 border-warning/20'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {liberado || jaLiberado ? (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-warning" />
                      )}
                      <div>
                        <p className="font-medium text-foreground">
                          {carencia.procedimento}
                        </p>
                        {dataLiberacao && !jaLiberado && (
                          <p className="text-sm text-muted-foreground">
                            Libera em: {format(dataLiberacao, "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={liberado || jaLiberado ? 'default' : 'secondary'}>
                      {liberado || jaLiberado ? 'Liberado' : 'Em Carência'}
                    </Badge>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground">
                Nenhum procedimento com carência cadastrado.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
