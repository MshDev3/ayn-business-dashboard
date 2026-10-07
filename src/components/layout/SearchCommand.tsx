import { useEffect, useId, useMemo, useRef, useState } from 'react';
import type { KeyboardEvent } from 'react';
import { useNavigate } from 'react-router';
import { Package, Search, ShoppingBag, UserSquare2, Users, X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useI18n } from '../../context/I18nContext';
import { useFormat } from '../../hooks/useFormat';
import { useLocalized } from '../../hooks/useLocalized';
import { cx } from '../../utils/classNames';
import { orderTotal } from '../../utils/domain';
import { matchesQuery } from '../../utils/text';
import { IconButton } from '../ui/Button';

type GroupKey = 'employees' | 'customers' | 'orders' | 'products';

interface SearchResult {
  id: string;
  group: GroupKey;
  title: string;
  subtitle: string;
  to: string;
}

const GROUP_ICONS: Record<GroupKey, LucideIcon> = {
  employees: Users,
  customers: UserSquare2,
  orders: ShoppingBag,
  products: Package,
};

const GROUP_ORDER: GroupKey[] = ['employees', 'customers', 'orders', 'products'];
const MAX_PER_GROUP = 4;

interface SearchCommandProps {
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export function SearchCommand({ mobileOpen, onMobileClose }: SearchCommandProps) {
  const { t } = useI18n();
  const localize = useLocalized();
  const format = useFormat();
  const navigate = useNavigate();
  const { employees, customers, orders, products, customerById } = useData();

  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  const results = useMemo<SearchResult[]>(() => {
    const term = query.trim();
    if (!term) return [];
    const found: SearchResult[] = [];

    employees
      .filter((e) => matchesQuery(term, e.name.ar, e.name.en, e.email, e.title.ar, e.title.en, e.id))
      .slice(0, MAX_PER_GROUP)
      .forEach((e) =>
        found.push({ id: e.id, group: 'employees', title: localize(e.name), subtitle: localize(e.title), to: `/employees/${e.id}` }),
      );

    customers
      .filter((c) => matchesQuery(term, c.name.ar, c.name.en, c.contact.ar, c.contact.en, c.email, c.id))
      .slice(0, MAX_PER_GROUP)
      .forEach((c) =>
        found.push({ id: c.id, group: 'customers', title: localize(c.name), subtitle: localize(c.contact), to: `/customers/${c.id}` }),
      );

    orders
      .filter((o) => {
        const customer = customerById.get(o.customerId);
        return matchesQuery(term, o.id, customer?.name.ar, customer?.name.en);
      })
      .slice(0, MAX_PER_GROUP)
      .forEach((o) => {
        const customer = customerById.get(o.customerId);
        found.push({
          id: o.id,
          group: 'orders',
          title: `#${o.id}`,
          subtitle: `${customer ? localize(customer.name) : t('common.unknown')} · ${format.currency(orderTotal(o))}`,
          to: `/orders/${o.id}`,
        });
      });

    products
      .filter((p) => matchesQuery(term, p.name.ar, p.name.en, p.sku))
      .slice(0, MAX_PER_GROUP)
      .forEach((p) =>
        found.push({ id: p.id, group: 'products', title: localize(p.name), subtitle: p.sku, to: '/inventory' }),
      );

    return found;
  }, [query, employees, customers, orders, products, customerById, localize, format, t]);

  const safeActive = results.length === 0 ? 0 : Math.min(activeIndex, results.length - 1);

  useEffect(() => {
    const onShortcut = (event: globalThis.KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const typing = target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable);
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      } else if (event.key === '/' && !typing) {
        event.preventDefault();
        inputRef.current?.focus();
        setOpen(true);
      }
    };
    document.addEventListener('keydown', onShortcut);
    return () => document.removeEventListener('keydown', onShortcut);
  }, []);

  useEffect(() => {
    if (mobileOpen) inputRef.current?.focus();
  }, [mobileOpen]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, [open]);

  const choose = (result: SearchResult) => {
    navigate(result.to);
    setQuery('');
    setOpen(false);
    inputRef.current?.blur();
    onMobileClose();
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      setOpen(true);
      setActiveIndex(results.length === 0 ? 0 : (safeActive + 1) % results.length);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      setActiveIndex(results.length === 0 ? 0 : (safeActive - 1 + results.length) % results.length);
    } else if (event.key === 'Enter') {
      const result = results[safeActive];
      if (open && result) {
        event.preventDefault();
        choose(result);
      }
    } else if (event.key === 'Escape') {
      if (open || query) {
        event.stopPropagation();
        setOpen(false);
        setQuery('');
      } else {
        inputRef.current?.blur();
        onMobileClose();
      }
    }
  };

  const grouped = GROUP_ORDER.map((group) => ({
    group,
    items: results.map((result, index) => ({ result, index })).filter((entry) => entry.result.group === group),
  })).filter((entry) => entry.items.length > 0);

  const optionId = (index: number) => `${listboxId}-option-${index}`;
  const showPanel = open && (query.trim().length > 0 || mobileOpen);

  return (
    <div className={cx('search-cmd', mobileOpen && 'is-mobile-open')} ref={rootRef}>
      <Search className="search-cmd__icon" size={18} aria-hidden="true" />
      <input
        ref={inputRef}
        type="text"
        role="combobox"
        className="search-cmd__input"
        placeholder={t('topbar.searchPlaceholder')}
        aria-label={t('topbar.searchLabel')}
        aria-expanded={showPanel}
        aria-controls={listboxId}
        aria-autocomplete="list"
        aria-activedescendant={showPanel && results.length > 0 ? optionId(safeActive) : undefined}
        autoComplete="off"
        value={query}
        onChange={(event) => {
          setQuery(event.target.value);
          setActiveIndex(0);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={onKeyDown}
      />
      <kbd className="search-cmd__kbd" aria-hidden="true">
        Ctrl K
      </kbd>
      {mobileOpen && (
        <IconButton
          label={t('common.close')}
          icon={<X size={18} />}
          className="search-cmd__close"
          onClick={() => {
            setQuery('');
            setOpen(false);
            onMobileClose();
          }}
        />
      )}

      {showPanel && (
        <div className="search-cmd__panel" id={listboxId} role="listbox" aria-label={t('topbar.searchLabel')}>
          {query.trim().length === 0 && <p className="search-cmd__message">{t('topbar.searchHint')}</p>}
          {query.trim().length > 0 && results.length === 0 && (
            <p className="search-cmd__message" role="status">
              {t('topbar.searchNoResults', { query: query.trim() })}
            </p>
          )}
          {grouped.map(({ group, items }) => {
            const Icon = GROUP_ICONS[group];
            return (
              <div role="group" aria-label={t(`topbar.searchGroups.${group}`)} key={group} className="search-cmd__group">
                <p className="search-cmd__group-label" aria-hidden="true">
                  {t(`topbar.searchGroups.${group}`)}
                </p>
                {items.map(({ result, index }) => (
                  <div
                    key={`${result.group}-${result.id}`}
                    id={optionId(index)}
                    role="option"
                    aria-selected={index === safeActive}
                    className={cx('search-cmd__option', index === safeActive && 'is-active')}
                    onMouseDown={(event) => event.preventDefault()}
                    onMouseEnter={() => setActiveIndex(index)}
                    onClick={() => choose(result)}
                  >
                    <span className="search-cmd__option-icon" aria-hidden="true">
                      <Icon size={16} />
                    </span>
                    <span className="search-cmd__option-text">
                      <span className="search-cmd__option-title">{result.title}</span>
                      <span className="search-cmd__option-sub">{result.subtitle}</span>
                    </span>
                    <span className="search-cmd__option-type" aria-hidden="true">
                      {t(`topbar.searchGroups.${group}`)}
                    </span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
