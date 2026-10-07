import type { Customer, CustomerStatus } from '../types';
import { dateKeyDaysAgo, isoDaysAgo } from '../utils/dates';

type Seed = [
  nameAr: string,
  nameEn: string,
  contactAr: string,
  contactEn: string,
  emailLocal: string,
  phone: string,
  cityAr: string,
  cityEn: string,
  status: CustomerStatus,
  joinedDaysAgo: number,
];

const SEEDS: Seed[] = [
  ['شركة آفاق للتجارة', 'Afaq Trading Co.', 'عمر السديري', 'Omar Al-Sudairi', 'procurement@afaq', '+966 11 402 1180', 'الرياض', 'Riyadh', 'active', 820],
  ['متجر رُواء', 'Ruwaa Store', 'لجين القرني', 'Lujain Al-Qarni', 'hello@ruwaa', '+966 12 667 3045', 'جدة', 'Jeddah', 'active', 640],
  ['مؤسسة مدى', 'Mada Establishment', 'سعد الدوسري', 'Saad Al-Dosari', 'orders@mada', '+966 13 835 7712', 'الدمام', 'Dammam', 'active', 910],
  ['نواة التقنية', 'Nawat Technology', 'جود العمري', 'Joud Al-Omari', 'it@nawat', '+966 11 293 5568', 'الرياض', 'Riyadh', 'active', 480],
  ['مطعم لمسة', 'Lamsa Restaurant', 'ياسر الخليفة', 'Yasser Al-Khalifa', 'manager@lamsa', '+966 13 892 4401', 'الخبر', 'Khobar', 'active', 360],
  ['صيدلية الندى', 'Al-Nada Pharmacy', 'ملاك الجهني', 'Malak Al-Juhani', 'admin@alnada', '+966 14 823 9076', 'المدينة المنورة', 'Madinah', 'inactive', 1040],
  ['مكتبة الأفق', 'Al-Ofoq Bookstore', 'عادل الأسمري', 'Adel Al-Asmari', 'books@alofoq', '+966 17 224 6613', 'أبها', 'Abha', 'active', 530],
  ['شركة بنيان للمقاولات', 'Bunyan Contracting', 'مشاري الحمود', 'Mishari Al-Hamoud', 'purchasing@bunyan', '+966 11 478 2290', 'الرياض', 'Riyadh', 'active', 1210],
  ['مركز سدرة الطبي', 'Sidra Medical Center', 'د. هالة الفيصل', 'Dr. Hala Al-Faisal', 'supplies@sidra', '+966 12 540 8837', 'جدة', 'Jeddah', 'active', 690],
  ['متجر خزامى', 'Khuzama Boutique', 'رغد السلمي', 'Raghad Al-Sulami', 'shop@khuzama', '+966 11 355 1907', 'الرياض', 'Riyadh', 'new', 38],
  ['مؤسسة رحال للسفر', 'Rihal Travel', 'فهد المنصور', 'Fahad Al-Mansour', 'office@rihal', '+966 12 575 3342', 'مكة المكرمة', 'Makkah', 'active', 420],
  ['شركة نخيل الخضراء', 'Green Nakheel Co.', 'منيرة الصالح', 'Munira Al-Saleh', 'info@greennakheel', '+966 16 381 6620', 'بريدة', 'Buraidah', 'active', 570],
  ['أكاديمية رؤية', 'Ruya Academy', 'تالا الراشد', 'Tala Al-Rashid', 'admin@ruya', '+966 11 462 7718', 'الرياض', 'Riyadh', 'new', 52],
  ['ورشة الإتقان', 'Al-Itqan Workshop', 'حمد العجمي', 'Hamad Al-Ajmi', 'workshop@alitqan', '+966 13 841 5593', 'الدمام', 'Dammam', 'inactive', 980],
  ['شركة جسور اللوجستية', 'Jusoor Logistics', 'بسام الزايدي', 'Bassam Al-Zaidi', 'ops@jusoor', '+966 12 691 4428', 'جدة', 'Jeddah', 'active', 760],
  ['مخبز الواحة', 'Al-Waha Bakery', 'أمل الفرج', 'Amal Al-Faraj', 'orders@alwaha', '+966 13 586 2204', 'الأحساء', 'Al-Ahsa', 'active', 300],
  ['استوديو إلهام', 'Ilham Studio', 'سلمى الحربي', 'Salma Al-Harbi', 'studio@ilham', '+966 11 207 9931', 'الرياض', 'Riyadh', 'new', 24],
  ['شركة سحاب للحلول السحابية', 'Sahab Cloud Solutions', 'عبدالعزيز النجدي', 'Abdulaziz Al-Najdi', 'finance@sahab', '+966 11 519 0046', 'الرياض', 'Riyadh', 'active', 450],
  ['متجر بيدر', 'Baidar Market', 'وفاء الشراري', 'Wafa Al-Sharari', 'market@baidar', '+966 14 427 3815', 'تبوك', 'Tabuk', 'active', 610],
  ['مؤسسة الريادة للتدريب', 'Al-Riyada Training', 'طلال البراك', 'Talal Al-Barrak', 'training@alriyada', '+966 13 877 6502', 'الخبر', 'Khobar', 'active', 880],
];

export function createCustomers(): Customer[] {
  return SEEDS.map(
    ([nameAr, nameEn, contactAr, contactEn, emailLocal, phone, cityAr, cityEn, status, joinedDaysAgo], index) => ({
      id: `CUS-${2001 + index}`,
      name: { ar: nameAr, en: nameEn },
      contact: { ar: contactAr, en: contactEn },
      // ".example" is a reserved TLD, so these addresses can never belong to a real business.
      email: `${emailLocal}.example`,
      phone,
      city: { ar: cityAr, en: cityEn },
      status,
      joinedAt: dateKeyDaysAgo(joinedDaysAgo),
      notes:
        index === 0
          ? [
              {
                id: 'note-seed-1',
                text: {
                  ar: 'يفضّل استلام الفواتير في بداية كل شهر. جهة الاتصال الرئيسية متاحة من الأحد إلى الخميس.',
                  en: 'Prefers invoices sent at the start of the month. Primary contact is available Sunday to Thursday.',
                },
                createdAt: isoDaysAgo(21, 11),
              },
            ]
          : index === 7
            ? [
                {
                  id: 'note-seed-2',
                  text: {
                    ar: 'طلبات متكررة كبيرة لمكاتب المواقع. تم الاتفاق على مهلة سداد 30 يومًا.',
                    en: 'Large recurring orders for site offices. Agreed on a 30-day payment window.',
                  },
                  createdAt: isoDaysAgo(46, 9),
                },
              ]
            : [],
    }),
  );
}
