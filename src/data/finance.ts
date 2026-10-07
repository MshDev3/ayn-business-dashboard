import type { MonthlyFinancePoint, Transaction, TransactionCategory, TransactionStatus, TransactionType } from '../types';
import { dateKeyDaysAgo } from '../utils/dates';

/** Twelve months of revenue/expenses in SAR, oldest first. monthsAgo = 0 is the current month. */
export const MONTHLY_FINANCE: MonthlyFinancePoint[] = [
  { monthsAgo: 11, revenue: 82400, expenses: 61200 },
  { monthsAgo: 10, revenue: 88900, expenses: 64500 },
  { monthsAgo: 9, revenue: 85100, expenses: 63800 },
  { monthsAgo: 8, revenue: 96300, expenses: 70100 },
  { monthsAgo: 7, revenue: 102800, expenses: 72400 },
  { monthsAgo: 6, revenue: 99400, expenses: 71900 },
  { monthsAgo: 5, revenue: 108700, expenses: 77300 },
  { monthsAgo: 4, revenue: 115200, expenses: 80100 },
  { monthsAgo: 3, revenue: 111900, expenses: 79400 },
  { monthsAgo: 2, revenue: 121600, expenses: 84600 },
  { monthsAgo: 1, revenue: 124300, expenses: 86200 },
  { monthsAgo: 0, revenue: 128450, expenses: 89700 },
];

export const MONTHLY_TARGET = 150000;

/** Month-over-month growth (%) for KPIs that are not derivable from the seeded records. */
export const KPI_TREND_MOCK = { customers: 5.7, products: 3.1 };

/** Sales for the last seven days (oldest first), in SAR. */
export const WEEKLY_SALES = [2400, 3100, 2700, 4600, 3900, 5800, 5100];

type Seed = [
  descriptionAr: string,
  descriptionEn: string,
  category: TransactionCategory,
  daysAgo: number,
  amount: number,
  type: TransactionType,
  status: TransactionStatus,
];

const SEEDS: Seed[] = [
  ['دفعة طلب من شركة آفاق للتجارة', 'Order payment from Afaq Trading Co.', 'sales', 1, 5577.5, 'income', 'completed'],
  ['دفعة طلب من مركز سدرة الطبي', 'Order payment from Sidra Medical Center', 'sales', 2, 8392, 'income', 'completed'],
  ['رواتب الموظفين — الشهر الحالي', 'Staff salaries — current month', 'salaries', 3, 46500, 'expense', 'completed'],
  ['إيجار المكتب الرئيسي', 'Head office rent', 'rent', 4, 14000, 'expense', 'completed'],
  ['حملة إعلانات رقمية', 'Digital advertising campaign', 'marketing', 5, 6200, 'expense', 'completed'],
  ['فاتورة خدمات صيانة — مؤسسة مدى', 'Maintenance service invoice — Mada Establishment', 'services', 6, 3450, 'income', 'pending'],
  ['شحن وتوصيل الطلبات', 'Order shipping and delivery', 'logistics', 6, 2780, 'expense', 'completed'],
  ['دفعة طلب من نواة التقنية', 'Order payment from Nawat Technology', 'sales', 7, 12640, 'income', 'completed'],
  ['فاتورة الكهرباء', 'Electricity bill', 'utilities', 8, 1860, 'expense', 'completed'],
  ['مستلزمات مكتبية', 'Office supplies', 'supplies', 9, 2140, 'expense', 'completed'],
  ['دفعة طلب من متجر بيدر', 'Order payment from Baidar Market', 'sales', 10, 4315, 'income', 'completed'],
  ['استشارة تقنية — شركة سحاب', 'Technical consultation — Sahab Cloud', 'services', 11, 9800, 'income', 'completed'],
  ['فاتورة الاتصالات والإنترنت', 'Telecom and internet bill', 'utilities', 12, 940, 'expense', 'completed'],
  ['فاتورة متأخرة — ورشة الإتقان', 'Overdue invoice — Al-Itqan Workshop', 'sales', 14, 2975, 'income', 'overdue'],
  ['اشتراكات برمجيات سنوية', 'Annual software subscriptions', 'supplies', 15, 7350, 'expense', 'completed'],
  ['دفعة طلب من شركة بنيان للمقاولات', 'Order payment from Bunyan Contracting', 'sales', 16, 18420, 'income', 'completed'],
  ['رعاية فعالية تجارية', 'Trade event sponsorship', 'marketing', 18, 8500, 'expense', 'completed'],
  ['شحن بضائع من المورّد', 'Supplier freight charges', 'logistics', 19, 3620, 'expense', 'pending'],
  ['دفعة طلب من أكاديمية رؤية', 'Order payment from Ruya Academy', 'sales', 21, 3905, 'income', 'completed'],
  ['تدريب وورش عمل — مؤسسة الريادة', 'Training and workshops — Al-Riyada', 'services', 23, 6400, 'income', 'completed'],
  ['إيجار المستودع', 'Warehouse rent', 'rent', 25, 9500, 'expense', 'completed'],
  ['دفعة طلب من متجر رُواء', 'Order payment from Ruwaa Store', 'sales', 27, 6180, 'income', 'completed'],
  ['مصاريف تسويق عبر المؤثرين', 'Influencer marketing', 'marketing', 29, 4800, 'expense', 'completed'],
  ['رواتب الموظفين — الشهر الماضي', 'Staff salaries — last month', 'salaries', 33, 45200, 'expense', 'completed'],
  ['دفعة طلب من شركة نخيل الخضراء', 'Order payment from Green Nakheel Co.', 'sales', 35, 7230, 'income', 'completed'],
  ['فاتورة المياه والكهرباء', 'Water and electricity bill', 'utilities', 38, 2210, 'expense', 'completed'],
  ['مستلزمات تغليف', 'Packaging supplies', 'supplies', 41, 3085, 'expense', 'completed'],
  ['فاتورة خدمات — مركز سدرة الطبي', 'Service invoice — Sidra Medical Center', 'services', 44, 5200, 'income', 'completed'],
  ['دفعة طلب من شركة جسور اللوجستية', 'Order payment from Jusoor Logistics', 'sales', 47, 9640, 'income', 'completed'],
  ['إيجار المكتب الرئيسي', 'Head office rent', 'rent', 56, 14000, 'expense', 'completed'],
  ['رواتب الموظفين — قبل شهرين', 'Staff salaries — two months ago', 'salaries', 63, 44800, 'expense', 'completed'],
  ['دفعة طلب من مطعم لمسة', 'Order payment from Lamsa Restaurant', 'sales', 66, 2860, 'income', 'completed'],
  ['حملة إعلانية موسمية', 'Seasonal ad campaign', 'marketing', 72, 11200, 'expense', 'completed'],
];

export function createTransactions(): Transaction[] {
  return SEEDS.map(([descriptionAr, descriptionEn, category, daysAgo, amount, type, status], index) => ({
    id: `TRX-${5001 + index}`,
    description: { ar: descriptionAr, en: descriptionEn },
    category,
    date: dateKeyDaysAgo(daysAgo),
    amount,
    type,
    status,
  }));
}
