import { Card, Text, Button, icons } from "@/design-system";

export default function AprovacoesCheque() {
  return (
    <div className="space-y-6 animate-fade-in">
      <header>
        <Text variant="h4">Aprovações Pendentes</Text>
        <Text variant="body" className="text-muted-foreground">Cheques que aguardam revisão de alçada superior.</Text>
      </header>

      <div className="space-y-4">
        {[
          { id: 1, solicitante: "Financeiro Depto", valor: 15400.00, motivo: "Pagamento Obra Sede", data: "04/08/2026" },
          { id: 2, solicitante: "RH Interno", valor: 6200.00, motivo: "Premiação Associado do Mês", data: "04/08/2026" },
        ].map((a) => (
          <Card key={a.id} className="border-l-4 border-l-amber-500">
            <div className="flex flex-col sm:flex-row justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Text variant="small" className="font-bold">R$ {a.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</Text>
                  <span className="px-1.5 py-0.5 bg-amber-100 text-amber-700 text-[9px] font-bold rounded uppercase">Aguardando</span>
                </div>
                <Text variant="body">{a.motivo}</Text>
                <Text variant="caption">Solicitado por {a.solicitante} em {a.data}</Text>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" tone="danger" leftIcon={icons.alerta}>Recusar</Button>
                <Button variant="secondary" tone="success" leftIcon={icons.confirmar}>Aprovar</Button>
              </div>
            </div>
          </Card>
        ))}

        {/* Empty state fallback simplificado */}
        <div className="hidden only:flex flex-col items-center justify-center py-12 text-muted-foreground">
          <icons.sucesso className="h-12 w-12 opacity-20 mb-4" />
          <Text variant="body">Nenhuma aprovação pendente no momento.</Text>
        </div>
      </div>
    </div>
  );
}
