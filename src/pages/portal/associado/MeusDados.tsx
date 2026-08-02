import { useMemo, useState } from "react";
import { useAssociado } from "@/contexts/AssociadoContext";
import { supabase } from "@/integrations/supabase/client";
import { icons } from "@/design-system/icons";
import PortalPageHeader from "@/portal/components/PortalPageHeader";
import { PortalCard } from "@/portal/ui/PortalCard";
import { InfoCard } from "@/portal/ui/cards";
import { PortalAlert, portalToast } from "@/portal/ui/feedback";
import { PortalForm, PortalFormActions, type FormErrorItem } from "@/portal/forms/PortalForm";
import { FormField } from "@/portal/forms/FormField";
import { EmailInput, PhoneInput } from "@/portal/forms/inputs";
import { TextareaField } from "@/portal/forms/TextareaField";
import { PortalButton } from "@/portal/forms/buttons";
import ProfilePhotoUpload from "@/components/ProfilePhotoUpload";
import { maskCPF } from "@/lib/format";
import { maskMatricula } from "@/portal/mask";
import { AVISO_DADO_OFICIAL } from "@/portal/associado/config";
import { SolicitarCorrecaoModal } from "./SolicitarCorrecao";

const data = (v?: string | null) => (v ? new Date(v).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "—");

/**
 * Meus dados (§5): separa claramente dado oficial (somente leitura) de dado
 * editável pelo associado. Correções de dados oficiais viram solicitação.
 */
export default function MeusDados() {
  const { associado, setAssociado } = useAssociado();
  const [email, setEmail] = useState(associado?.email ?? "");
  const [telefone, setTelefone] = useState(associado?.telefone ?? "");
  const [endereco, setEndereco] = useState(associado?.endereco ?? "");
  const [erros, setErros] = useState<FormErrorItem[]>([]);
  const [correcao, setCorrecao] = useState(false);

  const alterado = useMemo(
    () =>
      email !== (associado?.email ?? "") ||
      telefone !== (associado?.telefone ?? "") ||
      endereco !== (associado?.endereco ?? ""),
    [email, telefone, endereco, associado],
  );

  if (!associado) return null;

  const salvar = async () => {
    const problemas: FormErrorItem[] = [];
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim()))
      problemas.push({ field: "email", message: "Informe um e-mail válido." });
    if (telefone && telefone.replace(/\D/g, "").length < 10)
      problemas.push({ field: "telefone", message: "Informe um telefone com DDD." });
    setErros(problemas);
    if (problemas.length) return;

    const { data: resposta, error } = await supabase.functions.invoke("update-perfil", {
      body: {
        tipo: "associado",
        id: associado.id,
        matricula_titular: associado.matricula,
        cpf: associado.cpf,
        campos: { email: email.trim(), telefone: telefone.trim(), endereco: endereco.trim() },
      },
    });
    if (error || !resposta?.ok) throw new Error(resposta?.error || "Não foi possível salvar seus dados.");

    setAssociado({
      ...associado,
      email: email.trim() || null,
      telefone: telefone.trim() || null,
      endereco: endereco.trim() || null,
    });
    portalToast.success("Dados atualizados", "Suas informações de contato foram salvas.");
  };

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Meus dados"
        description="Confira suas informações cadastrais e mantenha seus dados de contato atualizados."
        source="Base institucional"
        updatedAt={associado.updated_at ?? null}
        action={
          <PortalButton variant="outline" iconLeft={icons.editar} onClick={() => setCorrecao(true)}>
            Solicitar correção
          </PortalButton>
        }
      />

      <PortalAlert tone="info" title="Dados oficiais" icon={icons.info}>
        {AVISO_DADO_OFICIAL} Nome, CPF, matrícula, data de nascimento e posto/graduação não podem ser alterados pelo
        portal — solicite a correção para análise da SBPM.
      </PortalAlert>

      <PortalCard title="Foto do perfil" description="A foto é usada na sua identificação digital." icon={icons.perfil}>
        <ProfilePhotoUpload
          currentUrl={associado.foto_url}
          nome={associado.nome}
          tipo="associado"
          id={associado.id}
          onUploaded={(url: string) => setAssociado({ ...associado, foto_url: url })}
        />
      </PortalCard>

      <InfoCard
        title="Dados pessoais e funcionais"
        icon={icons.documento}
        description="Informações mantidas pela base institucional (somente leitura)."
        items={[
          { label: "Nome completo", value: associado.nome },
          { label: "CPF", value: maskCPF(associado.cpf ?? "") },
          { label: "Data de nascimento", value: data(associado.data_nascimento) },
          { label: "Matrícula", value: maskMatricula(associado.matricula) },
          { label: "Posto / graduação", value: associado.patente ?? "Não informado" },
          { label: "Data de associação", value: data(associado.data_admissao) },
        ]}
      />

      <PortalCard
        title="Contato e endereço"
        description="Estes dados podem ser atualizados por você a qualquer momento."
        icon={icons.editar}
      >
        <PortalForm
          onSubmit={salvar}
          errors={erros}
          aria-label="Atualização de contato"
          actions={<PortalFormActions submitLabel="Salvar alterações" loadingText="Salvando..." disabled={!alterado} />}
        >
          <FormField label="E-mail" error={erros.find((e) => e.field === "email")?.message}>
            {(f) => <EmailInput {...f} value={email} onChange={(e) => setEmail(e.target.value)} />}
          </FormField>
          <FormField label="Telefone / WhatsApp" error={erros.find((e) => e.field === "telefone")?.message}>
            {(f) => <PhoneInput {...f} value={telefone} onChange={(e) => setTelefone(e.target.value)} />}
          </FormField>
          <FormField label="Endereço" helperText="Rua, número, complemento, bairro, cidade e CEP.">
            {(f) => (
              <TextareaField {...f} rows={3} maxLength={300} value={endereco} onChange={(e) => setEndereco(e.target.value)} />
            )}
          </FormField>
        </PortalForm>
      </PortalCard>

      <SolicitarCorrecaoModal open={correcao} onOpenChange={setCorrecao} />
    </div>
  );
}
