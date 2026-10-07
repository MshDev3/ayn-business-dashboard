const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;

/** Parses both date-only strings (as local dates) and full ISO timestamps. */
export function parseDate(value: string): Date {
  const match = DATE_ONLY.exec(value);
  if (match) {
    return new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  }
  return new Date(value);
}

const pad = (n: number) => String(n).padStart(2, '0');

/** Local YYYY-MM-DD key for a Date. */
export function toDateKey(date: Date): string {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate()
  );
}

/** Date-only key for N days before today. */
export function dateKeyDaysAgo(days: number): string {
  return toDateKey(addDays(new Date(), -days));
}

/** ISO timestamp for N days (and optionally M minutes) before now, pinned to a given hour. */
export function isoDaysAgo(days: number, hour = 10, minute = 0): string {
  const date = addDays(new Date(), -days);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

export function isoMinutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60_000).toISOString();
}

export function monthsAgoDate(months: number): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth() - months, 1);
}

export function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / 86_400_000);
}
