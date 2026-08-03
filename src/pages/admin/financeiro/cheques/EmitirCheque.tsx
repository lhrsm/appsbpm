import { useState, useEffect } from "react";
import { Card, Text, Button, icons, Badge } from "@/design-system";
import { useToast } from "@/hooks/use-toast";
import { IconButton } from "@/design-system/components/Button";
import { useNavigate } from "react-router-dom";
import { valorPorExtenso } from "@/lib/financeiro/valorPorExtenso";
import { supabase } from "@/integrations/supabase/client";


export default function EmitirCheque() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [etapa, setEtapa] = useState(1);
  const [loading, setLoading] = useState(false);
  const [contasPagar, setContasPagar] = useState<any[]>([]);
  const [selecionada, setSelecionada] = useState<any>(null);
  const [favorecido, setFavorecido] = useState("");
  const [valor, setValor] = useState<number>(0);
  const [extenso, setExtenso] = useState("");
  const [taloes, setTaloes] = useState<any[]>([]);
  const [talaoSelecionado, setTalaoSelecionado] = useState("");

  useEffect(() => {
    setExtenso(valorPorExtenso(valor));
  }, [valor]);

  useEffect(() => {
    const carregarTaloes = async () => {
      const { data } = await supabase.from('financeiro_taloes_cheque').select('*').eq('ativo', true);
      setTaloes(data || []);
      if (data && data.length > 0) setTalaoSelecionado(data[0].id);
    };
    carregarTaloes();
  }, []);

  const buscarPendencias = async () => {
    setLoading(true);
    // Simulação de busca no banco para demonstração técnica
    const mockPendencias = [
      { id: '1', fornecedor: 'Papelaria Central', valor: 350.50, descricao: 'Material de Escritório' },
      { id: '2', fornecedor: 'Energia Co.', valor: 1250.00, descricao: 'Fatura Julho/2026' }
    ];
    setContasPagar(mockPendencias);
    setLoading(false);
  };

  const selecionarPendencia = (p: any) => {
    setSelecionada(p);
    setFavorecido(p.fornecedor);
    setValor(p.valor);
  };

  const confirmarEmissao = async () => {
    setLoading(true);
    try {
      // 1. Reservar numeração (Lógica de backend simulada aqui para a UI)
      // 2. Criar registro de cheque
      // 3. Gerar PDF de cópia administrativa
      
      toast({
        title: "Cheque Emitido com Sucesso",
        description: `O número do cheque foi reservado e está pronto para impressão.`,
        variant: "default",
      });
      
      navigate("/admin/financeiro/cheques/emitidos");
    } catch (error) {
      toast({
        title: "Erro ao emitir",
        description: "Não foi possível reservar a numeração do cheque.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      <header className="flex items-center gap-4">
        <IconButton variant="ghost" onClick={() => navigate(-1)} icon={icons.anterior} label="Voltar" />
        <div>
          <Text variant="h4">Nova Emissão de Cheque</Text>
          <Text variant="caption">Etapa {etapa} de 3 - Emissão Assistida</Text>
        </div>
      </header>

      {/* Progress Stepper */}
      <div className="flex items-center justify-between px-2">
        {[1, 2, 3].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${etapa >= s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
              {s}
            </div>
            <span className={`text-xs font-medium hidden sm:inline ${etapa === s ? 'text-primary' : 'text-muted-foreground'}`}>
              {s === 1 ? 'Origem' : s === 2 ? 'Dados' : 'Revisão'}
            </span>
            {s < 3 && <div className={`w-12 sm:w-20 h-px ${etapa > s ? 'bg-primary' : 'bg-muted'}`} />}
          </div>
        ))}
      </div>

      <Card>
        {etapa === 1 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Text variant="h6">Origem do Pagamento</Text>
              <Button variant="ghost" size="sm" onClick={() => setEtapa(2)}>Pular Vínculo</Button>
            </div>
            
            <div className="grid gap-4">
               <div className="p-4 border rounded-lg bg-muted/30 space-y-4">
                 <div>
                   <Text variant="small" className="font-semibold">Vincular Conta a Pagar</Text>
                   <Text variant="caption">Selecione uma pendência do módulo financeiro para preenchimento automático.</Text>
                 </div>
                 
                 <div className="flex gap-2">
                   <input type="text" className="flex-1 p-2 border rounded-md text-sm" placeholder="Fornecedor ou Nota..." />
                   <Button variant="secondary" size="sm" onClick={buscarPendencias} loading={loading} leftIcon={icons.buscar}>Buscar</Button>
                 </div>

                 {contasPagar.length > 0 && (
                   <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                     {contasPagar.map((p) => (
                       <div 
                         key={p.id} 
                         onClick={() => selecionarPendencia(p)}
                         className={`p-3 border rounded-md cursor-pointer transition-colors flex justify-between items-center ${selecionada?.id === p.id ? 'border-primary bg-primary/5' : 'hover:bg-white'}`}
                       >
                         <div>
                           <Text variant="small" className="font-medium">{p.fornecedor}</Text>
                           <Text variant="caption">{p.descricao}</Text>
                         </div>
                         <Text variant="small" className="font-bold text-primary">R$ {p.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                       </div>
                     ))}
                   </div>
                 )}
               </div>
            </div>
            
            <div className="flex justify-end pt-4">
              <Button onClick={() => setEtapa(2)} disabled={!selecionada && favorecido === ""} rightIcon={icons.proximo}>Próximo: Dados do Cheque</Button>
            </div>
          </div>
        )}

        {etapa === 2 && (
          <div className="space-y-6">
            <Text variant="h6">Dados do Cheque</Text>
            
            <div className="p-4 bg-primary/5 border border-primary/10 rounded-lg flex items-center gap-3">
              <icons.previdencia className="h-5 w-5 text-primary" />
              <div className="flex-1">
                <label className="text-xs font-bold uppercase text-muted-foreground">Selecionar Talão Ativo</label>
                <select 
                  className="w-full bg-transparent border-none p-0 font-medium focus:ring-0 text-sm"
                  value={talaoSelecionado}
                  onChange={(e) => setTalaoSelecionado(e.target.value)}
                >
                  {taloes.length > 0 ? (
                    taloes.map(t => <option key={t.id} value={t.id}>{t.banco} - Ag: {t.agencia} CC: {t.conta}</option>)
                  ) : (
                    <option value="">Nenhum talão ativo encontrado</option>
                  )}
                </select>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Favorecido</label>
                <input 
                  type="text" 
                  className="w-full p-2 border rounded-md" 
                  placeholder="Nome do favorecido" 
                  value={favorecido}
                  onChange={(e) => setFavorecido(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Valor (R$)</label>
                <input 
                  type="number" 
                  step="0.01"
                  className="w-full p-2 border rounded-md" 
                  value={valor}
                  onChange={(e) => setValor(parseFloat(e.target.value) || 0)}
                />
              </div>
              <div className="sm:col-span-2 space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-sm font-medium">Valor por Extenso</label>
                  <Text variant="caption" className="text-primary italic">Automático</Text>
                </div>
                <textarea 
                  readOnly 
                  className="w-full p-2 border rounded-md bg-muted/50 font-mono text-sm min-h-[80px] resize-none"
                  value={extenso}
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="secondary" onClick={() => setEtapa(1)} leftIcon={icons.anterior}>Voltar</Button>
              <Button onClick={() => setEtapa(3)} disabled={!favorecido || valor <= 0} rightIcon={icons.proximo}>Próximo: Revisão</Button>
            </div>
          </div>
        )}

        {etapa === 3 && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <Text variant="h6">Revisão e Reserva</Text>
              <Badge tone="warning">Aguardando Confirmação</Badge>
            </div>

            <div className="p-6 border rounded-xl bg-slate-50 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-1 h-full bg-primary" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Text variant="overline" className="text-muted-foreground">Favorecido</Text>
                  <Text variant="body" className="font-bold text-lg">{favorecido}</Text>
                </div>
                <div className="sm:text-right">
                  <Text variant="overline" className="text-muted-foreground">Valor Total</Text>
                  <Text variant="h4" className="text-primary">R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                </div>
                <div className="sm:col-span-2 pt-2 border-t">
                  <Text variant="overline" className="text-muted-foreground">Valor por Extenso</Text>
                  <Text variant="caption" className="block font-mono leading-relaxed">{extenso}</Text>
                </div>
              </div>
            </div>
            
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs flex gap-3">
              <icons.alerta className="h-5 w-5 shrink-0 text-amber-500" />
              <div>
                <p className="font-bold">Reserva Transacional de Numeração</p>
                <p>Ao confirmar, o sistema irá buscar a próxima folha disponível no talão e bloqueá-la para esta emissão.</p>
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="secondary" onClick={() => setEtapa(2)} disabled={loading} leftIcon={icons.anterior}>Voltar</Button>
              <Button tone="success" loading={loading} leftIcon={icons.confirmar} onClick={confirmarEmissao}>Confirmar e Reservar</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

