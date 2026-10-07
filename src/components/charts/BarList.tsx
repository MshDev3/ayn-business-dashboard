import type { ReactNode } from 'react';

export interface BarListItem {
  id: string;
  label: string;
  /** Raw numeric value that drives the bar length. */
  value: number;
  /** Already formatted text shown at the end of the row. */
  display: string;
  leading?: ReactNode;
  hint?: string;
}

/** Horizontal bar list: robust for long Arabic/English labels and fully direction-aware. */
export function BarList({ items }: { items: BarListItem[] }) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <ul className="bar-list">
      {items.map((item) => (
        <li className="bar-list__item" key={item.id}>
          <div className="bar-list__row">
            {item.leading}
            <div className="bar-list__text">
              <span className="bar-list__label">{item.label}</span>
              {item.hint && <span className="bar-list__hint">{item.hint}</span>}
            </div>
            <bdi className="bar-list__value">{item.display}</bdi>
          </div>
          <div className="bar-list__track" aria-hidden="true">
            <span className="bar-list__fill" style={{ inlineSize: `${(item.value / max) * 100}%` }} />
          </div>
        </li>
      ))}
    </ul>
  );
}
