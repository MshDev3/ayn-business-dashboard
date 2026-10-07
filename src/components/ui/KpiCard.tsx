import { TrendingDown, TrendingUp } from 'lucide-react';
import type { ReactNode } from 'react';
import { useFormat } from '../../hooks/useFormat';
import { cx } from '../../utils/classNames';

interface KpiCardProps {
  label: string;
  value: string;
  icon: ReactNode;
  /** Percentage change versus the comparison period; omit to hide the chip. */
  delta?: number;
  hint?: string;
  tone?: 'brand' | 'success' | 'warning' | 'danger' | 'info';
}

export function KpiCard({ label, value, icon, delta, hint, tone = 'brand' }: KpiCardProps) {
  const format = useFormat();
  const positive = (delta ?? 0) >= 0;
  return (
    <article className="kpi">
      <div className="kpi__top">
        <span className={cx('kpi__icon', `kpi__icon--${tone}`)} aria-hidden="true">
          {icon}
        </span>
        {delta !== undefined && (
          <span className={cx('kpi__delta', positive ? 'is-up' : 'is-down')}>
            {positive ? <TrendingUp size={14} aria-hidden="true" /> : <TrendingDown size={14} aria-hidden="true" />}
            <bdi>
              {positive ? '+' : '−'}
              {format.percent(Math.abs(delta))}
            </bdi>
          </span>
        )}
      </div>
      <p className="kpi__label">{label}</p>
      <p className="kpi__value">{value}</p>
      {hint && <p className="kpi__hint">{hint}</p>}
    </article>
  );
}
