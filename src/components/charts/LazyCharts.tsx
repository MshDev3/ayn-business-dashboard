import { lazy, Suspense } from 'react';
import type { ComponentProps } from 'react';
import { Skeleton } from '../feedback/Skeleton';

/**
 * Charts pull in Recharts (the heaviest dependency), so they load on demand.
 * The page shell, KPIs and tables render first; a placeholder of the same height holds the space.
 */
const AreaTrendChartImpl = lazy(() => import('./AreaTrendChart').then((m) => ({ default: m.AreaTrendChart })));
const GroupedBarChartImpl = lazy(() => import('./GroupedBarChart').then((m) => ({ default: m.GroupedBarChart })));
const DonutChartImpl = lazy(() => import('./DonutChart').then((m) => ({ default: m.DonutChart })));

function ChartFallback({ height = 300 }: { height?: number }) {
  return (
    <div className="chart-box chart-box--loading" aria-hidden="true">
      <Skeleton height={height} radius={12} />
    </div>
  );
}

export function AreaTrendChart(props: ComponentProps<typeof AreaTrendChartImpl>) {
  return (
    <Suspense fallback={<ChartFallback />}>
      <AreaTrendChartImpl {...props} />
    </Suspense>
  );
}

export function GroupedBarChart(props: ComponentProps<typeof GroupedBarChartImpl>) {
  return (
    <Suspense fallback={<ChartFallback />}>
      <GroupedBarChartImpl {...props} />
    </Suspense>
  );
}

export function DonutChart(props: ComponentProps<typeof DonutChartImpl>) {
  return (
    <Suspense fallback={<ChartFallback height={190} />}>
      <DonutChartImpl {...props} />
    </Suspense>
  );
}
