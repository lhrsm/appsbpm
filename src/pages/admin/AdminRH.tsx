import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Users } from 'lucide-react';
import DashboardTab from './rh/DashboardTab';
import ColaboradoresTab from './rh/ColaboradoresTab';
import EstruturaTab from './rh/EstruturaTab';
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
        <TabsContent value="historico" className="mt-4">
          <HistoricoTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
