import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { SKU_CODES, STORAGE_KEYS } from '../constants';
import { createDemoData } from '../data';
import type { DemoData } from '../data';
import type {
  CalendarEvent,
  Customer,
  CustomerNote,
  Employee,
  Order,
  Product,
} from '../types';
import { nextId, randomId } from '../utils/domain';
import { readJson, removeKey, writeJson } from '../utils/storage';
import { toDateKey } from '../utils/dates';

export type NewEmployee = Omit<Employee, 'id' | 'joinedAt' | 'avatarHue'> & { joinedAt?: string };
export type NewCustomer = Omit<Customer, 'id' | 'joinedAt' | 'notes'>;
export type NewEvent = Omit<CalendarEvent, 'id'>;
export type NewProduct = Omit<Product, 'id' | 'sku' | 'updatedAt'>;
export type NewOrder = Omit<Order, 'id' | 'createdAt'>;

interface DataValue extends DemoData {
  customerById: ReadonlyMap<string, Customer>;
  productById: ReadonlyMap<string, Product>;
  addEmployee: (input: NewEmployee) => void;
  updateEmployee: (id: string, patch: Partial<Employee>) => void;
  deleteEmployee: (id: string) => void;
  addCustomer: (input: NewCustomer) => void;
  updateCustomer: (id: string, patch: Partial<Customer>) => void;
  addCustomerNote: (customerId: string, text: CustomerNote['text']) => void;
  updateOrder: (id: string, patch: Partial<Pick<Order, 'status' | 'paymentStatus'>>) => void;
  restockProduct: (id: string, quantity: number) => void;
  addProduct: (input: NewProduct) => void;
  /** Creates an order and deducts the ordered quantities from stock (unless the order is cancelled). */
  addOrder: (input: NewOrder) => string;
  addEvent: (input: NewEvent) => void;
  updateEvent: (id: string, patch: Partial<CalendarEvent>) => void;
  deleteEvent: (id: string) => void;
  markNotificationRead: (id: string, read: boolean) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  clearNotifications: () => void;
  resetData: () => void;
}

const DataContext = createContext<DataValue | null>(null);

const COLLECTIONS: Array<keyof DemoData> = [
  'employees',
  'customers',
  'products',
  'orders',
  'transactions',
  'events',
  'notifications',
];

function isDemoData(value: unknown): value is DemoData {
  if (typeof value !== 'object' || value === null) return false;
  return COLLECTIONS.every((key) => Array.isArray((value as Record<string, unknown>)[key]));
}

