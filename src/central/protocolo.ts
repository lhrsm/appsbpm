/**
 * Numeração institucional de protocolos (Fase 9, §5).
 *
 * Padrão: SBPM-AAAA-000000000 (9 dígitos sequenciais).
 * A geração definitiva é responsabilidade do backend/SBPMSanitas; aqui apenas
 * formatamos, validamos e criamos um número determinístico de contingência.
 */

const PREFIXO = "SBPM";
export const PROTOCOLO_REGEX = /^SBPM-\d{4}-\d{9}$/;

/** Formata sequência + ano no padrão institucional. */
export function formatarProtocolo(sequencia: number, ano = new Date().getFullYear()): string {
  return `${PREFIXO}-${ano}-${String(Math.abs(Math.trunc(sequencia))).padStart(9, "0")}`;
}

export const isProtocoloValido = (valor?: string | null) => !!valor && PROTOCOLO_REGEX.test(valor.trim().toUpperCase());

/**
 * Normaliza um protocolo vindo de qualquer origem.
 * Registros antigos (sem numeração) recebem um número derivado do id, mantendo
 * o mesmo valor entre sessões — nada de números aleatórios na tela.
 */
export function normalizarProtocolo(valor: string | null | undefined, id: string, criadoEm?: string | null): string {
  const bruto = (valor ?? "").trim().toUpperCase();
  if (isProtocoloValido(bruto)) return bruto;

  const somenteDigitos = bruto.replace(/\D/g, "");
  const ano = criadoEm ? new Date(criadoEm).getFullYear() : new Date().getFullYear();
  if (somenteDigitos.length >= 4) return formatarProtocolo(Number(somenteDigitos.slice(-9)), ano);

  // Deriva um sequencial estável a partir do identificador do registro.
  let hash = 0;
  for (const char of id) hash = (hash * 31 + char.charCodeAt(0)) % 1_000_000_000;
  return formatarProtocolo(hash, ano);
}

/** Aceita "sbpm2026123", "SBPM-2026-000000123" ou só os dígitos em consultas. */
export function interpretarConsultaProtocolo(entrada: string): string | null {
  const limpo = entrada.trim().toUpperCase().replace(/\s+/g, "");
  if (isProtocoloValido(limpo)) return limpo;
  const digitos = limpo.replace(/\D/g, "");
  if (digitos.length >= 13) return formatarProtocolo(Number(digitos.slice(4)), Number(digitos.slice(0, 4)));
  if (digitos.length >= 1) return digitos;
  return null;
}

/** Comparação tolerante usada na busca por protocolo. */
export function protocoloCombina(protocolo: string, consulta: string): boolean {
  const a = protocolo.replace(/\D/g, "");
  const b = consulta.replace(/\D/g, "");
  if (!b) return false;
  return a.includes(b) || protocolo.toUpperCase().includes(consulta.trim().toUpperCase());
}
