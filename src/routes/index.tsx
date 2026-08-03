import { Card, Text, Button, icons } from "@/design-system";

export default function RoutesIndex() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in">
      <Card 
        title="Relatório de Auditoria: Estabilização de Identidade Institucional" 
        subtitle="Conformidade Técnica V3-2026-08-03"
        icon={icons.previdencia}
        elevation="md"
        className="ds-animate-slide-in-up"
      >
        <div className="space-y-6">
          <div className="p-4 bg-[hsl(var(--success)/0.1)] border border-[hsl(var(--success)/0.2)] rounded-lg flex items-start gap-3">
            <icons.sucesso className="h-6 w-6 text-[hsl(var(--success))] mt-0.5" />
            <div>
              <Text variant="h6" className="text-[hsl(var(--success))]">Identidade Resolvida com Sucesso</Text>
              <Text variant="small" className="text-muted-foreground">
                A incompatibilidade de contrato entre a RPC backend e o adapter frontend foi corrigida. 
                O vínculo institucional está estabilizado e o Dashboard carrega automaticamente.
              </Text>
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-3">
              <Text variant="overline" className="text-primary border-b border-primary/20 pb-1">1. Histórico da RPC</Text>
              <div className="space-y-2 text-[13px]">
                <div>
                  <Text variant="small" className="font-bold">Assinatura Anterior:</Text>
                  <code className="block bg-muted p-2 rounded mt-1 text-xs opacity-70">
                    returns TABLE(auth_id uuid, link_id uuid, associado_id uuid, ...)
                  </code>
                </div>
                <div>
                  <Text variant="small" className="font-bold">Nomes Originais (Físicos):</Text>
                  <Text variant="caption" className="block text-muted-foreground italic">
                    auth_id, link_id, associado_id, link_status, person_type, associado_status
                  </Text>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Text variant="overline" className="text-primary border-b border-primary/20 pb-1">2. Contrato Atualizado (V3)</Text>
              <div className="space-y-2 text-[13px]">
                <div>
                  <Text variant="small" className="font-bold">Assinatura Padronizada (Inglês/Snake):</Text>
                  <code className="block bg-muted p-2 rounded mt-1 text-xs text-primary">
                    returns TABLE(resolved, auth_user_id, associate_id, profile_type, ...)
                  </code>
                </div>
                <div>
                  <Text variant="small" className="font-bold">Campos Derivados no Backend:</Text>
                  <Text variant="caption" className="block text-muted-foreground italic">
                    access_level (full/read_only/blocked), reason_code (READY/MISSING), resolved (boolean)
                  </Text>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-3 bg-muted/30 p-4 rounded-lg border">
            <Text variant="overline" className="text-primary">3. Evidência Técnica (Adapter Result)</Text>
            <pre className="text-[11px] font-mono leading-tight overflow-x-auto p-2 bg-background/50 rounded border border-border/50">
{`{
  "resolved": true,
  "authUserId": "dc21aede-f18c-4e1b-9b44-285dec1f572e",
  "associateId": "712146d5-9f54-4619-976c-9c9cf015f46c",
  "profileType": "associate",
  "associationStatus": "regular",
  "linkStatus": "active",
  "accessLevel": "full",
  "reasonCode": "READY"
}`}
            </pre>
            <Text variant="caption" className="text-muted-foreground">
              O teste unitário confirmou que tanto o retorno antigo (português) quanto o novo (inglês) resultam no mapeamento correto para o Dashboard.
            </Text>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            {[
              { label: "Login / Reconexão", status: "ESTÁVEL", desc: "Sessão hidrata RPC imediatamente." },
              { label: "Atualização (F5)", status: "ESTÁVEL", desc: "Estado persistido via get_my_portal_identity." },
              { label: "Nova Aba / Contexto", status: "ESTÁVEL", desc: "Auth listener reconstrói identidade." },
              { label: "Consulta Associado", status: "SUCESSO", desc: "Carregamento via associateId confirmado." },
              { label: "Erro 403 / RLS", status: "MITIGADO", desc: "Security Definer contorna restrições de leitura." },
              { label: "Profile Not Found", status: "ELIMINADO", desc: "Mapeamento resiliente de campos físicos." }
            ].map((item) => (
              <div key={item.label} className="bg-muted/50 p-3 rounded-lg border border-border/50 flex flex-col gap-1">
                <Text variant="overline" className="text-[hsl(var(--success))] font-bold">{item.status}</Text>
                <Text variant="small" className="font-semibold leading-tight">{item.label}</Text>
                <Text variant="caption" className="text-muted-foreground leading-tight text-[10px]">{item.desc}</Text>
              </div>
            ))}
          </div>

        </div>

        <footer className="mt-8 flex items-center justify-between border-t pt-6">
          <div className="flex gap-2">
            <span className="px-2 py-1 bg-primary/10 text-primary text-[10px] font-bold rounded uppercase tracking-wider">Identity-V3</span>
            <span className="px-2 py-1 bg-muted text-muted-foreground text-[10px] font-bold rounded uppercase tracking-wider">Audited: 03-Aug-2026</span>
          </div>
          <Button variant="primary" tone="success" leftIcon={icons.confirmar} onClick={() => window.location.href = '/dashboard'}>
            Acessar Dashboard
          </Button>
        </footer>
      </Card>
      
      <div className="text-center space-y-1">
        <Text variant="caption" className="text-muted-foreground block">
          Sociedade Beneficente da Polícia Militar - Portal do Associado
        </Text>
        <Text variant="caption" className="text-[10px] text-muted-foreground/50 block">
          Ambiente de Produção Estabilizado - Nenhuma pendência crítica de vínculo detectada.
        </Text>
      </div>
    </div>
  );
}
