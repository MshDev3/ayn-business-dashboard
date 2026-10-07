import { useId, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { ArrowDown, ArrowUp, ArrowUpDown } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { useSettings } from '../../context/SettingsContext';
import type { SortDirection } from '../../types';
import { cx } from '../../utils/classNames';
import { TableSkeleton } from '../feedback/Skeleton';
import { Select } from '../forms/Fields';
import { IconButton } from '../ui/Button';
import { Pagination } from './Pagination';

export interface Column<T> {
  key: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** Providing a sort value makes the column sortable. */
  sortValue?: (row: T) => string | number;
  align?: 'start' | 'end';
  /** Becomes the card title on small screens (no label). */
  primary?: boolean;
  /** Row-action column: shown as a footer row on small screens. */
  actions?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  caption: string;
  columns: Array<Column<T>>;
  rows: T[];
  rowKey: (row: T) => string;
  defaultSort?: { key: string; direction: SortDirection };
  loading?: boolean;
  empty?: ReactNode;
  /** When this value changes (e.g. filters), the table returns to page 1. */
  resetKey?: string;
  pageSize?: number;
  /** Set to false for compact "latest N rows" tables: shows the first page only, with no pager or mobile sort. */
  paginate?: boolean;
}

function compareValues(a: string | number, b: string | number, locale: string): number {
  if (typeof a === 'number' && typeof b === 'number') return a - b;
  return String(a).localeCompare(String(b), locale, { numeric: true, sensitivity: 'base' });
}

export function DataTable<T>({
  caption,
  columns,
  rows,
  rowKey,
  defaultSort,
  loading = false,
  empty,
  resetKey = '',
  pageSize: pageSizeProp,
  paginate = true,
}: DataTableProps<T>) {
  const { t, lang } = useI18n();
  const { preferences } = useSettings();
  const pageSize = pageSizeProp ?? preferences.rowsPerPage;
  const sortSelectId = useId();

  const [sort, setSort] = useState<{ key: string; direction: SortDirection } | null>(defaultSort ?? null);
  const [page, setPage] = useState(1);
  const [lastResetKey, setLastResetKey] = useState(resetKey);

  // Return to page 1 whenever filters change (adjusting state while rendering, the React-recommended pattern).
  if (lastResetKey !== resetKey) {
    setLastResetKey(resetKey);
    setPage(1);
  }

  const sortedRows = useMemo(() => {
    const column = sort ? columns.find((candidate) => candidate.key === sort.key) : undefined;
    if (!sort || !column?.sortValue) return rows;
    const getValue = column.sortValue;
    const factor = sort.direction === 'asc' ? 1 : -1;
    return [...rows].sort((a, b) => factor * compareValues(getValue(a), getValue(b), lang));
  }, [rows, columns, sort, lang]);

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visibleRows = sortedRows.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const sortableColumns = columns.filter((column) => column.sortValue);

  const toggleSort = (key: string) => {
    setSort((current) =>
      current?.key === key
        ? { key, direction: current.direction === 'asc' ? 'desc' : 'asc' }
        : { key, direction: 'asc' },
    );
  };

  const showEmpty = !loading && rows.length === 0;

  return (
    <div className="dt-wrap">
      {paginate && sortableColumns.length > 0 && !showEmpty && (
        <div className="dt-mobile-sort">
          <label className="dt-mobile-sort__label" htmlFor={sortSelectId}>
            {t('common.sortBy')}
          </label>
          <Select
            id={sortSelectId}
            value={sort?.key ?? ''}
            onChange={(event) => setSort({ key: event.target.value, direction: sort?.direction ?? 'asc' })}
            options={[
              ...(sort ? [] : [{ value: '', label: '—' }]),
              ...sortableColumns.map((column) => ({ value: column.key, label: column.header })),
            ]}
          />
          <IconButton
            variant="outline"
            label={sort?.direction === 'desc' ? t('common.descending') : t('common.ascending')}
            icon={sort?.direction === 'desc' ? <ArrowDown size={16} /> : <ArrowUp size={16} />}
            onClick={() => sort && toggleSort(sort.key)}
            disabled={!sort}
          />
        </div>
      )}

      {loading ? (
        <TableSkeleton rows={Math.min(pageSize, 6)} columns={Math.min(columns.length, 6)} />
      ) : showEmpty ? (
        empty
      ) : (
        <div className="dt-scroll">
          <table className="dt">
            <caption className="sr-only">{caption}</caption>
            <thead>
              <tr>
                {columns.map((column) => {
                  const active = sort?.key === column.key;
                  const ariaSort = active ? (sort.direction === 'asc' ? 'ascending' : 'descending') : 'none';
                  return (
                    <th
                      key={column.key}
                      scope="col"
                      className={cx(column.align === 'end' && 'is-end', column.actions && 'dt__actions-head')}
                      aria-sort={column.sortValue ? ariaSort : undefined}
                    >
                      {column.sortValue ? (
                        <button
                          type="button"
                          className={cx('dt__sort', active && 'is-active')}
                          onClick={() => toggleSort(column.key)}
                        >
                          <span>{column.header}</span>
                          {active ? (
                            sort.direction === 'asc' ? (
                              <ArrowUp size={14} aria-hidden="true" />
                            ) : (
                              <ArrowDown size={14} aria-hidden="true" />
                            )
                          ) : (
                            <ArrowUpDown size={14} aria-hidden="true" />
                          )}
                        </button>
                      ) : column.actions ? (
                        <span className="sr-only">{column.header}</span>
                      ) : (
                        column.header
                      )}
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((row) => (
                <tr key={rowKey(row)}>
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      data-label={column.primary || column.actions ? undefined : column.header}
                      className={cx(
                        column.align === 'end' && 'is-end',
                        column.primary && 'dt__primary',
                        column.actions && 'dt__actions',
                        column.className,
                      )}
                    >
                      {column.cell(row)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {paginate && !loading && !showEmpty && (
        <Pagination page={currentPage} pageSize={pageSize} total={sortedRows.length} onPageChange={setPage} />
      )}
    </div>
  );
}
