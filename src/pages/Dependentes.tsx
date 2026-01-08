import { useAssociado } from '@/contexts/AssociadoContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, User, Calendar, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dependentes() {
  const { dependentes } = useAssociado();

  const tipoLabel: Record<string, string> = {
    conjuge: 'Cônjuge',
    filho: 'Filho(a)',
    pai_mae: 'Pai/Mãe',
    outro: 'Outro',
  };

  const tipoColor: Record<string, string> = {
    conjuge: 'bg-pink-100 text-pink-700',
    filho: 'bg-blue-100 text-blue-700',
    pai_mae: 'bg-purple-100 text-purple-700',
    outro: 'bg-gray-100 text-gray-700',
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Dependentes</h2>
        <p className="text-muted-foreground">
          Visualize os dependentes vinculados ao seu cadastro
        </p>
      </div>

      {/* Resumo */}
      <Card className="border-l-4 border-l-primary">
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total de Dependentes</p>
              <p className="text-3xl font-bold text-primary">{dependentes.length}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Dependentes */}
      {dependentes.length > 0 ? (
        <div className="grid gap-4">
          {dependentes.map((dependente) => (
            <Card key={dependente.id} className="hover:shadow-md transition-shadow">
              <CardContent className="pt-6">
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center overflow-hidden shrink-0">
                    {dependente.foto_url ? (
                      <img
                        src={dependente.foto_url}
                        alt={dependente.nome}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>

                  <div className="flex-1 space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-semibold text-lg text-foreground">
                          {dependente.nome}
                        </h3>
                        <Badge className={tipoColor[dependente.tipo]}>
                          {tipoLabel[dependente.tipo]}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-muted-foreground">
                      {dependente.cpf && (
                        <div>
                          <span className="font-medium">CPF:</span>{' '}
                          {dependente.cpf.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '***.$2.$3-**')}
                        </div>
                      )}
                      {dependente.data_nascimento && (
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {format(new Date(dependente.data_nascimento), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="pt-6">
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <h3 className="font-semibold text-lg text-foreground mb-2">
                Nenhum dependente cadastrado
              </h3>
              <p className="text-muted-foreground max-w-md mx-auto">
                Você não possui dependentes vinculados ao seu cadastro.
                Para incluir dependentes, entre em contato com a SBPM.
              </p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
