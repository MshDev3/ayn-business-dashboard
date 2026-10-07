import { useI18n } from '../../context/I18nContext';
import { useFormat } from '../../hooks/useFormat';
import { cx } from '../../utils/classNames';
import { ChevronEnd, ChevronStart } from '../ui/DirIcon';

interface PaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPageChange: (page: number) => void;
}

/** Compact page list with ellipses, e.g. 1 … 4 5 6 … 12. */
function pageWindow(page: number, pageCount: number): Array<number | 'gap'> {
  if (pageCount <= 7) return Array.from({ length: pageCount }, (_, index) => index + 1);
  const pages = new Set([1, pageCount, page - 1, page, page + 1]);
  const sorted = [...pages].filter((value) => value >= 1 && value <= pageCount).sort((a, b) => a - b);
  const result: Array<number | 'gap'> = [];
  sorted.forEach((value, index) => {
    const previous = sorted[index - 1];
    if (previous !== undefined && value - previous > 1) result.push('gap');
    result.push(value);
  });
  return result;
}

export function Pagination({ page, pageSize, total, onPageChange }: PaginationProps) {
  const { t } = useI18n();
  const format = useFormat();
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const from = total === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(total, page * pageSize);

  return (
    <div className="pagination">
      <p className="pagination__summary" aria-live="polite">
        {t('common.showingRange', { from: format.number(from), to: format.number(to), total: format.number(total) })}
      </p>
      {pageCount > 1 && (
        <nav className="pagination__nav" aria-label={t('common.pageOf', { page, pages: pageCount })}>
          <button
            type="button"
            className="pagination__btn"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            aria-label={t('common.previousPage')}
          >
            <ChevronStart size={16} aria-hidden="true" />
          </button>
          {pageWindow(page, pageCount).map((entry, index) =>
            entry === 'gap' ? (
              <span key={`gap-${index}`} className="pagination__gap" aria-hidden="true">
                …
              </span>
            ) : (
              <button
                key={entry}
                type="button"
                className={cx('pagination__btn', entry === page && 'is-active')}
                onClick={() => onPageChange(entry)}
                aria-current={entry === page ? 'page' : undefined}
                aria-label={t('common.pageOf', { page: entry, pages: pageCount })}
              >
                {format.number(entry)}
              </button>
            ),
          )}
          <button
            type="button"
            className="pagination__btn"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= pageCount}
            aria-label={t('common.nextPage')}
          >
            <ChevronEnd size={16} aria-hidden="true" />
          </button>
        </nav>
      )}
    </div>
  );
}
