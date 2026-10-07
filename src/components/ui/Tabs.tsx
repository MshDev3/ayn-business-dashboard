import { useRef } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { useI18n } from '../../context/I18nContext';
import { cx } from '../../utils/classNames';

export interface TabItem {
  id: string;
  label: string;
  count?: number;
  icon?: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  /** Links each tab to its panel; pass the same prefix to <TabPanel>. */
  idPrefix: string;
  className?: string;
}

export function Tabs({ items, value, onChange, label, idPrefix, className }: TabsProps) {
  const { isRtl } = useI18n();
  const listRef = useRef<HTMLDivElement>(null);

  const move = (event: KeyboardEvent, index: number) => {
    const forwardKey = isRtl ? 'ArrowLeft' : 'ArrowRight';
    const backKey = isRtl ? 'ArrowRight' : 'ArrowLeft';
    let target = -1;
    if (event.key === forwardKey) target = (index + 1) % items.length;
    else if (event.key === backKey) target = (index - 1 + items.length) % items.length;
    else if (event.key === 'Home') target = 0;
    else if (event.key === 'End') target = items.length - 1;
    if (target < 0) return;
    event.preventDefault();
    const next = items[target];
    if (!next) return;
    onChange(next.id);
    listRef.current?.querySelectorAll<HTMLElement>('[role="tab"]')[target]?.focus();
  };

  return (
    <div className={cx('tabs', className)} role="tablist" aria-label={label} ref={listRef}>
      {items.map((item, index) => {
        const selected = item.id === value;
        return (
          <button
            key={item.id}
            id={`${idPrefix}-tab-${item.id}`}
            type="button"
            role="tab"
            aria-selected={selected}
            aria-controls={`${idPrefix}-panel-${item.id}`}
            tabIndex={selected ? 0 : -1}
            className={cx('tabs__tab', selected && 'is-active')}
            onClick={() => onChange(item.id)}
            onKeyDown={(event) => move(event, index)}
          >
            {item.icon}
            <span>{item.label}</span>
            {item.count !== undefined && <span className="tabs__count">{item.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

interface TabPanelProps {
  idPrefix: string;
  id: string;
  value: string;
  children: ReactNode;
}

export function TabPanel({ idPrefix, id, value, children }: TabPanelProps) {
  if (id !== value) return null;
  return (
    <div role="tabpanel" id={`${idPrefix}-panel-${id}`} aria-labelledby={`${idPrefix}-tab-${id}`} tabIndex={0} className="tab-panel">
      {children}
    </div>
  );
}
