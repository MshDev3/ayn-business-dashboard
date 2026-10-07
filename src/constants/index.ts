import type {
  CountryCode,
  CurrencyCode,
  Department,
  EmployeeStatus,
  EventCategory,
  NotificationType,
  OrderStatus,
  PaymentStatus,
  ProductCategory,
  TransactionCategory,
  CustomerStatus,
  StockStatus,
} from '../types';

/** Keys used for browser persistence. Everything lives in localStorage (or sessionStorage for non-remembered logins). */
export const STORAGE_KEYS = {
  theme: 'ayn:theme',
  lang: 'ayn:lang',
  auth: 'ayn:auth',
  data: 'ayn:data:v1',
  profile: 'ayn:profile',
  business: 'ayn:business',
  notificationPrefs: 'ayn:notification-prefs',
  preferences: 'ayn:preferences',
} as const;

/**
 * Demo-only credentials. This is NOT real authentication: there is no server, and
 * anything stored in the browser can be read by the person using the browser.
 */
export const DEMO_ACCOUNT = {
  email: 'admin@ayn.demo',
  password: '12345678',
} as const;

/** Display-only VAT rate used in order and invoice previews (not accounting logic). */
export const VAT_RATE = 0.15;

export const DEPARTMENTS: Department[] = [
  'sales',
  'operations',
  'finance',
  'engineering',
  'support',
  'hr',
  'marketing',
];
export const EMPLOYEE_STATUSES: EmployeeStatus[] = ['active', 'onLeave', 'inactive'];
export const CUSTOMER_STATUSES: CustomerStatus[] = ['active', 'new', 'inactive'];
export const ORDER_STATUSES: OrderStatus[] = ['completed', 'processing', 'pending', 'cancelled'];
export const PAYMENT_STATUSES: PaymentStatus[] = ['paid', 'unpaid', 'partial', 'refunded'];
export const PRODUCT_CATEGORIES: ProductCategory[] = [
  'electronics',
  'office',
  'furniture',
  'accessories',
  'packaging',
];
export const STOCK_STATUSES: StockStatus[] = ['inStock', 'lowStock', 'outOfStock'];

/** SKU prefix per product category, e.g. AY-ELC-004. */
export const SKU_CODES: Record<ProductCategory, string> = {
  electronics: 'ELC',
  office: 'OFC',
  furniture: 'FRN',
  accessories: 'ACC',
  packaging: 'PKG',
};
export const TRANSACTION_CATEGORIES: TransactionCategory[] = [
  'sales',
  'services',
  'salaries',
  'rent',
  'marketing',
  'supplies',
  'utilities',
  'logistics',
];
export const EVENT_CATEGORIES: EventCategory[] = ['meeting', 'task', 'event', 'reminder'];
export const NOTIFICATION_TYPES: NotificationType[] = [
  'order',
  'inventory',
  'employee',
  'finance',
  'system',
];
export const COUNTRIES: CountryCode[] = ['SA', 'AE', 'KW', 'QA', 'BH', 'OM'];
export const CURRENCIES: CurrencyCode[] = ['SAR', 'AED', 'USD'];

export const CURRENCY_SYMBOLS: Record<CurrencyCode, { ar: string; en: string }> = {
  SAR: { ar: 'ر.س', en: 'SAR' },
  AED: { ar: 'د.إ', en: 'AED' },
  USD: { ar: '$', en: 'USD' },
};

export const ROWS_PER_PAGE_OPTIONS = [6, 8, 10, 15, 20];

export const ADD_STOCK_QUANTITY = 25;
