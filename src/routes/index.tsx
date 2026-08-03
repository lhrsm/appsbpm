export default function RoutesIndex() {
  return (
    <div className="p-8 max-w-5xl mx-auto space-y-8 animate-fade-in whitespace-pre-wrap">
      PARAR QUALQUER ALTERAÇÃO NO DASHBOARD.

O erro atual não está relacionado ao Supabase, RLS, identidade institucional, RPC ou consulta do associado.

O React está quebrando antes da aplicação iniciar.

Erro real:

React.Children.only expected to receive a single React element child.

Quero localizar exatamente onde esse erro está acontecendo.

1. Pesquise no projeto inteiro por:

React.Children.only

e também pelos componentes que internamente utilizam esse método.

Especialmente verificar:

- RootErrorBoundary
- ErrorBoundary
- BrowserRouter
- Tooltip
- TooltipProvider
- Dialog
- DialogTrigger
- Sheet
- DropdownMenu
- Popover
- Slot
- ThemeProvider
- QueryClientProvider
- Suspense
- AuthProvider
- AssociadoProvider

2. Identifique exatamente:

- arquivo;
- componente;
- linha;
- stack completa;
- qual componente está recebendo mais de um child.

3. Corrija o componente para obedecer ao contrato esperado.

Se ele espera:

&lt;Componente&gt;
    &lt;Filho /&gt;
&lt;/Componente&gt;

não renderizar:

&lt;Componente&gt;
    &lt;Filho1 /&gt;
    &lt;Filho2 /&gt;
&lt;/Componente&gt;

Agrupar corretamente quando necessário ou reorganizar a árvore de renderização.

4. Não alterar:

- dashboard;
- RPC;
- Supabase;
- RLS;
- login;
- contexto.

O único objetivo desta etapa é eliminar completamente o erro:

React.Children.only expected to receive a single React element child.

5. Depois da correção informar:

- arquivo;
- linha;
- componente;
- stack original;
- código antigo;
- código corrigido;
- motivo pelo qual havia mais de um child.
    </div>
  );
}