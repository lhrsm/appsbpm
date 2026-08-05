export default function RoutesIndex() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in whitespace-pre-wrap">
AJUSTAR EXCLUSIVAMENTE O LAYOUT DESKTOP DA TELA INICIAL DO PORTAL SBPM

A versão mobile e PWA já está próxima do resultado esperado.

Agora quero um refinamento EXCLUSIVO para DESKTOP.

IMPORTANTE

NÃO alterar:

- Mobile

- Tablet

- PWA

- Responsividade atual

- Glassmorphism

- Transparência

- Bordas

- Botões

- Cards

- Fontes

Todas as alterações abaixo devem ocorrer apenas em telas acima de 1200px.

====================================================

1. DESLOCAR A MODAL MAIS PARA A DIREITA

Hoje a modal está praticamente centralizada.

Quero que ela fique aproximadamente entre 58% e 62% da largura da tela.

Ou seja:

- manter os militares totalmente visíveis à esquerda;

- aproveitar melhor o espaço do mar à direita;

- criar uma composição visual mais elegante.

Exemplo:

ANTES

[Militares]      [Modal]

DEPOIS

[Militares]           [Modal]

A alteração deve ocorrer apenas no Desktop.

====================================================

2. AUMENTAR UM POUCO A MODAL

A modal pode crescer aproximadamente:

• largura: +12%

• altura: automática

Não quero uma modal gigante.

Quero apenas que ela fique mais confortável visualmente.

====================================================

3. AUMENTAR O ESPAÇO INTERNO

Depois que aumentar a modal:

- aumentar ligeiramente os paddings;

- aumentar o respiro entre seções;

- aumentar o espaço entre título e subtítulo.

Sem exageros.

====================================================

4. AUMENTAR OS CARDS

Os três cards podem ficar um pouco maiores.

Aumentar apenas:

- largura;

- padding interno;

- espaçamento horizontal.

Não aumentar muito a altura.

====================================================

5. BOTÃO RECUPERAR ACESSO

Pode acompanhar a largura dos cards.

Manter exatamente a mesma identidade visual.

====================================================

6. LINKS INFERIORES

Os quatro botões inferiores podem ficar um pouco maiores.

Aumentar:

- largura;

- padding;

- espaçamento entre eles.

Continuar em grade 2x2.

====================================================

7. MANTER O BACKGROUND EM DESTAQUE

Não aumentar a opacidade da modal.

Continuar permitindo visualizar perfeitamente:

- os policiais;

- o farol;

- o mar;

- o pôr do sol.

====================================================

8. RESPONSIVIDADE

Essas alterações devem ocorrer somente em:

min-width: 1200px

Para resoluções menores:

- não alterar absolutamente nada.

====================================================

9. RESULTADO ESPERADO

Quero um layout semelhante aos grandes portais institucionais modernos:

- Gov.br

- Microsoft

- Apple

- Stripe

Onde existe bastante espaço lateral, excelente equilíbrio visual e uma composição elegante.

A versão mobile/PWA deve permanecer exatamente como está.
    </div>
  );
}
