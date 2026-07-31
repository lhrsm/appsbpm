// Abstração de envio de e-mail transacional do acesso externo.
// EMAIL_PROVIDER = mock | resend

export interface SendEmailInput {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface TransactionalEmailService {
  readonly name: string;
  send(input: SendEmailInput): Promise<{ success: boolean; error?: string }>;
}

class MockEmailService implements TransactionalEmailService {
  readonly name = 'mock';
  async send(input: SendEmailInput) {
    // Modo demonstração: não envia e-mail real. O código fica disponível
    // apenas no painel administrativo restrito (nunca em log aberto).
    console.log(`[email:mock] envio simulado para ${maskEmail(input.to)} — ${input.subject}`);
    return { success: true };
  }
}

class ResendEmailService implements TransactionalEmailService {
  readonly name = 'resend';
  async send(input: SendEmailInput) {
    const key = Deno.env.get('RESEND_API_KEY');
    const from = Deno.env.get('EMAIL_FROM') || 'SBPM <nao-responda@sbpmbahia.com.br>';
    if (!key) return { success: false, error: 'RESEND_API_KEY ausente' };
    const res = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ from, to: [input.to], subject: input.subject, html: input.html }),
    });
    if (!res.ok) return { success: false, error: `[${res.status}] ${await res.text()}` };
    return { success: true };
  }
}

export const maskEmail = (email: string) => {
  const [u, d] = (email || '').split('@');
  if (!d) return '***';
  return `${(u || '').slice(0, 1)}${'*'.repeat(Math.max((u || '').length - 1, 3))}@${d}`;
};

export function getEmailService(): TransactionalEmailService {
  const cfg = (Deno.env.get('EMAIL_PROVIDER') || 'mock').toLowerCase();
  if (cfg === 'resend') return new ResendEmailService();
  return new MockEmailService();
}

export const codeEmailHtml = (code: string) => `
  <div style="font-family:Arial,sans-serif;padding:24px;color:#1f2937">
    <h2 style="color:#065f46">Portal da SBPM</h2>
    <p>Use o código abaixo para confirmar seu e-mail e concluir o primeiro acesso:</p>
    <p style="font-size:30px;letter-spacing:8px;font-weight:bold">${code}</p>
    <p>O código expira em 5 minutos. Se não foi você, ignore esta mensagem.</p>
  </div>`;
