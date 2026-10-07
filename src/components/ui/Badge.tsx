import type { ReactNode } from 'react';
import { useI18n } from '../../context/I18nContext';
import type { Dictionary } from '../../i18n/en';
import { cx } from '../../utils/classNames';

export type BadgeTone = 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'brand';

interface BadgeProps {
  tone?: BadgeTone;
  dot?: boolean;
  children: ReactNode;
  className?: string;
}

export function Badge({ tone = 'neutral', dot = true, children, className }: BadgeProps) {
  return (
    <span className={cx('badge', `badge--${tone}`, className)}>
      {dot && <span className="badge__dot" aria-hidden="true" />}
      {children}
    </span>
  );
}

export type StatusKey = keyof Dictionary['status'];

const STATUS_TONES: Record<StatusKey, BadgeTone> = {
  active: 'success',
  onLeave: 'warning',
  inactive: 'neutral',
  new: 'info',
  completed: 'success',
  processing: 'info',
  pending: 'warning',
  cancelled: 'danger',
  paid: 'success',
  unpaid: 'danger',
  partial: 'warning',
  refunded: 'neutral',
  inStock: 'success',
  lowStock: 'warning',
  outOfStock: 'danger',
  overdue: 'danger',
  income: 'success',
  expense: 'neutral',
  present: 'success',
  late: 'warning',
  absent: 'danger',
  leave: 'info',
  todo: 'neutral',
  inProgress: 'info',
  done: 'success',
};

/** Translated, colour-coded badge for any domain status (orders, payments, staff, stock, …). */
export function StatusBadge({ status }: { status: StatusKey }) {
  const { t } = useI18n();
  return <Badge tone={STATUS_TONES[status]}>{t(`status.${status}`)}</Badge>;
}
