import { useEffect, useState } from "react";
import { useAssociado } from "@/contexts/AssociadoContext";
import { icons } from "@/design-system/icons";
import PortalPageHeader from "@/portal/components/PortalPageHeader";
import { PortalCard } from "@/portal/ui/PortalCard";
import { PortalAlert, portalToast } from "@/portal/ui/feedback";
import { SwitchField } from "@/portal/forms/choices";
import { SelectField } from "@/portal/forms/selects";
import { FormField } from "@/portal/forms/FormField";
import { useTheme } from "next-themes";

const STORAGE_KEY = "sbpm.dependente.preferencias";

interface Preferencias {
  notificarSolicitacoes: boolean;
  notificarComunicados: boolean;
  notificarCarteirinha: boolean;
  contraste: boolean;
  textoAmpliado: boolean;
}

const padrao: Preferencias = {
  notificarSolicitacoes: true,
  notificarComunicados: true,
  notificarCarteirinha: true,
  contraste: false,
  textoAmpliado: false,
};

/**
 * Preferências do dependente (§14 da Fase 8).
 * Preferências pessoais de exibição e notificação, persistidas localmente.
 */
export default function PreferenciasDependente() {
  const { dependenteLogado } = useAssociado();
  const { theme, setTheme } = useTheme();
  const [prefs, setPrefs] = useState<Preferencias>(padrao);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setPrefs({ ...padrao, ...(JSON.parse(raw) as Partial<Preferencias>) });
    } catch {
      /* preferências corrompidas: mantém o padrão */
    }
  }, []);

  useEffect(() => {
    document.documentElement.classList.toggle("text-ampliado", prefs.textoAmpliado);
    document.documentElement.classList.toggle("alto-contraste", prefs.contraste);
  }, [prefs.textoAmpliado, prefs.contraste]);

  const atualizar = (patch: Partial<Preferencias>) => {
    const next = { ...prefs, ...patch };
    setPrefs(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    portalToast.success("Preferência salva");
  };

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Preferências"
        description={`Ajuste como o portal se comporta para você${dependenteLogado?.nome ? `, ${dependenteLogado.nome.split(" ")[0]}` : ""}.`}
      />

      <PortalAlert tone="info" title="Preferências pessoais" icon={icons.info}>
        Estas opções valem apenas para este dispositivo e não alteram seus dados cadastrais.
      </PortalAlert>

      <PortalCard title="Notificações" description="Escolha os avisos que deseja receber." icon={icons.notificacao}>
        <div className="space-y-4">
          <SwitchField
            label="Andamento das minhas solicitações"
            description="Avisos quando um protocolo mudar de situação."
            checked={prefs.notificarSolicitacoes}
            onCheckedChange={(v) => atualizar({ notificarSolicitacoes: v })}
          />
          <SwitchField
            label="Comunicados da SBPM"
            description="Informativos institucionais direcionados a dependentes."
            checked={prefs.notificarComunicados}
            onCheckedChange={(v) => atualizar({ notificarComunicados: v })}
          />
          <SwitchField
            label="Validade da carteirinha"
            description="Lembrete quando a identificação estiver próxima do vencimento."
            checked={prefs.notificarCarteirinha}
            onCheckedChange={(v) => atualizar({ notificarCarteirinha: v })}
          />
        </div>
      </PortalCard>

      <PortalCard title="Exibição e acessibilidade" description="Conforto visual na navegação." icon={icons.perfil}>
        <div className="space-y-4">
          <FormField label="Tema" hint="Aplica-se apenas a este dispositivo.">
            {(field) => (
              <SelectField
                {...field}
                value={theme ?? "system"}
                onChange={(e) => setTheme(e.target.value)}
                options={[
                  { value: "system", label: "Seguir o sistema" },
                  { value: "light", label: "Claro" },
                  { value: "dark", label: "Escuro" },
                ]}
              />
            )}
          </FormField>
          <SwitchField
            label="Alto contraste"
            description="Aumenta o contraste entre texto e fundo."
            checked={prefs.contraste}
            onCheckedChange={(v) => atualizar({ contraste: v })}
          />
          <SwitchField
            label="Texto ampliado"
            description="Aumenta o tamanho da fonte em todo o portal."
            checked={prefs.textoAmpliado}
            onCheckedChange={(v) => atualizar({ textoAmpliado: v })}
          />
        </div>
      </PortalCard>
    </div>
  );
}
