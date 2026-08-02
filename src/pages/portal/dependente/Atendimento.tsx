import { Link } from "react-router-dom";
import { useAssociado } from "@/contexts/AssociadoContext";
import { icons } from "@/design-system/icons";
import { Text } from "@/design-system/components/Text";
import PortalPageHeader from "@/portal/components/PortalPageHeader";
import { PortalCard } from "@/portal/ui/PortalCard";
import { PortalAlert } from "@/portal/ui/feedback";
import { PortalButton } from "@/portal/forms/buttons";
import { linkWhatsApp } from "@/portal/associado/config";
import { canaisAtendimentoDependente } from "@/portal/dependente/config";

/**
 * Canais de atendimento do dependente (§12 da Fase 8).
 * Cada card traz setor, telefone, WhatsApp, horário e ação direta.
 */
export default function AtendimentoDependente() {
  const { dependenteLogado } = useAssociado();

  const mensagem = (setor: string) =>
    `Olá! Sou dependente vinculado(a) à SBPM e preciso de atendimento do setor ${setor}.` +
    (dependenteLogado?.nome ? ` Meu nome é ${dependenteLogado.nome}.` : "");

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Canais de atendimento"
        description="Fale com o setor responsável pelo seu assunto. Atendimento em dias úteis."
        action={
          <PortalButton iconLeft={icons.solicitacao} asChild>
            <Link to="/dashboard/solicitacoes/nova">Abrir solicitação</Link>
          </PortalButton>
        }
      />

      <PortalAlert tone="warning" title="Segurança no atendimento" icon={icons.lgpd}>
        A SBPM nunca solicita senha, código de acesso ou dados bancários por telefone, WhatsApp ou e-mail.
      </PortalAlert>

      <div className="grid gap-4 md:grid-cols-2">
        {canaisAtendimentoDependente.map((canal) => (
          <PortalCard key={canal.id} title={canal.setor} description={canal.descricao} icon={canal.icon}>
            <dl className="space-y-2 text-sm">
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Horário:</dt>
                <dd>{canal.horario}</dd>
              </div>
              {canal.telefone && (
                <div className="flex gap-2">
                  <dt className="text-muted-foreground">Telefone:</dt>
                  <dd>{canal.telefone}</dd>
                </div>
              )}
              {canal.email && (
                <div className="flex gap-2">
                  <dt className="text-muted-foreground">E-mail:</dt>
                  <dd className="break-all">{canal.email}</dd>
                </div>
              )}
            </dl>

            {canal.orientacoes && (
              <Text variant="caption" className="mt-3 block text-muted-foreground">
                {canal.orientacoes}
              </Text>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              {canal.whatsapp && (
                <PortalButton
                  iconLeft={icons.whatsapp}
                  onClick={() =>
                    window.open(linkWhatsApp(canal.whatsapp!, mensagem(canal.setor)), "_blank", "noopener,noreferrer")
                  }
                >
                  WhatsApp
                </PortalButton>
              )}
              {canal.telefone && (
                <PortalButton variant="secondary" iconLeft={icons.telefone} asChild>
                  <a href={`tel:+55${canal.telefone.replace(/\D/g, "")}`}>Ligar</a>
                </PortalButton>
              )}
              {canal.email && (
                <PortalButton variant="outline" iconLeft={icons.email} asChild>
                  <a href={`mailto:${canal.email}`}>Enviar e-mail</a>
                </PortalButton>
              )}
            </div>
          </PortalCard>
        ))}
      </div>
    </div>
  );
}
