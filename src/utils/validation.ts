const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
/** Accepts 05XXXXXXXX, 5XXXXXXXX, +9665XXXXXXXX and 009665XXXXXXXX with optional spaces or dashes. */
const SAUDI_MOBILE = /^(?:\+966|00966|0)?5\d{8}$/;

export function isEmail(value: string): boolean {
  return EMAIL.test(value.trim());
}

export function isSaudiMobile(value: string): boolean {
  return SAUDI_MOBILE.test(value.replace(/[\s-]/g, ''));
}

/** Any plausible phone number (landline or mobile, with optional country code). */
export function isPhone(value: string): boolean {
  const digits = value.replace(/[\s\-()+]/g, '');
  return /^\d{9,14}$/.test(digits);
}

export function isDateKey(value: string): boolean {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(new Date(value).getTime());
}

/** Normalises a Saudi mobile number to "+966 5X XXX XXXX" for display. */
export function formatSaudiMobile(value: string): string {
  const digits = value.replace(/[\s-]/g, '').replace(/^(\+966|00966|0)/, '');
  if (!/^5\d{8}$/.test(digits)) return value;
  return `+966 ${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5)}`;
}
