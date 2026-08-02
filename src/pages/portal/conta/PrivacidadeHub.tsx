import { useCallback, useEffect, useState } from "react";
import { icons } from "@/design-system/icons";
import { Badge } from "@/design-system/components/Badge";
import { Text } from "@/design-system/components/Text";
import PortalPageHeader from "@/portal/components/PortalPageHeader";
import { PortalCard } from "@/portal/ui/PortalCard";
import { PortalAlert, portalToast } from "@/portal/ui/feedback";
import { PortalEmptyState } from "@/portal/ui/PortalEmptyState";
import { SectionErrorState } from "@/portal/ui/errorStates";
import { ListSkeleton } from "@/portal/ui/skeletons";
import { PortalButton } from "@/portal/forms/buttons";
import { PortalModal } from "@/portal/forms/overlays";
import { FormField } from "@/portal/forms/FormField";
import { TextareaField } from "@/portal/forms/TextareaField";
import { SelectField } from "@/portal/forms/selects";
import { PasswordInput } from "@/portal/forms/inputs";
import { Switch } from "@/components/ui/switch";
import { contaCall, dataHoraBR } from "@/lib/conta";

interface Consentimento {
  tipo: string;
  finalidade: string;
  versao: string;
  status: string;
  concedido_em: string | null;
  revogado_em: string | null;
}

interface Pedido {
  id: string;
  protocol: string;
  request_type: string;
  description: string;
  status: string;
  created_at: string;
  completed_at: string | null;
}

interface Termo {
  id: string;
  terms_version: string;
  privacy_version: string | null;
  accepted_at: string;
  source: string | null;
}

const TIPOS_LGPD = [
  { value: "acesso", label: "Acesso aos meus dados" },
  { value: "correcao", label: "Correção de dados" },
  { value: "portabilidade", label: "Portabilidade (cópia dos dados)" },
  { value: "eliminacao", label: "Eliminação de dados" },
  { value: "revogacao", label: "Revogação de consentimento" },
  { value: "informacao", label: "Informação sobre compartilhamento" },
  { value: "oposicao", label: "Oposição ao tratamento" },
];

const STATUS_TONE: Record<string, "neutral" | "info" | "warning" | "success" | "danger"> = {
  recebida: "info",
  em_analise: "warning",
  em_andamento: "warning",
  concluida: "success",
  indeferida: "danger",
};

const rotuloTipo = (v: string) => TIPOS_LGPD.find((t) => t.value === v)?.label ?? v;

/**
 * Central de Privacidade e LGPD do portal externo (Fase 10).
 *
 * Consentimentos nunca são apagados: cada decisão gera novo registro histórico.
 */
