import { Card, Text, Button, icons } from "@/design-system";

export default function ModelosImpressao() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <Text variant="h4">Modelos de Impressão</Text>
          <Text variant="body" className="text-muted-foreground">Configuração visual e calibração por impressora.</Text>
        </div>
        <Button variant="primary" leftIcon={icons.adicionar}>Novo Modelo</Button>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Pré-visualização do Modelo">
          <div className="aspect-[2.5/1] w-full border-2 border-dashed rounded-lg bg-slate-50 relative flex items-center justify-center overflow-hidden">
             {/* Simulação de um cheque */}
             <div className="absolute top-4 right-8 text-lg font-mono font-bold text-slate-400">R$ ********</div>
             <div className="absolute top-12 left-12 right-12 h-px bg-slate-200" />
             <div className="absolute top-20 left-12 right-12 h-px bg-slate-200" />
             <div className="absolute bottom-12 left-12 text-xs font-serif italic text-slate-400">Cidade, ___ de ___________ de 20__</div>
             <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-48 h-px bg-slate-400" />
             <Text variant="caption" className="text-slate-300">Área de Impressão (170mm x 75mm)</Text>
          </div>
          
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Valor X (mm)</label>
              <input type="number" className="w-full p-1 border rounded text-sm" defaultValue={145} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Valor Y (mm)</label>
              <input type="number" className="w-full p-1 border rounded text-sm" defaultValue={12} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Data X (mm)</label>
              <input type="number" className="w-full p-1 border rounded text-sm" defaultValue={110} />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase text-muted-foreground">Data Y (mm)</label>
              <input type="number" className="w-full p-1 border rounded text-sm" defaultValue={60} />
            </div>
          </div>
        </Card>

        <Card title="Calibração Ativa">
          <div className="space-y-4">
             <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
               <div className="flex gap-2 text-blue-800">
                 <icons.info className="h-4 w-4 shrink-0" />
                 <Text variant="caption" className="font-medium">Dica de Calibração</Text>
               </div>
               <Text variant="caption" className="text-blue-700 mt-1 block">
                 Imprima uma folha de teste em papel A4 comum e sobreponha ao cheque real para ajustar os milímetros.
               </Text>
             </div>
             
             <div className="space-y-2">
               <Button variant="outline" fullWidth leftIcon={icons.imprimir}>Imprimir Teste</Button>
               <Button variant="primary" fullWidth leftIcon={icons.confirmar}>Salvar Ajustes</Button>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
