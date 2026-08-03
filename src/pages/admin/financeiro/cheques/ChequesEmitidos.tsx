import { useState, useEffect } from "react";
import { Card, Text, Button, icons, Badge } from "@/design-system";
import { IconButton } from "@/design-system/components/Button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function ChequesEmitidos() {
  const navigate = useNavigate();
  const [cheques, setCheques] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarCheques = async () => {
    setLoading(true);
    const { data } = await (supabase.from('financeiro_cheques_emitidos' as any).select('*') as any).order('created_at', { ascending: false });
    setCheques(data || []);
    setLoading(false);
  };

  useEffect(() => {
    carregarCheques();
  }, []);

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <header className="flex items-center justify-between">
        <div>
          <Text variant="h4">Cheques Emitidos</Text>
          <Text variant="body" className="text-muted-foreground">Histórico, rastreabilidade e gestão do ciclo de vida.</Text>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" leftIcon={icons.buscar}>Filtros Avançados</Button>
          <Button variant="primary" leftIcon={icons.adicionar} onClick={() => navigate("../novo")}>Novo Cheque</Button>
        </div>
      </header>

      <Card padding="none">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-4 py-3 font-bold uppercase text-[10px] text-muted-foreground">Folha Nº</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px] text-muted-foreground">Favorecido / Destino</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px] text-muted-foreground">Valor</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px] text-muted-foreground">Emissão</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px] text-muted-foreground">Situação</th>
                <th className="px-4 py-3 font-bold uppercase text-[10px] text-muted-foreground text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Carregando histórico...</td>
                </tr>
              ) : cheques.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-12 text-center text-muted-foreground">Nenhum cheque emitido no período.</td>
                </tr>
              ) : (
                cheques.map((c) => (
                  <tr key={c.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-4 font-mono font-bold text-primary">
                      {String(c.numero_cheque).padStart(6, '0')}
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <Text variant="small" className="font-bold">{c.favorecido}</Text>
                        <Text variant="caption" className="text-muted-foreground">{c.descricao_origem || 'Emissão Direta'}</Text>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-bold text-slate-700">
                      R$ {c.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td className="px-4 py-4 text-muted-foreground">
                      {new Date(c.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-4 py-4">
                      <Badge tone={
                        c.status === 'compensado' ? 'success' : 
                        c.status === 'impresso' ? 'info' : 
                        c.status === 'devolvido' ? 'danger' : 'warning'
                      }>
                        {c.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="flex justify-end gap-1">
                        <IconButton variant="ghost" size="sm" icon={icons.imprimir} label="Reimprimir Cópia" />
                        <IconButton variant="ghost" size="sm" icon={icons.buscar} label="Detalhes" />
                        <IconButton variant="ghost" size="sm" icon={icons.configuracoes} label="Alterar Status" />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Footer de Resumo Financeiro */}
      {!loading && cheques.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
          <div className="p-4 border rounded-xl bg-white shadow-sm">
            <Text variant="overline" className="text-muted-foreground">Total Emitido</Text>
            <Text variant="h6" className="text-primary">
              R$ {cheques.reduce((acc, c) => acc + c.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
          </div>
          <div className="p-4 border rounded-xl bg-white shadow-sm">
            <Text variant="overline" className="text-muted-foreground">Compensados</Text>
            <Text variant="h6" className="text-green-600">
              R$ {cheques.filter(c => c.status === 'compensado').reduce((acc, c) => acc + c.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
          </div>
          <div className="p-4 border rounded-xl bg-white shadow-sm">
            <Text variant="overline" className="text-muted-foreground">A Compensar</Text>
            <Text variant="h6" className="text-amber-600">
              R$ {cheques.filter(c => c.status !== 'compensado' && c.status !== 'devolvido').reduce((acc, c) => acc + c.valor, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </Text>
          </div>
          <div className="p-4 border rounded-xl bg-white shadow-sm">
            <Text variant="overline" className="text-muted-foreground">Qtd. Cheques</Text>
            <Text variant="h6">{cheques.length}</Text>
          </div>
        </div>
      )}
    </div>
  );
}

