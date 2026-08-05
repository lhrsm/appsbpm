import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNavigationState } from '@/hooks/useNavigationState';

import { Button, Input, Checkbox, Card, CardContent, CardDescription, CardHeader, CardTitle, RadioCard, Progress, Label, Field, ErrorMessage, Alert } from '@/design-system/components';
import { icons } from '@/design-system/icons';
import { useToast } from '@/hooks/use-toast';
import { Loader2, ShieldCheck, CheckCircle2, Eye, EyeOff, ArrowLeft, FileText, MailWarning, ShieldQuestion } from 'lucide-react';
import sbpmLogo from '@/assets/sbpm-logo.png';
import AuthBackgroundLayout from '@/components/AuthBackgroundLayout';
import { RegistrationNumberInput } from '@/components/RegistrationNumberInput';
import { CpfInput } from '@/components/CpfInput';
import { BirthDateInput } from '@/components/BirthDateInput';
import {
  CAMPOS_VALIDACAO,
  DesafioIdentidade,
  PersonType,
  confirmarCodigo,
  criarConta,
  enviarCodigo,
  forcaSenha,
  responderPergunta,
  senhaValida,
  validarIdentidade,
} from '@/lib/portalAcesso';
import { padCpf, padRegistrationNumber, normalizeBirthDate } from '@/lib/identity';

import { useAplicarPortal } from './useAplicarPortal';
import { PublicFlowModal } from '@/components/portal/PublicFlowModal';

type Etapa = 'identidade' | 'perguntas' | 'email' | 'codigo' | 'senha' | 'termos' | 'concluido';

const TITULOS: Record<Etapa, string> = {
  identidade: 'Validação de identidade',
  perguntas: 'Perguntas de segurança',
  email: 'Confirmação de e-mail',
  codigo: 'Código de confirmação',
  senha: 'Criação de senha',
  termos: 'Termos de uso',
  concluido: 'Acesso liberado',
};

const ORDEM: Etapa[] = ['identidade', 'perguntas', 'email', 'codigo', 'senha', 'termos', 'concluido'];

