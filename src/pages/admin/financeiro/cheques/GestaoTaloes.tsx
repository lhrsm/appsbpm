import { useState, useEffect } from "react";
import { Card, Text, Button, icons, Badge, useToast } from "@/design-system";
import { supabase } from "@/integrations/supabase/client";

export default function GestaoTaloes() {
  const { toast } = useToast();
  const [taloes, setTaloes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const carregarTaloes = async () => {
    setLoading(true);
    const { data, error } = await (supabase.from('financeiro_taloes_cheque' as any).select('*') as any).order('created_at', { ascending: false });
    if (error) {
      console.error(error);
    } else {
      setTaloes(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    carregarTaloes();
  }, []);

  const alternarStatus = async (id: string, ativo: boolean) => {
    const { error } = await (supabase.from('financeiro_taloes_cheque' as any).update({ ativo: !ativo } as any) as any).eq('id', id);
    if (!error) {
      toast({ title: ativo ? "Talão desativado" : "Talão ativado" });
      carregarTaloes();
    }
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <header className="flex items-center justify-between">
        <div>
          <Text variant="h4">Gestão de Talões</Text>
          <Text variant="body" className="text-muted-foreground">Controle de numeração e estoque de folhas.</Text>
        </div>
        <Button variant="primary" leftIcon={icons.adicionar}>Novo Talão</Button>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Talões de Cheque">
          <div className="space-y-4">
            {loading ? (
               <div className="py-8 text-center text-muted-foreground">Carregando talões...</div>
            ) : taloes.length === 0 ? (
               <div className="py-8 text-center text-muted-foreground">Nenhum talão cadastrado.</div>
            ) : (
              taloes.map((t) => {
                const total = t.num_fim - t.num_inicio + 1;
                const usado = t.num_atual - t.num_inicio;
                const porcentagem = Math.round((usado / total) * 100);
                
                return (
                  <div key={t.id} className={`p-4 border rounded-xl space-y-3 transition-colors ${t.ativo ? 'bg-white' : 'bg-muted/30 grayscale opacity-60'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <Text variant="small" className="font-bold">{t.banco}</Text>
                        <Text variant="caption" className="block">Ag: {t.agencia} | CC: {t.conta}</Text>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <Badge tone={t.ativo ? "success" : "neutral"}>{t.ativo ? "Ativo" : "Inativo"}</Badge>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6 text-[10px]" 
                          onClick={() => alternarStatus(t.id, t.ativo)}
                        >
                          {t.ativo ? "Desativar" : "Ativar"}
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-1.5">
                      <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground">
                        <span>Progresso: {usado}/{total} folhas</span>
                        <span>{porcentagem}%</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2 overflow-hidden border">
                        <div 
                          className={`h-full transition-all duration-500 ${porcentagem > 90 ? 'bg-destructive' : 'bg-primary'}`} 
                          style={{ width: `${porcentagem}%` }}
                        />
                      </div>
                      <div className="flex justify-between items-center pt-1">
                        <Text variant="caption">Próxima folha:</Text>
                        <Text variant="small" className="font-mono font-bold text-primary">{String(t.num_atual).padStart(6, '0')}</Text>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card title="Configurações de Segurança" subtitle="Regras de emissão e controle">
          <div className="space-y-5">
            <div className="flex items-center justify-between p-3 border rounded-lg bg-slate-50">
              <div className="flex-1">
                <Text variant="small" className="font-bold">Reserva Automática</Text>
                <Text variant="caption" className="block">Bloqueia o número do cheque imediatamente ao abrir a tela de emissão por 15 minutos.</Text>
              </div>
              <div className="ml-4 h-6 w-11 bg-primary rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm"/>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <Text variant="small" className="font-bold">Aprovação de Alçada</Text>
                <Text variant="caption" className="block">Exigir aprovação de diretoria para cheques com valor superior a R$ 5.000,00.</Text>
              </div>
              <div className="ml-4 h-6 w-11 bg-muted rounded-full relative cursor-pointer">
                <div className="absolute left-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm"/>
              </div>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex-1">
                <Text variant="small" className="font-bold">Notificação de Emissão</Text>
                <Text variant="caption" className="block">Enviar e-mail para o setor de contabilidade a cada novo cheque emitido.</Text>
              </div>
              <div className="ml-4 h-6 w-11 bg-primary rounded-full relative cursor-pointer">
                <div className="absolute right-1 top-1 h-4 w-4 bg-white rounded-full shadow-sm"/>
              </div>
            </div>

            <div className="pt-2">
              <Button variant="secondary" fullWidth leftIcon={icons.configuracoes}>Acessar Auditoria de Talões</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

