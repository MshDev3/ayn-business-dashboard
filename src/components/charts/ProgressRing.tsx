import { useId } from 'react';

interface ProgressRingProps {
  /** 0–100 */
  value: number;
  label: string;
  valueLabel: string;
  caption: string;
  size?: number;
}

export function ProgressRing({ value, label, valueLabel, caption, size = 168 }: ProgressRingProps) {
  const gradientId = useId();
  const stroke = 14;
  const radius = (size - stroke) / 2;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));

  return (
    <div className="ring" style={{ width: size, height: size }} role="img" aria-label={`${label}: ${valueLabel}`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="var(--chart-1)" />
            <stop offset="100%" stopColor="var(--chart-2)" />
          </linearGradient>
        </defs>
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--border)" strokeWidth={stroke} />
        <circle
          className="ring__value"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped / 100)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </svg>
      <div className="ring__center" aria-hidden="true">
        <strong>{valueLabel}</strong>
        <span>{caption}</span>
      </div>
    </div>
  );
}
