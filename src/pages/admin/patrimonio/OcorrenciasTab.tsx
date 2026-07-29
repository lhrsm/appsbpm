import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { AlertTriangle } from 'lucide-react';
import { dataHoraBR } from '@/lib/patrimonio';

export default function OcorrenciasTab() {
  const [itens, setItens] = useState<any[]>([]);
  const [bens, setBens] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtro, setFiltro] = useState('aberta');
  const [resposta, setResposta] = useState<Record<string, string>>({});

  const carregar = async () => {
    setLoading(true);
    const [o, b] = await Promise.all([
      supabase.from('pat_ocorrencias').select('*').order('created_at', { ascending: false }),
      supabase.from('pat_bens').select('id,numero_patrimonial,descricao'),
    ]);
    setItens(o.data || []);
    setBens(b.data || []);
    setLoading(false);
  };

  useEffect(() => { void carregar(); }, []);

  const responder = async (o: any, status: string) => {
    const { error } = await supabase.from('pat_ocorrencias')
      .update({ status, resposta: resposta[o.id] ?? o.resposta }).eq('id', o.id);
    if (error) return toast.error(error.message);
    toast.success('Ocorrência atualizada.');
    void carregar();
  };

  const filtradas = itens.filter((o) => filtro === 'todas' || o.status === filtro);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">Ocorrências informadas pela leitura do QR Code dos bens.</p>
        <Select value={filtro} onValueChange={setFiltro}>
          <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="aberta">Abertas</SelectItem>
            <SelectItem value="em_analise">Em análise</SelectItem>
            <SelectItem value="resolvida">Resolvidas</SelectItem>
            <SelectItem value="todas">Todas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando...</p>
      ) : filtradas.length === 0 ? (
        <Card><CardContent className="p-10 text-center text-muted-foreground">Nenhuma ocorrência registrada.</CardContent></Card>
      ) : (
        <div className="grid gap-2">
          {filtradas.map((o) => {
            const b = bens.find((x) => x.id === o.bem_id);
            return (
              <Card key={o.id}>
                <CardContent className="space-y-2 p-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-yellow-600" aria-hidden="true" />
                    <span className="font-mono text-xs text-muted-foreground">{b?.numero_patrimonial ?? '—'}</span>
                    <p className="font-medium">{b?.descricao ?? 'Bem'}</p>
                    <Badge variant="outline">{o.tipo}</Badge>
                    <Badge className={o.status === 'resolvida' ? 'bg-green-600 text-white' : 'bg-yellow-500 text-white'}>
                      {o.status === 'resolvida' ? 'Resolvida' : o.status === 'em_analise' ? 'Em análise' : 'Aberta'}
                    </Badge>
                    <span className="ml-auto text-xs text-muted-foreground">{dataHoraBR(o.created_at)}</span>
                  </div>
                  <p className="text-sm">{o.descricao}</p>
                  <p className="text-xs text-muted-foreground">
                    Informante: {o.informante_nome || 'Não identificado'}{o.informante_contato ? ` • ${o.informante_contato}` : ''}
                  </p>
                  {o.status !== 'resolvida' && (
                    <div className="flex flex-wrap items-end gap-2">
                      <Textarea
                        rows={2} className="flex-1" placeholder="Resposta / providências adotadas"
                        value={resposta[o.id] ?? o.resposta ?? ''}
                        onChange={(e) => setResposta({ ...resposta, [o.id]: e.target.value })}
                      />
                      <Button size="sm" variant="outline" onClick={() => responder(o, 'em_analise')}>Em análise</Button>
                      <Button size="sm" onClick={() => responder(o, 'resolvida')}>Resolver</Button>
                    </div>
                  )}
                  {o.status === 'resolvida' && o.resposta && (
                    <p className="rounded-md bg-muted p-2 text-xs">Resposta: {o.resposta}</p>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
