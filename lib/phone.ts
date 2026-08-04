/** Russian numbers only: stored as +7XXXXXXXXXX, shown as +7 900 000-00-00. */
export function normalizePhone(raw: string): string | null {
  const trimmed = raw.trim();
  const digits = trimmed.replace(/\D/g, "");

  // An explicit +7 / 8 prefix is a country code, never part of the number —
  // otherwise "+7 916 240-11-0" would silently pass as a 10-digit number.
  const national =
    trimmed.startsWith("+7") || (digits.length === 11 && /^[78]/.test(digits))
      ? digits.slice(1)
      : digits;

  return national.length === 10 ? `+7${national}` : null;
}

export function formatPhone(value: string): string {
  const normalized = normalizePhone(value);
  if (!normalized) return value;
  const d = normalized.slice(2);
  return `+7 ${d.slice(0, 3)} ${d.slice(3, 6)}-${d.slice(6, 8)}-${d.slice(8)}`;
}

/** Live formatting for an input that always keeps the +7 prefix. */
export function phoneInputValue(raw: string): string {
  let digits = raw.replace(/\D/g, "");
  if (digits.startsWith("8") || digits.startsWith("7")) digits = digits.slice(1);
  digits = digits.slice(0, 10);

  let out = "+7";
  if (digits.length) out += ` ${digits.slice(0, 3)}`;
  if (digits.length > 3) out += ` ${digits.slice(3, 6)}`;
  if (digits.length > 6) out += `-${digits.slice(6, 8)}`;
  if (digits.length > 8) out += `-${digits.slice(8, 10)}`;
  return out;
}

export const looksLikePhone = (value: string) =>
  /^[+\d][\d\s()\-]{5,}$/.test(value.trim());
