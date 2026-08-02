import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { portalCall } from "@/lib/portal";
import { icons } from "@/design-system/icons";
import PortalPageHeader from "@/portal/components/PortalPageHeader";
import { PortalCard } from "@/portal/ui/PortalCard";
import { PortalAlert, portalToast } from "@/portal/ui/feedback";
import { PortalForm, PortalFormActions, type FormErrorItem } from "@/portal/forms/PortalForm";
import { FormField } from "@/portal/forms/FormField";
import { TextInput } from "@/portal/forms/inputs";
import { TextareaField } from "@/portal/forms/TextareaField";
import { SelectField } from "@/portal/forms/selects";
import { RadioGroupField, CheckboxField } from "@/portal/forms/choices";
import { categoriasSolicitacao, getCategoriaSolicitacao } from "@/portal/associado/config";

/**
 * Abertura guiada de solicitação (§8): categoria → assunto → descrição → revisão.
 * Toda solicitação recebe protocolo e é acompanhada em "Minhas solicitações".
 */
export default function SolicitacaoNova() {
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState(categoriasSolicitacao[0].value);
  const [assunto, setAssunto] = useState("");
  const [assuntoLivre, setAssuntoLivre] = useState("");
  const [descricao, setDescricao] = useState("");
  const [urgente, setUrgente] = useState(false);
  const [confirma, setConfirma] = useState(false);
  const [erros, setErros] = useState<FormErrorItem[]>([]);

  const info = useMemo(() => getCategoriaSolicitacao(categoria)!, [categoria]);
  const assuntoFinal = (assunto === "__outro" ? assuntoLivre : assunto || info.assuntos[0]).trim();

  const enviar = async () => {
    const problemas: FormErrorItem[] = [];
    if (assuntoFinal.length < 3) problemas.push({ field: "assunto", message: "Informe o assunto da solicitação." });
    if (descricao.trim().length < 20)
      problemas.push({ field: "descricao", message: "Descreva o pedido com pelo menos 20 caracteres." });
    if (!confirma) problemas.push({ field: "confirma", message: "Confirme que as informações são verdadeiras." });
    setErros(problemas);
    if (problemas.length) return;

    const prazo = new Date();
    prazo.setDate(prazo.getDate() + info.sla);

    await portalCall("solicitacoes_criar", {
      categoria,
      assunto: assuntoFinal.slice(0, 190),
      descricao: descricao.trim(),
      prioridade: urgente ? "alta" : "normal",
      sla_prazo: prazo.toISOString(),
    });

    portalToast.success(
      "Solicitação registrada",
      `Prazo estimado de resposta: ${info.sla} dias úteis. Acompanhe em Minhas solicitações.`,
    );
    navigate("/dashboard/solicitacoes");
  };

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Nova solicitação"
        description="Registre seu pedido à SBPM. Você receberá um protocolo para acompanhamento."
      />

      <PortalAlert tone="info" title="Antes de abrir" icon={icons.info}>
        Consulte as perguntas frequentes e os canais de atendimento — muitas dúvidas são resolvidas na hora.
      </PortalAlert>

      <PortalCard title="Dados da solicitação" icon={icons.solicitacao}>
        <PortalForm
          onSubmit={enviar}
          errors={erros}
          aria-label="Nova solicitação"
          actions={
            <PortalFormActions
              submitLabel="Enviar solicitação"
              loadingText="Enviando..."
              onCancel={() => navigate("/dashboard/solicitacoes")}
            />
          }
        >
          <FormField label="Categoria" required helperText={info.descricao}>
            {(f) => (
              <SelectField
                {...f}
                value={categoria}
                onChange={(e) => {
                  setCategoria(e.target.value);
                  setAssunto("");
                }}
                options={categoriasSolicitacao.map((c) => ({ value: c.value, label: c.label }))}
              />
            )}
          </FormField>

          <RadioGroupField
            name="assunto"
            label="Assunto"
            value={assunto || info.assuntos[0]}
            onValueChange={setAssunto}
            options={[
              ...info.assuntos.map((a) => ({ value: a, label: a })),
              { value: "__outro", label: "Outro assunto" },
            ]}
          />

          {assunto === "__outro" && (
            <FormField label="Descreva o assunto" required error={erros.find((e) => e.field === "assunto")?.message}>
              {(f) => <TextInput {...f} value={assuntoLivre} maxLength={120} onChange={(e) => setAssuntoLivre(e.target.value)} />}
            </FormField>
          )}

          <FormField
            label="Detalhes do pedido"
            required
            helperText="Explique com clareza. Não inclua senhas ou dados de terceiros."
            error={erros.find((e) => e.field === "descricao")?.message}
            counter={`${descricao.length}/2000`}
          >
            {(f) => (
              <TextareaField {...f} rows={6} maxLength={2000} value={descricao} onChange={(e) => setDescricao(e.target.value)} />
            )}
          </FormField>

          <CheckboxField
            id="urgente"
            checked={urgente}
            onCheckedChange={setUrgente}
            label="Meu caso é urgente"
            description="A urgência é avaliada pelo setor responsável."
          />

          <CheckboxField
            id="confirma"
            checked={confirma}
            onCheckedChange={setConfirma}
            label="Confirmo que as informações prestadas são verdadeiras"
            error={erros.find((e) => e.field === "confirma")?.message}
          />

          <PortalAlert tone="neutral" title={`Prazo estimado: ${info.sla} dias úteis`} icon={icons.agenda}>
            {info.exigeDocumento
              ? "Poderá ser solicitado documento comprobatório durante a análise."
              : "Você será avisado a cada mudança de situação da solicitação."}
          </PortalAlert>
        </PortalForm>
      </PortalCard>
    </div>
  );
}
