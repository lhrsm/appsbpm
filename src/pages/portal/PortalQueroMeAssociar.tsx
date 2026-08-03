import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
import { mascararCpf } from '@/lib/portalAcesso';
import { isValidCPF, isValidEmail } from '@/lib/validate';
import {
  enviarPreCadastro,
  listarPostos,
  mascararTelefone,
  telefoneValido,
  type PostoGraduacao,
} from '@/lib/associacao';

const SUPORTE_WHATSAPP = 'https://wa.me/5571985496972';

export default function PortalQueroMeAssociar() {
  const navigate = useNavigate();
  const { toast } = useToast();

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
      <AuthBackgroundLayout align="center">
        <main className="w-full max-w-xl">
          <Card className="auth-card auth-card--wide w-full border-0 animate-fade-in">
            <CardHeader className="text-center pb-2">
              <div className="flex justify-center mb-3">
                <CheckCircle2 className="h-14 w-14 text-primary" aria-hidden="true" />
              </div>
              <CardTitle className="text-2xl font-bold text-primary">Pré-cadastro enviado com sucesso</CardTitle>
              <CardDescription>
                Recebemos suas informações e registramos seu interesse em se associar à SBPM.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4" role="status" aria-live="polite">
              <p className="text-sm text-muted-foreground">
                Para a conclusão da associação, será necessário fornecer outras informações e documentos para que a
                instituição possa encaminhar o processo à SAEB.
              </p>
              <p className="text-sm text-muted-foreground">
                O setor responsável entrará em contato pelo telefone ou e-mail informado para orientar sobre as
                próximas etapas e dar continuidade ao processo.
              </p>

              <div className="rounded-xl border bg-muted/40 p-4 text-center">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Protocolo</p>
                <p className="text-lg font-bold text-primary">{protocolo}</p>
              </div>

              <div className="space-y-2">
                <button type="button" className="portal-btn-primary w-full" onClick={() => navigate('/')}>
                  Voltar ao início
                </button>
                <Link to="/faq" className="portal-btn-secondary w-full">
                  Consultar orientações
                </Link>
                <a
                  href={SUPORTE_WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="portal-btn-tertiary w-full"
                >
                  <MessageCircle className="h-4 w-4" aria-hidden="true" /> Falar com o atendimento
                </a>
              </div>
            </CardContent>
          </Card>
        </main>
      </AuthBackgroundLayout>
    );
  }

  return (
    <AuthBackgroundLayout align="center">
      <main className="w-full max-w-xl">
        <Card className="auth-card auth-card--wide w-full border-0 animate-fade-in">
          <CardHeader className="pb-2 text-center">
            <div className="flex justify-center mb-3">
              <img src={sbpmLogo} alt="SBPM" className="h-16 w-auto object-contain" />
            </div>
            <CardTitle className="flex items-center justify-center gap-2 text-2xl font-bold text-primary">
              <BadgePlus className="h-6 w-6" aria-hidden="true" /> Pré-cadastro para associação
            </CardTitle>
            <CardDescription>
              Informe seus dados para que a equipe da SBPM possa entrar em contato e orientar sobre as próximas etapas
              do processo de associação.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={submeter} className="space-y-4" noValidate aria-label="Formulário de pré-cadastro">
              <div className="space-y-2">
                <Label htmlFor="nome">Nome completo</Label>
                <Input
                  id="nome"
                  value={nome}
                  autoComplete="name"
                  onChange={(e) => setNome(e.target.value)}
                  aria-invalid={!!erros.nome}
                  aria-describedby={erros.nome ? 'erro-nome' : undefined}
                  className="h-12"
                  disabled={enviando}
                />
                {erros.nome && <p id="erro-nome" className="text-xs font-medium text-destructive">{erros.nome}</p>}
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="cpf">CPF</Label>
                  <Input
                    id="cpf"
                    inputMode="numeric"
                    value={cpf}
                    onChange={(e) => setCpf(mascararCpf(e.target.value))}
                    maxLength={14}
                    aria-invalid={!!erros.cpf}
                    aria-describedby={erros.cpf ? 'erro-cpf' : undefined}
                    className="h-12"
                    disabled={enviando}
                  />
                  {erros.cpf && <p id="erro-cpf" className="text-xs font-medium text-destructive">{erros.cpf}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="matricula">Matrícula</Label>
                  <Input
                    id="matricula"
                    value={matricula}
                    onChange={(e) => setMatricula(e.target.value.replace(/\s+/g, ''))}
                    maxLength={30}
                    aria-invalid={!!erros.matricula}
                    aria-describedby={erros.matricula ? 'erro-matricula' : undefined}
                    className="h-12"
                    disabled={enviando}
                  />
                  {erros.matricula && (
                    <p id="erro-matricula" className="text-xs font-medium text-destructive">{erros.matricula}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="posto">Posto ou graduação</Label>
                <Select value={postoId} onValueChange={setPostoId} disabled={enviando}>
                  <SelectTrigger id="posto" className="h-12" aria-invalid={!!erros.posto}>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {postos.map((p) => (
                      <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {erros.posto && <p className="text-xs font-medium text-destructive">{erros.posto}</p>}
              </div>

              {exigeComplemento && (
                <div className="space-y-2">
                  <Label htmlFor="postoOutro">Informe seu posto ou graduação</Label>
                  <Input
                    id="postoOutro"
                    value={postoOutro}
                    onChange={(e) => setPostoOutro(e.target.value)}
                    className="h-12"
                    disabled={enviando}
                  />
                  {erros.postoOutro && <p className="text-xs font-medium text-destructive">{erros.postoOutro}</p>}
                </div>
              )}

              <fieldset className="space-y-2">
                <legend className="text-sm font-medium">Situação funcional</legend>
                <RadioGroup
                  value={situacao}
                  onValueChange={(v) => setSituacao(v as 'ativo' | 'inativo')}
                  className="grid grid-cols-2 gap-3"
                >
                  {(['ativo', 'inativo'] as const).map((v) => (
                    <Label
                      key={v}
                      htmlFor={`sit-${v}`}
                      className="flex cursor-pointer items-center gap-2 rounded-xl border bg-background/70 p-3 text-sm font-medium has-[:checked]:border-primary has-[:checked]:ring-2 has-[:checked]:ring-primary/25"
                    >
                      <RadioGroupItem id={`sit-${v}`} value={v} />
                      {v === 'ativo' ? 'Ativo' : 'Inativo'}
                    </Label>
                  ))}
                </RadioGroup>
              </fieldset>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <Input
                  id="email"
                  type="email"
                  inputMode="email"
                  autoComplete="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={!!erros.email}
                  className="h-12"
                  disabled={enviando}
                />
                {erros.email && <p className="text-xs font-medium text-destructive">{erros.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone com WhatsApp</Label>
                <Input
                  id="telefone"
                  inputMode="tel"
                  autoComplete="tel"
                  value={telefone}
                  onChange={(e) => setTelefone(mascararTelefone(e.target.value))}
                  maxLength={16}
                  aria-invalid={!!erros.telefone}
                  aria-describedby="ajuda-telefone"
                  className="h-12"
                  disabled={enviando}
                />
                <p id="ajuda-telefone" className="text-xs text-muted-foreground">
                  Informe um número com WhatsApp — o contato da SBPM poderá ser feito por esse canal.
                </p>
                {erros.telefone && <p className="text-xs font-medium text-destructive">{erros.telefone}</p>}
              </div>

              <div className="rounded-xl border bg-muted/30 p-3">
                <Label htmlFor="consent" className="flex cursor-pointer items-start gap-3 text-sm font-normal">
                  <Checkbox
                    id="consent"
                    checked={consent}
                    onCheckedChange={(v) => setConsent(v === true)}
                    className="mt-0.5"
                    disabled={enviando}
                  />
                  <span>
                    Confirmo que os dados informados são verdadeiros e autorizo o contato da SBPM para continuidade do
                    processo.
                  </span>
                </Label>
                <p className="mt-2 pl-7 text-xs text-muted-foreground">
                  Leia a <Link to="/privacidade" className="font-medium text-primary hover:underline">Política de Privacidade</Link>{' '}
                  e os <Link to="/privacidade#termos" className="font-medium text-primary hover:underline">Termos de Uso</Link>.
                </p>
                {erros.consent && <p className="mt-1 text-xs font-medium text-destructive">{erros.consent}</p>}
              </div>

              <div className="space-y-2 pt-1">
                <button type="submit" className="portal-btn-primary w-full" disabled={enviando}>
                  {enviando ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" /> Enviando...
                    </>
                  ) : (
                    'Enviar pré-cadastro'
                  )}
                </button>
                <button
                  type="button"
                  className="portal-btn-secondary w-full"
                  onClick={() => navigate('/')}
                  disabled={enviando}
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" /> Cancelar
                </button>
                <a
                  href={SUPORTE_WHATSAPP}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="portal-btn-tertiary w-full"
                >
                  <HelpCircle className="h-4 w-4" aria-hidden="true" /> Preciso de ajuda
                </a>
              </div>
            </form>
          </CardContent>
        </Card>
      </main>
    </AuthBackgroundLayout>
  );
}
