import type { Lang, Localized } from '../types';

export function pick(value: Localized, lang: Lang): string {
  return value[lang] || value.ar || value.en;
}

/** A value typed in one language is used for both until it is edited in the other. */
export function makeLocalized(value: string): Localized {
  const text = value.trim();
  return { ar: text, en: text };
}

export function setLocalized(previous: Localized, lang: Lang, value: string): Localized {
  return { ...previous, [lang]: value.trim() };
}

const ARABIC_DIACRITICS = /[ً-ٰٟـ]/g;

/** Lower-cases and folds Arabic letter variants so "احمد" matches "أحمد" and "مدرسه" matches "مدرسة". */
export function normalizeText(value: string): string {
  return value
    .normalize('NFKD')
    .replace(ARABIC_DIACRITICS, '')
    .replace(/[أإآٱ]/g, 'ا')
    .replace(/ى/g, 'ي')
    .replace(/ة/g, 'ه')
    .toLowerCase()
    .trim();
}

export function matchesQuery(query: string, ...fields: Array<string | undefined>): boolean {
  const needle = normalizeText(query);
  if (!needle) return true;
  return fields.some((field) => field !== undefined && normalizeText(field).includes(needle));
}

/** Arabic "ال" and Latin "Al-" are definite-article prefixes, not meaningful initials. */
const NAME_PREFIX = /^(?:ال(?=.{2})|al-(?=.))/i;

export function initials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((part) => part.replace(NAME_PREFIX, ''));
  if (parts.length === 0) return '?';
  const first = Array.from(parts[0] ?? '')[0] ?? '';
  const second = parts.length > 1 ? (Array.from(parts[1] ?? '')[0] ?? '') : '';
  return (first + second).toUpperCase();
}

/** Replaces `{token}` placeholders. */
export function interpolate(template: string, params?: Record<string, string | number>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in params ? String(params[key]) : match,
  );
}
