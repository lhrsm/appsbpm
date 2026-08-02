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
import { AVISO_DADO_OFICIAL_DEPENDENTE, camposOficiaisDependente, parentescoLabel } from "@/portal/dependente/config";
import { SolicitarCorrecaoModal } from "@/pages/portal/associado/SolicitarCorrecao";

const dataBR = (v?: string | null) => (v ? new Date(v).toLocaleDateString("pt-BR", { timeZone: "UTC" }) : "—");

/**
 * Meus dados do dependente (§6 da Fase 8).
 *
 * Dados sincronizados (somente leitura, com origem) ficam separados dos dados
 * editáveis. Correções de dado oficial sempre geram solicitação com protocolo.
 */
export default function MeusDadosDependente() {
  const { dependenteLogado, setDependenteLogado, associado } = useAssociado();
  const [email, setEmail] = useState(dependenteLogado?.email ?? "");
  const [telefone, setTelefone] = useState(dependenteLogado?.telefone ?? "");
  const [endereco, setEndereco] = useState(dependenteLogado?.endereco ?? "");
  const [erros, setErros] = useState<FormErrorItem[]>([]);
  const [correcao, setCorrecao] = useState(false);

  const alterado = useMemo(
    () =>
      email !== (dependenteLogado?.email ?? "") ||
      telefone !== (dependenteLogado?.telefone ?? "") ||
      endereco !== (dependenteLogado?.endereco ?? ""),
    [email, telefone, endereco, dependenteLogado],
  );

  if (!dependenteLogado) return null;

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
        tipo: "dependente",
        id: dependenteLogado.id,
        matricula_titular: associado?.matricula,
        cpf: dependenteLogado.cpf,
        campos: { email: email.trim(), telefone: telefone.trim(), endereco: endereco.trim() },
      },
    });
    if (error || !resposta?.ok) throw new Error(resposta?.error || "Não foi possível salvar seus dados.");

    setDependenteLogado({
      ...dependenteLogado,
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
        description="Confira suas informações e mantenha seus dados de contato sempre atualizados."
        source="Base institucional SBPM"
        updatedAt={null}
        action={
          <PortalButton variant="outline" iconLeft={icons.editar} onClick={() => setCorrecao(true)}>
            Solicitar correção
          </PortalButton>
        }
      />

      <PortalAlert tone="info" title="Dados sincronizados" icon={icons.info}>
        {AVISO_DADO_OFICIAL_DEPENDENTE} Para corrigir nome, CPF, data de nascimento ou parentesco, abra uma solicitação
        de correção — ela é analisada pela SBPM e você acompanha pelo protocolo.
      </PortalAlert>

      <PortalCard title="Foto do perfil" description="Usada na sua identificação digital." icon={icons.perfil}>
        <ProfilePhotoUpload
          currentPhotoUrl={dependenteLogado.foto_url}
          userName={dependenteLogado.nome}
          userType="dependente"
          userId={dependenteLogado.id}
          onPhotoUpdated={(url: string) => setDependenteLogado({ ...dependenteLogado, foto_url: url })}
        />
      </PortalCard>

      <InfoCard
        title="Dados sincronizados"
        icon={icons.documento}
        description="Origem: base institucional da SBPM — somente leitura."
        items={[
          { label: "Nome completo", value: dependenteLogado.nome },
          { label: "CPF", value: dependenteLogado.cpf ? maskCPF(dependenteLogado.cpf) : "—" },
          { label: "Data de nascimento", value: dataBR(dependenteLogado.data_nascimento) },
          { label: "Grau de parentesco", value: parentescoLabel[dependenteLogado.tipo] ?? "Outro" },
          { label: "Situação do vínculo", value: dependenteLogado.ativo === false ? "Inativo" : "Ativo" },
        ]}
      />

      <PortalCard
        title="Dados editáveis"
        description="Estas informações podem ser atualizadas por você a qualquer momento."
        icon={icons.editar}
      >
        <PortalForm
          onSubmit={salvar}
          errors={erros}
          aria-label="Atualização de contato do dependente"
          actions={<PortalFormActions submitLabel="Salvar alterações" loadingText="Salvando..." disabled={!alterado} />}
        >
          <FormField label="E-mail" error={erros.find((e) => e.field === "email")?.message}>
            {(f) => <EmailInput {...f} value={email} onValueChange={setEmail} />}
          </FormField>
          <FormField label="Telefone / WhatsApp" error={erros.find((e) => e.field === "telefone")?.message}>
            {(f) => <PhoneInput {...f} whatsapp value={telefone} onValueChange={setTelefone} />}
          </FormField>
          <FormField label="Endereço" helperText="Rua, número, complemento, bairro, cidade e CEP.">
            {(f) => (
              <TextareaField
                {...f}
                rows={3}
                maxLength={300}
                value={endereco}
                onChange={(e) => setEndereco(e.target.value)}
              />
            )}
          </FormField>
        </PortalForm>
      </PortalCard>

      <SolicitarCorrecaoModal
        open={correcao}
        onOpenChange={setCorrecao}
        campos={camposOficiaisDependente.map((c) => c.label)}
      />
    </div>
  );
}
