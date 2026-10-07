import type { AppNotification, NotificationType } from '../types';
import { isoMinutesAgo } from '../utils/dates';

type Seed = [
  type: NotificationType,
  titleAr: string,
  titleEn: string,
  bodyAr: string,
  bodyEn: string,
  minutesAgo: number,
  read: boolean,
  link?: string,
];

const SEEDS: Seed[] = [
  ['order', 'طلب جديد #AY-1048', 'New order #AY-1048', 'تم استلام طلب جديد وهو بانتظار المعالجة.', 'A new order was received and is waiting to be processed.', 12, false, '/orders/AY-1048'],
  ['inventory', 'مخزون منخفض: شاشة 27 بوصة', 'Low stock: 27" 4K Monitor', 'تبقّت 9 وحدات فقط، وهو أقل من حد إعادة الطلب.', 'Only 9 units left, below the reorder level.', 55, false, '/inventory'],
  ['finance', 'فاتورة متأخرة', 'Overdue invoice', 'فاتورة ورشة الإتقان متأخرة عن موعد السداد.', 'The invoice for Al-Itqan Workshop is past its due date.', 140, false, '/finance'],
  ['order', 'تم إكمال الطلب #AY-1044', 'Order #AY-1044 completed', 'تم تسليم الطلب بنجاح وتأكيد الدفع.', 'The order was delivered and payment confirmed.', 260, true, '/orders/AY-1044'],
  ['employee', 'طلب إجازة جديد', 'New leave request', 'قدّمت نورة الشمري طلب إجازة لمدة 5 أيام.', 'Noura Al-Shammari submitted a 5-day leave request.', 410, false, '/employees/EMP-1004'],
  ['inventory', 'نفاد المخزون: سماعة اجتماعات', 'Out of stock: Conference Speakerphone', 'نفدت الكمية. يُنصح بإعادة التوريد.', 'Stock has run out. Restocking is recommended.', 600, true, '/inventory'],
  ['system', 'تم تحديث لوحة التحكم', 'Dashboard updated', 'أصبحت التقارير تدعم التصدير بصيغة CSV.', 'Reports now support CSV export.', 1100, true, '/reports'],
  ['finance', 'تم استلام دفعة', 'Payment received', 'استلمت دفعة بقيمة 12,640 ر.س من نواة التقنية.', 'A payment of SAR 12,640 was received from Nawat Technology.', 1500, true, '/finance'],
  ['employee', 'موظف جديد انضم للفريق', 'New team member joined', 'انضم ناصر البلوي إلى فريق المستودع.', 'Nasser Al-Balawi joined the warehouse team.', 2900, true, '/employees/EMP-1023'],
  ['order', 'تم إلغاء الطلب #AY-1039', 'Order #AY-1039 cancelled', 'ألغى العميل الطلب قبل الشحن.', 'The customer cancelled the order before shipping.', 3600, true, '/orders/AY-1039'],
  ['system', 'نصيحة: اختصار البحث', 'Tip: search shortcut', 'اضغط Ctrl + K للبحث السريع في أي صفحة.', 'Press Ctrl + K to search from any page.', 5200, true],
  ['inventory', 'مخزون منخفض: حبر طابعة', 'Low stock: Printer ink', 'نفدت الكمية من حبر الطابعة الأسود.', 'Black printer ink is out of stock.', 7000, true, '/inventory'],
];

export function createNotifications(): AppNotification[] {
  return SEEDS.map(([type, titleAr, titleEn, bodyAr, bodyEn, minutesAgo, read, link], index) => ({
    id: `NTF-${index + 1}`,
    type,
    title: { ar: titleAr, en: titleEn },
    body: { ar: bodyAr, en: bodyEn },
    createdAt: isoMinutesAgo(minutesAgo),
    read,
    link,
  }));
}
