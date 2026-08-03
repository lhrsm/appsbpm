import { Card, Text, Button, icons } from "@/design-system";

export default function RoutesIndex() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Card 
        title="Fase 15 — Auditoria e Consolidação" 
        subtitle="Status da Produção"
        icon={icons.previdencia}
        elevation="md"
        className="ds-animate-slide-in-up"
      >
        <div className="space-y-4">
          <Text variant="body" className="readable">
            A Fase 15 foi concluída. O sistema passou por uma auditoria rigorosa de segurança, 
            limpeza técnica e validação de regras de negócio antes do deploy final.
          </Text>

          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              "Remoção de 'Limite Disponível' (Portal)",
              "Ocultação de 'Carências' (Portal)",
              "Auditoria de RLS e Security Definers",
              "Verificação de Dead Code e Logs",
              "Matriz de Responsividade (320px-4K)",
              "Validação de Transactional Email Service"
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/50 p-2 rounded-md">
                <icons.confirmar className="h-4 w-4 text-[hsl(var(--success))]" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <footer className="mt-6 flex justify-end">
          <Button variant="primary" tone="success" leftIcon={icons.confirmar}>
            Pronto para Produção
          </Button>
        </footer>
      </Card>
      
      <Text variant="caption" className="text-center block">
        Fase 15: Auditoria Final e Preparação para Produção - Concluída em 03/08/2026
      </Text>
    </div>
  );
}
