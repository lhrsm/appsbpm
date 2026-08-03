import { useState } from "react";
import { Card, Text, Button, icons } from "@/design-system";
import { useToast } from "@/hooks/use-toast";


export default function ModelosImpressao() {
  const { toast } = useToast();
  const [calibracao, setCalibracao] = useState({
    valorX: 145, valorY: 12,
    extensoX: 20, extensoY: 25,
    cidadeX: 110, cidadeY: 60,
    diaX: 125, mesX: 140, anoX: 165
  });

  const handleSave = () => {
    toast({
      title: "Calibração Salva",
      description: "As coordenadas de impressão foram atualizadas com sucesso.",
    });
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12">
      <header className="flex items-center justify-between">
        <div>
          <Text variant="h4">Modelos de Impressão</Text>
          <Text variant="body" className="text-muted-foreground">Configuração visual e calibração milimétrica por impressora.</Text>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" leftIcon={icons.configuracoes}>Gerenciar Papéis</Button>
          <Button variant="primary" leftIcon={icons.adicionar}>Novo Modelo</Button>
        </div>
      </header>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2" title="Editor Visual de Coordenadas" subtitle="Posicionamento dos campos em milímetros (mm)">
          <div className="aspect-[2.4/1] w-full border-2 border-dashed rounded-xl bg-slate-50 relative flex items-center justify-center overflow-hidden shadow-inner">
             {/* Simulação de um cheque institucional */}
             <div className="absolute inset-4 border border-slate-200 bg-white rounded shadow-sm overflow-hidden">
                <div className="absolute top-2 left-4 w-12 h-12 bg-slate-100 rounded-full opacity-20 flex items-center justify-center">
                  <icons.previdencia className="h-6 w-6 text-slate-400" />
                </div>
                <div className="absolute top-4 right-8 text-xl font-mono font-bold text-slate-300">R$ *******,**</div>
                
                {/* Campos dinâmicos simulando a posição baseada no estado */}
                <div className="absolute h-4 w-32 border-b border-primary/20 bg-primary/5 flex items-center px-1" style={{ top: `${calibracao.valorY * 2}px`, right: '32px' }}>
                  <Text variant="small" className="text-[8px] text-primary font-bold uppercase">Valor</Text>
                </div>
                
                <div className="absolute h-4 left-12 right-12 border-b border-primary/20 bg-primary/5 flex items-center px-1" style={{ top: `${calibracao.extensoY * 2.5}px` }}>
                  <Text variant="small" className="text-[8px] text-primary font-bold uppercase">Valor por Extenso (Linha 1)</Text>
                </div>

                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 text-[10px] text-slate-400 font-serif italic">
                  <span>Salvador,</span>
                  <span className="border-b border-slate-300 w-8 text-center">___</span>
                  <span>de</span>
                  <span className="border-b border-slate-300 w-24 text-center">___________</span>
                  <span>de</span>
                  <span className="border-b border-slate-300 w-12 text-center">20__</span>
                </div>
             </div>
             <Text variant="caption" className="text-slate-300 z-10">Área Útil: 170mm x 75mm</Text>
          </div>
          
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-3 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground flex justify-between">
                Valor (R$) <span>X: {calibracao.valorX}mm</span>
              </label>
              <input 
                type="range" min="0" max="170" 
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary" 
                value={calibracao.valorX} 
                onChange={(e) => setCalibracao({...calibracao, valorX: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground flex justify-between">
                Extenso <span>Y: {calibracao.extensoY}mm</span>
              </label>
              <input 
                type="range" min="0" max="75" 
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary" 
                value={calibracao.extensoY} 
                onChange={(e) => setCalibracao({...calibracao, extensoY: parseInt(e.target.value)})}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground flex justify-between">
                Data/Local <span>Y: {calibracao.cidadeY}mm</span>
              </label>
              <input 
                type="range" min="0" max="75" 
                className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary" 
                value={calibracao.cidadeY} 
                onChange={(e) => setCalibracao({...calibracao, cidadeY: parseInt(e.target.value)})}
              />
            </div>
          </div>
        </Card>

        <Card title="Assistente de Calibração" subtitle="Sincronia com impressora local">
          <div className="space-y-6">
             <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl">
               <div className="flex gap-2 text-blue-800">
                 <icons.info className="h-5 w-5 shrink-0" />
                 <Text variant="small" className="font-bold">Método de Cruzamento</Text>
               </div>
               <Text variant="caption" className="text-blue-700 mt-2 block leading-relaxed">
                 1. Imprima o modelo de teste em papel A4 comum.<br/>
                 2. Coloque o cheque real por trás contra a luz.<br/>
                 3. Ajuste os milímetros acima caso os campos não estejam alinhados.
               </Text>
             </div>
             
             <div className="space-y-3">
               <Text variant="small" className="font-bold text-muted-foreground">Impressora Selecionada</Text>
               <div className="p-3 border rounded-lg flex items-center justify-between bg-slate-50">
                 <div className="flex items-center gap-2">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                   <Text variant="caption" className="font-medium">EPSON L3150 (Rede)</Text>
                 </div>
                 <icons.configuracoes className="h-4 w-4 text-muted-foreground cursor-pointer" />
               </div>
             </div>

             <div className="pt-2 space-y-2">
               <Button variant="secondary" fullWidth leftIcon={icons.imprimir}>Imprimir Folha Teste</Button>
               <Button variant="primary" fullWidth leftIcon={icons.confirmar} onClick={handleSave}>Salvar Modelo Atual</Button>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
