import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Button, Input, Checkbox, Label, Field, RadioCard, Select, SelectContent, SelectItem, SelectTrigger, SelectValue, Alert } from '@/design-system/components';
import { ArrowLeft, CheckCircle2, CircleHelp, Loader2, Send, ShieldCheck, ChevronRight } from 'lucide-react';
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
import { useEffect, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

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
  const [showHelp, setShowHelp] = useState(false);

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
          <Card className="auth-card auth-card--wide border-0 animate-in fade-in zoom-in duration-300 shadow-xl overflow-hidden bg-white/95 backdrop-blur-sm">
            <CardHeader className="text-center pb-2 pt-10 space-y-4">
              <div className="flex justify-center mb-2">
                <div className="bg-primary/10 rounded-full p-4 animate-bounce-subtle">
                  <CheckCircle2 className="h-16 w-16 text-primary" aria-hidden="true" />
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-primary">Pré-cadastro enviado!</CardTitle>
              <CardDescription className="text-gray-600 font-medium px-4">
                Recebemos seu pré-cadastro com sucesso. Nossa equipe irá analisar as informações enviadas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 px-8 pb-10 pt-2" role="status" aria-live="polite">
              <div className="space-y-4 text-center text-sm text-gray-600 leading-relaxed bg-slate-50 p-6 rounded-2xl border border-slate-100">
                <p>
                  Caso todos os dados estejam corretos, entraremos em contato para solicitar a documentação complementar necessária para formalizar sua associação junto à SBPM.
                </p>
                <p>
                  Em seguida será iniciado o processo administrativo para emissão da SAEB.
                </p>
                <p className="font-medium text-primary">
                  Obrigado pelo interesse em fazer parte da Sociedade Beneficente da Polícia Militar e do Corpo de Bombeiros Militar da Bahia.
                </p>
              </div>

              <div className="rounded-2xl border bg-primary/5 p-6 text-center border-primary/20 shadow-inner">
                <p className="text-xs uppercase tracking-widest font-semibold text-primary/70 mb-1">Protocolo de Registro</p>
                <p className="text-3xl font-bold text-primary tracking-tight">{protocolo}</p>
              </div>

              <div className="space-y-4 pt-2">
                <Button 
                  className="w-full h-14 rounded-2xl bg-primary hover:bg-primary-hover font-bold text-base shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5" 
                  onClick={() => navigate('/')}
                >
                  Voltar para a página inicial
                </Button>
                <Button 
                  variant="outline"
                  className="w-full h-14 rounded-2xl text-muted-foreground border-slate-200 cursor-not-allowed" 
                  disabled
                >
                  Acompanhar posteriormente (em breve)
                </Button>
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
        <Card className="auth-card auth-card--wide border-0 animate-fade-in shadow-none flex flex-col xl:max-h-none p-0 overflow-visible">
          <CardHeader className="pb-4 pt-8 text-center space-y-2 flex-shrink-0 px-8">
            <div className="flex justify-center mb-2">
              <img src={sbpmLogo} alt="SBPM" className="h-16 w-auto object-contain" />
            </div>
            <CardTitle className="text-2xl font-bold text-primary leading-tight">
              Quero me associar
            </CardTitle>
            <CardDescription className="text-muted-foreground font-medium text-sm">
              Preencha o formulário abaixo para iniciar seu processo de associação.
            </CardDescription>
          </CardHeader>

          <CardContent className="px-8 pb-8 pt-2 overflow-visible flex-grow">
            <form onSubmit={submeter} className="space-y-5 w-full max-w-full">
              
              {/* Campos do formulário permanecem inalterados conforme instrução */}
              <div className="space-y-5">
                <Field label="Nome completo" htmlFor="nome" error={erros.nome}>
                  <Input
                    id="nome"
                    value={nome}
                    placeholder="Seu nome completo"
                    onChange={(e) => setNome(e.target.value)}
                    invalid={!!erros.nome}
                    disabled={enviando}
                  />
                </Field>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 w-full">
                  <Field label="CPF" htmlFor="cpf" error={erros.cpf}>
                    <CpfInput value={cpf} onChange={setCpf} error={erros.cpf} disabled={enviando} />
                  </Field>
                  <Field label="Matrícula" htmlFor="matricula" error={erros.matricula}>
                    <RegistrationNumberInput value={matricula} onChange={setMatricula} error={erros.matricula} disabled={enviando} />
                  </Field>
                </div>

                <Field label="Posto ou graduação" htmlFor="posto" error={erros.posto}>
                  <Select value={postoId} onValueChange={setPostoId} disabled={enviando}>
                    <SelectTrigger id="posto" invalid={!!erros.posto}>
                      <SelectValue placeholder="Selecione seu posto ou graduação" />
                    </SelectTrigger>
                    <SelectContent>
                      {postos.map((p) => (
                        <SelectItem key={p.id} value={p.id}>{p.nome}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </Field>

                {exigeComplemento && (
                  <Field label="Informe seu posto ou graduação" htmlFor="postoOutro" error={erros.postoOutro}>
                    <Input id="postoOutro" value={postoOutro} onChange={(e) => setPostoOutro(e.target.value)} disabled={enviando} />
                  </Field>
                )}

                <div className="space-y-3 w-full">
                  <Label>Situação funcional</Label>
                  <div className="grid grid-cols-2 gap-3 w-full">
                    <RadioCard label="Ativo" selected={situacao === 'regular'} onClick={() => setSituacao('regular')} />
                    <RadioCard label="Inativo" selected={situacao === 'inativo'} onClick={() => setSituacao('inativo')} />
                  </div>
                </div>

                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 w-full">
                  <Field label="E-mail" htmlFor="email" error={erros.email}>
                    <Input id="email" type="email" placeholder="exemplo@email.com" value={email} onChange={(e) => setEmail(e.target.value)} invalid={!!erros.email} disabled={enviando} />
                  </Field>
                  <Field label="Telefone com WhatsApp" htmlFor="telefone" error={erros.telefone}>
                    <Input id="telefone" placeholder="(00) 00000-0000" value={telefone} onChange={(e) => setTelefone(mascararTelefone(e.target.value))} maxLength={16} invalid={!!erros.telefone} disabled={enviando} />
                  </Field>
                </div>
              </div>

              {/* ----------------------------------------------------
                  REFINAMENTO DO RODAPÉ (INÍCIO)
                  ---------------------------------------------------- */}
              
              <div className="space-y-6 pt-4">
                
                {/* 1. ÁREA DOS TERMOS (CARD PREMIUM) */}
                <div className={cn(
                  "rounded-[16px] border p-5 transition-all duration-300 w-full shadow-sm",
                  consent ? "border-primary/40 bg-white/80" : "border-[#E7E7E7] bg-white/60",
                  erros.consent && "border-destructive/50 bg-destructive/5"
                )}>
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "p-2 rounded-xl shrink-0 transition-colors duration-300",
                      consent ? "bg-primary/10 text-primary" : "bg-slate-100 text-slate-400"
                    )}>
                      <ShieldCheck className="h-6 w-6" />
                    </div>
                    <div className="flex flex-col gap-3 min-w-0">
                      <label htmlFor="consent" className="flex items-start gap-3 cursor-pointer group">
                        <Checkbox
                          id="consent"
                          checked={consent}
                          onCheckedChange={(v) => setConsent(v === true)}
                          disabled={enviando}
                          className="mt-0.5 h-5 w-5 transition-transform active:scale-95"
                        />
                        <span className="text-[13px] leading-relaxed text-slate-700 font-medium">
                          Declaro que as informações prestadas são verdadeiras e autorizo a SBPM a entrar em contato para dar continuidade ao processo de associação.
                        </span>
                      </label>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pl-8">
                        <Link 
                          to="/privacidade" 
                          target="_blank"
                          className="text-[11px] font-bold text-primary hover:underline underline-offset-4 decoration-primary/40 transition-all"
                        >
                          Política de Privacidade
                        </Link>
                        <span className="text-[10px] text-slate-300">•</span>
                        <Link 
                          to="/privacidade#termos" 
                          target="_blank"
                          className="text-[11px] font-bold text-primary hover:underline underline-offset-4 decoration-primary/40 transition-all"
                        >
                          Termos de Uso
                        </Link>
                      </div>
                    </div>
                  </div>
                  {erros.consent && (
                    <p className="mt-3 pl-14 text-[11px] font-bold text-destructive animate-in fade-in slide-in-from-top-1">
                      {erros.consent}
                    </p>
                  )}
                </div>

                {/* BOTÕES E AÇÕES */}
                <div className="space-y-4 pt-2">
                  
                  {/* 2. BOTÃO PRINCIPAL (PREMIUM) */}
                  <Button 
                    type="submit" 
                    disabled={enviando}
                    className={cn(
                      "w-full h-[56px] rounded-[14px] text-base font-bold text-white shadow-lg transition-all",
                      "bg-[#198754] hover:bg-[#157347] active:bg-[#146C43] active:scale-[0.98] hover:-translate-y-0.5",
                      "flex items-center justify-center gap-3",
                      enviando && "opacity-80 cursor-not-allowed"
                    )}
                  >
                    {enviando ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Enviando pré-cadastro...</span>
                      </>
                    ) : (
                      <>
                        <Send className="h-5 w-5" />
                        <span>Enviar pré-cadastro</span>
                      </>
                    )}
                  </Button>

                  {/* 3. BOTÕES SECUNDÁRIOS */}
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 rounded-[14px] border-slate-200 text-slate-600 font-semibold hover:bg-slate-50 transition-all group"
                      onClick={() => navigate('/')}
                      disabled={enviando}
                    >
                      <ArrowLeft className="h-4 w-4 mr-2 transition-transform group-hover:-translate-x-1" />
                      Voltar
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      className="h-12 rounded-[14px] border-[#198754]/30 text-[#198754] font-semibold hover:bg-[#198754]/5 transition-all group"
                      onClick={() => setShowHelp(true)}
                      disabled={enviando}
                    >
                      <CircleHelp className="h-4 w-4 mr-2 transition-transform group-hover:scale-110" />
                      Ajuda (?)
                    </Button>
                  </div>

                  {/* 4. TEXTO EXPLICATIVO */}
                  <p className="text-[12px] text-muted-foreground text-center leading-relaxed px-4">
                    O envio deste formulário representa apenas um pré-cadastro.
                    Após a análise das informações, a equipe da SBPM entrará em contato para solicitar a documentação necessária e dar continuidade ao processo de associação.
                  </p>

                  {/* 5. ETAPAS DO PROCESSO (STEPPER) */}
                  <div className="pt-6 space-y-6">
                    <div className="h-[1px] w-full bg-slate-100" />
                    
                    {/* Stepper Responsivo */}
                    <div className="animate-in fade-in duration-700">
                      {/* Desktop/Tablet Stepper (Horizontal) */}
                      <div className="hidden sm:flex items-center justify-between w-full px-2">
                        <StepItem number="1" label="Pré-cadastro" active />
                        <StepLine />
                        <StepItem number="2" label="Validação" />
                        <StepLine />
                        <StepItem number="3" label="Contato" />
                        <StepLine />
                        <StepItem number="4" label="Envio SAEB" />
                        <StepLine />
                        <StepItem number="5" label="Concluído" />
                      </div>

                      {/* Mobile Stepper (Vertical) */}
                      <div className="sm:hidden flex flex-col items-center gap-3">
                        <StepItemVertical number="1" label="Pré-cadastro" active />
                        <StepLineVertical />
                        <StepItemVertical number="2" label="Validação" />
                        <StepLineVertical />
                        <StepItemVertical number="3" label="Contato da SBPM" />
                        <StepLineVertical />
                        <StepItemVertical number="4" label="Envio da SAEB" />
                        <StepLineVertical />
                        <StepItemVertical number="5" label="Associação concluída" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </form>
          </CardContent>
        </Card>
      </PublicFlowModal>

      {/* MODAL DE AJUDA */}
      <Dialog open={showHelp} onOpenChange={setShowHelp}>
        <DialogContent className="rounded-[28px] max-w-md bg-white border-0 shadow-2xl p-0 overflow-hidden">
          <div className="p-8 space-y-6">
            <div className="flex items-center gap-4">
              <div className="bg-primary/10 p-3 rounded-2xl">
                <CircleHelp className="h-8 w-8 text-primary" />
              </div>
              <DialogHeader className="text-left p-0 m-0">
                <DialogTitle className="text-xl font-bold text-primary">Como funciona a associação?</DialogTitle>
                <DialogDescription>Entenda o passo a passo simplificado.</DialogDescription>
              </DialogHeader>
            </div>
            
            <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
              <div className="flex gap-4">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">1</div>
                <p>Você envia este <strong>pré-cadastro</strong> com seus dados básicos.</p>
              </div>
              <div className="flex gap-4">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">2</div>
                <p>Nossa equipe <strong>analisa as informações</strong> e valida sua elegibilidade.</p>
              </div>
              <div className="flex gap-4">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">3</div>
                <p>Entramos em <strong>contato via WhatsApp ou E-mail</strong> para solicitar fotos de documentos.</p>
              </div>
              <div className="flex gap-4">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">4</div>
                <p>Com os documentos, geramos a <strong>SAEB</strong> para início do desconto em folha.</p>
              </div>
              <div className="flex gap-4">
                <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">5</div>
                <p>Pronto! Você recebe seu <strong>acesso ao Portal</strong> e sua carteirinha digital.</p>
              </div>
            </div>
            
            <div className="pt-2">
              <Button 
                className="w-full h-12 rounded-xl font-bold" 
                onClick={() => setShowHelp(false)}
              >
                Entendi, fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </AuthBackgroundLayout>
  );
}

