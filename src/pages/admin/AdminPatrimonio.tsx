import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Boxes } from 'lucide-react';
import DashboardTab from './patrimonio/DashboardTab';
import BensTab from './patrimonio/BensTab';
import CadastrosTab from './patrimonio/CadastrosTab';
import MovimentacoesTab from './patrimonio/MovimentacoesTab';
import InventariosTab from './patrimonio/InventariosTab';
import ManutencoesTab from './patrimonio/ManutencoesTab';
import TermosTab from './patrimonio/TermosTab';
import BaixasTab from './patrimonio/BaixasTab';
import OcorrenciasTab from './patrimonio/OcorrenciasTab';
import RelatoriosTab from './patrimonio/RelatoriosTab';
import ConfiguracoesTab from './patrimonio/ConfiguracoesTab';

export default function AdminPatrimonio() {
  const [aba, setAba] = useState('painel');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Boxes className="h-6 w-6 text-primary" aria-hidden="true" /> Patrimônio
        </h1>
        <p className="text-sm text-muted-foreground">
          Controle dos bens institucionais da aquisição à baixa, com localização, responsabilidade,
          manutenção, inventário e histórico permanente.
        </p>
      </div>

      <Tabs value={aba} onValueChange={setAba}>
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="painel">Painel</TabsTrigger>
          <TabsTrigger value="bens">Bens</TabsTrigger>
          <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
          <TabsTrigger value="inventarios">Inventários</TabsTrigger>
          <TabsTrigger value="manutencoes">Manutenções</TabsTrigger>
          <TabsTrigger value="termos">Termos</TabsTrigger>
          <TabsTrigger value="baixas">Baixas</TabsTrigger>
          <TabsTrigger value="ocorrencias">Ocorrências</TabsTrigger>
          <TabsTrigger value="cadastros">Cadastros</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="painel" className="mt-4"><DashboardTab onIrPara={setAba} /></TabsContent>
        <TabsContent value="bens" className="mt-4"><BensTab /></TabsContent>
        <TabsContent value="movimentacoes" className="mt-4"><MovimentacoesTab /></TabsContent>
        <TabsContent value="inventarios" className="mt-4"><InventariosTab /></TabsContent>
        <TabsContent value="manutencoes" className="mt-4"><ManutencoesTab /></TabsContent>
        <TabsContent value="termos" className="mt-4"><TermosTab /></TabsContent>
        <TabsContent value="baixas" className="mt-4"><BaixasTab /></TabsContent>
        <TabsContent value="ocorrencias" className="mt-4"><OcorrenciasTab /></TabsContent>
        <TabsContent value="cadastros" className="mt-4"><CadastrosTab /></TabsContent>
        <TabsContent value="relatorios" className="mt-4"><RelatoriosTab /></TabsContent>
        <TabsContent value="configuracoes" className="mt-4"><ConfiguracoesTab /></TabsContent>
      </Tabs>
    </div>
  );
}
