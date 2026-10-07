import type { Lang, Order } from '../../types';
import { addDays, daysBetween, parseDate, startOfDay, toDateKey } from '../../utils/dates';
import { formatDate } from '../../utils/format';

export interface DateRangeKeys {
  from: string;
  to: string;
}

export interface RangeBounds {
  start: Date;
  /** Exclusive upper bound (start of the day after `to`). */
  end: Date;
  days: number;
}

export type RangePreset = 'days7' | 'days30' | 'days90' | 'year';

const PRESET_DAYS: Record<RangePreset, number> = { days7: 7, days30: 30, days90: 90, year: 365 };

export function presetRange(preset: RangePreset): DateRangeKeys {
  const today = startOfDay(new Date());
  return { from: toDateKey(addDays(today, -(PRESET_DAYS[preset] - 1))), to: toDateKey(today) };
}

export function activePreset(range: DateRangeKeys): RangePreset | null {
  const match = (Object.keys(PRESET_DAYS) as RangePreset[]).find((preset) => {
    const candidate = presetRange(preset);
    return candidate.from === range.from && candidate.to === range.to;
  });
  return match ?? null;
}

/** Returns null when either date is missing or the range is inverted. */
export function rangeBounds(range: DateRangeKeys): RangeBounds | null {
  if (!range.from || !range.to) return null;
  const start = parseDate(range.from);
  const last = parseDate(range.to);
  if (Number.isNaN(start.getTime()) || Number.isNaN(last.getTime()) || start > last) return null;
  const end = addDays(last, 1);
  return { start, end, days: daysBetween(start, end) };
}

export function ordersInRange(orders: Order[], bounds: RangeBounds | null): Order[] {
  if (!bounds) return [];
  return orders.filter((order) => {
    const created = new Date(order.createdAt);
    return created >= bounds.start && created < bounds.end;
  });
}

export interface Bucket {
  label: string;
  start: Date;
  end: Date;
}

/** Daily buckets for short ranges, weekly buckets for longer ones (keeps charts readable). */
export function buildBuckets(bounds: RangeBounds, lang: Lang): Bucket[] {
  const step = bounds.days <= 31 ? 1 : bounds.days <= 120 ? 7 : 30;
  const buckets: Bucket[] = [];
  for (let offset = 0; offset < bounds.days; offset += step) {
    const start = addDays(bounds.start, offset);
    const end = new Date(Math.min(addDays(start, step).getTime(), bounds.end.getTime()));
    buckets.push({ label: formatDate(start, lang, 'dayMonth'), start, end });
  }
  return buckets;
}

export function sumByBucket(
  buckets: Bucket[],
  orders: Order[],
  valueOf: (order: Order) => number,
): number[] {
  const totals = buckets.map(() => 0);
  for (const order of orders) {
    const created = new Date(order.createdAt);
    const index = buckets.findIndex((bucket) => created >= bucket.start && created < bucket.end);
    if (index >= 0) totals[index] = (totals[index] ?? 0) + valueOf(order);
  }
  return totals;
}
