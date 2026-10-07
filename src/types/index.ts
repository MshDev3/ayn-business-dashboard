export type Lang = 'ar' | 'en';

export interface Localized {
  ar: string;
  en: string;
}

export type ThemeMode = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

/* ---------- Employees ---------- */

export type Department =
  | 'sales'
  | 'operations'
  | 'finance'
  | 'engineering'
  | 'support'
  | 'hr'
  | 'marketing';

export type EmployeeStatus = 'active' | 'onLeave' | 'inactive';

export interface Employee {
  id: string;
  name: Localized;
  email: string;
  phone: string;
  department: Department;
  title: Localized;
  status: EmployeeStatus;
  /** Date-only ISO string (YYYY-MM-DD). */
  joinedAt: string;
  /** 0–360, used to derive a stable avatar colour. */
  avatarHue: number;
}

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'leave';

export interface AttendanceRecord {
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
}

export type TaskStatus = 'todo' | 'inProgress' | 'done';

export interface EmployeeTask {
  id: string;
  title: Localized;
  status: TaskStatus;
  dueDate: string;
}

export interface ActivityEntry {
  id: string;
  text: Localized;
  at: string;
}

export interface EmployeeExtras {
  attendance: AttendanceRecord[];
  tasks: EmployeeTask[];
  activity: ActivityEntry[];
}

/* ---------- Customers ---------- */

export type CustomerStatus = 'active' | 'new' | 'inactive';

export interface CustomerNote {
  id: string;
  text: Localized;
  createdAt: string;
}

export interface Customer {
  id: string;
  name: Localized;
  contact: Localized;
  email: string;
  phone: string;
  city: Localized;
  status: CustomerStatus;
  joinedAt: string;
  notes: CustomerNote[];
}

/* ---------- Products & orders ---------- */

export type ProductCategory = 'electronics' | 'office' | 'furniture' | 'accessories' | 'packaging';
export type StockStatus = 'inStock' | 'lowStock' | 'outOfStock';

export interface Product {
  id: string;
  sku: string;
  name: Localized;
  category: ProductCategory;
  stock: number;
  reorderLevel: number;
  /** Unit price excluding VAT. */
  price: number;
  updatedAt: string;
}

export type OrderStatus = 'completed' | 'processing' | 'pending' | 'cancelled';
export type PaymentStatus = 'paid' | 'unpaid' | 'partial' | 'refunded';

export interface OrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

export interface Order {
  id: string;
  customerId: string;
  createdAt: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
}

/* ---------- Finance ---------- */

export type TransactionType = 'income' | 'expense';
export type TransactionStatus = 'completed' | 'pending' | 'overdue';
export type TransactionCategory =
  | 'sales'
  | 'services'
  | 'salaries'
  | 'rent'
  | 'marketing'
  | 'supplies'
  | 'utilities'
  | 'logistics';

export interface Transaction {
  id: string;
  description: Localized;
  category: TransactionCategory;
  date: string;
  amount: number;
  type: TransactionType;
  status: TransactionStatus;
}

export interface MonthlyFinancePoint {
  /** Months back from the current month (0 = this month). */
  monthsAgo: number;
  revenue: number;
  expenses: number;
}

/* ---------- Calendar & notifications ---------- */

export type EventCategory = 'meeting' | 'task' | 'event' | 'reminder';

export interface CalendarEvent {
  id: string;
  title: Localized;
  /** Date-only ISO string (YYYY-MM-DD). */
  date: string;
  /** HH:mm */
  time: string;
  category: EventCategory;
  description: Localized;
}

export type NotificationType = 'order' | 'inventory' | 'employee' | 'finance' | 'system';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: Localized;
  body: Localized;
  createdAt: string;
  read: boolean;
  link?: string;
}

/* ---------- Settings ---------- */

export type CurrencyCode = 'SAR' | 'AED' | 'USD';
export type CountryCode = 'SA' | 'AE' | 'KW' | 'QA' | 'BH' | 'OM';

export interface UserProfile {
  name: Localized;
  email: string;
  phone: string;
  role: Localized;
}

export interface BusinessInfo {
  name: Localized;
  email: string;
  phone: string;
  currency: CurrencyCode;
  country: CountryCode;
}

export type NotificationPrefs = Record<NotificationType, boolean>;

export interface AppPreferences {
  rowsPerPage: number;
  sidebarCollapsed: boolean;
}

export type SortDirection = 'asc' | 'desc';
