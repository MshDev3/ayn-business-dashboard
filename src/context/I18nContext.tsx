import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { STORAGE_KEYS } from '../constants';
import { LANGUAGE_META, dictionaries, resolveKey } from '../i18n';
import type { TranslationKey } from '../i18n';
import type { Lang } from '../types';
import { interpolate } from '../utils/text';
import { readString, writeString } from '../utils/storage';

interface I18nValue {
  lang: Lang;
  dir: 'rtl' | 'ltr';
  isRtl: boolean;
  setLang: (lang: Lang) => void;
  toggleLang: () => void;
  t: (key: TranslationKey, params?: Record<string, string | number>) => string;
}

const I18nContext = createContext<I18nValue | null>(null);

function readInitialLang(): Lang {
  return readString(STORAGE_KEYS.lang) === 'en' ? 'en' : 'ar';
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(readInitialLang);
  const dir = LANGUAGE_META[lang].dir;

  useEffect(() => {
    const root = document.documentElement;
    root.lang = lang;
    root.dir = dir;
    writeString(STORAGE_KEYS.lang, lang);
  }, [lang, dir]);

  const setLang = useCallback((next: Lang) => setLangState(next), []);
  const toggleLang = useCallback(() => setLangState((current) => (current === 'ar' ? 'en' : 'ar')), []);

  const t = useCallback<I18nValue['t']>(
    (key, params) => interpolate(resolveKey(dictionaries[lang], key), params),
    [lang],
  );

  const value = useMemo<I18nValue>(
    () => ({ lang, dir, isRtl: dir === 'rtl', setLang, toggleLang, t }),
    [lang, dir, setLang, toggleLang, t],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18n(): I18nValue {
  const context = useContext(I18nContext);
  if (!context) throw new Error('useI18n must be used inside <I18nProvider>');
  return context;
}
