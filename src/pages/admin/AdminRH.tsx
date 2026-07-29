import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users } from 'lucide-react';
import DashboardTab from './rh/DashboardTab';
import ColaboradoresTab from './rh/ColaboradoresTab';
import EstruturaTab from './rh/EstruturaTab';
import FrequenciaTab from './rh/FrequenciaTab';
import FeriasTab from './rh/FeriasTab';
import AfastamentosTab from './rh/AfastamentosTab';
import BeneficiosTab from './rh/BeneficiosTab';
import SolicitacoesTab from './rh/SolicitacoesTab';
import FolhaTab from './rh/FolhaTab';
import HistoricoTab from './rh/HistoricoTab';

export default function AdminRH() {
  const [aba, setAba] = useState('painel');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Users className="h-6 w-6 text-primary" aria-hidden="true" /> Recursos Humanos
        </h1>
        <p className="text-sm text-muted-foreground">
          Gestão do ciclo funcional dos colaboradores da SBPM: estrutura organizacional, cadastros,
          vínculos e histórico. Independente dos cadastros de associados e dependentes.
        </p>
      </div>

      <Tabs value={aba} onValueChange={setAba}>
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="painel">Painel</TabsTrigger>
          <TabsTrigger value="colaboradores">Colaboradores</TabsTrigger>
          <TabsTrigger value="estrutura">Estrutura organizacional</TabsTrigger>
          <TabsTrigger value="frequencia">Jornada e frequência</TabsTrigger>
          <TabsTrigger value="ferias">Férias</TabsTrigger>
          <TabsTrigger value="afastamentos">Afastamentos</TabsTrigger>
          <TabsTrigger value="beneficios">Benefícios</TabsTrigger>
          <TabsTrigger value="solicitacoes">Solicitações</TabsTrigger>
          <TabsTrigger value="historico">Histórico</TabsTrigger>
        </TabsList>

        <TabsContent value="painel" className="mt-4">
          <DashboardTab onIrPara={setAba} />
        </TabsContent>
        <TabsContent value="colaboradores" className="mt-4">
          <ColaboradoresTab />
        </TabsContent>
        <TabsContent value="estrutura" className="mt-4">
          <EstruturaTab />
        </TabsContent>
        <TabsContent value="frequencia" className="mt-4">
          <FrequenciaTab />
        </TabsContent>
        <TabsContent value="ferias" className="mt-4">
          <FeriasTab />
        </TabsContent>
        <TabsContent value="afastamentos" className="mt-4">
          <AfastamentosTab />
        </TabsContent>
        <TabsContent value="beneficios" className="mt-4">
          <BeneficiosTab />
        </TabsContent>
        <TabsContent value="solicitacoes" className="mt-4">
          <SolicitacoesTab />
        </TabsContent>
        <TabsContent value="historico" className="mt-4">
          <HistoricoTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
