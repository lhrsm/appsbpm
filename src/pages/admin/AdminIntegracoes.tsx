import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plug } from "lucide-react";
import ConectoresTab from "./integracoes/ConectoresTab";
import ImportacaoTab from "./integracoes/ImportacaoTab";
import HistoricoTab from "./integracoes/HistoricoTab";
import ServicosExternosTab from "./integracoes/ServicosExternosTab";

export default function AdminIntegracoes() {
  const [refreshKey, setRefreshKey] = useState(0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Plug className="w-6 h-6 text-primary" aria-hidden="true" /> Central de Integrações e Importações
        </h1>
        <p className="text-muted-foreground text-sm">
          Ponto único de entrada de dados institucionais: conectores abstratos por sistema de origem, importação
          manual validada em área de staging e histórico auditável de cada lote.
        </p>
      </div>

      <Tabs defaultValue="conectores">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="conectores">Conectores</TabsTrigger>
          <TabsTrigger value="importacao">Importação manual</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
          <TabsTrigger value="servicos">Serviços externos</TabsTrigger>
        </TabsList>

        <TabsContent value="conectores" className="mt-4">
          <ConectoresTab />
        </TabsContent>
        <TabsContent value="importacao" className="mt-4">
          <ImportacaoTab onConcluir={() => setRefreshKey((k) => k + 1)} />
        </TabsContent>
        <TabsContent value="historico" className="mt-4">
          <HistoricoTab refreshKey={refreshKey} />
        </TabsContent>
        <TabsContent value="servicos" className="mt-4">
          <ServicosExternosTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
