import type {
  AppNotification,
  BusinessInfo,
  CalendarEvent,
  Customer,
  Employee,
  NotificationPrefs,
  Order,
  Product,
  Transaction,
  UserProfile,
} from '../types';
import { createCustomers } from './customers';
import { createEmployees } from './employees';
import { createEvents } from './events';
import { createTransactions } from './finance';
import { createNotifications } from './notifications';
import { createOrders } from './orders';
import { createProducts } from './products';

export interface DemoData {
  employees: Employee[];
  customers: Customer[];
  products: Product[];
  orders: Order[];
  transactions: Transaction[];
  events: CalendarEvent[];
  notifications: AppNotification[];
}

export function createDemoData(): DemoData {
  const customers = createCustomers();
  const products = createProducts();
  return {
    employees: createEmployees(),
    customers,
    products,
    orders: createOrders(customers, products),
    transactions: createTransactions(),
    events: createEvents(),
    notifications: createNotifications(),
  };
}

export const DEFAULT_PROFILE: UserProfile = {
  name: { ar: 'مشعل', en: 'Mishal' },
  email: 'admin@ayn.demo',
  phone: '+966 50 000 0000',
  role: { ar: 'مدير النظام', en: 'System Administrator' },
};

export const DEFAULT_BUSINESS: BusinessInfo = {
  name: { ar: 'أين للحلول التجارية', en: 'AYN Business Solutions' },
  email: 'hello@ayn.demo',
  phone: '+966 11 000 0000',
  currency: 'SAR',
  country: 'SA',
};

export const DEFAULT_NOTIFICATION_PREFS: NotificationPrefs = {
  order: true,
  inventory: true,
  employee: true,
  finance: true,
  system: true,
};
