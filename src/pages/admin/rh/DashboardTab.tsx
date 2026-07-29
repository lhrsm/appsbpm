import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Building2, Briefcase, UserMinus, Loader2 } from 'lucide-react';

type Resumo = {
  colaboradores: number;
  ativos: number;
  desligados: number;
  setores: number;
  cargos: number;
  unidades: number;
};

export default function DashboardTab({ onIrPara }: { onIrPara?: (aba: string) => void }) {
  const [resumo, setResumo] = useState<Resumo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const [colab, setores, cargos, unidades] = await Promise.all([
        supabase.from('rh_colaboradores').select('situacao'),
        supabase.from('rh_setores').select('id', { count: 'exact', head: true }),
        supabase.from('rh_cargos').select('id', { count: 'exact', head: true }),
        supabase.from('rh_unidades').select('id', { count: 'exact', head: true }),
      ]);
      const linhas = colab.data ?? [];
      setResumo({
        colaboradores: linhas.length,
        ativos: linhas.filter((c: any) => c.situacao === 'ativo').length,
        desligados: linhas.filter((c: any) => c.situacao === 'desligado').length,
        setores: setores.count ?? 0,
        cargos: cargos.count ?? 0,
        unidades: unidades.count ?? 0,
      });
      setLoading(false);
    })();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-8 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" /> Carregando indicadores...
      </div>
    );
  }

  const cards = [
    { label: 'Colaboradores ativos', valor: resumo?.ativos ?? 0, icon: Users, aba: 'colaboradores' },
    { label: 'Desligados', valor: resumo?.desligados ?? 0, icon: UserMinus, aba: 'colaboradores' },
    { label: 'Setores', valor: resumo?.setores ?? 0, icon: Building2, aba: 'estrutura' },
    { label: 'Cargos', valor: resumo?.cargos ?? 0, icon: Briefcase, aba: 'estrutura' },
  ];

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map((c) => (
          <Card
            key={c.label}
            className={onIrPara ? 'cursor-pointer transition-colors hover:border-primary' : ''}
            onClick={() => onIrPara?.(c.aba)}
          >
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{c.label}</CardTitle>
              <c.icon className="h-4 w-4 text-primary" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{c.valor}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm">Sobre o módulo</CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 text-sm text-muted-foreground">
          <p>
            O módulo de Recursos Humanos administra o ciclo funcional dos colaboradores da SBPM e é
            totalmente separado dos cadastros de associados e dependentes.
          </p>
          <p>
            Salários e dados bancários ficam em área restrita, exigindo permissão específica de RH
            sensível. Toda alteração é registrada em histórico imutável.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
