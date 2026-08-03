import { useState, useEffect } from "react";
import { Card, Text, Button, icons, Form } from "@/design-system";
import { useNavigate } from "react-router-dom";
import { valorPorExtenso } from "@/lib/financeiro/valorPorExtenso";

export default function EmitirCheque() {
  const navigate = useNavigate();
  const [etapa, setEtapa] = useState(1);
  const [valor, setValor] = useState<number>(0);
  const [extenso, setExtenso] = useState("");

  useEffect(() => {
    setExtenso(valorPorExtenso(valor));
  }, [valor]);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <header className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)} icon={icons.anterior} label="Voltar" />
        <div>
          <Text variant="h4">Nova Emissão de Cheque</Text>
          <Text variant="caption">Etapa {etapa} de 3</Text>
        </div>
      </header>

      <Card>
        {etapa === 1 && (
          <div className="space-y-6">
            <Text variant="h6">Origem do Pagamento</Text>
            <div className="grid gap-4">
               {/* Simulação de campos conforme requisito 3 */}
               <div className="p-4 border rounded-lg bg-muted/30">
                 <Text variant="small" className="font-semibold">Vincular Conta a Pagar</Text>
                 <Text variant="caption">Selecione uma pendência para preenchimento automático.</Text>
                 <Button variant="secondary" size="sm" className="mt-3" leftIcon={icons.buscar}>Buscar Pendências</Button>
               </div>
            </div>
            <div className="flex justify-end pt-4">
              <Button onClick={() => setEtapa(2)} rightIcon={icons.proximo}>Próximo: Dados do Cheque</Button>
            </div>
          </div>
        )}

        {etapa === 2 && (
          <div className="space-y-6">
            <Text variant="h6">Dados do Cheque</Text>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Favorecido</label>
                <input type="text" className="w-full p-2 border rounded-md" placeholder="Nome do favorecido" />
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
                <label className="text-sm font-medium">Valor por Extenso</label>
                <textarea 
                  readOnly 
                  className="w-full p-2 border rounded-md bg-muted/50 font-mono text-sm"
                  value={extenso}
                />
              </div>
            </div>
            <div className="flex justify-between pt-4">
              <Button variant="secondary" onClick={() => setEtapa(1)} leftIcon={icons.anterior}>Voltar</Button>
              <Button onClick={() => setEtapa(3)} rightIcon={icons.proximo}>Próximo: Revisão</Button>
            </div>
          </div>
        )}

        {etapa === 3 && (
          <div className="space-y-6">
            <Text variant="h6">Revisão e Reserva</Text>
            <div className="p-4 border rounded-lg space-y-2">
              <div className="flex justify-between"><Text variant="caption">Favorecido:</Text><Text variant="small" className="font-medium">João da Silva</Text></div>
              <div className="flex justify-between"><Text variant="caption">Valor:</Text><Text variant="small" className="font-medium text-primary">R$ {valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text></div>
              <div className="flex justify-between"><Text variant="caption">Conta:</Text><Text variant="small">Banco do Brasil - Ag: 1234 CC: 56789-0</Text></div>
            </div>
            
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-800 text-xs flex gap-2">
              <icons.alerta className="h-4 w-4 shrink-0" />
              Ao confirmar, o número do cheque será reservado por 15 minutos.
            </div>

            <div className="flex justify-between pt-4">
              <Button variant="secondary" onClick={() => setEtapa(2)} leftIcon={icons.anterior}>Voltar</Button>
              <Button tone="success" leftIcon={icons.confirmar} onClick={() => {
                navigate("/admin/financeiro");
              }}>Confirmar e Reservar</Button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}
