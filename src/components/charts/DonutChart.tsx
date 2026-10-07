import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { ChartTooltip } from './ChartParts';
import { CHART_COLORS } from './chartColors';

export interface DonutSlice {
  name: string;
  value: number;
}

interface DonutChartProps {
  data: DonutSlice[];
  formatValue: (value: number) => string;
  formatPercent: (value: number) => string;
  centerLabel: string;
  centerValue: string;
  ariaLabel: string;
}

export function DonutChart({ data, formatValue, formatPercent, centerLabel, centerValue, ariaLabel }: DonutChartProps) {
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const total = data.reduce((sum, slice) => sum + slice.value, 0);

  return (
    <div className="donut">
      <div className="donut__chart" role="img" aria-label={ariaLabel}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={<ChartTooltip formatValue={formatValue} />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="name"
              innerRadius="64%"
              outerRadius="92%"
              paddingAngle={2}
              stroke="none"
              cornerRadius={5}
              isAnimationActive={!reduceMotion}
              animationDuration={500}
            >
              {data.map((slice, index) => (
                <Cell key={slice.name} fill={CHART_COLORS[index % CHART_COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="donut__center" aria-hidden="true">
          <span className="donut__center-value">{centerValue}</span>
          <span className="donut__center-label">{centerLabel}</span>
        </div>
      </div>
      <ul className="donut__legend">
        {data.map((slice, index) => (
          <li className="donut__legend-item" key={slice.name}>
            <span
              className="chart-legend__swatch"
              style={{ background: CHART_COLORS[index % CHART_COLORS.length] }}
              aria-hidden="true"
            />
            <span className="donut__legend-name">{slice.name}</span>
            <bdi className="donut__legend-value">{formatPercent(total === 0 ? 0 : (slice.value / total) * 100)}</bdi>
          </li>
        ))}
      </ul>
    </div>
  );
}
