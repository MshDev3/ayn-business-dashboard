import type { ActivityEntry } from '../types';
import { isoDaysAgo, isoMinutesAgo } from '../utils/dates';

type Seed = [ar: string, en: string, at: string];

/** Fictional activity feed shown on the profile page. */
export function createProfileActivity(): ActivityEntry[] {
  const seeds: Seed[] = [
    ['حدّث حالة الطلب #AY-1046 إلى «مكتمل»', 'Marked order #AY-1046 as completed', isoMinutesAgo(95)],
    ['أضاف منتج «شاحن سريع 65 واط» إلى المخزون', 'Added “65W Fast Charger” stock', isoDaysAgo(1, 15, 20)],
    ['راجع تقرير المبيعات الأسبوعي', 'Reviewed the weekly sales report', isoDaysAgo(2, 10, 5)],
    ['أنشأ فعالية «مراجعة المبيعات الأسبوعي»', 'Scheduled “Weekly sales review”', isoDaysAgo(3, 9, 40)],
    ['وافق على طلب إجازة جديد', 'Approved a leave request', isoDaysAgo(5, 13, 15)],
    ['صدّر بيانات الطلبات بصيغة CSV', 'Exported orders as CSV', isoDaysAgo(8, 11, 30)],
  ];
  return seeds.map(([ar, en, at], index) => ({ id: `profile-act-${index + 1}`, text: { ar, en }, at }));
}

/** Sample figures for the profile summary tiles. */
export const PROFILE_STATS = { tasksCompleted: 128, actionsThisMonth: 214, daysActive: 412 };
