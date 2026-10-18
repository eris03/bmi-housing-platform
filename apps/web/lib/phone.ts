/**
 * Normalises an Indian mobile number to E.164 (+91XXXXXXXXXX).
 * Returns null when the input is not a valid Indian mobile number.
 * The server re-validates; this is for immediate form feedback.
 */
export function normaliseIndianMobile(input: string): string | null {
  let digits = input.replace(/[^\d]/g, "");
  if (digits.length === 12 && digits.startsWith("91")) digits = digits.slice(2);
  else if (digits.length === 11 && digits.startsWith("0")) digits = digits.slice(1);
  if (!/^[6-9]\d{9}$/.test(digits)) return null;
  return `+91${digits}`;
}

/** Masks a phone for display/logging: +91•••••43210 */
export function maskPhone(e164: string): string {
  return e164.slice(0, 3) + "•••••" + e164.slice(-5);
}

export function isValidEmail(input: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(input.trim());
}
