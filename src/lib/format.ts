export function formatCPF(cpf?: string | null): string {
  if (!cpf) return '';
  const c = cpf.replace(/\D/g, '');
  if (c.length !== 11) return cpf;
  return `${c.slice(0, 3)}.${c.slice(3, 6)}.${c.slice(6, 9)}-${c.slice(9)}`;
}

/** Masks CPF for display: 123.***.***-45 */
export function maskCPF(cpf?: string | null): string {
  if (!cpf) return '';
  const c = cpf.replace(/\D/g, '');
  if (c.length !== 11) return cpf;
  return `${c.slice(0, 3)}.***.***-${c.slice(9)}`;
}

export function formatPhone(phone?: string | null): string {
  if (!phone) return '';
  const p = phone.replace(/\D/g, '');
  if (p.length === 11) return `(${p.slice(0, 2)}) ${p.slice(2, 7)}-${p.slice(7)}`;
  if (p.length === 10) return `(${p.slice(0, 2)}) ${p.slice(2, 6)}-${p.slice(6)}`;
  return phone;
}
