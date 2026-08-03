import { Card, Text, Button, icons } from "@/design-system";
import { useNavigate } from "react-router-dom";

export default function GestaoTaloes() {
  const navigate = useNavigate();
  return (
    <div className="space-y-6 animate-fade-in">
      <header className="flex items-center justify-between">
        <div>
          <Text variant="h4">Gestão de Talões</Text>
          <Text variant="body" className="text-muted-foreground">Controle de numeração e estoque de folhas.</Text>
        </div>
        <Button variant="primary" leftIcon={icons.adicionar}>Novo Talão</Button>
      </header>

      <div className="grid gap-6 md:grid-cols-2">
        <Card title="Talões Ativos">
          <div className="space-y-4">
            {[
              { banco: "Banco do Brasil", agencia: "1234", conta: "56789-0", inicio: 401, fim: 500, atual: 456 },
              { banco: "Caixa Econômica", agencia: "0001", conta: "98765-4", inicio: 101, fim: 200, atual: 105 },
            ].map((t, i) => (
              <div key={i} className="p-3 border rounded-lg space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <Text variant="small" className="font-bold">{t.banco}</Text>
                    <Text variant="caption">Ag: {t.agencia} | CC: {t.conta}</Text>
                  </div>
                  <Badge tone="success">Ativo</Badge>
                </div>
                <div className="space-y-1">
                  <div className="flex justify-between text-[10px] uppercase font-bold text-muted-foreground">
                    <span>Progresso: {t.atual - t.inicio + 1}/{t.fim - t.inicio + 1}</span>
                    <span>{Math.round(((t.atual - t.inicio) / (t.fim - t.inicio)) * 100)}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
                    <div 
                      className="bg-primary h-full transition-all" 
                      style={{ width: `${((t.atual - t.inicio) / (t.fim - t.inicio)) * 100}%` }}
                    />
                  </div>
                  <Text variant="caption">Próxima folha disponível: <span className="font-mono font-bold text-primary">{String(t.atual + 1).padStart(6, '0')}</span></Text>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Configurações de Segurança">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-2 border-b">
              <div>
                <Text variant="small" className="font-medium">Reserva Automática</Text>
                <Text variant="caption">Bloqueia número ao iniciar emissão</Text>
              </div>
              <div className="h-5 w-10 bg-primary rounded-full relative"><div className="absolute right-1 top-1 h-3 w-3 bg-white rounded-full"/></div>
            </div>
            <div className="flex items-center justify-between p-2 border-b">
              <div>
                <Text variant="small" className="font-medium">Aprovação Dupla</Text>
                <Text variant="caption">Exigir 2 assinaturas para > R$ 5.000</Text>
              </div>
              <div className="h-5 w-10 bg-primary rounded-full relative"><div className="absolute right-1 top-1 h-3 w-3 bg-white rounded-full"/></div>
            </div>
            <div className="pt-2">
              <Button variant="outline" fullWidth size="sm" leftIcon={icons.configuracoes}>Configurações Avançadas</Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Badge({ children, tone = "default" }: { children: React.ReactNode, tone?: string }) {
  const colors = tone === "success" ? "bg-green-100 text-green-700" : "bg-muted text-muted-foreground";
  return <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${colors}`}>{children}</span>;
}
