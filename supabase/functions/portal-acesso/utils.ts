
/**
 * Normaliza data do formato DD/MM/YYYY para ISO (YYYY-MM-DD).
 */
export function normalizeBirthDate(input: string | null | undefined): string | null {
  if (!input) return null;
  const trimmed = input.trim();
  
  if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
    return trimmed.split('T')[0];
  }

  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (!match) return null;

  const [, day, month, year] = match;
  return `${year}-${month}-${day}`;
}

export function validateBirthDate(input: string | null | undefined): boolean {
  const iso = normalizeBirthDate(input);
  if (!iso) return false;
  const [year, month, day] = iso.split('-').map(Number);
  if (year < 1900 || month < 1 || month > 12 || day < 1 || day > 31) return false;
  const daysInMonth = new Date(year, month, 0).getDate();
  if (day > daysInMonth) return false;
  const inputDate = new Date(year, month - 1, day);
  const now = new Date();
  if (inputDate > now) return false;
  return true;
}

// ... rest of validation logic ...
