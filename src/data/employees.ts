import type { Department, Employee, EmployeeStatus } from '../types';
import { dateKeyDaysAgo } from '../utils/dates';

type Seed = [
  nameAr: string,
  nameEn: string,
  emailLocal: string,
  phone: string,
  department: Department,
  titleAr: string,
  titleEn: string,
  status: EmployeeStatus,
  joinedDaysAgo: number,
];

const SEEDS: Seed[] = [
  ['أحمد العتيبي', 'Ahmed Al-Otaibi', 'ahmed.otaibi', '+966 50 214 3381', 'sales', 'مدير المبيعات', 'Sales Manager', 'active', 1480],
  ['سارة الحربي', 'Sara Al-Harbi', 'sara.harbi', '+966 55 480 1927', 'operations', 'قائدة العمليات', 'Operations Lead', 'active', 1260],
  ['خالد القحطاني', 'Khalid Al-Qahtani', 'khalid.qahtani', '+966 54 733 2056', 'finance', 'مدير المالية', 'Finance Manager', 'active', 1710],
  ['نورة الشمري', 'Noura Al-Shammari', 'noura.shammari', '+966 56 902 7714', 'hr', 'أخصائية موارد بشرية', 'HR Specialist', 'onLeave', 840],
  ['فيصل الغامدي', 'Faisal Al-Ghamdi', 'faisal.ghamdi', '+966 50 561 8840', 'engineering', 'مطوّر واجهات أمامية', 'Front-End Engineer', 'active', 610],
  ['ريم الدوسري', 'Reem Al-Dosari', 'reem.dosari', '+966 53 128 4402', 'support', 'قائدة دعم العملاء', 'Customer Support Lead', 'active', 970],
  ['عبدالله الزهراني', 'Abdullah Al-Zahrani', 'abdullah.zahrani', '+966 59 346 7125', 'operations', 'مشرف المستودع', 'Warehouse Supervisor', 'active', 1320],
  ['لمى السبيعي', 'Lama Al-Subaie', 'lama.subaie', '+966 55 871 6039', 'marketing', 'أخصائية تسويق', 'Marketing Specialist', 'active', 430],
  ['تركي المطيري', 'Turki Al-Mutairi', 'turki.mutairi', '+966 50 937 2218', 'sales', 'مسؤول حسابات عملاء', 'Account Executive', 'active', 520],
  ['هند العنزي', 'Hind Al-Anazi', 'hind.anazi', '+966 54 205 9981', 'finance', 'محاسبة', 'Accountant', 'inactive', 1100],
  ['ماجد الشهري', 'Majed Al-Shehri', 'majed.shehri', '+966 56 419 3370', 'operations', 'منسّق لوجستي', 'Logistics Coordinator', 'active', 380],
  ['دانة البقمي', 'Dana Al-Buqami', 'dana.buqami', '+966 53 764 5092', 'marketing', 'استراتيجية محتوى', 'Content Strategist', 'onLeave', 700],
  ['بدر الرشيد', 'Badr Al-Rasheed', 'badr.rasheed', '+966 50 682 1457', 'engineering', 'مصمم واجهات', 'UI Designer', 'active', 290],
  ['غادة العسيري', 'Ghada Al-Asiri', 'ghada.asiri', '+966 55 307 8864', 'support', 'مسؤولة دعم', 'Support Agent', 'active', 240],
  ['سلطان الحازمي', 'Sultan Al-Hazmi', 'sultan.hazmi', '+966 59 118 7703', 'operations', 'مسؤول مشتريات', 'Procurement Officer', 'active', 1560],
  ['جواهر المالكي', 'Jawaher Al-Malki', 'jawaher.malki', '+966 54 590 3316', 'sales', 'ممثلة مبيعات', 'Sales Representative', 'active', 160],
  ['يزيد السهلي', 'Yazeed Al-Sahli', 'yazeed.sahli', '+966 56 273 9048', 'operations', 'محلل عمليات', 'Operations Analyst', 'inactive', 900],
  ['العنود الجهني', 'Alanoud Al-Juhani', 'alanoud.juhani', '+966 50 849 6621', 'hr', 'مسؤولة توظيف', 'Recruiter', 'active', 350],
  ['وليد الخالدي', 'Waleed Al-Khalidi', 'waleed.khalidi', '+966 53 612 0975', 'finance', 'محلل مالي', 'Financial Analyst', 'active', 470],
  ['مها التميمي', 'Maha Al-Tamimi', 'maha.tamimi', '+966 55 946 2283', 'marketing', 'مديرة التسويق', 'Marketing Manager', 'active', 1190],
  ['رائد الفهد', 'Raed Al-Fahad', 'raed.fahad', '+966 54 381 7750', 'engineering', 'مهندس اختبار الجودة', 'QA Engineer', 'active', 205],
  ['شهد الحمدان', 'Shahad Al-Hamdan', 'shahad.hamdan', '+966 56 705 4119', 'support', 'نجاح العملاء', 'Customer Success Specialist', 'onLeave', 560],
  ['ناصر البلوي', 'Nasser Al-Balawi', 'nasser.balawi', '+966 59 472 8836', 'operations', 'موظف مستودع', 'Warehouse Associate', 'active', 125],
  ['أروى الشريف', 'Arwa Al-Sharif', 'arwa.sharif', '+966 50 226 5594', 'operations', 'مساعدة تنفيذية', 'Executive Assistant', 'active', 780],
];

export function createEmployees(): Employee[] {
  return SEEDS.map(
    ([nameAr, nameEn, emailLocal, phone, department, titleAr, titleEn, status, joinedDaysAgo], index) => ({
      id: `EMP-${1001 + index}`,
      name: { ar: nameAr, en: nameEn },
      email: `${emailLocal}@ayn.demo`,
      phone,
      department,
      title: { ar: titleAr, en: titleEn },
      status,
      joinedAt: dateKeyDaysAgo(joinedDaysAgo),
      avatarHue: (index * 47 + 230) % 360,
    }),
  );
}
