import { cx } from '../../utils/classNames';

interface TooltipEntry {
  name?: string | number;
  value?: unknown;
  color?: string;
  payload?: { fill?: string };
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: ReadonlyArray<TooltipEntry>;
  label?: string | number;
  formatValue: (value: number) => string;
  /** Optional override for the heading, e.g. a full date instead of the axis tick. */
  heading?: (label: string | number | undefined) => string | undefined;
}

export function ChartTooltip({ active, payload, label, formatValue, heading }: ChartTooltipProps) {
  if (!active || !payload || payload.length === 0) return null;
  const title = heading ? heading(label) : label;
  return (
    <div className="chart-tooltip" role="presentation">
      {title !== undefined && title !== '' && <p className="chart-tooltip__title">{title}</p>}
      {payload.map((entry, index) => (
        <p className="chart-tooltip__row" key={`${entry.name}-${index}`}>
          <span
            className="chart-tooltip__swatch"
            style={{ background: entry.color ?? entry.payload?.fill }}
            aria-hidden="true"
          />
          <span className="chart-tooltip__name">{entry.name}</span>
          <bdi className="chart-tooltip__value">{formatValue(Number(entry.value))}</bdi>
        </p>
      ))}
    </div>
  );
}

interface LegendItem {
  label: string;
  color: string;
}

export function ChartLegend({ items, className }: { items: LegendItem[]; className?: string }) {
  return (
    <ul className={cx('chart-legend', className)}>
      {items.map((item) => (
        <li className="chart-legend__item" key={item.label}>
          <span className="chart-legend__swatch" style={{ background: item.color }} aria-hidden="true" />
          {item.label}
        </li>
      ))}
    </ul>
  );
}
