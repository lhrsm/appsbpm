import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CreditCard, Building2, Bell, ShieldCheck, UserCog, Sparkles } from "lucide-react";

interface Step {
  icon: React.ElementType;
  title: string;
  description: string;
}

const STEPS_TITULAR: Step[] = [
  { icon: Sparkles, title: "Bem-vindo(a) ao portal SBPM!", description: "Faça um tour rápido pelos principais recursos disponíveis para você e seus dependentes." },
  { icon: CreditCard, title: "Carteirinha digital", description: "Acesse e apresente sua carteirinha do titular e dos dependentes a qualquer momento — inclusive off-line." },
  { icon: Building2, title: "Rede credenciada", description: "Consulte clínicas e parceiros com filtros por especialidade, cidade e estado. Fale direto pelo WhatsApp." },
  { icon: Bell, title: "Notificações e comunicados", description: "Ative notificações push para receber avisos importantes da SBPM em tempo real." },
  { icon: ShieldCheck, title: "Segurança e privacidade", description: "Sua sessão bloqueia automaticamente após 10 minutos sem uso. Consulte seus dados e acessos recentes em 'Meu Perfil'." },
  { icon: UserCog, title: "Personalize seu perfil", description: "Atualize foto, e-mail, telefone e endereço na página 'Meu Perfil'. Tudo pronto para começar!" },
];

const STEPS_DEP: Step[] = [
  { icon: Sparkles, title: "Bem-vindo(a) ao portal SBPM!", description: "Você tem acesso rápido à sua carteirinha, clínicas credenciadas e canais de atendimento." },
  { icon: CreditCard, title: "Sua carteirinha", description: "Apresente sua carteirinha digital nas clínicas e parceiros. Baixe em PDF quando precisar." },
  { icon: Building2, title: "Rede credenciada", description: "Encontre clínicas e parceiros por especialidade e cidade, com contato via WhatsApp." },
  { icon: UserCog, title: "Seu perfil", description: "Atualize foto, e-mail e telefone em 'Meu Perfil'. Bom uso do portal!" },
];

const STORAGE_KEY = "sbpm.welcome_tour.v1";

export default function WelcomeTour({ isDependente }: { isDependente: boolean }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const steps = isDependente ? STEPS_DEP : STEPS_TITULAR;

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setOpen(true);
    } catch {}
  }, []);

  const finish = () => {
    try { localStorage.setItem(STORAGE_KEY, "1"); } catch {}
    setOpen(false);
  };

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) finish(); }}>
      <DialogContent className="max-w-[420px] w-[calc(100%-32px)] max-h-[85vh] gap-0 overflow-hidden flex flex-col p-0 border-none shadow-2xl bg-[var(--lgpd-sheet-bg-light)] dark:bg-[var(--lgpd-sheet-bg-dark)] backdrop-blur-[var(--lgpd-blur)] -webkit-backdrop-blur-[var(--lgpd-blur)]">
        <div className="overflow-y-auto p-6 flex-1">
          <DialogHeader className="gap-2">
            <div className="mx-auto mb-2 w-14 h-14 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Icon className="w-7 h-7" aria-hidden />
            </div>
            <DialogTitle className="text-center text-xl">{current.title}</DialogTitle>
            <DialogDescription className="text-center text-sm">
              {current.description}
            </DialogDescription>
          </DialogHeader>

          <div className="flex justify-center gap-2 py-6" role="tablist" aria-label="Progresso do tour">
            {steps.map((_, i) => (
              <span
                key={i}
                className={`h-1.5 rounded-full transition-all duration-300 ${i === step ? "w-6 bg-primary" : "w-1.5 bg-muted"}`}
                aria-current={i === step ? "step" : undefined}
              />
            ))}
          </div>
        </div>

        <DialogFooter className="flex-row items-center justify-between gap-2 p-4 border-t border-white/20 dark:border-white/10 bg-muted/20">
          <Button variant="ghost" size="sm" onClick={finish} className="text-muted-foreground hover:text-foreground">
            Pular
          </Button>
          <div className="flex gap-2">
            {step > 0 && (
              <Button variant="outline" size="sm" onClick={() => setStep((s) => s - 1)}>
                Anterior
              </Button>
            )}
            {isLast ? (
              <Button size="sm" onClick={finish} className="px-6">
                Começar
              </Button>
            ) : (
              <Button size="sm" onClick={() => setStep((s) => s + 1)} className="px-6">
                Próximo
              </Button>
            )}
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
