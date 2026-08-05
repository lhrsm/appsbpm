export default function RoutesIndex() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in whitespace-pre-wrap">
AJUSTAR EXCLUSIVAMENTE O LAYOUT DESKTOP DA PÁGINA INICIAL.

O último ajuste não atingiu o objetivo.

A modal continua centralizada.

Quero uma composição semelhante às landing pages modernas, onde a imagem ocupa a esquerda e a interface ocupa a direita.

==========================

DESKTOP SOMENTE

==========================

Aplicar SOMENTE para telas acima de 1280px.

Não alterar:

- Mobile

- Tablet

- PWA

==========================

1. POSICIONAMENTO

==========================

A modal NÃO deverá mais ficar centralizada.

Ela deverá ficar posicionada aproximadamente entre 62% e 65% da largura da viewport.

Exemplo:

ANTES

      MODAL

DEPOIS

                     MODAL

Ou seja, deslocar aproximadamente de 180px a 260px para a direita (dependendo da largura da tela).

Pode utilizar, por exemplo:

left: 63%;

transform: translateX(-50%);

ou outra técnica equivalente.

O importante é que a modal fique claramente na metade direita da tela.

==========================

2. AUMENTAR A LARGURA

==========================

Aumentar a largura da modal entre 15% e 20%.

Hoje ela parece estreita.

Quero aproximadamente:

largura atual:

~420px

nova largura:

520~560px

Sem alterar a altura automaticamente.

==========================

3. AUMENTAR OS CARDS

==========================

Após aumentar a largura da modal:

- aumentar a largura dos três cards;

- aumentar a largura do botão Recuperar acesso;

- aumentar a largura dos quatro botões inferiores.

Não aumentar significativamente a altura.

==========================

4. APROVEITAR O ESPAÇO DA DIREITA

==========================

Hoje existe muito espaço vazio entre a modal e o mar.

Quero que esse espaço diminua.

A composição deverá ficar:

POLICIAIS (esquerda)

               MODAL (direita)

MAR (ao fundo)

==========================

5. BACKGROUND

==========================

Não alterar:

✓ transparência

✓ efeito glass

✓ borda verde

✓ blur

✓ background

==========================

6. RESPONSIVIDADE

==========================

Essas alterações devem ocorrer SOMENTE acima de 1280px.

Abaixo disso, manter exatamente como está.

==========================

RESULTADO ESPERADO

==========================

Quero que a imagem dos policiais ocupe mais protagonismo na esquerda e a interface fique posicionada na direita, semelhante às landing pages da Microsoft, Stripe e Apple.

Não centralizar mais a modal.
    </div>
  );
}
