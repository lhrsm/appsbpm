// Envio transacional compartilhado (Resend) + templates de segurança.
export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export const DEFAULT_FROM = 'Portal da SBPM <naoresponda@notify.sbpmbahia.com.br>';

export const maskEmail = (email: string) => {
  const [u, d] = (email || '').split('@');
  if (!d) return '***';
  return `${(u || '').slice(0, 1)}${'*'.repeat(Math.max((u || '').length - 1, 3))}@${d}`;
};

export async function enviarEmail(input: SendEmailInput) {
  const key = Deno.env.get('RESEND_API_KEY');
  if (!key) {
    console.log(`[email:mock] envio simulado para ${maskEmail(input.to)} — ${input.subject}`);
    return { success: true };
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      from: Deno.env.get('EMAIL_FROM') || DEFAULT_FROM,
      to: [input.to],
      subject: input.subject,
      html: input.html,
      text: input.text,
    }),
  });
  if (!res.ok) {
    console.error(`[email:resend] falha ${res.status} para ${maskEmail(input.to)}`);
    return { success: false };
  }
  return { success: true };
}

const layout = (titulo: string, corpo: string) => `
  <div style="font-family:Arial,sans-serif;padding:24px;color:#1f2937">
    <h2 style="color:#065f46;margin:0 0 12px">Portal da SBPM</h2>
    <h3 style="margin:0 0 12px">${titulo}</h3>
    ${corpo}
    <p style="font-size:12px;color:#6b7280;margin-top:24px">
      Esta é uma mensagem automática de segurança. Não responda a este e-mail.
    </p>
  </div>`;

export const templateCodigo = (codigo: string, contexto: string) =>
  layout('Confirme esta alteração', `
    <p>Use o código abaixo para confirmar ${contexto}:</p>
    <p style="font-size:30px;letter-spacing:8px;font-weight:bold">${codigo}</p>
    <p>O código expira em 10 minutos. Se não foi você, altere sua senha imediatamente.</p>`);

/** Alertas críticos de segurança — nunca incluem CPF, matrícula, códigos ou tokens. */
export const templateAlerta = (titulo: string, mensagem: string, quando = new Date()) =>
  layout(titulo, `
    <p>${mensagem}</p>
    <p><strong>Data:</strong> ${quando.toLocaleString('pt-BR', { timeZone: 'America/Bahia' })}</p>
    <p>Se você não reconhece esta atividade, acesse o portal em
      <em>Segurança &gt; Histórico de acessos</em> e encerre as demais sessões.</p>`);