export default function PortalPrimeiroAcesso() {
  const [etapa, setEtapa] = useState<Etapa>('identidade');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setIsNavigating } = useNavigationState();
  const aplicar = useAplicarPortal();

  useEffect(() => {
    setIsNavigating(false);
  }, [setIsNavigating]);


  const [personType, setPersonType] = useState<PersonType>('associate');
  const [cpf, setCpf] = useState('');
  const [nascimento, setNascimento] = useState('');
  const [extras, setExtras] = useState<Record<string, string>>({});
  const [erro, setErro] = useState<string | null>(null);

  const [sessao, setSessao] = useState<{ id: string; token: string; nome?: string; demo?: boolean } | null>(null);
  const [email, setEmail] = useState('');
  const [emailMascarado, setEmailMascarado] = useState('');
  const [codigo, setCodigo] = useState('');
  const [senha, setSenha] = useState('');
  const [confirmacao, setConfirmacao] = useState('');
  const [verSenha, setVerSenha] = useState(false);
  const [aceiteTermos, setAceiteTermos] = useState(false);
  const [aceitePrivacidade, setAceitePrivacidade] = useState(false);

  const [pergunta, setPergunta] = useState<DesafioIdentidade | null>(null);
  const [resposta, setResposta] = useState('');
  const [errosRestantes, setErrosRestantes] = useState<number | null>(null);
  const [bloqueado, setBloqueado] = useState(false);

  const progresso = ((ORDEM.indexOf(etapa) + 1) / ORDEM.length) * 100;
  const forca = forcaSenha(senha);

  const validar = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);
    setLoading(true);
    const res = await validarIdentidade({
      cpf: padCpf(cpf) || "",
      birthDate: nascimento, // Já está em ISO via BirthDateInput
      personType,
      registration: extras.registration ? padRegistrationNumber(extras.registration) || undefined : undefined,
      fullName: extras.fullName,
      motherName: extras.motherName,
    });

    setLoading(false);

    if (!res.success || !res.sessionId || !res.validationToken) {
      setErro(res.message ?? 'Não foi possível validar os dados informados.');
      return;
    }
    setSessao({ id: res.sessionId, token: res.validationToken, nome: res.maskedName, demo: res.demoMode });

    if (res.question) {
      setPergunta(res.question);
      setResposta('');
      setEtapa('perguntas');
      return;
    }
    setEtapa('email');
  };

  const responder = async () => {
    if (!sessao || !pergunta || !resposta) return;
    setErro(null);
    setLoading(true);
    const res = await responderPergunta({
      sessionId: sessao.id,
      validationToken: sessao.token,
      ordem: pergunta.ordem,
      answer: resposta,
    });
    setLoading(false);

    if (typeof res.errosRestantes === 'number') setErrosRestantes(res.errosRestantes);

    if (!res.success) {
      setErro(res.message ?? 'Não foi possível validar sua resposta.');
      if (res.status === 'quiz_failed') {
        setBloqueado(true);
        setPergunta(null);
      }
      return;
    }

    if (res.completed) {
      setPergunta(null);
      setEtapa('email');
      return;
    }
    if (res.question) {
      setPergunta(res.question);
      setResposta('');
    }
  };

  const solicitarCodigo = async (reenvio = false) => {
    if (!sessao) return;
    setErro(null);
    setLoading(true);
    const res = await enviarCodigo({ sessionId: sessao.id, validationToken: sessao.token, email, resend: reenvio });
    setLoading(false);
    if (!res.success) {
      setErro(res.message ?? 'Não foi possível enviar o código.');
      return;
    }
    setEmailMascarado(res.maskedEmail ?? email);
    setEtapa('codigo');
    toast({ title: 'Código enviado', description: `Enviamos um código para ${res.maskedEmail ?? email}.` });
  };

  const verificar = async () => {
    if (!sessao) return;
    setErro(null);
    setLoading(true);
    const res = await confirmarCodigo({ sessionId: sessao.id, validationToken: sessao.token, code: codigo });
    setLoading(false);
    if (!res.success) {
      setErro(res.message ?? 'Código inválido.');
      return;
    }
    setEtapa('senha');
  };

  const concluir = async () => {
    if (!sessao) return;
    setErro(null);
    setLoading(true);
    const res = await criarConta({ sessionId: sessao.id, validationToken: sessao.token, password: senha });
    setLoading(false);
    if (!res.success) {
      setErro(res.message ?? 'Não foi possível concluir o cadastro.');
      return;
    }
    if (res.portal) aplicar(res.portal);
    setEtapa('concluido');
  };

  return (
    <AuthBackgroundLayout align="right">
      <PublicFlowModal>
        <Card className="auth-card border-0 animate-fade-in shadow-none flex flex-col max-h-[calc(100dvh-24px)] xl:max-h-[calc(100dvh-40px)] p-0 overflow-hidden">
          <CardHeader className="text-center pb-2 pt-6 px-6 space-y-1 desktop-header-respiro flex-shrink-0">
            <div className="flex justify-center mb-1">
              <img src={sbpmLogo} alt="SBPM" className="h-[62px] w-auto object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary leading-tight clamp-title">Bem-vindo ao Portal da SBPM</CardTitle>
            <CardDescription className="text-muted-foreground font-medium text-[0.80rem] leading-snug">
              {TITULOS[etapa]} • Etapa {ORDEM.indexOf(etapa) + 1} de {ORDEM.length}
            </CardDescription>
            <Progress value={progresso} className="mt-3 h-2" />
          </CardHeader>

          <CardContent className="px-6 pb-6 pt-4 space-y-5 overflow-y-auto overflow-x-hidden custom-scrollbar flex-grow overscroll-behavior-contain">
            {erro && (
              <Alert tone="danger" className="mb-4">
                {erro}
              </Alert>
            )}

            {etapa === 'identidade' && (
              <form onSubmit={validar} className="space-y-4">
                <div className="space-y-3">
                  <Label>Você é</Label>
                  <div className="grid grid-cols-2 gap-3">
                    <RadioCard
                      label="Associado(a)"
                      selected={personType === 'associate'}
                      onClick={() => { setPersonType('associate'); setExtras({}); }}
                    />
                    <RadioCard
                      label="Dependente"
                      selected={personType === 'dependent'}
                      onClick={() => { setPersonType('dependent'); setExtras({}); }}
                    />
                  </div>
                </div>

                <Field label="CPF" htmlFor="cpf">
                  <CpfInput 
                    value={cpf} 
                    onChange={setCpf} 
                    onFocus={(e) => {
                      setTimeout(() => {
                        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 300);
                    }}
                  />
                </Field>

                <Field label="Data de nascimento" htmlFor="nascimento">
                  <BirthDateInput
                    value={nascimento}
                    onChange={setNascimento}
                    required
                    onFocus={(e) => {
                      setTimeout(() => {
                        e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      }, 300);
                    }}
                  />
                </Field>


                {CAMPOS_VALIDACAO[personType].map((campo) => (
                  <Field label={campo.label} htmlFor={campo.key} hint={campo.help} key={campo.key}>
                    {campo.key === 'registration' ? (
                      <RegistrationNumberInput
                        value={extras[campo.key] ?? ''}
                        onChange={(v) => setExtras((p) => ({ ...p, [campo.key]: v }))}
                        className="h-11"
                        onFocus={(e) => {
                          setTimeout(() => {
                            e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 300);
                        }}
                      />
                    ) : (
                      <Input
                        id={campo.key}
                        value={extras[campo.key] ?? ''}
                        onChange={(e) => setExtras((p) => ({ ...p, [campo.key]: e.target.value }))}
                        className="h-11"
                        onFocus={(e) => {
                          setTimeout(() => {
                            e.target.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          }, 300);
                        }}
                      />
                    )}
                  </Field>
                ))}

                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Validar meus dados'}
                </Button>
              </form>
            )}

            {etapa === 'perguntas' && (
              <div className="space-y-5">
                {bloqueado ? (
                  <Alert tone="danger" title="Acesso bloqueado" icon={ShieldQuestion}>
                    Por segurança, encerramos esta tentativa de primeiro acesso. Procure o atendimento da SBPM para
                    liberar o seu cadastro.
                  </Alert>
                ) : pergunta ? (
                  <>
                    <Alert tone="success" icon={ShieldCheck}>
                      Identidade localizada{sessao?.nome ? ` para ${sessao.nome}` : ''}. Responda às perguntas abaixo
                      para confirmarmos que é você.
                    </Alert>

                    <div className="space-y-4">
                      <Progress value={(pergunta.ordem / pergunta.total) * 100} label={`Pergunta ${pergunta.ordem} de ${pergunta.total}`} />
                      {typeof errosRestantes === 'number' && (
                        <p className="text-xs text-[var(--field-helper)] font-medium">{errosRestantes} erro(s) restante(s)</p>
                      )}
                    </div>

                    <div className="space-y-3">
                      <p className="text-base font-semibold text-[var(--field-label)] leading-snug">{pergunta.pergunta}</p>
                      <div className="grid gap-2">
                        {pergunta.opcoes.map((opcao) => (
                          <RadioCard
                            key={opcao}
                            label={opcao}
                            selected={resposta === opcao}
                            onClick={() => setResposta(opcao)}
                          />
                        ))}
                      </div>
                    </div>

                    <Button className="w-full h-11" onClick={responder} disabled={loading || !resposta} loading={loading}>
                      Confirmar resposta
                    </Button>
                  </>
                ) : null}
              </div>
            )}



            {etapa === 'email' && (
              <div className="space-y-4">
                <Alert tone="success" icon={ShieldCheck}>
                  Identidade confirmada{sessao?.nome ? ` para ${sessao.nome}` : ''}. Informe um e-mail válido para
                  receber o código de confirmação.
                </Alert>
                <Field label="E-mail" htmlFor="email">
                  <Input 
                    id="email" 
                    type="email" 
                    autoComplete="email" 
                    value={email} 
                    onChange={(e) => setEmail(e.target.value)} 
                    placeholder="exemplo@email.com"
                  />
                </Field>
                <Button className="w-full h-11" onClick={() => solicitarCodigo(false)} disabled={loading || !email} loading={loading}>
                  Enviar código
                </Button>
              </div>
            )}

            {etapa === 'codigo' && (
              <div className="space-y-4">
                <p className="text-sm text-[var(--field-helper)] font-medium">
                  Enviamos um código de 6 dígitos para <strong>{emailMascarado}</strong>. Ele expira em 5 minutos.
                </p>
                <Alert tone="warning" icon={MailWarning}>
                  Não encontrou o e-mail? Verifique as pastas <strong>Spam</strong>, <strong>Lixo Eletrônico</strong> ou{' '}
                  <strong>Promoções</strong>. Marque a mensagem como "não é spam" e adicione{' '}
                  <strong>naoresponda@notify.sbpmbahia.com.br</strong> aos seus contatos.
                </Alert>

                <div className="space-y-2">
                <Field label="Código de confirmação" htmlFor="codigo">
                  <Input
                    id="codigo"
                    inputMode="numeric"
                    maxLength={6}
                    value={codigo}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setCodigo(digits);
                    }}
                    className="h-12 text-center text-2xl tracking-[0.5em] font-bold"
                    placeholder="000000"
                  />
                </Field>
                </div>
                <Button className="w-full h-11" onClick={verificar} disabled={loading || codigo.length !== 6} loading={loading}>
                  Confirmar código
                </Button>
                <div className="flex items-center justify-between text-sm">
                  <button type="button" className="text-[var(--link-color)] font-semibold hover:underline" onClick={() => solicitarCodigo(true)} disabled={loading}>
                    Reenviar código
                  </button>
                  <button type="button" className="text-muted-foreground hover:underline" onClick={() => setEtapa('email')}>
                    Trocar e-mail
                  </button>
                </div>
              </div>
            )}

            {etapa === 'senha' && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="senha">Crie sua senha</Label>
                  <div className="relative">
                    <Input
                      id="senha"
                      type={verSenha ? 'text' : 'password'}
                      autoComplete="new-password"
                      value={senha}
                      onChange={(e) => setSenha(e.target.value)}
                      className="h-11 pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setVerSenha(!verSenha)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                    >
                      {verSenha ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  <div className="flex gap-1 h-1">
                    {[1, 2, 3, 4].map((i) => (
                      <div key={i} className={`flex-1 rounded-full ${forca.score >= i ? 'bg-primary' : 'bg-muted'}`} />
                    ))}
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Força: {forca.label} — mínimo de 10 caracteres com maiúscula, minúscula, número e símbolo.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmacao">Confirme sua senha</Label>
                  <Input
                    id="confirmacao"
                    type={verSenha ? 'text' : 'password'}
                    autoComplete="new-password"
                    value={confirmacao}
                    onChange={(e) => setConfirmacao(e.target.value)}
                    className="h-11"
                  />
                </div>
                <Button className="w-full h-11" onClick={() => setEtapa('termos')} disabled={loading || !senhaValida(senha) || senha !== confirmacao}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Continuar'}
                </Button>
              </div>
            )}

            {etapa === 'termos' && (
              <div className="space-y-5">
                <div className="rounded-lg border bg-muted/20 p-4 max-h-60 overflow-y-auto text-[11px] space-y-3 leading-relaxed text-muted-foreground">
                  <h4 className="font-bold text-sm text-foreground">Termos de Uso e Privacidade</h4>
                  <p>
                    O Portal do Associado da SBPM disponibiliza consulta a dados cadastrais, limites, informes e
                    carteirinha digital.
                  </p>
                  <p>
                    O acesso é <strong className="text-foreground">pessoal e intransferível</strong>. Você é
                    responsável por manter a confidencialidade da sua senha.
                  </p>
                  <p>
                    Os dados são tratados conforme a LGPD, utilizados apenas para prestação dos serviços
                    associativos e mantidos com registro de auditoria dos acessos.
                  </p>
                </div>
                <div className="space-y-3">
                  <Label
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-xs font-normal leading-relaxed transition-colors ${
                      aceiteTermos ? 'border-primary/40 bg-primary/5' : 'bg-muted/20 hover:bg-muted/40'
                    }`}
                  >
                    <Checkbox checked={aceiteTermos} onCheckedChange={(v) => setAceiteTermos(v === true)} className="mt-0.5" />
                    <span className="text-muted-foreground">Li e aceito os Termos de Uso do Portal do Associado.</span>
                  </Label>
                  <Label
                    className={`flex cursor-pointer items-start gap-3 rounded-lg border p-3 text-xs font-normal leading-relaxed transition-colors ${
                      aceitePrivacidade ? 'border-primary/40 bg-primary/5' : 'bg-muted/20 hover:bg-muted/40'
                    }`}
                  >
                    <Checkbox checked={aceitePrivacidade} onCheckedChange={(v) => setAceitePrivacidade(v === true)} className="mt-0.5" />
                    <span className="text-muted-foreground">
                      Li e concordo com a{' '}
                      <Link to="/privacidade" className="font-medium text-primary underline underline-offset-2">
                        Política de Privacidade
                      </Link>{' '}
                      e com o tratamento dos meus dados conforme a LGPD.
                    </span>
                  </Label>
                </div>
                <Button className="w-full h-11 font-semibold" onClick={concluir} disabled={loading || !aceiteTermos || !aceitePrivacidade}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Concluir cadastro'}
                </Button>
              </div>
            )}


            {etapa === 'concluido' && (
              <div className="space-y-4 text-center">
                <CheckCircle2 className="mx-auto h-14 w-14 text-primary" aria-hidden="true" />
                <p className="text-sm text-muted-foreground">
                  Seu acesso foi criado com sucesso. A partir de agora, entre com seu CPF ou matrícula e a senha
                  cadastrada.
                </p>
                <Button className="w-full h-11" onClick={() => navigate('/entrar')}>
                  Acessar o Portal
                </Button>
              </div>
            )}

            {etapa !== 'concluido' && (
              <div className="flex justify-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (etapa === 'identidade') navigate('/');
                    else {
                      const prev = ORDEM[ORDEM.indexOf(etapa) - 1];
                      setEtapa(prev);
                    }
                  }}
                  className="flex items-center text-sm font-medium text-muted-foreground hover:text-primary transition-colors"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
                </button>
              </div>
            )}
          </CardContent>

          <style dangerouslySetInnerHTML={{ __html: `
            .clamp-title {
              font-size: clamp(1.45rem, 6vw, 1.8rem) !important;
            }
            .desktop-header-respiro {
              padding-top: 8px !important;
              padding-bottom: 12px !important;
            }
            @media (min-width: 1200px) {
              .desktop-header-respiro h3 {
                margin-top: 12px !important;
                margin-bottom: 6px !important;
              }
              .desktop-header-respiro p {
                margin-bottom: 12px !important;
              }
            }
            @media (max-width: 359px) {
              .grid-cols-2 {
                grid-template-columns: 1fr !important;
              }
            }
          `}} />
        </Card>
      </PublicFlowModal>
    </AuthBackgroundLayout>
  );
}