function loadInitialData(): DemoData {
  const stored = readJson<unknown>(STORAGE_KEYS.data, null);
  return isDemoData(stored) ? stored : createDemoData();
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<DemoData>(loadInitialData);

  useEffect(() => {
    writeJson(STORAGE_KEYS.data, data);
  }, [data]);

  const addEmployee = useCallback<DataValue['addEmployee']>((input) => {
    const avatarHue = Math.floor(Math.random() * 360);
    const joinedAt = input.joinedAt ?? toDateKey(new Date());
    setData((current) => {
      const created: Employee = {
        ...input,
        id: nextId('EMP', current.employees.map((e) => e.id)),
        joinedAt,
        avatarHue,
      };
      return { ...current, employees: [created, ...current.employees] };
    });
  }, []);

  const updateEmployee = useCallback<DataValue['updateEmployee']>((id, patch) => {
    setData((current) => ({
      ...current,
      employees: current.employees.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }, []);

  const deleteEmployee = useCallback<DataValue['deleteEmployee']>((id) => {
    setData((current) => ({ ...current, employees: current.employees.filter((e) => e.id !== id) }));
  }, []);

  const addCustomer = useCallback<DataValue['addCustomer']>((input) => {
    const joinedAt = toDateKey(new Date());
    setData((current) => {
      const created: Customer = {
        ...input,
        id: nextId('CUS', current.customers.map((c) => c.id), 2000),
        joinedAt,
        notes: [],
      };
      return { ...current, customers: [created, ...current.customers] };
    });
  }, []);

  const updateCustomer = useCallback<DataValue['updateCustomer']>((id, patch) => {
    setData((current) => ({
      ...current,
      customers: current.customers.map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }, []);

  const addCustomerNote = useCallback<DataValue['addCustomerNote']>((customerId, text) => {
    const note: CustomerNote = { id: randomId('note'), text, createdAt: new Date().toISOString() };
    setData((current) => ({
      ...current,
      customers: current.customers.map((c) =>
        c.id === customerId ? { ...c, notes: [note, ...c.notes] } : c,
      ),
    }));
  }, []);

  const updateOrder = useCallback<DataValue['updateOrder']>((id, patch) => {
    setData((current) => ({
      ...current,
      orders: current.orders.map((o) => (o.id === id ? { ...o, ...patch } : o)),
    }));
  }, []);

  const restockProduct = useCallback<DataValue['restockProduct']>((id, quantity) => {
    setData((current) => ({
      ...current,
      products: current.products.map((p) =>
        p.id === id ? { ...p, stock: p.stock + quantity, updatedAt: new Date().toISOString() } : p,
      ),
    }));
  }, []);

  const addProduct = useCallback<DataValue['addProduct']>((input) => {
    const updatedAt = new Date().toISOString();
    setData((current) => {
      const inCategory = current.products.filter((p) => p.category === input.category).length;
      const created: Product = {
        ...input,
        id: nextId('PRD', current.products.map((p) => p.id), 3000),
        sku: `AY-${SKU_CODES[input.category]}-${String(inCategory + 1).padStart(3, '0')}`,
        updatedAt,
      };
      return { ...current, products: [created, ...current.products] };
    });
  }, []);

  const addOrder = useCallback<DataValue['addOrder']>(
    (input) => {
      const id = nextId('AY', data.orders.map((o) => o.id));
      const createdAt = new Date().toISOString();
      setData((current) => {
        const order: Order = { ...input, id, createdAt };
        const deduct = input.status !== 'cancelled';
        const products = deduct
          ? current.products.map((p) => {
              const line = input.items.find((item) => item.productId === p.id);
              return line ? { ...p, stock: Math.max(0, p.stock - line.quantity), updatedAt: createdAt } : p;
            })
          : current.products;
        return { ...current, orders: [order, ...current.orders], products };
      });
      return id;
    },
    [data.orders],
  );
  const addEvent = useCallback<DataValue['addEvent']>((input) => {
    const created: CalendarEvent = { ...input, id: randomId('EVT') };
    setData((current) => ({ ...current, events: [...current.events, created] }));
  }, []);

  const updateEvent = useCallback<DataValue['updateEvent']>((id, patch) => {
    setData((current) => ({
      ...current,
      events: current.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),
    }));
  }, []);

  const deleteEvent = useCallback<DataValue['deleteEvent']>((id) => {
    setData((current) => ({ ...current, events: current.events.filter((e) => e.id !== id) }));
  }, []);

  const markNotificationRead = useCallback<DataValue['markNotificationRead']>((id, read) => {
    setData((current) => ({
      ...current,
      notifications: current.notifications.map((n) => (n.id === id ? { ...n, read } : n)),
    }));
  }, []);

  const markAllNotificationsRead = useCallback(() => {
    setData((current) => ({
      ...current,
      notifications: current.notifications.map((n) => (n.read ? n : { ...n, read: true })),
    }));
  }, []);

  const deleteNotification = useCallback<DataValue['deleteNotification']>((id) => {
    setData((current) => ({
      ...current,
      notifications: current.notifications.filter((n) => n.id !== id),
    }));
  }, []);

  const clearNotifications = useCallback(() => {
    setData((current) => ({ ...current, notifications: [] }));
  }, []);

  const resetData = useCallback(() => {
    removeKey(STORAGE_KEYS.data);
    setData(createDemoData());
  }, []);

  const customerById = useMemo(() => new Map(data.customers.map((c) => [c.id, c])), [data.customers]);
  const productById = useMemo(() => new Map(data.products.map((p) => [p.id, p])), [data.products]);

  const value = useMemo<DataValue>(
    () => ({
      ...data,
      customerById,
      productById,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      addCustomer,
      updateCustomer,
      addCustomerNote,
      updateOrder,
      restockProduct,
      addProduct,
      addOrder,
      addEvent,
      updateEvent,
      deleteEvent,
      markNotificationRead,
      markAllNotificationsRead,
      deleteNotification,
      clearNotifications,
      resetData,
    }),
    [
      data,
      customerById,
      productById,
      addEmployee,
      updateEmployee,
      deleteEmployee,
      addCustomer,
      updateCustomer,
      addCustomerNote,
      updateOrder,
      restockProduct,
      addProduct,
      addOrder,
      addEvent,
      updateEvent,
      deleteEvent,
      markNotificationRead,
      markAllNotificationsRead,
      deleteNotification,
      clearNotifications,
      resetData,
    ],
  );

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData(): DataValue {
  const context = useContext(DataContext);
  if (!context) throw new Error('useData must be used inside <DataProvider>');
  return context;
}
