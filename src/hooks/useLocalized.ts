import { useCallback } from 'react';
import { useI18n } from '../context/I18nContext';
import type { Localized } from '../types';
import { pick } from '../utils/text';

/** Returns a function that resolves a bilingual value to the active language. */
export function useLocalized() {
  const { lang } = useI18n();
  return useCallback((value: Localized) => pick(value, lang), [lang]);
}
