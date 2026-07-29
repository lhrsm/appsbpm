import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Boxes, Loader2, ShieldCheck } from 'lucide-react';
import { PAT_STATUS, PatStatus, dataHoraBR } from '@/lib/patrimonio';

const TIPOS_OCORRENCIA = [
  { value: 'dano', label: 'Dano ou defeito' },
  { value: 'extravio', label: 'Extravio' },
  { value: 'localizacao', label: 'Localização divergente' },
  { value: 'responsavel', label: 'Responsável divergente' },
  { value: 'outro', label: 'Outro' },
];

export default function BemQR() {
  const { token = '' } = useParams();
  const [bem, setBem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);
  const [form, setForm] = useState({ tipo: 'dano', descricao: '', nome: '', contato: '' });
  const [enviado, setEnviado] = useState(false);

  useEffect(() => {
    (async () => {
      const { data, error } = await supabase.rpc('pat_consulta_qr', { _token: token });
      if (error) toast.error('Não foi possível consultar este bem.');
      setBem((data as any[])?.[0] ?? null);
      setLoading(false);
    })();
  }, [token]);

  const enviar = async () => {
    if (form.descricao.trim().length < 10) return toast.error('Descreva a ocorrência com pelo menos 10 caracteres.');
    setEnviando(true);
    const { error } = await supabase.rpc('pat_registrar_ocorrencia', {
      _token: token, _descricao: form.descricao, _tipo: form.tipo,
      _nome: form.nome || null, _contato: form.contato || null,
    });
    setEnviando(false);
    if (error) return toast.error(error.message);
    setEnviado(true);
    toast.success('Ocorrência registrada. Obrigado!');
  };

  return (
    <main className="mx-auto min-h-screen max-w-lg space-y-4 p-4">
      <div className="flex items-center gap-2 pt-4">
        <Boxes className="h-6 w-6 text-primary" aria-hidden="true" />
        <div>
          <h1 className="text-lg font-bold">Consulta patrimonial SBPM</h1>
          <p className="text-xs text-muted-foreground">Identificação pública do bem institucional.</p>
        </div>
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">Carregando informações do bem...</p>
      ) : !bem ? (
        <Card><CardContent className="p-8 text-center text-muted-foreground">
          Bem não encontrado. Verifique se a etiqueta está legível ou procure o setor de patrimônio.
        </CardContent></Card>
      ) : (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">{bem.descricao}</CardTitle>
              <p className="font-mono text-xs text-muted-foreground">{bem.numero_patrimonial}</p>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <Badge className={PAT_STATUS[bem.status as PatStatus]?.className}>
                {PAT_STATUS[bem.status as PatStatus]?.label}
              </Badge>
              <dl className="grid grid-cols-2 gap-2 pt-2 text-xs">
                <div><dt className="text-muted-foreground">Categoria</dt><dd>{bem.categoria ?? '—'}</dd></div>
                <div><dt className="text-muted-foreground">Marca / modelo</dt><dd>{[bem.marca, bem.modelo].filter(Boolean).join(' ') || '—'}</dd></div>
                <div><dt className="text-muted-foreground">Unidade</dt><dd>{bem.unidade ?? '—'}</dd></div>
                <div><dt className="text-muted-foreground">Setor</dt><dd>{bem.setor ?? '—'}</dd></div>
                <div><dt className="text-muted-foreground">Localização</dt><dd>{bem.localizacao ?? '—'}</dd></div>
                <div><dt className="text-muted-foreground">Responsável</dt><dd>{bem.responsavel ?? '—'}</dd></div>
                <div><dt className="text-muted-foreground">Conservação</dt><dd className="capitalize">{bem.estado_conservacao}</dd></div>
              </dl>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2"><CardTitle className="text-base">Histórico recente</CardTitle></CardHeader>
            <CardContent>
              {(bem.historico ?? []).length === 0 ? (
                <p className="text-sm text-muted-foreground">Sem registros disponíveis.</p>
              ) : (
                <ol className="space-y-1 text-xs">
                  {(bem.historico as any[]).map((h, i) => (
                    <li key={i} className="flex justify-between gap-2 border-b py-1 last:border-0">
                      <span className="capitalize">{String(h.acao).replace(/_/g, ' ')}</span>
                      <span className="text-muted-foreground">{dataHoraBR(h.data)}</span>
                    </li>
                  ))}
                </ol>
              )}
            </CardContent>
          </Card>

          {bem.permite_ocorrencia && (
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-base">Informar ocorrência</CardTitle></CardHeader>
              <CardContent className="space-y-3">
                {enviado ? (
                  <p className="flex items-center gap-2 text-sm text-green-700">
                    <ShieldCheck className="h-4 w-4" aria-hidden="true" /> Ocorrência registrada. O setor de patrimônio fará a análise.
                  </p>
                ) : (
                  <>
                    <div>
                      <Label>Tipo</Label>
                      <Select value={form.tipo} onValueChange={(v) => setForm({ ...form, tipo: v })}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>{TIPOS_OCORRENCIA.map((t) => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Descrição *</Label>
                      <Textarea rows={3} value={form.descricao} onChange={(e) => setForm({ ...form, descricao: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div><Label>Seu nome</Label><Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} /></div>
                      <div><Label>Contato</Label><Input value={form.contato} onChange={(e) => setForm({ ...form, contato: e.target.value })} /></div>
                    </div>
                    <Button className="w-full" onClick={enviar} disabled={enviando}>
                      {enviando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Enviar ocorrência
                    </Button>
                  </>
                )}
              </CardContent>
            </Card>
          )}
        </>
      )}
    </main>
  );
}