export default function PrivacidadeHub() {
  const [consentimentos, setConsentimentos] = useState<Consentimento[]>([]);
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [termos, setTermos] = useState<Termo[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [dialogo, setDialogo] = useState<null | "solicitacao" | "exportacao">(null);
  const [enviando, setEnviando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);
  const [tipo, setTipo] = useState("acesso");
  const [descricao, setDescricao] = useState("");
  const [senha, setSenha] = useState("");
  const [formato, setFormato] = useState("json");

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      const [c, p, t] = await Promise.all([
        contaCall<{ itens: Consentimento[] }>("consentimentos"),
        contaCall<{ itens: Pedido[] }>("lgpd_listar"),
        contaCall<{ itens: Termo[] }>("termos"),
      ]);
      setConsentimentos(c.itens ?? []);
      setPedidos(p.itens ?? []);
      setTermos(t.itens ?? []);
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível carregar suas informações de privacidade.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const alternar = async (c: Consentimento, conceder: boolean) => {
    try {
      await contaCall("consentimento_definir", { tipo: c.tipo, conceder, versao: c.versao });
      portalToast.success(conceder ? "Consentimento registrado." : "Consentimento revogado.");
      await carregar();
    } catch (e) {
      portalToast.error(e instanceof Error ? e.message : "Não foi possível registrar sua escolha.");
    }
  };

  const executar = async (fn: () => Promise<void>) => {
    if (enviando) return;
    setEnviando(true);
    setErroForm(null);
    try {
      await fn();
    } catch (e) {
      setErroForm(e instanceof Error ? e.message : "Não foi possível concluir a solicitação.");
    } finally {
      setEnviando(false);
    }
  };

  const fechar = () => {
    setDialogo(null);
    setDescricao("");
    setSenha("");
    setErroForm(null);
  };

  if (carregando) return <ListSkeleton />;

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Privacidade e proteção de dados"
        description="Controle seus consentimentos, exerça seus direitos previstos na LGPD e acompanhe os protocolos abertos."
        secondaryActions={
          <PortalButton variant="secondary" iconLeft={icons.baixar} onClick={() => setDialogo("exportacao")}>
            Solicitar cópia dos dados
          </PortalButton>
        }
        action={
          <PortalButton iconLeft={icons.adicionar} onClick={() => setDialogo("solicitacao")}>
            Nova solicitação
          </PortalButton>
        }
      />

      {erro && <SectionErrorState description={erro} onRetry={carregar} />}

      <PortalAlert tone="info" title="Dados institucionais">
        Nome, CPF, matrícula, patente e vínculo são informações oficiais mantidas pela SBPM e não podem ser alteradas
        diretamente pelo portal. Para corrigi-las, abra uma solicitação de correção cadastral.
      </PortalAlert>

      <PortalCard
        title="Meus consentimentos"
        icon={icons.lgpd}
        subtitle="Comunicações e recursos opcionais. Serviços essenciais do vínculo não dependem de consentimento."
      >
        <ul className="divide-y">
          {consentimentos.map((c) => {
            const ativo = c.status === "granted";
            return (
              <li key={c.tipo} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0 flex-1">
                  <Text variant="small" className="font-medium">
                    {c.finalidade}
                  </Text>
                  <Text variant="caption" className="text-muted-foreground">
                    Versão {c.versao} ·{" "}
                    {ativo
                      ? `Concedido em ${dataHoraBR(c.concedido_em)}`
                      : c.revogado_em
                        ? `Revogado em ${dataHoraBR(c.revogado_em)}`
                        : "Nunca concedido"}
                  </Text>
                </div>
                <Switch
                  checked={ativo}
                  onCheckedChange={(v) => alternar(c, v)}
                  aria-label={`${ativo ? "Revogar" : "Conceder"} consentimento: ${c.finalidade}`}
                />
              </li>
            );
          })}
        </ul>
      </PortalCard>

      <PortalCard title="Minhas solicitações de privacidade" icon={icons.solicitacao} subtitle={`${pedidos.length} protocolo(s)`}>
        {pedidos.length === 0 ? (
          <PortalEmptyState
            size="compact"
            title="Nenhuma solicitação registrada"
            description="Você pode solicitar acesso, correção, portabilidade ou eliminação dos seus dados."
          />
        ) : (
          <ul className="divide-y">
            {pedidos.map((p) => (
              <li key={p.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Text variant="small" className="font-medium">
                      {rotuloTipo(p.request_type)}
                    </Text>
                    <Badge tone={STATUS_TONE[p.status] ?? "neutral"}>{p.status.replace(/_/g, " ")}</Badge>
                  </div>
                  <Text variant="caption" className="text-muted-foreground">
                    Protocolo {p.protocol} · Aberto em {dataHoraBR(p.created_at)}
                    {p.completed_at ? ` · Concluído em ${dataHoraBR(p.completed_at)}` : ""}
                  </Text>
                </div>
              </li>
            ))}
          </ul>
        )}
      </PortalCard>

      <PortalCard title="Termos e políticas aceitos" icon={icons.documento}>
        {termos.length === 0 ? (
          <PortalEmptyState size="compact" title="Nenhum aceite registrado" />
        ) : (
          <ul className="divide-y">
            {termos.map((t) => (
              <li key={t.id} className="py-3">
                <Text variant="small" className="font-medium">
                  Termos de uso {t.terms_version}
                  {t.privacy_version ? ` · Política de privacidade ${t.privacy_version}` : ""}
                </Text>
                <Text variant="caption" className="text-muted-foreground">
                  Aceito em {dataHoraBR(t.accepted_at)}
                </Text>
              </li>
            ))}
          </ul>
        )}
      </PortalCard>

      {/* -------------------------------------------------- Nova solicitação */}
      <PortalModal
        open={dialogo === "solicitacao"}
        onOpenChange={(o) => (o ? null : fechar())}
        title="Nova solicitação de privacidade"
        description="Descreva seu pedido. Você receberá um protocolo para acompanhamento."
        footer={
          <>
            <PortalButton variant="secondary" onClick={fechar} disabled={enviando}>
              Cancelar
            </PortalButton>
            <PortalButton
              loading={enviando}
              onClick={() =>
                executar(async () => {
                  const r = await contaCall<{ protocol: string }>("lgpd_criar", { tipo, descricao });
                  portalToast.success(`Solicitação registrada sob o protocolo ${r.protocol}.`);
                  fechar();
                  await carregar();
                })
              }
            >
              Enviar solicitação
            </PortalButton>
          </>
        }
      >
        {erroForm && <PortalAlert tone="danger">{erroForm}</PortalAlert>}
        <FormField label="Tipo de solicitação" required>
          {(f) => (
            <SelectField
              id={f.id}
              options={TIPOS_LGPD}
              value={tipo}
              onChange={(e) => setTipo(e.target.value)}
            />
          )}
        </FormField>
        <FormField
          label="Descrição"
          required
          helperText="Detalhe seu pedido com pelo menos 20 caracteres."
          counter={`${descricao.length}/4000`}
        >
          {(f) => (
            <TextareaField
              id={f.id}
              maxLength={4000}
              autoResize
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
            />
          )}
        </FormField>
      </PortalModal>

      {/* -------------------------------------------------- Exportação */}
      <PortalModal
        open={dialogo === "exportacao"}
        onOpenChange={(o) => (o ? null : fechar())}
        title="Solicitar cópia dos meus dados"
        description="Confirme sua senha. O arquivo é gerado pela SBPM e fica disponível por tempo limitado."
        footer={
          <>
            <PortalButton variant="secondary" onClick={fechar} disabled={enviando}>
              Cancelar
            </PortalButton>
            <PortalButton
              loading={enviando}
              onClick={() =>
                executar(async () => {
                  const r = await contaCall<{ protocolo: string | null }>("exportacao_solicitar", {
                    senha_atual: senha,
                    formato,
                  });
                  portalToast.success(
                    r.protocolo ? `Solicitação registrada sob o protocolo ${r.protocolo}.` : "Solicitação registrada.",
                  );
                  fechar();
                  await carregar();
                })
              }
            >
              Solicitar cópia
            </PortalButton>
          </>
        }
      >
        {erroForm && <PortalAlert tone="danger">{erroForm}</PortalAlert>}
        <SelectField
          label="Formato do arquivo"
          value={formato}
          onValueChange={setFormato}
          options={[
            { value: "json", label: "JSON (estruturado)" },
            { value: "csv", label: "CSV (planilha)" },
            { value: "pdf", label: "PDF (leitura)" },
          ]}
        />
        <FormField label="Senha atual" required>
          {(f) => (
            <PasswordInput
              id={f.id}
              autoComplete="current-password"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
            />
          )}
        </FormField>
      </PortalModal>
    </div>
  );
}
