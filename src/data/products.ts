import { SKU_CODES } from '../constants';
import type { Product, ProductCategory } from '../types';
import { isoDaysAgo } from '../utils/dates';

type Seed = [
  category: ProductCategory,
  nameAr: string,
  nameEn: string,
  price: number,
  stock: number,
  reorderLevel: number,
  updatedDaysAgo: number,
];

const SEEDS: Seed[] = [
  ['electronics', 'لابتوب أعمال 14 بوصة', '14" Business Laptop', 3299, 42, 15, 2],
  ['electronics', 'شاشة 27 بوصة بدقة 4K', '27" 4K Monitor', 1249, 9, 12, 1],
  ['electronics', 'لوحة مفاتيح لاسلكية', 'Wireless Keyboard', 189, 134, 40, 6],
  ['electronics', 'فأرة مريحة', 'Ergonomic Mouse', 149, 118, 40, 6],
  ['electronics', 'سماعة اجتماعات', 'Conference Speakerphone', 459, 0, 8, 3],
  ['electronics', 'جهاز نقاط بيع', 'POS Terminal', 1890, 17, 10, 4],
  ['electronics', 'طابعة إيصالات حرارية', 'Thermal Receipt Printer', 620, 6, 10, 2],
  ['electronics', 'راوتر مكتبي', 'Office Router', 399, 51, 15, 9],
  ['electronics', 'كاميرا مراقبة', 'Security Camera', 329, 28, 20, 11],
  ['office', 'ورق طباعة A4 (كرتون)', 'A4 Paper (Carton)', 139, 260, 80, 1],
  ['office', 'أقلام حبر (علبة 50)', 'Ink Pens (Box of 50)', 65, 14, 30, 5],
  ['office', 'دفتر ملاحظات فاخر', 'Premium Notebook', 39, 190, 60, 8],
  ['office', 'ملفات حفظ (حزمة)', 'Archive Folders (Pack)', 55, 77, 30, 12],
  ['office', 'حبر طابعة أسود', 'Black Printer Ink', 210, 0, 20, 2],
  ['furniture', 'كرسي مكتب مريح', 'Ergonomic Office Chair', 899, 23, 10, 7],
  ['furniture', 'مكتب قابل للتعديل', 'Standing Desk', 1650, 8, 8, 3],
  ['furniture', 'خزانة ملفات', 'Filing Cabinet', 740, 16, 6, 15],
  ['furniture', 'طاولة اجتماعات', 'Meeting Table', 2450, 4, 5, 20],
  ['accessories', 'حامل لابتوب', 'Laptop Stand', 159, 88, 25, 4],
  ['accessories', 'حقيبة لابتوب', 'Laptop Bag', 219, 36, 20, 10],
  ['accessories', 'كابل USB-C (2 متر)', 'USB-C Cable (2 m)', 45, 310, 100, 1],
  ['accessories', 'شاحن سريع 65 واط', '65W Fast Charger', 135, 19, 30, 2],
  ['accessories', 'محوّل HDMI', 'HDMI Adapter', 79, 0, 25, 6],
  ['packaging', 'كراتين شحن متوسطة (25)', 'Medium Shipping Boxes (25)', 89, 150, 50, 3],
  ['packaging', 'شريط لاصق (6 قطع)', 'Packing Tape (6 pcs)', 42, 22, 40, 9],
  ['packaging', 'أكياس فقاعية (رول)', 'Bubble Wrap (Roll)', 95, 64, 20, 13],
  ['packaging', 'ملصقات شحن (500)', 'Shipping Labels (500)', 58, 41, 25, 5],
];

export function createProducts(): Product[] {
  const counters: Partial<Record<ProductCategory, number>> = {};
  return SEEDS.map(([category, nameAr, nameEn, price, stock, reorderLevel, updatedDaysAgo], index) => {
    const count = (counters[category] ?? 0) + 1;
    counters[category] = count;
    return {
      id: `PRD-${3001 + index}`,
      sku: `AY-${SKU_CODES[category]}-${String(count).padStart(3, '0')}`,
      name: { ar: nameAr, en: nameEn },
      category,
      stock,
      reorderLevel,
      price,
      updatedAt: isoDaysAgo(updatedDaysAgo, 9 + (index % 7)),
    };
  });
}
