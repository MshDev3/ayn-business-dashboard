import symbol from '../../assets/branding/ayn-symbol.png';
import symbolSmall from '../../assets/branding/ayn-symbol-sm.png';
import { useI18n } from '../../context/I18nContext';
import { cx } from '../../utils/classNames';

interface BrandProps {
  /** Symbol only, for the compact sidebar and small screens. */
  compact?: boolean;
  size?: 'md' | 'lg';
  className?: string;
}

/** The AYN symbol plus the "AYN | أين" wordmark. The symbol is never stretched; only its box scales. */
export function Brand({ compact = false, size = 'md', className }: BrandProps) {
  const { t } = useI18n();
  return (
    <span className={cx('brand', `brand--${size}`, compact && 'brand--compact', className)}>
      <img
        className="brand__symbol"
        src={size === 'lg' ? symbol : symbolSmall}
        width={size === 'lg' ? 384 : 96}
        height={size === 'lg' ? 384 : 96}
        alt={compact ? t('app.name') : ''}
      />
      {!compact && (
        <span className="brand__wordmark" aria-label="AYN | أين">
          <span className="brand__latin">AYN</span>
          <span className="brand__divider" aria-hidden="true" />
          <span className="brand__arabic">أين</span>
        </span>
      )}
    </span>
  );
}
