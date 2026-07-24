/** Validates a Brazilian CPF (11 digits, valid check digits). */
export function isValidCPF(cpf?: string | null): boolean {
  if (!cpf) return false;
  const c = cpf.replace(/\D/g, '');
  if (c.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(c)) return false;
  const calc = (base: string, factor: number) => {
    let sum = 0;
    for (let i = 0; i < base.length; i++) sum += parseInt(base[i], 10) * (factor - i);
    const r = (sum * 10) % 11;
    return r === 10 ? 0 : r;
  };
  const d1 = calc(c.slice(0, 9), 10);
  const d2 = calc(c.slice(0, 10), 11);
  return d1 === parseInt(c[9], 10) && d2 === parseInt(c[10], 10);
}

/** Validates SBPM matrícula: 4 to 8 digits (numeric only). */
export function isValidMatricula(m?: string | null): boolean {
  if (!m) return false;
  const s = m.replace(/\D/g, '');
  return s.length >= 4 && s.length <= 8;
}

/** Validates an email loosely (RFC 5322-lite). */
export function isValidEmail(email?: string | null): boolean {
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
