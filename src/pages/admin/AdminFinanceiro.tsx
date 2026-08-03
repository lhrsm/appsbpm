import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wallet } from 'lucide-react';
import DashboardTab from './financeiro/DashboardTab';
import LancamentosTab from './financeiro/LancamentosTab';
import CadastrosTab from './financeiro/CadastrosTab';
import RelatoriosTab from './financeiro/RelatoriosTab';
import MensalidadesTab from './financeiro/MensalidadesTab';
import ChequesDashboard from './financeiro/cheques/ChequesDashboard';

export default function AdminFinanceiro() {
  const [aba, setAba] = useState('painel');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="flex items-center gap-2 text-2xl font-bold">
          <Wallet className="h-6 w-6 text-primary" aria-hidden="true" /> Financeiro
        </h1>
        <p className="text-sm text-muted-foreground">
          Gestão financeira institucional com aprovação, rastreabilidade e relatórios.
        </p>
      </div>

      <Tabs value={aba} onValueChange={setAba}>
        <TabsList className="flex w-full flex-wrap justify-start">
          <TabsTrigger value="painel">Painel</TabsTrigger>
          <TabsTrigger value="receitas">Receitas</TabsTrigger>
          <TabsTrigger value="despesas">Despesas</TabsTrigger>
          <TabsTrigger value="pagar">Contas a pagar</TabsTrigger>
          <TabsTrigger value="receber">Contas a receber</TabsTrigger>
          <TabsTrigger value="mensalidades">Mensalidades</TabsTrigger>
          <TabsTrigger value="cadastros">Cadastros</TabsTrigger>
          <TabsTrigger value="cheques">Cheques</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
        </TabsList>

        <TabsContent value="painel" className="mt-4"><DashboardTab onIrPara={setAba} /></TabsContent>
        <TabsContent value="receitas" className="mt-4"><LancamentosTab modo="receitas" /></TabsContent>
        <TabsContent value="despesas" className="mt-4"><LancamentosTab modo="despesas" /></TabsContent>
        <TabsContent value="pagar" className="mt-4"><LancamentosTab modo="pagar" /></TabsContent>
        <TabsContent value="receber" className="mt-4"><LancamentosTab modo="receber" /></TabsContent>
        <TabsContent value="mensalidades" className="mt-4"><MensalidadesTab /></TabsContent>
        <TabsContent value="cadastros" className="mt-4"><CadastrosTab /></TabsContent>
        <TabsContent value="cheques" className="mt-4"><ChequesDashboard /></TabsContent>
        <TabsContent value="relatorios" className="mt-4"><RelatoriosTab /></TabsContent>
      </Tabs>
    </div>
  );
}
