import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useNavigationState } from '@/hooks/useNavigationState';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, BadgePlus, CheckCircle2, HelpCircle, Loader2, MessageCircle } from 'lucide-react';
import sbpmLogo from '@/assets/sbpm-logo.png';
import AuthBackgroundLayout from '@/components/AuthBackgroundLayout';
import { CpfInput } from '@/components/CpfInput';
import { RegistrationNumberInput } from '@/components/RegistrationNumberInput';
import { isValidCPF, isValidEmail } from '@/lib/validate';
import {
  enviarPreCadastro,
  listarPostos,
  mascararTelefone,
  telefoneValido,
  type PostoGraduacao,
} from '@/lib/associacao';
import { PublicFlowModal } from '@/components/portal/PublicFlowModal';
import { cn } from '@/lib/utils';

const SUPORTE_WHATSAPP = 'https://wa.me/5571985496972';

export default function PortalQueroMeAssociar() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { setIsNavigating } = useNavigationState();

  useEffect(() => {
    setIsNavigating(false);
  }, [setIsNavigating]);


  const [postos, setPostos] = useState<PostoGraduacao[]>([]);
  const [nome, setNome] = useState('');
  const [cpf, setCpf] = useState('');
  const [matricula, setMatricula] = useState('');
  const [postoId, setPostoId] = useState('');
  const [postoOutro, setPostoOutro] = useState('');
  const [situacao, setSituacao] = useState<'regular' | 'inativo'>('regular');
  const [email, setEmail] = useState('');
  const [telefone, setTelefone] = useState('');
  const [consent, setConsent] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [protocolo, setProtocolo] = useState<string | null>(null);
  const [erros, setErros] = useState<Record<string, string>>({});

  useEffect(() => {
    listarPostos().then(setPostos);
  }, []);

  const postoSelecionado = useMemo(() => postos.find((p) => p.id === postoId), [postos, postoId]);
  const exigeComplemento = Boolean(postoSelecionado?.permite_complemento);

  const validar = () => {
    const e: Record<string, string> = {};
    if (nome.trim().split(' ').filter(Boolean).length < 2) e.nome = 'Informe o nome completo.';
    if (!isValidCPF(cpf)) e.cpf = 'CPF inválido.';
    if (!matricula.trim()) e.matricula = 'Informe sua matrícula.';
    if (!postoId) e.posto = 'Selecione o posto ou graduação.';
    if (exigeComplemento && !postoOutro.trim()) e.postoOutro = 'Descreva seu posto ou graduação.';
    if (!isValidEmail(email)) e.email = 'E-mail inválido.';
    if (!telefoneValido(telefone)) e.telefone = 'Informe DDD e número válidos.';
    if (!consent) e.consent = 'É necessário confirmar a declaração para enviar.';
    setErros(e);
    return Object.keys(e).length === 0;
  };

  const submeter = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (enviando) return;
    if (!validar()) {
      toast({ title: 'Confira os campos', description: 'Alguns dados precisam de correção.', variant: 'destructive' });
      return;
    }
    setEnviando(true);
    const res = await enviarPreCadastro({
      fullName: nome,
      cpf,
      registration: matricula,
      rankId: postoId,
      rankOther: exigeComplemento ? postoOutro : undefined,
      functionalStatus: situacao,
      email,
      phone: telefone,
    });
    setEnviando(false);

    if (!res?.success || !res.protocol) {
      toast({
        title: 'Não foi possível enviar',
        description: res?.message ?? 'Tente novamente em instantes.',
        variant: 'destructive',
      });
      return;
    }
    setProtocolo(res.protocol);
  };

  if (protocolo) {
    return (
      <AuthBackgroundLayout align="right">
        <PublicFlowModal>
          <Card className="auth-card auth-card--wide border-0 animate-fade-in shadow-none overflow-hidden">
            <CardHeader className="text-center pb-2 pt-6 space-y-1">
              <div className="flex justify-center mb-3">
                <CheckCircle2 className="h-14 w-14 text-primary animate-bounce-subtle" aria-hidden="true" />
              </div>
              <CardTitle className="text-2xl font-bold text-primary">Pré-cadastro enviado com sucesso</CardTitle>
              <CardDescription className="text-[var(--public-description-light)] font-medium">
                Recebemos suas informações e registramos seu interesse em se associar à SBPM.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-6 pb-8 pt-2" role="status" aria-live="polite">
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground leading-relaxed text-center">
                  Para a conclusão da associação, será necessário fornecer outras informações e documentos para que a
                  instituição possa encaminhar o processo à SAEB.
                </p>
                <p className="text-sm text-muted-foreground leading-relaxed text-center">
                  O setor responsável entrará em contato pelo telefone ou e-mail informado para orientar sobre as
                  próximas etapas e dar continuidade ao processo.
                </p>
              </div>

              <div className="rounded-2xl border bg-primary/5 p-5 text-center border-primary/20">
                <p className="text-xs uppercase tracking-widest font-semibold text-primary/70 mb-1">Protocolo</p>
                <p className="text-2xl font-bold text-primary tracking-tight">{protocolo}</p>
              </div>

              <div className="space-y-3 pt-2">
                <button type="button" className="portal-btn-primary w-full h-12 rounded-xl" onClick={() => navigate('/')}>
                  Voltar ao início
                </button>
                <Link to="/faq" className="portal-btn-secondary w-full h-12 flex items-center justify-center rounded-xl">
                  Consultar orientações
                </Link>
                <a
                  href={SUPORTE_WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="portal-btn-tertiary w-full h-12 flex items-center justify-center rounded-xl"
                >
                  <MessageCircle className="h-4 w-4 mr-2" aria-hidden="true" /> Falar com o atendimento
                </a>
              </div>
            </CardContent>
          </Card>
        </PublicFlowModal>
      </AuthBackgroundLayout>
    );
  }

  return (
    <AuthBackgroundLayout align="right">
      <PublicFlowModal>
        <Card className="auth-card auth-card--wide border-0 animate-fade-in shadow-none overflow-hidden">
          <CardHeader className="pb-4 pt-6 text-center space-y-2">
            <div className="flex justify-center mb-1">
              <img src={sbpmLogo} alt="SBPM" className="h-14 w-auto object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary leading-tight">
              Quero me associar
            </CardTitle>
            <CardDescription className="text-[var(--public-description-light)] font-medium text-sm">
              Informe seus dados para que a equipe da SBPM possa entrar em contato.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-6 pb-8 pt-2">
            <form onSubmit={submeter} className="space-y-4" noValidate aria-label="Formulário de pré-cadastro">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  value={nome}
                  autoComplete="name"
                  placeholder="Seu nome completo"
                  onChange={(e) => setNome(e.target.value)}
                  aria-invalid={!!erros.nome}
                  className="h-11 rounded-xl bg-white border-primary/30 focus-visible:ring-primary"
                  disabled={enviando}
                  onFocus={(e) => {
                    setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                  }}
                />
                {erros.nome && <p className="text-xs font-medium text-destructive animate-fade-in">{erros.nome}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <CpfInput
                  label="CPF"
                  value={cpf}
                  onChange={setCpf}
                  className="h-11 rounded-xl"
                  disabled={enviando}
                  error={erros.cpf}
                  onFocus={(e) => {
                    setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                  }}
                />

                <RegistrationNumberInput
                  label="Matrícula"
                  value={matricula}
                  onChange={setMatricula}
                  className="h-11 rounded-xl"
                  disabled={enviando}
                  error={erros.matricula}
                  onFocus={(e) => {
                    setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                  }}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="posto">Posto ou graduação</Label>
                <Select value={postoId} onValueChange={setPostoId} disabled={enviando}>
                  <SelectTrigger id="posto" className="h-11 rounded-xl bg-white border-primary/30 focus-visible:ring-primary" aria-invalid={!!erros.posto}>
                    <SelectValue placeholder="Selecione seu posto ou graduação" />
                  </SelectTrigger>
                  <SelectContent>
                    {postos.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {erros.posto && <p className="text-xs font-medium text-destructive animate-fade-in">{erros.posto}</p>}
              </div>

              {exigeComplemento && (
                <div className="space-y-2 animate-fade-in">
                  <Label htmlFor="postoOutro">Informe seu posto ou graduação</Label>
                  <Input
                    id="postoOutro"
                    value={postoOutro}
                    onChange={(e) => setPostoOutro(e.target.value)}
                    className="h-11 rounded-xl bg-white border-primary/30 focus-visible:ring-primary"
                    disabled={enviando}
                    onFocus={(e) => {
                      setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                    }}
                  />
                  {erros.postoOutro && <p className="text-xs font-medium text-destructive animate-fade-in">{erros.postoOutro}</p>}
                </div>
              )}

              <div className="space-y-3">
                <Label className="text-sm font-semibold text-primary/80">Situação funcional</Label>
                <RadioGroup
                  value={situacao}
                  onValueChange={(v) => setSituacao(v as 'regular' | 'inativo')}
                  className="grid grid-cols-2 gap-3"
                >
                  {(['regular', 'inativo'] as const).map((v) => (
                    <Label
                      key={v}
                      htmlFor={`sit-${v}`}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-xl border p-3.5 text-sm font-medium transition-all duration-200",
                        situacao === v 
                          ? "border-primary bg-primary/5 ring-2 ring-primary/20 shadow-sm" 
                          : "bg-white border-primary/20 hover:border-primary/40"
                      )}
                    >
                      <RadioGroupItem id={`sit-${v}`} value={v} className="border-primary text-primary" />
                      {v === 'regular' ? 'Ativo' : 'Inativo'}
                    </Label>
                  ))}
                </RadioGroup>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">E-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    placeholder="exemplo@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    aria-invalid={!!erros.email}
                    className="h-11 rounded-xl bg-white border-primary/30 focus-visible:ring-primary"
                    disabled={enviando}
                    onFocus={(e) => {
                      setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                    }}
                  />
                  {erros.email && <p className="text-xs font-medium text-destructive animate-fade-in">{erros.email}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="telefone">Telefone com WhatsApp</Label>
                  <Input
                    id="telefone"
                    inputMode="tel"
                    autoComplete="tel"
                    placeholder="(00) 00000-0000"
                    value={telefone}
                    onChange={(e) => setTelefone(mascararTelefone(e.target.value))}
                    maxLength={16}
                    aria-invalid={!!erros.telefone}
                    className="h-11 rounded-xl bg-white border-primary/30 focus-visible:ring-primary"
                    disabled={enviando}
                    onFocus={(e) => {
                      setTimeout(() => e.target.scrollIntoView({ behavior: 'smooth', block: 'center' }), 300);
                    }}
                  />
                  {erros.telefone && <p className="text-xs font-medium text-destructive animate-fade-in">{erros.telefone}</p>}
                </div>
              </div>

              <div className={cn(
                "rounded-2xl border p-5 transition-all duration-300",
                consent ? "border-primary/40 bg-primary/5" : "border-primary/10 bg-white/40"
              )}>
                <Label htmlFor="consent" className="flex cursor-pointer items-start gap-4 text-sm font-normal">
                  <Checkbox
                    id="consent"
                    checked={consent}
                    onCheckedChange={(v) => setConsent(v === true)}
                    className="mt-0.5 h-5 w-5 rounded-md border-primary/40 data-[state=checked]:bg-primary"
                    disabled={enviando}
                  />
                  <span className="leading-relaxed">
                    Confirmo que os dados informados são verdadeiros e autorizo o contato da SBPM para continuidade do processo.
                  </span>
                </Label>
                <div className="mt-3 pl-9 flex flex-wrap gap-x-4 gap-y-1">
                  <Link to="/privacidade" className="text-xs font-semibold text-primary hover:underline underline-offset-2">Política de Privacidade</Link>
                  <Link to="/privacidade#termos" className="text-xs font-semibold text-primary hover:underline underline-offset-2">Termos de Uso</Link>
                </div>
                {erros.consent && <p className="mt-2 pl-9 text-xs font-medium text-destructive animate-fade-in">{erros.consent}</p>}
              </div>

              <div className="space-y-3 pt-2">
                <button 
                  type="submit" 
                  className="portal-btn-primary w-full h-12 rounded-xl text-base font-bold shadow-lg shadow-primary/20 active:scale-[0.98] transition-all" 
                  disabled={enviando}
                >
                  {enviando ? (
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
                      <span>Enviando...</span>
                    </div>
                  ) : (
                    'Enviar pré-cadastro'
                  )}
                </button>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className="portal-btn-secondary h-11 flex items-center justify-center rounded-xl text-sm font-semibold"
                    onClick={() => navigate('/')}
                    disabled={enviando}
                  >
                    <ArrowLeft className="h-4 w-4 mr-2" aria-hidden="true" /> Voltar
                  </button>
                  <a
                    href={SUPORTE_WHATSAPP}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="portal-btn-tertiary h-11 flex items-center justify-center rounded-xl text-sm font-semibold"
                  >
                    <HelpCircle className="h-4 w-4 mr-2" aria-hidden="true" /> Ajuda
                  </a>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </PublicFlowModal>
    </AuthBackgroundLayout>
  );
}
