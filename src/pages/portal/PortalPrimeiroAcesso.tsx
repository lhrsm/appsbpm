import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
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
  const aplicar = useAplicarPortal();

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
    <AuthBackgroundLayout align="center">
      <main className="w-full max-w-md">
        <Card className="auth-card w-full border-0 animate-fade-in">
          <CardHeader className="pb-2 text-center">
            <div className="flex justify-center mb-3">
              <img src={sbpmLogo} alt="SBPM" className="h-20 w-auto object-contain" />
            </div>
            <CardTitle className="text-xl font-bold text-primary">{TITULOS[etapa]}</CardTitle>
            <CardDescription>Etapa {ORDEM.indexOf(etapa) + 1} de {ORDEM.length}</CardDescription>
            <Progress value={progresso} className="mt-3 h-2" />
          </CardHeader>

          <CardContent className="space-y-5">
            {erro && (
              <div role="alert" className="rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive">
                {erro}
              </div>
            )}

            {etapa === 'identidade' && (
              <form onSubmit={validar} className="space-y-4">
                <div className="space-y-2">
                  <Label>Você é</Label>
                  <RadioGroup
                    value={personType}
                    onValueChange={(v) => { setPersonType(v as PersonType); setExtras({}); }}
                    className="grid grid-cols-2 gap-2"
                  >
                    <Label className="flex items-center gap-2 rounded-md border p-3 text-sm font-normal cursor-pointer">
                      <RadioGroupItem value="associate" /> Associado(a)
                    </Label>
                    <Label className="flex items-center gap-2 rounded-md border p-3 text-sm font-normal cursor-pointer">
                      <RadioGroupItem value="dependent" /> Dependente
                    </Label>
                  </RadioGroup>
                </div>

                <CpfInput 
                  label="CPF" 
                  value={cpf} 
                  onChange={setCpf} 
                  className="h-11" 
                />

                <BirthDateInput
                  label="Data de nascimento"
                  value={nascimento}
                  onChange={setNascimento}
                  className="h-11"
                  required
                />


                {CAMPOS_VALIDACAO[personType].map((campo) => (
                  <div className="space-y-2" key={campo.key}>
                    {campo.key === 'registration' ? (
                      <RegistrationNumberInput
                        label={campo.label}
                        value={extras[campo.key] ?? ''}
                        onChange={(v) => setExtras((p) => ({ ...p, [campo.key]: v }))}
                        className="h-11"
                      />
                    ) : (
                      <>
                        <Label htmlFor={campo.key}>{campo.label}</Label>
                        <Input
                          id={campo.key}
                          value={extras[campo.key] ?? ''}
                          onChange={(e) => setExtras((p) => ({ ...p, [campo.key]: e.target.value }))}
                          className="h-11"
                        />
                      </>
                    )}
                    {campo.help && <p className="text-xs text-muted-foreground">{campo.help}</p>}
                  </div>
                ))}

                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Validar meus dados'}
                </Button>
              </form>
            )}

            {etapa === 'perguntas' && (
              <div className="space-y-5">
                {bloqueado ? (
                  <div className="space-y-3 text-center">
                    <ShieldQuestion className="mx-auto h-12 w-12 text-destructive" aria-hidden="true" />
                    <p className="text-sm text-muted-foreground">
                      Por segurança, encerramos esta tentativa de primeiro acesso. Procure o atendimento da SBPM para
                      liberar o seu cadastro.
                    </p>
                  </div>
                ) : pergunta ? (
                  <>
                    <p className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
                      <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                      <span>
                        Identidade localizada{sessao?.nome ? ` para ${sessao.nome}` : ''}. Responda às perguntas abaixo
                        para confirmarmos que é você.
                      </span>
                    </p>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-medium uppercase tracking-wide">
                        Pergunta {pergunta.ordem} de {pergunta.total}
                      </span>
                      {typeof errosRestantes === 'number' && (
                        <span>{errosRestantes} erro(s) restante(s)</span>
                      )}
                    </div>
                    <Progress value={(pergunta.ordem / pergunta.total) * 100} className="h-1.5" />

                    <fieldset className="space-y-3">
                      <legend className="text-base font-semibold text-foreground">{pergunta.pergunta}</legend>
                      <RadioGroup value={resposta} onValueChange={setResposta} className="grid gap-2">
                        {pergunta.opcoes.map((opcao) => (
                          <Label
                            key={opcao}
                            className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm font-normal transition-colors ${
                              resposta === opcao ? 'border-primary/50 bg-primary/5' : 'bg-muted/20 hover:bg-muted/40'
                            }`}
                          >
                            <RadioGroupItem value={opcao} /> {opcao}
                          </Label>
                        ))}
                      </RadioGroup>
                    </fieldset>

                    <Button className="w-full h-11" onClick={responder} disabled={loading || !resposta}>
                      {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirmar resposta'}
                    </Button>
                  </>
                ) : null}
              </div>
            )}



            {etapa === 'email' && (
              <div className="space-y-4">
                <p className="flex items-start gap-2 rounded-md border bg-muted/30 p-3 text-sm">
                  <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>
                    Identidade confirmada{sessao?.nome ? ` para ${sessao.nome}` : ''}. Informe um e-mail válido para
                    receber o código de confirmação.
                  </span>
                </p>
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="h-11" />
                </div>
                <Button className="w-full h-11" onClick={() => solicitarCodigo(false)} disabled={loading || !email}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Enviar código'}
                </Button>
              </div>
            )}

            {etapa === 'codigo' && (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  Enviamos um código de 6 dígitos para <strong>{emailMascarado}</strong>. Ele expira em 5 minutos.
                </p>
                <p className="flex items-start gap-2 rounded-lg border border-yellow-500/30 bg-yellow-500/10 p-3 text-xs leading-relaxed text-foreground">
                  <MailWarning className="mt-0.5 h-4 w-4 shrink-0 text-yellow-600" aria-hidden="true" />
                  <span>
                    Não encontrou o e-mail? Verifique as pastas <strong>Spam</strong>, <strong>Lixo Eletrônico</strong> ou{' '}
                    <strong>Promoções</strong>. Marque a mensagem como "não é spam" e adicione{' '}
                    <strong>naoresponda@notify.sbpmbahia.com.br</strong> aos seus contatos.
                  </span>
                </p>

                <div className="space-y-2">
                  <Label htmlFor="codigo">Código de confirmação</Label>
                  <Input
                    id="codigo"
                    inputMode="numeric"
                    maxLength={6}
                    value={codigo}
                    onChange={(e) => {
                      const digits = e.target.value.replace(/\D/g, '').slice(0, 6);
                      setCodigo(digits);
                    }}
                    className="h-12 text-center text-2xl tracking-[0.5em]"
                  />
                </div>
                <Button className="w-full h-11" onClick={verificar} disabled={loading || codigo.length !== 6}>
                  {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Confirmar código'}
                </Button>
                <div className="flex items-center justify-between text-sm">
                  <button type="button" className="text-primary hover:underline" onClick={() => solicitarCodigo(true)} disabled={loading}>
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
                      className="h-11 pr-12"
                    />
                    <button
                      type="button"
                      onClick={() => setVerSenha((v) => !v)}
                      className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label={verSenha ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {verSenha ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  <Progress value={(forca.score / 4) * 100} className="h-1.5" />
                  <p className="text-xs text-muted-foreground">
                    Força: {forca.label} — mínimo de 10 caracteres com maiúscula, minúscula, número e símbolo.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="conf">Confirme a senha</Label>
                  <Input id="conf" type={verSenha ? 'text' : 'password'} value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} className="h-11" />
                </div>
                <Button
                  className="w-full h-11"
                  onClick={() => setEtapa('termos')}
                  disabled={!senhaValida(senha) || senha !== confirmacao}
                >
                  Continuar
                </Button>
              </div>
            )}

            {etapa === 'termos' && (
              <div className="space-y-5">
                <p className="flex items-start gap-2 rounded-lg border border-primary/20 bg-primary/5 p-3 text-sm">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
                  <span>Última etapa: leia e aceite os termos para liberar o seu acesso.</span>
                </p>

                <div className="rounded-lg border bg-card shadow-sm">
                  <div className="flex items-center justify-between border-b px-4 py-2.5">
                    <span className="text-sm font-semibold text-foreground">Termos de Uso</span>
                    <span className="text-[11px] uppercase tracking-wide text-muted-foreground">Role para ler</span>
                  </div>
                  <div className="max-h-44 space-y-3 overflow-y-auto px-4 py-3 text-xs leading-relaxed text-muted-foreground">
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
                <Button className="w-full h-11" onClick={() => navigate('/dashboard')}>
                  Ir para o portal
                </Button>
              </div>
            )}

            {etapa !== 'concluido' && (
              <Button asChild variant="ghost" className="w-full">
                <Link to="/">
                  <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" /> Voltar
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </main>
    </AuthBackgroundLayout>
  );
}