/* Componentes Auxiliares para o Stepper */

function StepItem({ number, label, active = false }: { number: string; label: string; active?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5 shrink-0">
      <div className={cn(
        "h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all duration-500",
        active ? "bg-primary text-white shadow-md shadow-primary/30" : "bg-slate-100 text-slate-400"
      )}>
        {number}
      </div>
      <span className={cn(
        "text-[9px] font-bold tracking-tight text-center uppercase whitespace-nowrap",
        active ? "text-primary" : "text-slate-400"
      )}>
        {label}
      </span>
    </div>
  );
}

function StepLine() {
  return <div className="h-[1px] flex-grow mx-2 bg-slate-200" />;
}

function StepItemVertical({ number, label, active = false }: { number: string; label: string; active?: boolean }) {
  return (
    <div className="flex items-center gap-3 w-full">
      <div className={cn(
        "h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 transition-all duration-500",
        active ? "bg-primary text-white shadow-md shadow-primary/30" : "bg-slate-100 text-slate-400"
      )}>
        {number}
      </div>
      <span className={cn(
        "text-[12px] font-bold text-slate-600",
        active && "text-primary"
      )}>
        {label}
      </span>
    </div>
  );
}

function StepLineVertical() {
  return <div className="h-4 w-[2px] bg-slate-100 my-0.5 ml-3.5" />;
}
