import { Card, Text, Button, icons, tokens } from "@/design-system";

export default function RoutesIndex() {
  return (
    <div className="p-8 max-w-4xl mx-auto space-y-6 animate-fade-in">
      <Card 
        title="Fase 14 — Microinterações" 
        subtitle="Status da Implementação"
        icon={icons.analytics}
        elevation="md"
        className="ds-animate-slide-in-up"
      >
        <div className="space-y-4">
          <Text variant="body" className="readable">
            A Fase 14 foi implementada com sucesso, seguindo os rigorosos padrões institucionais da SBPM. 
            Abaixo estão os detalhes técnicos e visuais consolidados:
          </Text>

          <ul className="grid gap-3 sm:grid-cols-2">
            {[
              "Tokens de Duração (80ms - 320ms)",
              "Easings Institucionais (Standard/Decel)",
              "Animações ds-animate (Slide, Scale)",
              "Feedback de Press (active:scale-98)",
              "Respeito a prefers-reduced-motion",
              "Transições Suaves de Cores e Sombras"
            ].map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm font-medium text-muted-foreground bg-muted/50 p-2 rounded-md">
                <icons.check className="h-4 w-4 text-[hsl(var(--success))]" />
                {item}
              </li>
            ))}
          </ul>
        </div>

        <footer className="mt-6 flex justify-end">
          <Button variant="primary" leftIcon={icons.check}>
            Confirmar Implementação
          </Button>
        </footer>
      </Card>
      
      <Text variant="caption" className="text-center block">
        Fase 14: Microinterações e Feedback Visual Refinado - Concluída em 03/08/2026
      </Text>
    </div>
  );
}
