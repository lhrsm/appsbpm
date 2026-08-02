import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Text } from "@/design-system/components/Text";
import { Badge } from "@/design-system/components/Badge";
import { icons } from "@/design-system/icons";
import { cn } from "@/lib/utils";
import { PortalCard } from "@/portal/ui";
import { PortalAlert, portalToast } from "@/portal/ui/feedback";
import {
  FormField,
  PortalButton,
  PortalForm,
  PortalFormActions,
  RadioGroupField,
  SelectField,
  TextareaField,
  TextInput,
} from "@/portal/forms";
import { getModulo, modulosPorPerfil, uploadConfig } from "../catalog";
import { useAssuntos, useCriarSolicitacao } from "../hooks/useRelationship";
import type { CentralPrioridade, CentralProtocolo } from "../types";

/**
 * Wizard institucional de abertura de solicitação (Fase 9, §4).
 *
 * Seis etapas: módulo → assunto → descrição → prioridade → documentos →
 * confirmação. Nenhuma lista é fixada aqui: módulos e assuntos vêm do catálogo
 * central (`src/central/catalog.ts`) e, futuramente, do SBPMSanitas.
 */

const ETAPAS = ["Módulo", "Assunto", "Descrição", "Prioridade", "Documentos", "Confirmação"] as const;

const prioridades: Array<{ value: CentralPrioridade; label: string; description: string }> = [
  { value: "baixa", label: "Baixa", description: "Sem urgência; pode aguardar o fluxo normal." },
  { value: "media", label: "Média", description: "Situação comum, dentro do prazo padrão." },
  { value: "alta", label: "Alta", description: "Impacta o uso de um benefício ou serviço." },
  { value: "urgente", label: "Urgente", description: "Risco imediato ao atendimento ou ao vínculo." },
];

export interface SupportWizardProps {
  perfil: "associate" | "dependent";
  /** Módulo pré-selecionado (ex.: atalho vindo do hub). */
  moduloInicial?: string;
  onConcluido?: (protocolo: CentralProtocolo) => void;
}

