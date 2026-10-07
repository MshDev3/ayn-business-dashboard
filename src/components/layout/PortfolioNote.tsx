import { Info } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

/** Subtle portfolio disclosure shown at the foot of every page. */
export function PortfolioNote() {
  const { t } = useI18n();
  return (
    <footer className="portfolio-note">
      <Info size={14} aria-hidden="true" />
      <p>{t('app.disclosure')}</p>
    </footer>
  );
}
