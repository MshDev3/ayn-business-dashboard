import { CURRENCY_SYMBOLS } from '../constants';
import type { CurrencyCode, Lang } from '../types';
import { parseDate } from './dates';

/** Gregorian calendar with Latin digits in both languages, so numbers read consistently in tables and KPIs. */
const LOCALES: Record<Lang, string> = {
  ar: 'ar-SA-u-ca-gregory-nu-latn',
  en: 'en-GB',
};

const NUMBER_LOCALE = 'en-US';

export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat(NUMBER_LOCALE, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

export function formatCompact(value: number): string {
  return new Intl.NumberFormat(NUMBER_LOCALE, { notation: 'compact', maximumFractionDigits: 1 }).format(value);
}

/** The number and its percent sign are isolated left-to-right so "%" never jumps to the wrong side in Arabic text. */
export function formatPercent(value: number, decimals = 1): string {
  return `⁦${formatNumber(value, decimals)}%⁩`;
}

export function formatCurrency(
  value: number,
  lang: Lang,
  currency: CurrencyCode,
  decimals?: number,
): string {
  const digits = decimals ?? (Number.isInteger(value) ? 0 : 2);
  const amount = formatNumber(value, digits);
  const symbol = CURRENCY_SYMBOLS[currency][lang];
  return lang === 'ar' ? `${amount} ${symbol}` : `${symbol} ${amount}`;
}

export type DateStyle = 'short' | 'medium' | 'long' | 'weekday' | 'monthYear' | 'dayMonth';

const DATE_OPTIONS: Record<DateStyle, Intl.DateTimeFormatOptions> = {
  short: { day: '2-digit', month: '2-digit', year: 'numeric' },
  medium: { day: 'numeric', month: 'short', year: 'numeric' },
  long: { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' },
  weekday: { weekday: 'short' },
  monthYear: { month: 'long', year: 'numeric' },
  dayMonth: { day: 'numeric', month: 'short' },
};

export function formatDate(value: string | Date, lang: Lang, style: DateStyle = 'medium'): string {
  const date = typeof value === 'string' ? parseDate(value) : value;
  if (Number.isNaN(date.getTime())) return '—';
  return new Intl.DateTimeFormat(LOCALES[lang], DATE_OPTIONS[style]).format(date);
}

export function formatTime(value: string | Date, lang: Lang): string {
  const date = typeof value === 'string' ? parseDate(value) : value;
  return new Intl.DateTimeFormat(LOCALES[lang], { hour: '2-digit', minute: '2-digit', hour12: true }).format(date);
}

/** Formats an HH:mm string (event times) for display. */
export function formatClock(hhmm: string, lang: Lang): string {
  const [h = '0', m = '0'] = hhmm.split(':');
  const date = new Date();
  date.setHours(Number(h), Number(m), 0, 0);
  return formatTime(date, lang);
}

export function formatRelative(value: string, lang: Lang): string {
  const diffMs = parseDate(value).getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat(LOCALES[lang], { numeric: 'auto' });
  const minutes = Math.round(diffMs / 60_000);
  if (Math.abs(minutes) < 60) return rtf.format(minutes, 'minute');
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return rtf.format(hours, 'hour');
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 30) return rtf.format(days, 'day');
  const months = Math.round(days / 30);
  return rtf.format(months, 'month');
}

export function monthName(monthIndex: number, lang: Lang, style: 'long' | 'short' = 'short'): string {
  return new Intl.DateTimeFormat(LOCALES[lang], { month: style }).format(new Date(2024, monthIndex, 1));
}

export function weekdayName(dayIndex: number, lang: Lang, style: 'long' | 'short' = 'short'): string {
  // 2024-01-07 is a Sunday.
  return new Intl.DateTimeFormat(LOCALES[lang], { weekday: style }).format(new Date(2024, 0, 7 + dayIndex));
}
