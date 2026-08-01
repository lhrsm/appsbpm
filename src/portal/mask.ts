/** Máscaras de segurança visual do portal externo. */

/** Matrícula mascarada: 123456 -> ***456 */
export function maskMatricula(matricula?: string | null): string {
  if (!matricula) return "—";
  const clean = String(matricula).trim();
  if (clean.length <= 3) return "***";
  return `***${clean.slice(-3)}`;
}

/** Nome reduzido: "João Carlos Silva" -> "J*** S****" */
export function maskNome(nome?: string | null): string {
  if (!nome) return "—";
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "—";
  const pick = parts.length > 1 ? [parts[0], parts[parts.length - 1]] : [parts[0]];
  return pick.map((p) => `${p[0].toUpperCase()}${"*".repeat(Math.max(p.length - 1, 1))}`).join(" ");
}

/** E-mail mascarado: joao@dominio.com -> jo***@dominio.com */
export function maskEmail(email?: string | null): string {
  if (!email || !email.includes("@")) return "—";
  const [user, domain] = email.split("@");
  const visible = user.slice(0, 2);
  return `${visible}${"*".repeat(Math.max(user.length - 2, 2))}@${domain}`;
}

/** Primeiro nome para saudações. */
export function primeiroNome(nome?: string | null): string {
  if (!nome) return "";
  return nome.trim().split(/\s+/)[0];
}
