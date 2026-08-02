import { useState } from "react";
import { portalCall } from "@/lib/portal";
import { icons } from "@/design-system/icons";
import { PortalModal } from "@/portal/forms/overlays";
import { PortalForm, PortalFormActions, type FormErrorItem } from "@/portal/forms/PortalForm";
import { FormField } from "@/portal/forms/FormField";
import { TextInput } from "@/portal/forms/inputs";
import { TextareaField } from "@/portal/forms/TextareaField";
import { SelectField } from "@/portal/forms/selects";
import { CheckboxField } from "@/portal/forms/choices";
import { PortalAlert, portalToast } from "@/portal/ui/feedback";
import { camposOficiais, getCategoriaSolicitacao } from "@/portal/associado/config";

export interface SolicitarCorrecaoModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Informação pré-selecionada (ex.: "Nome completo"). */
  campoPadrao?: string;
  /** Valor atualmente exibido no portal. */
  valorAtual?: string;
  onSucesso?: () => void;
}

/**
 * Fluxo de solicitação de correção cadastral (§5).
 *
 * Nunca altera o dado oficial: cria uma solicitação institucional para análise,
 * com protocolo e histórico. O associado acompanha em "Minhas solicitações".
 */
export function SolicitarCorrecaoModal({
  open,
  onOpenChange,
  campoPadrao,
  valorAtual,
  onSucesso,
}: SolicitarCorrecaoModalProps) {
  const [campo, setCampo] = useState(campoPadrao ?? camposOficiais[0].label);
  const [atual, setAtual] = useState(valorAtual ?? "");
  const [correto, setCorreto] = useState("");
  const [motivo, setMotivo] = useState("");
  const [observacao, setObservacao] = useState("");
  const [temDocumento, setTemDocumento] = useState(false);
  const [erros, setErros] = useState<FormErrorItem[]>([]);

  const categoria = getCategoriaSolicitacao("alteracao_cadastral")!;

  const enviar = async () => {
    const problemas: FormErrorItem[] = [];
    if (!correto.trim()) problemas.push({ field: "correto", message: "Informe o valor correto." });
    if (motivo.trim().length < 10) problemas.push({ field: "motivo", message: "Descreva o motivo com pelo menos 10 caracteres." });
    setErros(problemas);
    if (problemas.length) return;

    const prazo = new Date();
    prazo.setDate(prazo.getDate() + categoria.sla);

    const descricao = [
      `Informação a corrigir: ${campo}`,
      `Valor atualmente exibido: ${atual || "não informado"}`,
      `Valor correto sugerido: ${correto.trim()}`,
      `Motivo: ${motivo.trim()}`,
      observacao.trim() ? `Observação: ${observacao.trim()}` : null,
      `Documento comprobatório: ${temDocumento ? "o associado informou que possui e enviará ao setor" : "não informado"}`,
    ]
      .filter(Boolean)
      .join("\n");

    await portalCall("solicitacoes_criar", {
      categoria: "alteracao_cadastral",
      assunto: `Correção cadastral — ${campo}`.slice(0, 120),
      descricao,
      prioridade: "normal",
      sla_prazo: prazo.toISOString(),
    });

    portalToast.success(
      "Solicitação de correção enviada",
      "O dado oficial permanece inalterado até a análise da SBPM. Acompanhe em Minhas solicitações.",
    );
    setCorreto("");
    setMotivo("");
    setObservacao("");
    setTemDocumento(false);
    onOpenChange(false);
    onSucesso?.();
  };

  return (
    <PortalModal
      open={open}
      onOpenChange={onOpenChange}
      title="Solicitar correção cadastral"
      description="Os dados oficiais não são alterados automaticamente. Sua solicitação será analisada pela SBPM."
      size="lg"
    >
      <PortalForm
        onSubmit={enviar}
        errors={erros}
        aria-label="Solicitação de correção cadastral"
        actions={<PortalFormActions submitLabel="Enviar solicitação" loadingText="Enviando..." onCancel={() => onOpenChange(false)} />}
      >
        <PortalAlert tone="info" title="Como funciona" icon={icons.info}>
          A correção passa pelas etapas Recebida, Em análise e Concluída. Você receberá um protocolo para acompanhamento.
        </PortalAlert>

        <FormField label="Informação a corrigir" required>
          {(f) => (
            <SelectField
              {...f}
              value={campo}
              onChange={(e) => setCampo(e.target.value)}
              options={camposOficiais.map((c) => ({ value: c.label, label: c.label }))}
            />
          )}
        </FormField>

        <FormField label="Valor atualmente exibido" helperText="Como a informação aparece hoje no portal.">
          {(f) => <TextInput {...f} value={atual} maxLength={140} onChange={(e) => setAtual(e.target.value)} />}
        </FormField>

        <FormField label="Valor correto sugerido" required error={erros.find((e) => e.field === "correto")?.message}>
          {(f) => <TextInput {...f} value={correto} maxLength={140} onChange={(e) => setCorreto(e.target.value)} />}
        </FormField>

        <FormField label="Motivo da correção" required error={erros.find((e) => e.field === "motivo")?.message}>
          {(f) => (
            <TextareaField {...f} rows={4} maxLength={800} value={motivo} onChange={(e) => setMotivo(e.target.value)} />
          )}
        </FormField>

        <FormField label="Observação" helperText="Opcional.">
          {(f) => (
            <TextareaField {...f} rows={3} maxLength={500} value={observacao} onChange={(e) => setObservacao(e.target.value)} />
          )}
        </FormField>

        <CheckboxField
          id="documento-correcao"
          checked={temDocumento}
          onCheckedChange={setTemDocumento}
          label="Possuo documento comprobatório"
          description="O setor responsável indicará como enviar o documento pelo canal oficial."
        />
      </PortalForm>
    </PortalModal>
  );
}
