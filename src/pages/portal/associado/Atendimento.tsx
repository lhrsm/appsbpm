import { useNavigate } from "react-router-dom";
import { useAssociado } from "@/contexts/AssociadoContext";
import { icons } from "@/design-system/icons";
import { Text } from "@/design-system/components/Text";
import PortalPageHeader from "@/portal/components/PortalPageHeader";
import { PortalCard } from "@/portal/ui/PortalCard";
import { ActionCard } from "@/portal/ui/cards";
import { PortalAlert } from "@/portal/ui/feedback";
import { PortalButton } from "@/portal/forms/buttons";
import { canaisAtendimento, linkWhatsApp } from "@/portal/associado/config";

/**
 * Canais de atendimento (§10): setor, horário e canal correto para cada assunto.
 * Somente canais institucionais — nunca contatos pessoais.
 */
export default function Atendimento() {
  const navigate = useNavigate();
  const { associado } = useAssociado();

  const mensagem = (setor: string) =>
    `Olá! Sou associado(a) da SBPM e preciso de atendimento do setor ${setor}.` +
    (associado?.nome ? ` Meu nome é ${associado.nome}.` : "");

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Canais de atendimento"
        description="Fale com o setor responsável pelo seu assunto. Atendimento em dias úteis."
        action={
          <PortalButton iconLeft={icons.solicitacao} onClick={() => navigate("/dashboard/solicitacoes/nova")}>
            Abrir solicitação
          </PortalButton>
        }
      />

      <PortalAlert tone="warning" title="Segurança no atendimento" icon={icons.lgpd}>
        A SBPM nunca solicita senha, código de acesso ou dados bancários por telefone, WhatsApp ou e-mail.
      </PortalAlert>

      <div className="grid gap-4 md:grid-cols-2">
        {canaisAtendimento.map((canal) => (
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
                  variant="primary"
                  iconLeft={icons.whatsapp}
                  onClick={() =>
                    window.open(linkWhatsApp(canal.whatsapp!, mensagem(canal.setor)), "_blank", "noopener,noreferrer")
                  }
                >
                  WhatsApp
                </PortalButton>
              )}
              {canal.email && (
                <PortalButton
                  variant="outline"
                  iconLeft={icons.email}
                  onClick={() => {
                    window.location.href = `mailto:${canal.email}`;
                  }}
                >
                  Enviar e-mail
                </PortalButton>
              )}
            </div>
          </PortalCard>
        ))}
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <ActionCard
          title="Perguntas frequentes"
          description="Respostas rápidas sobre benefícios, cadastro e uso do portal."
          icon={icons.ajuda}
          to="/dashboard/faq"
        />
        <ActionCard
          title="Minhas solicitações"
          description="Acompanhe protocolos e respostas da SBPM."
          icon={icons.solicitacao}
          to="/dashboard/solicitacoes"
        />
      </div>
    </div>
  );
}
