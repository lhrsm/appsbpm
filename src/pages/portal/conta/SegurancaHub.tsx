import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import QRCode from "qrcode";
import { icons } from "@/design-system/icons";
import { Badge } from "@/design-system/components/Badge";
import { Text } from "@/design-system/components/Text";
import PortalPageHeader from "@/portal/components/PortalPageHeader";
import { PortalCard } from "@/portal/ui/PortalCard";
import { PortalAlert, portalToast } from "@/portal/ui/feedback";
import { SectionErrorState } from "@/portal/ui/errorStates";
import { CardSkeleton } from "@/portal/ui/skeletons";
import { PortalButton } from "@/portal/forms/buttons";
import { PortalModal } from "@/portal/forms/overlays";
import { FormField } from "@/portal/forms/FormField";
import { PasswordInput, EmailInput, PhoneInput, TextInput } from "@/portal/forms/inputs";
import { contaCall, dataHoraBR, NIVEL_SEGURANCA, type ResumoSeguranca } from "@/lib/conta";

type Dialogo = null | "senha" | "email" | "telefone" | "mfa" | "mfa_off" | "recovery";

/**
 * Central de Segurança do portal externo (Fase 10).
 *
 * Nenhum segredo de 2FA é persistido no navegador: o QR Code é gerado em
 * memória e descartado ao fechar o fluxo.
 */
