import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calculator } from 'lucide-react';
import DashboardTab from './contabilidade/DashboardTab';
import PlanoContasTab from './contabilidade/PlanoContasTab';
import ExerciciosTab from './contabilidade/ExerciciosTab';
import PeriodosTab from './contabilidade/PeriodosTab';
import LancamentosTab from './contabilidade/LancamentosTab';
import LotesTab from './contabilidade/LotesTab';
import ConciliacaoTab from './contabilidade/ConciliacaoTab';
import FechamentosTab from './contabilidade/FechamentosTab';
import RelatoriosTab from './contabilidade/RelatoriosTab';
import IntegracoesTab from './contabilidade/IntegracoesTab';
import ConfiguracoesTab from './contabilidade/ConfiguracoesTab';

export default function AdminContabilidade() {
  const [aba, setAba] = useState('painel');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Calculator className="h-6 w-6 text-primary" aria-hidden="true" /> Contábil
        </h1>
        <p className="text-sm text-muted-foreground">
          Estrutura inicial da escrituração contábil, integrada ao Financeiro e ao Patrimônio.
        </p>
      </div>

      <Tabs value={aba} onValueChange={setAba}>
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="painel">Painel</TabsTrigger>
          <TabsTrigger value="plano">Plano de contas</TabsTrigger>
          <TabsTrigger value="exercicios">Exercícios</TabsTrigger>
          <TabsTrigger value="periodos">Períodos</TabsTrigger>
          <TabsTrigger value="lancamentos">Lançamentos</TabsTrigger>
          <TabsTrigger value="lotes">Lotes</TabsTrigger>
          <TabsTrigger value="conciliacao">Conciliação</TabsTrigger>
          <TabsTrigger value="fechamentos">Fechamentos</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          <TabsTrigger value="integracoes">Integrações</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="painel" className="mt-4"><DashboardTab onIrPara={setAba} /></TabsContent>
        <TabsContent value="plano" className="mt-4"><PlanoContasTab /></TabsContent>
        <TabsContent value="exercicios" className="mt-4"><ExerciciosTab /></TabsContent>
        <TabsContent value="periodos" className="mt-4"><PeriodosTab /></TabsContent>
        <TabsContent value="lancamentos" className="mt-4"><LancamentosTab /></TabsContent>
        <TabsContent value="lotes" className="mt-4"><LotesTab /></TabsContent>
        <TabsContent value="conciliacao" className="mt-4"><ConciliacaoTab /></TabsContent>
        <TabsContent value="fechamentos" className="mt-4"><FechamentosTab /></TabsContent>
        <TabsContent value="relatorios" className="mt-4"><RelatoriosTab /></TabsContent>
        <TabsContent value="integracoes" className="mt-4"><IntegracoesTab /></TabsContent>
        <TabsContent value="configuracoes" className="mt-4"><ConfiguracoesTab /></TabsContent>
      </Tabs>
    </div>
  );
}
