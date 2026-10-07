import { useMemo } from 'react';
import { CURRENCY_SYMBOLS } from '../constants';
import { useI18n } from '../context/I18nContext';
import { useSettings } from '../context/SettingsContext';
import {
  formatClock,
  formatCompact,
  formatCurrency,
  formatDate,
  formatNumber,
  formatPercent,
  formatRelative,
  formatTime,
} from '../utils/format';
import type { DateStyle } from '../utils/format';

/** Locale- and currency-aware formatters bound to the current language and business settings. */
export function useFormat() {
  const { lang } = useI18n();
  const { business } = useSettings();
  const currencyCode = business.currency;

  return useMemo(
    () => ({
      number: (value: number, decimals?: number) => formatNumber(value, decimals),
      compact: (value: number) => formatCompact(value),
      percent: (value: number, decimals?: number) => formatPercent(value, decimals),
      currency: (value: number, decimals?: number) => formatCurrency(value, lang, currencyCode, decimals),
      currencySymbol: CURRENCY_SYMBOLS[currencyCode][lang],
      date: (value: string | Date, style?: DateStyle) => formatDate(value, lang, style),
      time: (value: string | Date) => formatTime(value, lang),
      clock: (hhmm: string) => formatClock(hhmm, lang),
      relative: (value: string) => formatRelative(value, lang),
    }),
    [lang, currencyCode],
  );
}
