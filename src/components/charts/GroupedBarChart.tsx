import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useI18n } from '../../context/I18nContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { ChartLegend, ChartTooltip } from './ChartParts';

export interface BarSeries {
  key: string;
  label: string;
  color: string;
}

interface GroupedBarChartProps {
  data: Array<Record<string, string | number>>;
  xKey: string;
  series: BarSeries[];
  formatValue: (value: number) => string;
  formatTick: (value: number) => string;
  ariaLabel: string;
}

export function GroupedBarChart({ data, xKey, series, formatValue, formatTick, ariaLabel }: GroupedBarChartProps) {
  const { isRtl } = useI18n();
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  return (
    <div className="chart-wrap">
      {series.length > 1 && <ChartLegend items={series.map((item) => ({ label: item.label, color: item.color }))} />}
      <div className="chart-box" role="img" aria-label={ariaLabel}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }} barGap={4} barCategoryGap="22%">
            <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--chart-grid)" />
            <XAxis
              dataKey={xKey}
              reversed={isRtl}
              axisLine={false}
              tickLine={false}
              tickMargin={10}
              interval="preserveStartEnd"
              tick={{ fill: 'var(--chart-axis)', fontSize: 12 }}
            />
            <YAxis
              orientation={isRtl ? 'right' : 'left'}
              axisLine={false}
              tickLine={false}
              width={44}
              tickFormatter={formatTick}
              tick={{ fill: 'var(--chart-axis)', fontSize: 12 }}
            />
            <Tooltip cursor={{ fill: 'var(--chart-cursor)' }} content={<ChartTooltip formatValue={formatValue} />} />
            {series.map((item) => (
              <Bar
                key={item.key}
                dataKey={item.key}
                name={item.label}
                fill={item.color}
                radius={[6, 6, 0, 0]}
                maxBarSize={28}
                isAnimationActive={!reduceMotion}
                animationDuration={500}
              />
            ))}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
