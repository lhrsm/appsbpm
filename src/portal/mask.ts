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

/* ------------------------------------------------------------------ *
 * Descrições acessíveis (Fase 13 — WCAG 2.2 AA)
 * Leitores de tela não devem anunciar "asterisco asterisco asterisco".
 * ------------------------------------------------------------------ */

/** "Matrícula final 456" */
export function describeMatricula(matricula?: string | null): string {
  if (!matricula) return "Matrícula não informada";
  const clean = String(matricula).trim();
  if (clean.length <= 3) return "Matrícula protegida";
  return `Matrícula final ${clean.slice(-3).split("").join(" ")}`;
}

/** "CPF final 12" */
export function describeCPF(cpf?: string | null): string {
  const digits = String(cpf ?? "").replace(/\D/g, "");
  if (!digits) return "CPF não informado";
  return `CPF final ${digits.slice(-2).split("").join(" ")}`;
}

/** "E-mail começando com jo, no domínio dominio.com" */
export function describeEmail(email?: string | null): string {
  if (!email || !email.includes("@")) return "E-mail não informado";
  const [user, domain] = email.split("@");
  return `E-mail começando com ${user.slice(0, 2)}, no domínio ${domain}`;
}

/** "Telefone final 4321" */
export function describeTelefone(tel?: string | null): string {
  const digits = String(tel ?? "").replace(/\D/g, "");
  if (!digits) return "Telefone não informado";
  return `Telefone final ${digits.slice(-4).split("").join(" ")}`;
}

/** "Nome protegido, iniciais J S" */
export function describeNome(nome?: string | null): string {
  if (!nome) return "Nome não informado";
  const parts = nome.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "Nome não informado";
  const iniciais = [parts[0], parts[parts.length - 1]]
    .filter(Boolean)
    .map((p) => p[0].toUpperCase())
    .join(" ");
  return `Nome protegido, iniciais ${iniciais}`;
}
