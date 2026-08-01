# Formulários do Portal SBPM — Fase 05

Biblioteca única de botões, campos, seleções, overlays e fluxo de envio.
Importe sempre por `@/portal/forms`.

## Botões (`buttons.tsx`)
| Componente | Uso |
|---|---|
| `PortalButton` | `primary` (1 por tela), `secondary`, `outline`, `ghost`, `danger`, `success`, `link` |
| `PortalIconButton` | Ícone isolado — `label` obrigatório (vira `aria-label` + tooltip), alvo 44px |
| `ActionLink` | Navegação textual dentro de conteúdo |

Estados: `loading` + `loadingText` desabilitam o botão e evitam duplo envio.

## Campos
- `FormField` — label, obrigatoriedade, ajuda, erro, sucesso, contador e `aria-*`.
- `TextInput`, `CPFInput`, `RegistrationInput`, `PhoneInput`, `EmailInput`, `PasswordInput` (força + Caps Lock), `DateInput`.
- `TextareaField` — contador e `autoResize` (sempre com `maxLength`).
- `SelectField` (nativo), `SearchableSelect` (listas longas).
- `RadioGroupField` (`list` | `cards` | `inline`), `CheckboxField`, `SwitchField`.
- `FileUploadField` — arrastar/soltar, prévia, progresso, validação de tipo/tamanho.
- `OTPInput` + `ResendCodeButton` — código de 6 dígitos com colagem e contagem.

## Fluxo (`PortalForm.tsx`)
- `PortalForm` — espaçamento padrão, resumo de erros, bloqueio de envio duplicado.
- `PortalFormActions` — rodapé responsivo (primário à direita no desktop).
- `FormErrorSummary`, `focusFirstError`, `SaveStatus`.

## Overlays (`overlays.tsx`)
- `PortalModal` (`sm`/`md`/`lg`/`xl`) para confirmações e formulários curtos.
- `PortalDrawer` — bottom sheet no mobile, painel lateral no desktop.
- `dismissible={false}` durante envios em andamento.

## Regras
1. Erros sempre em português, específicos e abaixo do campo (`role="alert"`).
2. Validação no blur; revalidação no change após o primeiro erro.
3. Máscaras são visuais — envie sempre o valor normalizado (`normalize*`).
4. Sucesso só após resposta do backend.
5. Alvos de toque mínimos de 44px e `inputMode` correto no mobile.

## Exemplo
```tsx
<PortalForm onSubmit={salvar} errors={erros} actions={<PortalFormActions submitLabel="Salvar" onCancel={fechar} />}>
  <FormField id="cpf" label="CPF" required error={erros.cpf}>
    {(field) => <CPFInput {...field} value={cpf} onChange={setCpf} />}
  </FormField>
</PortalForm>
```
