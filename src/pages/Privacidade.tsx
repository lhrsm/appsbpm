import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Mail, Shield } from 'lucide-react';
import sbpmLogo from '@/assets/sbpm-logo.jpeg';

export default function Privacidade() {
  return (
    <div className="min-h-dvh bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <a
        href="#conteudo-privacidade"
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
                Política de Privacidade
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
        id="conteudo-privacidade"
        className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12"
      >
        <div className="mb-8 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Shield className="h-6 w-6" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">
              Conforme a Lei Geral de Proteção de Dados (Lei nº 13.709/2018)
            </p>
            <p className="text-xs text-muted-foreground">
              Última atualização: 21 de julho de 2026
            </p>
          </div>
        </div>

        <article className="prose prose-sm max-w-none space-y-6 text-foreground sm:prose-base">
          <section aria-labelledby="s-controlador">
            <h2 id="s-controlador" className="text-lg font-semibold sm:text-xl">
              1. Quem é o controlador
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              A Sociedade Beneficente da Polícia Militar da Bahia (SBPM) é a
              controladora dos dados pessoais tratados neste Portal do Associado
              e responde por decisões referentes ao tratamento dessas
              informações.
            </p>
          </section>

          <section aria-labelledby="s-dados">
            <h2 id="s-dados" className="text-lg font-semibold sm:text-xl">
              2. Dados que tratamos
            </h2>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <li>Dados cadastrais: nome, matrícula, CPF, data de nascimento, contatos.</li>
              <li>Dados de dependentes vinculados ao titular associado.</li>
              <li>Informações de utilização de benefícios (limites, procedimentos, informes de rendimentos).</li>
              <li>Foto de perfil (quando o próprio associado optar por enviar).</li>
              <li>Dados técnicos mínimos de sessão (autenticação e preferências).</li>
            </ul>
          </section>

          <section aria-labelledby="s-finalidade">
            <h2 id="s-finalidade" className="text-lg font-semibold sm:text-xl">
              3. Finalidade e base legal
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Utilizamos seus dados para: (i) autenticar seu acesso; (ii)
              disponibilizar sua carteirinha digital e a de seus dependentes;
              (iii) exibir limites, informes de rendimentos e rede credenciada;
              (iv) permitir o envio de indicações no programa Associação
              Premiada. As bases legais aplicáveis são a execução de contrato
              associativo, o cumprimento de obrigação legal/regulatória e o
              legítimo interesse, nos termos dos arts. 7º e 10 da LGPD.
            </p>
          </section>

          <section aria-labelledby="s-compartilhamento">
            <h2 id="s-compartilhamento" className="text-lg font-semibold sm:text-xl">
              4. Compartilhamento
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Compartilhamos dados apenas com operadores estritamente necessários
              (provedor de hospedagem/infraestrutura, envio de e-mail e
              mensageria) e com autoridades quando exigido por lei. Não vendemos
              dados pessoais.
            </p>
          </section>

          <section aria-labelledby="s-retencao">
            <h2 id="s-retencao" className="text-lg font-semibold sm:text-xl">
              5. Retenção
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Retemos seus dados enquanto perdurar o vínculo associativo e pelos
              prazos legais aplicáveis (por exemplo, fiscal e regulatório). Após
              esse período, os dados são eliminados ou anonimizados.
            </p>
          </section>

          <section aria-labelledby="s-direitos">
            <h2 id="s-direitos" className="text-lg font-semibold sm:text-xl">
              6. Seus direitos como titular
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Nos termos do art. 18 da LGPD, você pode solicitar, a qualquer
              tempo:
            </p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-sm leading-relaxed text-muted-foreground sm:text-base">
              <li>Confirmação de tratamento e acesso aos seus dados.</li>
              <li>Correção de dados incompletos, inexatos ou desatualizados.</li>
              <li>Anonimização, bloqueio ou eliminação de dados desnecessários.</li>
              <li>Portabilidade a outro fornecedor de serviço.</li>
              <li>Eliminação de dados tratados com base no consentimento.</li>
              <li>Informação sobre com quem compartilhamos seus dados.</li>
              <li>Revogação do consentimento.</li>
            </ul>
          </section>

          <section aria-labelledby="s-seguranca">
            <h2 id="s-seguranca" className="text-lg font-semibold sm:text-xl">
              7. Segurança da informação
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Adotamos medidas técnicas e administrativas para proteger seus
              dados contra acessos não autorizados, incluindo criptografia em
              trânsito, políticas de acesso restrito e controles de auditoria.
            </p>
          </section>

          <section aria-labelledby="s-cookies">
            <h2 id="s-cookies" className="text-lg font-semibold sm:text-xl">
              8. Cookies e armazenamento local
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Utilizamos apenas cookies e armazenamento local estritamente
              necessários ao funcionamento do Portal (por exemplo, para manter
              sua sessão e sua preferência de consentimento). Não utilizamos
              cookies de publicidade.
            </p>
          </section>

          <section aria-labelledby="s-contato" className="rounded-lg border bg-card p-4 sm:p-6">
            <h2 id="s-contato" className="text-lg font-semibold sm:text-xl">
              9. Encarregado (DPO) e canal de atendimento
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Para exercer seus direitos ou tirar dúvidas sobre este documento,
              entre em contato com nosso canal de privacidade:
            </p>
            <div className="mt-3 space-y-1 text-sm sm:text-base">
              <p><strong>DPO:</strong> Encarregado de Proteção de Dados da SBPM</p>
              <p>
                <strong>E-mail:</strong>{' '}
                <a
                  href="mailto:previdencia@sbpmbahia.com.br?subject=LGPD%20-%20Solicita%C3%A7%C3%A3o%20de%20Titular"
                  className="inline-flex items-center gap-2 font-medium text-primary underline underline-offset-2 hover:opacity-80"
                >
                  <Mail className="h-4 w-4" aria-hidden="true" />
                  previdencia@sbpmbahia.com.br
                </a>
              </p>
              <p><strong>Telefone:</strong> (71) 98549-6972</p>
              <p><strong>Prazo de resposta:</strong> até 15 dias úteis (art. 19, LGPD)</p>
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              Associados logados podem exercer seus direitos diretamente pelo Portal em{' '}
              <Link to="/dashboard/minha-privacidade" className="text-primary underline">Central de Privacidade</Link>.
              Também é possível apresentar reclamação à ANPD em{' '}
              <a href="https://www.gov.br/anpd" target="_blank" rel="noreferrer" className="text-primary underline">gov.br/anpd</a>.
            </p>
          </section>
        </article>
      </main>
    </div>
  );
}