export default function SupportWizard({ perfil, moduloInicial, onConcluido }: SupportWizardProps) {
  const navigate = useNavigate();
  const { criar, enviando } = useCriarSolicitacao();

  const modulos = useMemo(() => modulosPorPerfil(perfil), [perfil]);
  const [etapa, setEtapa] = useState(moduloInicial ? 1 : 0);
  const [modulo, setModulo] = useState(moduloInicial ?? "");
  const [assunto, setAssunto] = useState("");
  const [assuntoLivre, setAssuntoLivre] = useState("");
  const [descricao, setDescricao] = useState("");
  const [prioridade, setPrioridade] = useState<CentralPrioridade>("media");
  const [erro, setErro] = useState<string | null>(null);

  const { assuntos, loading: carregandoAssuntos } = useAssuntos(modulo || undefined);
  const moduloInfo = modulo ? getModulo(modulo) : null;
  const assuntoFinal = assunto === "__outro" ? assuntoLivre.trim() : assunto;

  const podeAvancar = () => {
    if (etapa === 0) return !!modulo;
    if (etapa === 1) return assuntoFinal.length >= 3;
    if (etapa === 2) return descricao.trim().length >= 20;
    return true;
  };

  const mensagemBloqueio = () => {
    if (etapa === 0) return "Selecione o módulo responsável pelo seu pedido.";
    if (etapa === 1) return "Informe o assunto da solicitação (mínimo de 3 caracteres).";
    if (etapa === 2) return "Descreva o pedido com pelo menos 20 caracteres.";
    return null;
  };

  const avancar = () => {
    if (!podeAvancar()) {
      setErro(mensagemBloqueio());
      return;
    }
    setErro(null);
    setEtapa((e) => Math.min(e + 1, ETAPAS.length - 1));
  };

  const voltar = () => {
    setErro(null);
    setEtapa((e) => Math.max(e - 1, 0));
  };

  const enviar = async () => {
    try {
      const criada = await criar({ modulo, assunto: assuntoFinal, descricao: descricao.trim(), prioridade });
      portalToast.success(`Solicitação registrada — protocolo ${criada.protocolo}`);
      if (onConcluido) onConcluido(criada);
      else navigate(`/dashboard/central/protocolos/${criada.id}`);
    } catch (err) {
      setErro(err instanceof Error ? err.message : "Não foi possível registrar a solicitação.");
    }
  };

  const progresso = Math.round(((etapa + 1) / ETAPAS.length) * 100);

  return (
    <div className="space-y-4">
      {/* Progresso institucional */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Text variant="small" className="font-medium">
            Etapa {etapa + 1} de {ETAPAS.length} · {ETAPAS[etapa]}
          </Text>
          <Text variant="caption">{progresso}%</Text>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={progresso} aria-valuemin={0} aria-valuemax={100} aria-label="Progresso da solicitação">
          <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${progresso}%` }} />
        </div>
        <ol className="flex flex-wrap gap-x-3 gap-y-1" aria-label="Etapas">
          {ETAPAS.map((nome, i) => (
            <li key={nome} className={cn("text-xs", i === etapa ? "font-semibold text-primary" : i < etapa ? "text-muted-foreground line-through" : "text-muted-foreground")}>
              {i + 1}. {nome}
            </li>
          ))}
        </ol>
      </div>

      {erro && <PortalAlert tone="danger" title="Verifique os dados" description={erro} />}

      <PortalCard density="regular">
        {etapa === 0 && (
          <fieldset className="space-y-3">
            <legend className="sr-only">Escolha o módulo</legend>
            <Text variant="small" className="text-muted-foreground">
              Selecione o setor responsável. Isso define o prazo de retorno e quem receberá o seu pedido.
            </Text>
            <div className="grid gap-2 sm:grid-cols-2">
              {modulos.map((m) => {
                const Icon = m.icon;
                const ativo = modulo === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setModulo(m.value)}
                    aria-pressed={ativo}
                    className={cn(
                      "flex min-h-[44px] items-start gap-3 rounded-xl border p-3 text-left transition",
                      ativo ? "border-primary bg-primary/5 ring-1 ring-primary/40" : "border-border hover:border-primary/40",
                    )}
                  >
                    <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary" aria-hidden>
                      <Icon className="h-4.5 w-4.5" />
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold">{m.label}</span>
                      <span className="block text-xs text-muted-foreground">{m.descricao}</span>
                      <Badge tone="neutral" className="mt-1">
                        Prazo de {m.sla} dias úteis
                      </Badge>
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        )}

        {etapa === 1 && (
          <div className="space-y-4">
            <FormField label="Assunto" required helperText="Escolha o assunto mais próximo do seu pedido.">
              {(f) => (
                <SelectField
                  {...f}
                  options={assuntos.map((a) => ({ value: a, label: a }))}
                  value={assunto}
                  loading={carregandoAssuntos}
                  allowOther
                  otherLabel="Outro assunto"
                  onChange={(e) => setAssunto(e.target.value)}
                />
              )}
            </FormField>
            {assunto === "__outro" && (
              <FormField label="Descreva o assunto" required counter={`${assuntoLivre.length}/120`}>
                {(f) => (
                  <TextInput
                    {...f}
                    maxLength={120}
                    value={assuntoLivre}
                    onChange={(e) => setAssuntoLivre(e.target.value)}
                    placeholder="Ex.: Atualização de conta bancária"
                  />
                )}
              </FormField>
            )}
          </div>
        )}

        {etapa === 2 && (
          <FormField
            label="Descrição do pedido"
            required
            helperText="Detalhe datas, nomes e o que você precisa. Não inclua senhas ou dados de cartão."
            counter={`${descricao.length}/4000`}
          >
            {(f) => (
              <TextareaField
                {...f}
                autoResize
                rows={6}
                maxLength={4000}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva sua solicitação com o máximo de detalhes."
              />
            )}
          </FormField>
        )}

        {etapa === 3 && (
          <div className="space-y-3">
            <RadioGroupField
              label="Prioridade"
              name="prioridade"
              value={prioridade}
              onChange={(v) => setPrioridade(v as CentralPrioridade)}
              options={prioridades}
            />
            {moduloInfo && (
              <PortalAlert
                tone="info"
                title={`Prazo estimado: ${moduloInfo.sla} dias úteis`}
                description="A prioridade orienta o setor, mas o prazo institucional do módulo continua valendo."
              />
            )}
          </div>
        )}

        {etapa === 4 && (
          <div className="space-y-3">
            <Text variant="h6" as="p">
              Documentos comprobatórios
            </Text>
            <PortalAlert
              tone="warning"
              title="Envio de anexos pelo portal em implantação"
              description={`Assim que a integração for concluída, será possível anexar até ${uploadConfig.maxArquivos} arquivos de ${uploadConfig.maxTamanhoMb} MB (${uploadConfig.formatos.join(", ")}). Por enquanto, o setor solicitará os documentos pelo protocolo, por e-mail ou WhatsApp.`}
            />
            <Text variant="small" className="text-muted-foreground">
              Você pode seguir para a confirmação — o pedido será registrado normalmente.
            </Text>
          </div>
        )}

        {etapa === 5 && (
          <PortalForm
            onSubmit={enviar}
            aria-label="Confirmação da solicitação"
            actions={
              <PortalFormActions
                submitLabel="Enviar solicitação"
                loadingText="Registrando..."
                cancelLabel="Voltar"
                onCancel={voltar}
                disabled={enviando}
              />
            }
          >
            <dl className="divide-y divide-border rounded-xl border border-border">
              {[
                ["Módulo", moduloInfo?.label ?? "—"],
                ["Assunto", assuntoFinal || "—"],
                ["Prioridade", prioridades.find((p) => p.value === prioridade)?.label ?? "—"],
                ["Prazo estimado", moduloInfo ? `${moduloInfo.sla} dias úteis` : "—"],
              ].map(([rotulo, valor]) => (
                <div key={rotulo} className="flex flex-wrap justify-between gap-2 p-3">
                  <dt className="text-sm text-muted-foreground">{rotulo}</dt>
                  <dd className="text-sm font-medium">{valor}</dd>
                </div>
              ))}
              <div className="space-y-1 p-3">
                <dt className="text-sm text-muted-foreground">Descrição</dt>
                <dd className="whitespace-pre-wrap text-sm">{descricao}</dd>
              </div>
            </dl>
            <PortalAlert
              tone="info"
              title="Protocolo automático"
              description="Ao enviar, você receberá um número no formato SBPM-AAAA-000000000 para acompanhar o atendimento."
            />
          </PortalForm>
        )}
      </PortalCard>

      {etapa < 5 && (
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          {etapa > 0 && (
            <PortalButton variant="ghost" onClick={voltar} icon={icons.anterior} className="w-full sm:w-auto">
              Voltar
            </PortalButton>
          )}
          <PortalButton onClick={avancar} iconRight={icons.proximo} className="w-full sm:w-auto">
            Continuar
          </PortalButton>
        </div>
      )}
    </div>
  );
}
