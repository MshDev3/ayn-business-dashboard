import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { orderTotal } from '../utils/domain';

export interface CustomerStats {
  orderCount: number;
  spending: number;
  lastOrderAt: string | null;
}

const EMPTY_STATS: CustomerStats = { orderCount: 0, spending: 0, lastOrderAt: null };

/** Per-customer order totals derived from the order list, so they always match the Orders page. */
export function useCustomerStats() {
  const { orders } = useData();

  return useMemo(() => {
    const stats = new Map<string, CustomerStats>();
    for (const order of orders) {
      const current = stats.get(order.customerId) ?? { ...EMPTY_STATS };
      current.orderCount += 1;
      if (order.status !== 'cancelled') current.spending += orderTotal(order);
      if (!current.lastOrderAt || order.createdAt > current.lastOrderAt) current.lastOrderAt = order.createdAt;
      stats.set(order.customerId, current);
    }
    return {
      get: (customerId: string): CustomerStats => stats.get(customerId) ?? EMPTY_STATS,
    };
  }, [orders]);
}
