import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import AvisoEstrutura from './AvisoEstrutura';
import { getConfig, setConfig } from '@/lib/contabilidade';

type Item = { chave: string; titulo: string; descricao: string; travaSe?: string };

const ITENS: Item[] = [
  {
    chave: 'mapeamento_validado',
    titulo: 'Mapeamento validado pelo setor contábil',
    descricao: 'Confirma que o plano de contas e os roteiros de integração foram conferidos pelos responsáveis.',
  },
  {
    chave: 'contabilizacao_automatica',
    titulo: 'Contabilização automática',
    descricao: 'Gera lançamentos a partir do Financeiro e do Patrimônio. Só pode ser ativada após a validação do mapeamento.',
    travaSe: 'mapeamento_validado',
  },
  {
    chave: 'modo_simulacao',
    titulo: 'Modo de simulação',
    descricao: 'Novos lançamentos nascem como prévia e precisam de efetivação manual.',
  },
];

export default function ConfiguracoesTab() {
  const [config, setConfigState] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setConfigState(await getConfig());
      setLoading(false);
    })();
  }, []);

  const alternar = async (chave: string, valor: boolean) => {
    try {
      await setConfig(chave, String(valor));
      setConfigState((c) => ({ ...c, [chave]: String(valor) }));
      toast.success('Configuração atualizada.');
    } catch (e: any) {
      toast.error(e.message ?? 'Não foi possível salvar.');
    }
  };

  return (
    <div className="space-y-4">
      <AvisoEstrutura />

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Parâmetros do módulo contábil</CardTitle>
          <CardDescription>
            Ajustes de segurança da escrituração. Alterações ficam registradas na auditoria do banco.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading && <p className="text-sm text-muted-foreground">Carregando configurações...</p>}
          {!loading && ITENS.map((i) => {
            const travado = i.travaSe ? config[i.travaSe] !== 'true' : false;
            return (
              <div key={i.chave} className="flex items-start justify-between gap-4 rounded-md border p-3">
                <div>
                  <Label htmlFor={i.chave}>{i.titulo}</Label>
                  <p className="text-xs text-muted-foreground">{i.descricao}</p>
                </div>
                <Switch
                  id={i.chave}
                  checked={config[i.chave] === 'true'}
                  disabled={travado}
                  onCheckedChange={(v) => alternar(i.chave, v)}
                />
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
