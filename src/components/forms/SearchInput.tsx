import { Search, X } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { cx } from '../../utils/classNames';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  label: string;
  className?: string;
}

export function SearchInput({ value, onChange, placeholder, label, className }: SearchInputProps) {
  const { t } = useI18n();
  return (
    <div className={cx('search-input', className)} role="search">
      <Search className="search-input__icon" size={18} aria-hidden="true" />
      <input
        type="search"
        className="search-input__control"
        value={value}
        placeholder={placeholder}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
      />
      {value && (
        <button
          type="button"
          className="search-input__clear"
          onClick={() => onChange('')}
          aria-label={t('common.clearSearch')}
        >
          <X size={16} aria-hidden="true" />
        </button>
      )}
    </div>
  );
}
