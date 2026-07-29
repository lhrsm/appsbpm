import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, Save } from 'lucide-react';

const CHAVES = {
  qr_permite_ocorrencia: 'true',
  prefixo_numero: 'SBPM',
  proximo_numero: '1',
  vida_util_padrao_meses: '60',
  texto_qr: 'Bem patrimonial da Sociedade Beneficente da Polícia Militar da Bahia.',
};

export default function ConfiguracoesTab() {
  const [valores, setValores] = useState<Record<string, string>>(CHAVES);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    (async () => {
      const { data } = await supabase.from('pat_config').select('*');
      const map = { ...CHAVES } as Record<string, string>;
      (data || []).forEach((r: any) => { map[r.chave] = r.valor ?? ''; });
      setValores(map);
      setLoading(false);
    })();
  }, []);

  const salvar = async () => {
    setSalvando(true);
    const rows = Object.entries(valores).map(([chave, valor]) => ({ chave, valor, updated_at: new Date().toISOString() }));
    const { error } = await supabase.from('pat_config').upsert(rows, { onConflict: 'chave' });
    setSalvando(false);
    if (error) return toast.error(error.message);
    toast.success('Configurações salvas.');
  };

  if (loading) return <p className="text-sm text-muted-foreground">Carregando configurações...</p>;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Numeração patrimonial</CardTitle></CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-2">
          <div>
            <Label>Prefixo do número patrimonial</Label>
            <Input value={valores.prefixo_numero ?? ''} onChange={(e) => setValores({ ...valores, prefixo_numero: e.target.value })} />
          </div>
          <div>
            <Label>Próximo número sugerido</Label>
            <Input type="number" value={valores.proximo_numero ?? ''} onChange={(e) => setValores({ ...valores, proximo_numero: e.target.value })} />
          </div>
          <div>
            <Label>Vida útil padrão (meses)</Label>
            <Input type="number" value={valores.vida_util_padrao_meses ?? ''} onChange={(e) => setValores({ ...valores, vida_util_padrao_meses: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2"><CardTitle className="text-base">Consulta pública por QR Code</CardTitle></CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center justify-between rounded-md border p-3">
            <div>
              <Label>Permitir registro de ocorrências</Label>
              <p className="text-xs text-muted-foreground">
                Quando ativo, quem ler a etiqueta pode informar dano, extravio ou irregularidade no bem.
              </p>
            </div>
            <Switch
              checked={valores.qr_permite_ocorrencia === 'true'}
              onCheckedChange={(v) => setValores({ ...valores, qr_permite_ocorrencia: v ? 'true' : 'false' })}
            />
          </div>
          <div>
            <Label>Texto exibido na consulta</Label>
            <Input value={valores.texto_qr ?? ''} onChange={(e) => setValores({ ...valores, texto_qr: e.target.value })} />
          </div>
          <p className="text-xs text-muted-foreground">
            A consulta pública exibe apenas identificação, localização, situação, responsável e o histórico resumido —
            nunca valores, notas fiscais ou documentos internos.
          </p>
        </CardContent>
      </Card>

      <Button onClick={salvar} disabled={salvando}>
        {salvando ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Salvar configurações
      </Button>
    </div>
  );
}
