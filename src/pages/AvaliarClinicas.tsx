import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAssociado } from '@/contexts/AssociadoContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Star, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

type Clinica = { id: string; nome: string; especialidade: string | null };
type Avaliacao = { id: string; clinica_id: string; nota: number; comentario: string | null; created_at: string };

function Stars({ value, onChange, size = 20 }: { value: number; onChange?: (n: number) => void; size?: number }) {
  return (
    <div className="flex gap-1" role={onChange ? 'radiogroup' : undefined} aria-label="Nota">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange?.(n)}
          disabled={!onChange}
          aria-label={`${n} estrela${n > 1 ? 's' : ''}`}
          className={onChange ? 'cursor-pointer' : 'cursor-default'}
        >
          <Star
            style={{ width: size, height: size }}
            className={n <= value ? 'fill-yellow-500 text-yellow-500' : 'text-muted-foreground/40'}
          />
        </button>
      ))}
    </div>
  );
}

export default function AvaliarClinicas() {
  const { associado } = useAssociado();
  const [clinicas, setClinicas] = useState<Clinica[]>([]);
  const [minhas, setMinhas] = useState<Avaliacao[]>([]);
  const [medias, setMedias] = useState<Record<string, { avg: number; count: number }>>({});
  const [openId, setOpenId] = useState<string | null>(null);
  const [nota, setNota] = useState(5);
  const [coment, setComent] = useState('');

  const load = async () => {
    const [{ data: cs }, { data: mine }, { data: all }] = await Promise.all([
      supabase.from('clinicas_parceiros').select('id,nome,especialidade').eq('status', 'ativo').order('nome'),
      associado?.id
        ? supabase.from('avaliacoes_parceiros').select('*').eq('associado_id', associado.id)
        : Promise.resolve({ data: [] as Avaliacao[] }),
      supabase.from('avaliacoes_parceiros').select('clinica_id,nota').eq('aprovado', true),
    ]);
    setClinicas((cs as Clinica[]) ?? []);
    setMinhas((mine as Avaliacao[]) ?? []);
    const m: Record<string, { avg: number; count: number; sum: number }> = {};
    (all ?? []).forEach((a: any) => {
      m[a.clinica_id] ??= { avg: 0, count: 0, sum: 0 };
      m[a.clinica_id].sum += a.nota;
      m[a.clinica_id].count += 1;
    });
    const out: Record<string, { avg: number; count: number }> = {};
    Object.entries(m).forEach(([k, v]) => (out[k] = { avg: v.sum / v.count, count: v.count }));
    setMedias(out);
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [associado?.id]);

  const abrir = (id: string) => {
    const existente = minhas.find((m) => m.clinica_id === id);
    setNota(existente?.nota ?? 5);
    setComent(existente?.comentario ?? '');
    setOpenId(id);
  };

  const enviar = async () => {
    if (!associado?.id || !openId) return;
    const existente = minhas.find((m) => m.clinica_id === openId);
    const base = {
      associado_id: associado.id,
      clinica_id: openId,
      nota,
      comentario: coment || null,
      aprovado: false,
    };
    const { error } = existente
      ? await supabase.from('avaliacoes_parceiros').update(base).eq('id', existente.id)
      : await supabase.from('avaliacoes_parceiros').insert({ ...base, autor_nome: associado.nome ?? 'Associado' });
    if (error) return toast.error('Erro ao enviar avaliação.');
    toast.success('Avaliação enviada! Será exibida após moderação.');
    setOpenId(null);
    load();
  };

  return (
    <main className="max-w-5xl mx-auto p-4 md:p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Avaliar Clínicas e Parceiros</h1>
        <p className="text-sm text-muted-foreground">
          Ajude outros associados compartilhando sua experiência. Avaliações passam por moderação.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {clinicas.map((c) => {
          const m = medias[c.id];
          const mine = minhas.find((x) => x.clinica_id === c.id);
          return (
            <Card key={c.id}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{c.nome}</CardTitle>
                {c.especialidade && <p className="text-xs text-muted-foreground">{c.especialidade}</p>}
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Stars value={Math.round(m?.avg ?? 0)} />
                  <span className="text-xs text-muted-foreground">
                    {m ? `${m.avg.toFixed(1)} (${m.count})` : 'Sem avaliações'}
                  </span>
                </div>
                <Button size="sm" variant="outline" className="w-full" onClick={() => abrir(c.id)}>
                  <MessageSquare className="h-4 w-4 mr-2" />
                  {mine ? 'Editar minha avaliação' : 'Avaliar'}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={!!openId} onOpenChange={(o) => !o && setOpenId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sua avaliação</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Stars value={nota} onChange={setNota} size={28} />
            <Textarea
              placeholder="Conte sua experiência (opcional)"
              value={coment}
              onChange={(e) => setComent(e.target.value)}
              rows={4}
              maxLength={500}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpenId(null)}>Cancelar</Button>
            <Button onClick={enviar}>Enviar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  );
}
