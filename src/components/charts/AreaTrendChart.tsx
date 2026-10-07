import { useId } from 'react';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useI18n } from '../../context/I18nContext';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { ChartTooltip } from './ChartParts';

interface AreaTrendChartProps {
  data: Array<Record<string, string | number>>;
  xKey: string;
  yKey: string;
  seriesLabel: string;
  formatValue: (value: number) => string;
  formatTick: (value: number) => string;
  /** Accessible summary of what the chart shows. */
  ariaLabel: string;
}

export function AreaTrendChart({ data, xKey, yKey, seriesLabel, formatValue, formatTick, ariaLabel }: AreaTrendChartProps) {
  const { isRtl } = useI18n();
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const gradientId = useId();

  return (
    <div className="chart-box" role="img" aria-label={ariaLabel}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 8 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="var(--chart-grid)" />
          <XAxis
            dataKey={xKey}
            reversed={isRtl}
            axisLine={false}
            tickLine={false}
            tickMargin={10}
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
          <Tooltip
            cursor={{ stroke: 'var(--chart-axis)', strokeDasharray: '4 4' }}
            content={<ChartTooltip formatValue={formatValue} />}
          />
          <Area
            type="monotone"
            dataKey={yKey}
            name={seriesLabel}
            stroke="var(--chart-1)"
            strokeWidth={2.5}
            fill={`url(#${gradientId})`}
            dot={false}
            activeDot={{ r: 5, strokeWidth: 2, stroke: 'var(--surface)', fill: 'var(--chart-1)' }}
            isAnimationActive={!reduceMotion}
            animationDuration={500}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
