import { useEffect } from 'react';
import { useI18n } from '../context/I18nContext';

/** Sets the browser tab title to "AYN — {page}" (or "أين — {page}" in Arabic). */
export function useDocumentTitle(page: string) {
  const { t } = useI18n();
  useEffect(() => {
    document.title = t('app.pageTitle', { page });
  }, [t, page]);
}
