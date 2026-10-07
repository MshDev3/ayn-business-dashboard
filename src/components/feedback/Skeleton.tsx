import type { CSSProperties } from 'react';
import { useI18n } from '../../context/I18nContext';
import { cx } from '../../utils/classNames';

interface SkeletonProps {
  width?: number | string;
  height?: number | string;
  radius?: number | string;
  className?: string;
}

/** Decorative placeholder; screen readers are told the region is loading by its container. */
export function Skeleton({ width, height = 14, radius, className }: SkeletonProps) {
  const style: CSSProperties = { width, height, borderRadius: radius };
  return <span className={cx('skeleton', className)} style={style} aria-hidden="true" />;
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="card" aria-hidden="true">
      <div className="stack stack--sm">
        <Skeleton width="40%" height={16} />
        {Array.from({ length: lines }, (_, index) => (
          <Skeleton key={index} width={index === lines - 1 ? '60%' : '100%'} />
        ))}
      </div>
    </div>
  );
}

export function KpiSkeleton() {
  return (
    <div className="kpi" aria-hidden="true">
      <div className="kpi__top">
        <Skeleton width={42} height={42} radius={13} />
        <Skeleton width={56} height={20} radius={99} />
      </div>
      <Skeleton width="55%" height={13} />
      <Skeleton width="70%" height={26} />
    </div>
  );
}

export function TableSkeleton({ rows = 6, columns = 5 }: { rows?: number; columns?: number }) {
  const { t } = useI18n();
  return (
    <div className="table-skeleton" role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">{t('common.loading')}</span>
      {Array.from({ length: rows }, (_, row) => (
        <div className="table-skeleton__row" key={row} style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
          {Array.from({ length: columns }, (_, column) => (
            <Skeleton key={column} width={column === 0 ? '80%' : '60%'} height={14} />
          ))}
        </div>
      ))}
    </div>
  );
}

/** Mirrors the dashboard composition: header, four KPIs, a wide chart and a ring card, then a table. */
export function DashboardSkeleton() {
  const { t } = useI18n();
  return (
    <div className="page" role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">{t('app.loadingPage')}</span>
      <div className="stack stack--sm">
        <Skeleton width={140} height={14} />
        <Skeleton width={280} height={30} />
        <Skeleton width={360} height={14} />
      </div>
      <div className="kpi-grid">
        <KpiSkeleton />
        <KpiSkeleton />
        <KpiSkeleton />
        <KpiSkeleton />
      </div>
      <div className="grid-2-1">
        <div className="card" aria-hidden="true">
          <Skeleton width={180} height={18} />
          <Skeleton height={300} radius={12} className="skeleton--mt" />
        </div>
        <div className="card skeleton-center" aria-hidden="true">
          <Skeleton width={140} height={18} />
          <Skeleton width={168} height={168} radius={999} className="skeleton--mt" />
          <Skeleton width="80%" height={14} className="skeleton--mt" />
        </div>
      </div>
      <div className="card card--flush" aria-hidden="true">
        <TableSkeleton rows={5} columns={5} />
      </div>
    </div>
  );
}

export function PageSkeleton() {
  const { t } = useI18n();
  return (
    <div className="page" role="status" aria-busy="true" aria-live="polite">
      <span className="sr-only">{t('app.loadingPage')}</span>
      <div className="stack stack--sm">
        <Skeleton width={220} height={28} />
        <Skeleton width={340} height={14} />
      </div>
      <div className="kpi-grid">
        <KpiSkeleton />
        <KpiSkeleton />
        <KpiSkeleton />
        <KpiSkeleton />
      </div>
      <CardSkeleton lines={6} />
    </div>
  );
}
