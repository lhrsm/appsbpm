import { useState } from "react";
import { Text } from "@/design-system/components/Text";
import { PortalCard } from "@/portal/ui";
import { PortalAlert, portalToast } from "@/portal/ui/feedback";
import { FormField, PortalButton, PortalForm, PortalFormActions, RadioGroupField, TextareaField } from "@/portal/forms";
import { icons } from "@/design-system/icons";
import { cn } from "@/lib/utils";
import { useEnviarFeedback } from "../hooks/useRelationship";
import type { CentralFeedback } from "../types";

const satisfacoes = [
  { value: "muito_insatisfeito", label: "Muito insatisfeito" },
  { value: "insatisfeito", label: "Insatisfeito" },
  { value: "neutro", label: "Neutro" },
  { value: "satisfeito", label: "Satisfeito" },
  { value: "muito_satisfeito", label: "Muito satisfeito" },
];

const tempos = [
  { value: "muito_rapido", label: "Muito rápido", description: "Respondido antes do esperado." },
  { value: "adequado", label: "Adequado", description: "Dentro do prazo informado." },
  { value: "demorado", label: "Demorado", description: "Levou mais tempo que o necessário." },
];

export interface FeedbackFormProps {
  protocoloId: string;
  protocolo: string;
  onEnviado?: () => void;
}

/** Pesquisa de satisfação exibida ao encerrar um atendimento (Fase 9, §16). */
export default function FeedbackForm({ protocoloId, protocolo, onEnviado }: FeedbackFormProps) {
  const { enviar, enviando } = useEnviarFeedback();
  const [nota, setNota] = useState(0);
  const [satisfacao, setSatisfacao] = useState<CentralFeedback["satisfacao"]>("satisfeito");
  const [tempo, setTempo] = useState<CentralFeedback["tempoAtendimento"]>("adequado");
  const [comentario, setComentario] = useState("");
  const [erro, setErro] = useState<string | null>(null);
  const [concluido, setConcluido] = useState(false);

  if (concluido) {
    return (
      <PortalCard variant="success" density="compact" icon={icons.sucesso} title="Obrigado pela avaliação">
        <Text variant="small" className="text-muted-foreground">
          Sua opinião ajuda a SBPM a melhorar o atendimento.
        </Text>
      </PortalCard>
    );
  }

  const submeter = async () => {
    if (nota < 1) {
      setErro("Selecione uma nota de 1 a 5 estrelas.");
      return;
    }
    setErro(null);
    try {
      await enviar({ protocoloId, nota, satisfacao, tempoAtendimento: tempo, comentario: comentario.trim() || undefined });
      portalToast.success("Avaliação registrada. Obrigado!");
      setConcluido(true);
      onEnviado?.();
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível registrar a avaliação.");
    }
  };

  return (
    <PortalCard title="Avalie este atendimento" subtitle={`Protocolo ${protocolo}`} icon={icons.avaliacao}>
      {erro && <PortalAlert tone="danger" title="Avaliação incompleta">{erro}</PortalAlert>}

      <PortalForm
        onSubmit={submeter}
        aria-label="Pesquisa de satisfação"
        actions={<PortalFormActions submitLabel="Enviar avaliação" loadingText="Enviando..." disabled={enviando} />}
      >
        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">Nota geral</legend>
          <div className="flex gap-1" role="radiogroup" aria-label="Nota de 1 a 5">
            {[1, 2, 3, 4, 5].map((valor) => (
              <button
                key={valor}
                type="button"
                role="radio"
                aria-checked={nota === valor}
                aria-label={`${valor} estrela${valor > 1 ? "s" : ""}`}
                onClick={() => setNota(valor)}
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-border transition hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <icons.avaliacao className={cn("h-5 w-5", valor <= nota ? "fill-current text-primary" : "text-muted-foreground")} aria-hidden />
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">Como você avalia a resolução?</legend>
          <RadioGroupField
            name="satisfacao"
            variant="list"
            value={satisfacao}
            onValueChange={(v) => setSatisfacao(v as CentralFeedback["satisfacao"])}
            options={satisfacoes}
          />
        </fieldset>

        <fieldset className="space-y-2">
          <legend className="text-sm font-semibold">Tempo de atendimento</legend>
          <RadioGroupField
            name="tempo"
            variant="cards"
            value={tempo}
            onValueChange={(v) => setTempo(v as CentralFeedback["tempoAtendimento"])}
            options={tempos}
          />
        </fieldset>

        <FormField label="Comentário (opcional)" counter={`${comentario.length}/1000`}>
          {(f) => (
            <TextareaField
              {...f}
              autoResize
              maxLength={1000}
              value={comentario}
              onChange={(e) => setComentario(e.target.value)}
              placeholder="Conte o que funcionou bem ou o que pode melhorar."
            />
          )}
        </FormField>
      </PortalForm>
    </PortalCard>
  );
}
