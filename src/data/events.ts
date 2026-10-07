import type { CalendarEvent, EventCategory } from '../types';
import { dateKeyDaysAgo } from '../utils/dates';

type Seed = [
  id: string,
  titleAr: string,
  titleEn: string,
  daysFromToday: number,
  time: string,
  category: EventCategory,
  descriptionAr: string,
  descriptionEn: string,
];

const SEEDS: Seed[] = [
  ['EVT-1', 'اجتماع مراجعة المبيعات الأسبوعي', 'Weekly sales review', -6, '10:00', 'meeting', 'مراجعة أداء الفريق وأهم الصفقات المفتوحة.', 'Review team performance and the most important open deals.'],
  ['EVT-2', 'تسليم تقرير الجرد الشهري', 'Submit monthly stock report', -3, '14:00', 'task', 'إرسال تقرير المخزون إلى الإدارة المالية.', 'Send the inventory report to the finance department.'],
  ['EVT-3', 'اجتماع مع شركة آفاق للتجارة', 'Meeting with Afaq Trading Co.', 0, '11:30', 'meeting', 'مناقشة تجديد العقد السنوي وجدول التوريد.', 'Discuss the annual contract renewal and the supply schedule.'],
  ['EVT-4', 'إغلاق حسابات الأسبوع', 'Close the weekly accounts', 0, '15:00', 'task', 'مطابقة المدفوعات المستلمة مع الفواتير.', 'Match received payments against invoices.'],
  ['EVT-5', 'ورشة تدريب فريق الدعم', 'Support team training workshop', 2, '09:00', 'event', 'جلسة تدريبية حول التعامل مع الشكاوى.', 'A training session on handling customer complaints.'],
  ['EVT-6', 'موعد سداد إيجار المستودع', 'Warehouse rent due', 4, '09:00', 'reminder', 'تذكير بتحويل الإيجار قبل نهاية اليوم.', 'Reminder to transfer the rent before the end of the day.'],
  ['EVT-7', 'مقابلة مرشح — مطوّر واجهات', 'Candidate interview — Front-End Engineer', 5, '13:00', 'meeting', 'مقابلة عبر الاجتماع المرئي مع فريق الهندسة.', 'Video interview with the engineering team.'],
  ['EVT-8', 'إطلاق حملة التسويق الجديدة', 'Launch the new marketing campaign', 8, '10:00', 'event', 'إطلاق الحملة على القنوات الرقمية.', 'Launch the campaign across digital channels.'],
  ['EVT-9', 'مراجعة أهداف الربع', 'Quarterly goals review', 11, '12:00', 'meeting', 'اجتماع الإدارة لمراجعة المؤشرات والأهداف.', 'Management meeting to review KPIs and goals.'],
  ['EVT-10', 'تجديد اشتراك البرمجيات', 'Renew software subscriptions', 14, '09:30', 'reminder', 'تجديد اشتراكات الأدوات قبل انتهاء الفترة.', 'Renew tool subscriptions before they expire.'],
];

export function createEvents(): CalendarEvent[] {
  return SEEDS.map(([id, titleAr, titleEn, daysFromToday, time, category, descriptionAr, descriptionEn]) => ({
    id,
    title: { ar: titleAr, en: titleEn },
    date: dateKeyDaysAgo(-daysFromToday),
    time,
    category,
    description: { ar: descriptionAr, en: descriptionEn },
  }));
}