export default function SegurancaHub() {
  const [resumo, setResumo] = useState<ResumoSeguranca | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [dialogo, setDialogo] = useState<Dialogo>(null);
  const [enviando, setEnviando] = useState(false);
  const [erroForm, setErroForm] = useState<string | null>(null);

  // campos temporários
  const [senhaAtual, setSenhaAtual] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmaSenha, setConfirmaSenha] = useState("");
  const [encerrarSessoes, setEncerrarSessoes] = useState(true);
  const [novoEmail, setNovoEmail] = useState("");
  const [telefone, setTelefone] = useState("");
  const [codigo, setCodigo] = useState("");
  const [etapa, setEtapa] = useState<"dados" | "codigo">("dados");
  const [destino, setDestino] = useState("");
  const [segredo, setSegredo] = useState("");
  const [qr, setQr] = useState("");
  const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);

  const carregar = useCallback(async () => {
    setCarregando(true);
    setErro(null);
    try {
      setResumo(await contaCall<ResumoSeguranca>("seguranca_resumo"));
    } catch (e) {
      setErro(e instanceof Error ? e.message : "Não foi possível carregar suas informações de segurança.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  const limpar = () => {
    setSenhaAtual("");
    setNovaSenha("");
    setConfirmaSenha("");
    setNovoEmail("");
    setTelefone("");
    setCodigo("");
    setEtapa("dados");
    setDestino("");
    setSegredo("");
    setQr("");
    setErroForm(null);
  };

  const fechar = () => {
    setDialogo(null);
    limpar();
  };

  const executar = async (fn: () => Promise<void>) => {
    if (enviando) return;
    setEnviando(true);
    setErroForm(null);
    try {
      await fn();
    } catch (e) {
      setErroForm(e instanceof Error ? e.message : "Não foi possível concluir esta alteração.");
    } finally {
      setEnviando(false);
    }
  };

  const abrirMfa = () =>
    executar(async () => {
      const r = await contaCall<{ secret: string; otpauth: string }>("mfa_iniciar", { senha_atual: senhaAtual });
      setSegredo(r.secret);
      setQr(await QRCode.toDataURL(r.otpauth, { margin: 1, width: 240 }));
      setEtapa("codigo");
    });

  if (carregando) return <CardSkeleton />;
  if (erro || !resumo) return <SectionErrorState description={erro ?? undefined} onRetry={carregar} />;

  const nivel = NIVEL_SEGURANCA[resumo.nivel] ?? NIVEL_SEGURANCA.basico;

  return (
    <div className="space-y-6">
      <PortalPageHeader
        title="Segurança da conta"
        description="Gerencie sua senha, autenticação em dois fatores, dispositivos e sessões ativas."
        secondaryActions={
          <PortalButton variant="secondary" iconLeft={icons.horario} asChild>
            <Link to="/dashboard/historico">Histórico de acessos</Link>
          </PortalButton>
        }
      />

      <PortalCard
        title="Nível de proteção"
        icon={icons.previdencia}
        badge={<Badge tone={nivel.tone}>{nivel.label}</Badge>}
        description={`${resumo.pontos} de ${resumo.total} recomendações de segurança atendidas.`}
      >
        <ul className="grid gap-2 sm:grid-cols-2">
          {resumo.criterios.map((c) => {
            const Icone = c.ok ? icons.sucesso : icons.alerta;
            return (
              <li key={c.id} className="flex items-center gap-2 text-sm">
                <Icone
                  className={c.ok ? "size-4 text-[hsl(var(--success))]" : "size-4 text-warning"}
                  aria-hidden
                />
                <span className={c.ok ? "" : "text-muted-foreground"}>{c.label}</span>
              </li>
            );
          })}
        </ul>
      </PortalCard>

      <div className="grid gap-4 md:grid-cols-2">
        <PortalCard
          title="Senha de acesso"
          icon={icons.senha}
          subtitle={`Última alteração: ${dataHoraBR(resumo.last_password_change_at)}`}
          action={<PortalButton onClick={() => setDialogo("senha")}>Alterar senha</PortalButton>}
        >
          <Text variant="caption" className="text-muted-foreground">
            Use ao menos 10 caracteres, com letras, números e símbolos. Nunca compartilhe sua senha.
          </Text>
        </PortalCard>

        <PortalCard
          title="Autenticação em dois fatores"
          icon={icons.lgpd}
          badge={
            <Badge tone={resumo.mfa_enabled ? "success" : "warning"}>
              {resumo.mfa_enabled ? "Ativa" : "Inativa"}
            </Badge>
          }
          action={
            resumo.mfa_enabled ? (
              <PortalButton variant="secondary" onClick={() => setDialogo("recovery")}>
                Novos códigos de recuperação
              </PortalButton>
            ) : (
              <PortalButton onClick={() => setDialogo("mfa")}>Ativar 2FA</PortalButton>
            )
          }
          secondaryAction={
            resumo.mfa_enabled && !resumo.mfa_required ? (
              <PortalButton variant="ghost" tone="danger" onClick={() => setDialogo("mfa_off")}>
                Desativar
              </PortalButton>
            ) : undefined
          }
        >
          <Text variant="caption" className="text-muted-foreground">
            {resumo.mfa_required
              ? "A verificação em duas etapas é obrigatória para o seu perfil."
              : "Use um aplicativo autenticador (Google Authenticator, Authy ou similar) para gerar códigos temporários."}
          </Text>
        </PortalCard>

        <PortalCard
          title="E-mail de contato"
          icon={icons.email}
          subtitle={resumo.email_mascarado}
          badge={
            <Badge tone={resumo.email_verified ? "success" : "warning"}>
              {resumo.email_verified ? "Verificado" : "Não verificado"}
            </Badge>
          }
          action={<PortalButton variant="secondary" onClick={() => setDialogo("email")}>Alterar e-mail</PortalButton>}
        >
          <Text variant="caption" className="text-muted-foreground">
            Enviaremos um código de confirmação para o novo endereço antes de concluir a alteração.
          </Text>
        </PortalCard>

        <PortalCard
          title="Telefone de contato"
          icon={icons.telefone}
          badge={
            <Badge tone={resumo.phone_verified ? "success" : "neutral"}>
              {resumo.phone_verified ? "Verificado" : "Sem verificação"}
            </Badge>
          }
          action={<PortalButton variant="secondary" onClick={() => setDialogo("telefone")}>Alterar telefone</PortalButton>}
        >
          <Text variant="caption" className="text-muted-foreground">
            A confirmação é enviada para o e-mail cadastrado na sua conta.
          </Text>
        </PortalCard>
      </div>

      <PortalCard
        title="Sessões e dispositivos"
        icon={icons.dashboard}
        subtitle={`${resumo.sessoes_ativas} sessão(ões) ativa(s) · ${resumo.dispositivos_confiaveis} dispositivo(s) confiável(is)`}
        action={
          <PortalButton variant="secondary" iconLeft={icons.horario} asChild>
            <Link to="/dashboard/historico">Gerenciar acessos</Link>
          </PortalButton>
        }
      >
        {resumo.ultimo_acesso ? (
          <Text variant="caption" className="text-muted-foreground">
            Último acesso em {dataHoraBR(resumo.ultimo_acesso.created_at)} · {resumo.ultimo_acesso.device_summary} ·{" "}
            {resumo.ultimo_acesso.location_summary}
          </Text>
        ) : (
          <Text variant="caption" className="text-muted-foreground">
            Ainda não há registros de acesso para esta conta.
          </Text>
        )}
      </PortalCard>

      {/* ---------------------------------------------------- Senha */}
      <PortalModal
        open={dialogo === "senha"}
        onOpenChange={(o) => (o ? null : fechar())}
        title="Alterar senha"
        description="Confirme sua senha atual para definir uma nova."
        footer={
          <>
            <PortalButton variant="secondary" onClick={fechar} disabled={enviando}>
              Cancelar
            </PortalButton>
            <PortalButton
              loading={enviando}
              onClick={() =>
                executar(async () => {
                  if (novaSenha !== confirmaSenha) throw new Error("A confirmação não corresponde à nova senha.");
                  await contaCall("senha_alterar", {
                    senha_atual: senhaAtual,
                    nova_senha: novaSenha,
                    encerrar_sessoes: encerrarSessoes,
                  });
                  portalToast.success("Senha alterada com sucesso.");
                  fechar();
                  void carregar();
                })
              }
            >
              Salvar nova senha
            </PortalButton>
          </>
        }
      >
        {erroForm && <PortalAlert tone="danger">{erroForm}</PortalAlert>}
        <FormField label="Senha atual" required>
          {(f) => (
            <PasswordInput
              id={f.id}
              autoComplete="current-password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
            />
          )}
        </FormField>
        <FormField label="Nova senha" required helperText="Mínimo de 10 caracteres.">
          {(f) => (
            <PasswordInput
              id={f.id}
              autoComplete="new-password"
              showStrength
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
            />
          )}
        </FormField>
        <FormField label="Confirmar nova senha" required>
          {(f) => (
            <PasswordInput
              id={f.id}
              autoComplete="new-password"
              value={confirmaSenha}
              onChange={(e) => setConfirmaSenha(e.target.value)}
            />
          )}
        </FormField>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            className="size-4 rounded border-input"
            checked={encerrarSessoes}
            onChange={(e) => setEncerrarSessoes(e.target.checked)}
          />
          Encerrar as outras sessões ativas
        </label>
      </PortalModal>

      {/* ---------------------------------------------------- E-mail */}
      <PortalModal
        open={dialogo === "email"}
        onOpenChange={(o) => (o ? null : fechar())}
        title="Alterar e-mail"
        description={
          etapa === "dados"
            ? "Informe sua senha e o novo endereço de e-mail."
            : `Digite o código enviado para ${destino}.`
        }
        footer={
          <>
            <PortalButton variant="secondary" onClick={fechar} disabled={enviando}>
              Cancelar
            </PortalButton>
            <PortalButton
              loading={enviando}
              onClick={() =>
                executar(async () => {
                  if (etapa === "dados") {
                    const r = await contaCall<{ destino: string }>("email_alterar_iniciar", {
                      senha_atual: senhaAtual,
                      novo_email: novoEmail,
                    });
                    setDestino(r.destino);
                    setEtapa("codigo");
                    return;
                  }
                  await contaCall("email_alterar_confirmar", { codigo });
                  portalToast.success("E-mail atualizado com sucesso.");
                  fechar();
                  void carregar();
                })
              }
            >
              {etapa === "dados" ? "Enviar código" : "Confirmar"}
            </PortalButton>
          </>
        }
      >
        {erroForm && <PortalAlert tone="danger">{erroForm}</PortalAlert>}
        {etapa === "dados" ? (
          <>
            <FormField label="Senha atual" required>
              {(f) => (
                <PasswordInput
                  id={f.id}
                  autoComplete="current-password"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                />
              )}
            </FormField>
            <FormField label="Novo e-mail" required>
              {(f) => <EmailInput id={f.id} value={novoEmail} onValueChange={setNovoEmail} />}
            </FormField>
          </>
        ) : (
          <>
            <PortalAlert tone="info" title="Não encontrou a mensagem?">
              Verifique a caixa de spam ou lixo eletrônico e adicione nosso remetente aos seus contatos.
            </PortalAlert>
            <FormField label="Código de confirmação" required>
              {(f) => (
                <TextInput
                  id={f.id}
                  inputMode="numeric"
                  maxLength={6}
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                />
              )}
            </FormField>
          </>
        )}
      </PortalModal>

      {/* ---------------------------------------------------- Telefone */}
      <PortalModal
        open={dialogo === "telefone"}
        onOpenChange={(o) => (o ? null : fechar())}
        title="Alterar telefone"
        description={etapa === "dados" ? "Informe sua senha e o novo telefone." : `Digite o código enviado para ${destino}.`}
        footer={
          <>
            <PortalButton variant="secondary" onClick={fechar} disabled={enviando}>
              Cancelar
            </PortalButton>
            <PortalButton
              loading={enviando}
              onClick={() =>
                executar(async () => {
                  if (etapa === "dados") {
                    const r = await contaCall<{ destino: string }>("telefone_alterar_iniciar", {
                      senha_atual: senhaAtual,
                      telefone,
                    });
                    setDestino(r.destino);
                    setEtapa("codigo");
                    return;
                  }
                  await contaCall("telefone_alterar_confirmar", { codigo });
                  portalToast.success("Telefone atualizado com sucesso.");
                  fechar();
                  void carregar();
                })
              }
            >
              {etapa === "dados" ? "Enviar código" : "Confirmar"}
            </PortalButton>
          </>
        }
      >
        {erroForm && <PortalAlert tone="danger">{erroForm}</PortalAlert>}
        {etapa === "dados" ? (
          <>
            <FormField label="Senha atual" required>
              {(f) => (
                <PasswordInput
                  id={f.id}
                  autoComplete="current-password"
                  value={senhaAtual}
                  onChange={(e) => setSenhaAtual(e.target.value)}
                />
              )}
            </FormField>
            <FormField label="Novo telefone" required>
              {(f) => <PhoneInput id={f.id} value={telefone} onValueChange={setTelefone} />}
            </FormField>
          </>
        ) : (
          <FormField label="Código de confirmação" required>
            {(f) => (
              <TextInput
                id={f.id}
                inputMode="numeric"
                maxLength={6}
                value={codigo}
                onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
              />
            )}
          </FormField>
        )}
      </PortalModal>

      {/* ---------------------------------------------------- Ativar 2FA */}
      <PortalModal
        open={dialogo === "mfa"}
        onOpenChange={(o) => (o ? null : fechar())}
        title="Ativar autenticação em dois fatores"
        description={
          etapa === "dados"
            ? "Confirme sua senha para gerar o código de configuração."
            : "Leia o QR Code no seu aplicativo autenticador e informe o código gerado."
        }
        dismissible={!enviando}
        footer={
          <>
            <PortalButton variant="secondary" onClick={fechar} disabled={enviando}>
              Cancelar
            </PortalButton>
            <PortalButton
              loading={enviando}
              onClick={() =>
                etapa === "dados"
                  ? abrirMfa()
                  : executar(async () => {
                      const r = await contaCall<{ recovery_codes: string[] }>("mfa_ativar", { codigo });
                      setRecoveryCodes(r.recovery_codes);
                      portalToast.success("Autenticação em dois fatores ativada.");
                      fechar();
                      void carregar();
                    })
              }
            >
              {etapa === "dados" ? "Continuar" : "Ativar"}
            </PortalButton>
          </>
        }
      >
        {erroForm && <PortalAlert tone="danger">{erroForm}</PortalAlert>}
        {etapa === "dados" ? (
          <FormField label="Senha atual" required>
            {(f) => (
              <PasswordInput
                id={f.id}
                autoComplete="current-password"
                value={senhaAtual}
                onChange={(e) => setSenhaAtual(e.target.value)}
              />
            )}
          </FormField>
        ) : (
          <>
            <div className="flex flex-col items-center gap-3">
              {qr && <img src={qr} alt="QR Code para configurar o aplicativo autenticador" className="rounded-lg border" />}
              <Text variant="caption" className="break-all text-center text-muted-foreground">
                Chave manual: <span className="font-mono">{segredo}</span>
              </Text>
            </div>
            <FormField label="Código do aplicativo" required helperText="6 dígitos, renovados a cada 30 segundos.">
              {(f) => (
                <TextInput
                  id={f.id}
                  inputMode="numeric"
                  maxLength={6}
                  value={codigo}
                  onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
                />
              )}
            </FormField>
          </>
        )}
      </PortalModal>

      {/* ---------------------------------------------------- Desativar 2FA */}
      <PortalModal
        open={dialogo === "mfa_off"}
        onOpenChange={(o) => (o ? null : fechar())}
        title="Desativar autenticação em dois fatores"
        description="Sua conta ficará menos protegida. Confirme sua identidade para continuar."
        footer={
          <>
            <PortalButton variant="secondary" onClick={fechar} disabled={enviando}>
              Manter ativa
            </PortalButton>
            <PortalButton
              tone="danger"
              loading={enviando}
              onClick={() =>
                executar(async () => {
                  await contaCall("mfa_desativar", { senha_atual: senhaAtual, codigo });
                  portalToast.success("Autenticação em dois fatores desativada.");
                  fechar();
                  void carregar();
                })
              }
            >
              Desativar
            </PortalButton>
          </>
        }
      >
        {erroForm && <PortalAlert tone="danger">{erroForm}</PortalAlert>}
        <FormField label="Senha atual" required>
          {(f) => (
            <PasswordInput
              id={f.id}
              autoComplete="current-password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
            />
          )}
        </FormField>
        <FormField label="Código do aplicativo ou de recuperação" required>
          {(f) => <TextInput id={f.id} value={codigo} onChange={(e) => setCodigo(e.target.value)} />}
        </FormField>
      </PortalModal>

      {/* ---------------------------------------------------- Recovery codes */}
      <PortalModal
        open={dialogo === "recovery"}
        onOpenChange={(o) => (o ? null : fechar())}
        title="Gerar novos códigos de recuperação"
        description="Os códigos anteriores serão invalidados imediatamente."
        footer={
          <>
            <PortalButton variant="secondary" onClick={fechar} disabled={enviando}>
              Cancelar
            </PortalButton>
            <PortalButton
              loading={enviando}
              onClick={() =>
                executar(async () => {
                  const r = await contaCall<{ recovery_codes: string[] }>("recovery_codes_regenerar", {
                    senha_atual: senhaAtual,
                    codigo,
                  });
                  setRecoveryCodes(r.recovery_codes);
                  fechar();
                  void carregar();
                })
              }
            >
              Gerar códigos
            </PortalButton>
          </>
        }
      >
        {erroForm && <PortalAlert tone="danger">{erroForm}</PortalAlert>}
        <FormField label="Senha atual" required>
          {(f) => (
            <PasswordInput
              id={f.id}
              autoComplete="current-password"
              value={senhaAtual}
              onChange={(e) => setSenhaAtual(e.target.value)}
            />
          )}
        </FormField>
        <FormField label="Código do aplicativo autenticador" required>
          {(f) => (
            <TextInput
              id={f.id}
              inputMode="numeric"
              maxLength={6}
              value={codigo}
              onChange={(e) => setCodigo(e.target.value.replace(/\D/g, ""))}
            />
          )}
        </FormField>
      </PortalModal>

      {/* ---------------------------------------------------- Exibição única dos códigos */}
      <PortalModal
        open={!!recoveryCodes}
        onOpenChange={(o) => (o ? null : setRecoveryCodes(null))}
        title="Guarde seus códigos de recuperação"
        description="Eles são exibidos apenas uma vez e permitem entrar caso você perca o aplicativo autenticador."
        footer={
          <>
            <PortalButton
              variant="secondary"
              iconLeft={icons.baixar}
              onClick={() => {
                const blob = new Blob([(recoveryCodes ?? []).join("\n")], { type: "text/plain" });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = "codigos-recuperacao-sbpm.txt";
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              Baixar códigos
            </PortalButton>
            <PortalButton onClick={() => setRecoveryCodes(null)}>Guardei os códigos</PortalButton>
          </>
        }
      >
        <PortalAlert tone="warning" title="Armazene em local seguro">
          Cada código pode ser usado uma única vez. Não compartilhe com terceiros.
        </PortalAlert>
        <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/40 p-3 font-mono text-sm">
          {(recoveryCodes ?? []).map((c) => (
            <span key={c}>{c}</span>
          ))}
        </div>
      </PortalModal>
    </div>
  );
}
