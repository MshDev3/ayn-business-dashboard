import type {
  ActivityEntry,
  AttendanceRecord,
  AttendanceStatus,
  Department,
  Employee,
  EmployeeExtras,
  EmployeeTask,
  Localized,
  TaskStatus,
} from '../types';
import { dateKeyDaysAgo, isoDaysAgo, toDateKey, addDays } from '../utils/dates';

function hash(value: string): number {
  let h = 2166136261;
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const TASKS: Record<Department, Localized[]> = {
  sales: [
    { ar: 'متابعة عروض الأسعار المفتوحة', en: 'Follow up on open quotations' },
    { ar: 'تحديث خط أنابيب المبيعات', en: 'Update the sales pipeline' },
    { ar: 'التحضير لاجتماع تجديد العقد', en: 'Prepare for a contract renewal meeting' },
    { ar: 'مراجعة أهداف الربع', en: 'Review quarterly targets' },
  ],
  operations: [
    { ar: 'مراجعة جدول الشحنات الأسبوعي', en: 'Review the weekly shipment schedule' },
    { ar: 'مطابقة المخزون مع النظام', en: 'Reconcile stock with the system' },
    { ar: 'تحسين مسار تجهيز الطلبات', en: 'Improve the order fulfilment flow' },
    { ar: 'التنسيق مع شركة الشحن', en: 'Coordinate with the freight partner' },
  ],
  finance: [
    { ar: 'إقفال حسابات الأسبوع', en: 'Close the weekly accounts' },
    { ar: 'مراجعة الفواتير المتأخرة', en: 'Review overdue invoices' },
    { ar: 'إعداد ميزانية الشهر القادم', en: 'Prepare next month’s budget' },
    { ar: 'مطابقة كشف الحساب', en: 'Reconcile the account statement' },
  ],
  engineering: [
    { ar: 'تطوير مكوّن الجداول القابلة للفرز', en: 'Build the sortable table component' },
    { ar: 'مراجعة طلبات الدمج', en: 'Review pull requests' },
    { ar: 'تحسين أداء الصفحة الرئيسية', en: 'Improve home page performance' },
    { ar: 'كتابة اختبارات واجهة المستخدم', en: 'Write UI tests' },
  ],
  support: [
    { ar: 'الرد على التذاكر المفتوحة', en: 'Answer open support tickets' },
    { ar: 'تحديث قاعدة المعرفة', en: 'Update the knowledge base' },
    { ar: 'متابعة شكاوى العملاء', en: 'Follow up on customer complaints' },
    { ar: 'إعداد تقرير رضا العملاء', en: 'Prepare the customer satisfaction report' },
  ],
  hr: [
    { ar: 'مراجعة طلبات الإجازات', en: 'Review leave requests' },
    { ar: 'جدولة مقابلات التوظيف', en: 'Schedule hiring interviews' },
    { ar: 'تحديث سياسة العمل عن بعد', en: 'Update the remote-work policy' },
    { ar: 'تجهيز مواد التعريف بالموظفين الجدد', en: 'Prepare new-hire onboarding material' },
  ],
  marketing: [
    { ar: 'جدولة المحتوى الأسبوعي', en: 'Schedule weekly content' },
    { ar: 'تحليل أداء الحملة الإعلانية', en: 'Analyse ad campaign performance' },
    { ar: 'إعداد خطة المحتوى للربع القادم', en: 'Draft next quarter’s content plan' },
    { ar: 'تنسيق جلسة تصوير المنتجات', en: 'Coordinate a product photoshoot' },
  ],
};

const ACTIVITY: Localized[] = [
  { ar: 'سجّل الدخول إلى النظام', en: 'Signed in to the workspace' },
  { ar: 'حدّث بيانات الاتصال الشخصية', en: 'Updated personal contact details' },
  { ar: 'أكمل مهمة وانتقل إلى التالية', en: 'Completed a task and moved to the next' },
  { ar: 'حضر اجتماع الفريق الأسبوعي', en: 'Attended the weekly team meeting' },
  { ar: 'أضاف ملاحظة على ملف عميل', en: 'Added a note to a customer record' },
  { ar: 'قدّم طلب تحديث بيانات', en: 'Submitted a data update request' },
];

const TASK_STATUSES: TaskStatus[] = ['done', 'inProgress', 'todo', 'inProgress'];

export function getEmployeeExtras(employee: Employee): EmployeeExtras {
  const seed = hash(employee.id);

  const attendance: AttendanceRecord[] = [];
  for (let i = 0; i < 14; i++) {
    const date = addDays(new Date(), -i);
    const day = date.getDay();
    // Friday (5) and Saturday (6) are the weekend in Saudi Arabia.
    if (day === 5 || day === 6) continue;
    const roll = (seed >>> (i % 16)) % 10;
    let status: AttendanceStatus = 'present';
    if (employee.status === 'onLeave') status = 'leave';
    else if (employee.status === 'inactive') status = 'absent';
    else if (roll === 3) status = 'late';
    else if (roll === 7 && i > 2) status = 'absent';
    attendance.push({
      date: toDateKey(date),
      status,
      checkIn: status === 'present' ? '08:0' + (roll % 5) : status === 'late' ? '09:' + (10 + roll) : undefined,
      checkOut: status === 'present' || status === 'late' ? '16:' + (30 + (roll % 20)) : undefined,
    });
  }

  const pool = TASKS[employee.department];
  const tasks: EmployeeTask[] = pool.map((title, index) => ({
    id: `${employee.id}-task-${index + 1}`,
    title,
    status: TASK_STATUSES[(index + seed) % TASK_STATUSES.length] ?? 'todo',
    dueDate: dateKeyDaysAgo(-(index * 3 + 1)),
  }));

  const activity: ActivityEntry[] = ACTIVITY.slice(0, 5).map((text, index) => ({
    id: `${employee.id}-act-${index + 1}`,
    text: ACTIVITY[(index + seed) % ACTIVITY.length] ?? text,
    at: isoDaysAgo(index * 2, 9 + ((seed + index) % 8), (seed * (index + 1)) % 60),
  }));

  return { attendance, tasks, activity };
}
