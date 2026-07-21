import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Accessibility, Mail } from 'lucide-react';
import sbpmLogo from '@/assets/sbpm-logo.jpeg';

export default function Acessibilidade() {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <a
        href="#conteudo-acessibilidade"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-primary focus:px-4 focus:py-2 focus:text-primary-foreground"
      >
        Pular para o conteúdo
      </a>

      <header className="border-b bg-background">
        <div className="mx-auto flex max-w-4xl items-center justify-between gap-4 p-4">
          <div className="flex items-center gap-3">
            <img
              src={sbpmLogo}
              alt=""
              aria-hidden="true"
              className="h-10 w-auto object-contain mix-blend-multiply"
            />
            <div>
              <p className="text-xs text-muted-foreground">SBPM</p>
              <h1 className="text-base font-semibold text-foreground sm:text-lg">
                Acessibilidade
              </h1>
            </div>
          </div>
          <Button asChild variant="outline" size="sm">
            <Link to="/" aria-label="Voltar para a página inicial">
              <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
              Voltar
            </Link>
          </Button>
        </div>
      </header>

      <main
        id="conteudo-acessibilidade"
        className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12"
      >
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Accessibility className="h-6 w-6" aria-hidden="true" />
          </div>
          <p className="text-sm text-muted-foreground">
            Nosso compromisso com um portal acessível a todos.
          </p>
        </div>

        <article className="space-y-6">
          <section>
            <h2 className="text-lg font-semibold sm:text-xl">Compromisso</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Trabalhamos continuamente para que o Portal do Associado SBPM
              atenda às recomendações das{' '}
              <abbr title="Web Content Accessibility Guidelines">WCAG</abbr> 2.1
              em nível AA e à Lei Brasileira de Inclusão (Lei nº 13.146/2015).
            </p>
          </section>

          <section>
            <h2 className="text-lg font-semibold sm:text-xl">Recursos disponíveis</h2>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <li>Navegação completa por teclado (Tab, Shift+Tab, Enter e Esc).</li>
              <li>Foco visível em todos os elementos interativos.</li>
              <li>Marcação semântica com landmarks (cabeçalho, principal, navegação).</li>
              <li>Contraste de cores adequado seguindo o padrão AA.</li>
              <li>Textos alternativos em imagens informativas.</li>
              <li>Rótulos (labels) em todos os campos de formulário.</li>
              <li>Zoom até 200% sem perda de conteúdo.</li>
              <li>Compatibilidade com leitores de tela (NVDA, VoiceOver, TalkBack).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-lg font-semibold sm:text-xl">Atalhos de teclado</h2>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <li><kbd>Tab</kbd> — avança pelos elementos interativos.</li>
              <li><kbd>Shift</kbd> + <kbd>Tab</kbd> — retorna ao elemento anterior.</li>
              <li><kbd>Enter</kbd> / <kbd>Espaço</kbd> — ativa botões e links.</li>
              <li><kbd>Esc</kbd> — fecha caixas de diálogo e modais.</li>
            </ul>
          </section>

          <section className="rounded-lg border bg-card p-4 sm:p-6">
            <h2 className="text-lg font-semibold sm:text-xl">Encontrou uma barreira?</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Se você encontrou alguma dificuldade de acesso, fale conosco para
              que possamos corrigir rapidamente.
            </p>
            <p className="mt-3">
              <a
                href="mailto:contato@sbpmbahia.com.br?subject=Acessibilidade%20-%20Portal%20do%20Associado"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary underline underline-offset-2 hover:opacity-80 sm:text-base"
              >
                <Mail className="h-4 w-4" aria-hidden="true" />
                contato@sbpmbahia.com.br
              </a>
            </p>
          </section>
        </article>
      </main>
    </div>
  );
}
