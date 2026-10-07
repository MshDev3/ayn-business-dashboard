import { cx } from '../../utils/classNames';

interface ProgressBarProps {
  /** 0–100 */
  value: number;
  label: string;
  tone?: 'brand' | 'success' | 'warning' | 'danger';
  className?: string;
}

export function ProgressBar({ value, label, tone = 'brand', className }: ProgressBarProps) {
  const clamped = Math.max(0, Math.min(100, value));
  return (
    <div
      className={cx('progress', `progress--${tone}`, className)}
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(clamped)}
    >
      <span className="progress__fill" style={{ inlineSize: `${clamped}%` }} />
    </div>
  );
}
