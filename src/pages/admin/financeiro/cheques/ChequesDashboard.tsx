import { Card, Text, icons, tokens, Button } from "@/design-system";
import { StatCard } from "@/design-system/components/Card";
import { useNavigate } from "react-router-dom";

export default function ChequesDashboard() {
  const navigate = useNavigate();

  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Text variant="h4">Gestão de Cheques</Text>
          <Text variant="body" className="text-muted-foreground">
            Controle de emissão, impressão e compensação de cheques institucionais.
          </Text>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="secondary" 
            leftIcon={icons.configuracoes}
            onClick={() => navigate("modelos")}
          >
            Modelos
          </Button>
          <Button 
            variant="primary" 
            leftIcon={icons.adicionar}
            onClick={() => navigate("novo")}
          >
            Emitir Cheque
          </Button>
        </div>
      </header>

      {/* Indicadores */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard 
          title="Em Preparação" 
          value="0" 
          icon={icons.documento} 
          hint="Aguardando dados"
        />
        <StatCard 
          title="Aguardando Aprovação" 
          value="0" 
          icon={icons.alerta} 
          hint="Revisão necessária"
        />
        <StatCard 
          title="A Compensar" 
          value="R$ 0,00" 
          icon={icons.financeiro} 
          hint="Cheques emitidos"
        />
        <StatCard 
          title="Compensados" 
          value="R$ 0,00" 
          icon={icons.sucesso} 
          hint="Este mês"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card title="Ações Rápidas" className="lg:col-span-1">
          <div className="space-y-2">
            {[
              { label: "Gerenciar Talões", to: "taloes", icon: icons.pasta },
              { label: "Modelos de Impressão", to: "modelos", icon: icons.configuracoes },
              { label: "Relatórios", to: "/admin/relatorios", icon: icons.relatorio },
              { label: "Calibração", to: "modelos", icon: icons.configuracoes },
            ].map((acao) => (
              <Button 
                key={acao.label}
                variant="ghost" 
                fullWidth 
                className="justify-start gap-3"
                onClick={() => navigate(acao.to)}
                leftIcon={acao.icon}
              >
                {acao.label}
              </Button>
            ))}
          </div>
        </Card>

        <Card title="Últimos Cheques" className="lg:col-span-2" empty emptyDescription="Nenhum cheque emitido recentemente.">
          {/* Listagem será implementada na Etapa 4 */}
        </Card>
      </div>
    </div>
  );
}
