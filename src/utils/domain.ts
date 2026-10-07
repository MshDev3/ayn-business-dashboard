import { VAT_RATE } from '../constants';
import type { Order, Product, StockStatus } from '../types';

export function orderSubtotal(order: Pick<Order, 'items'>): number {
  return order.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
}

export function orderVat(order: Pick<Order, 'items'>): number {
  return Math.round(orderSubtotal(order) * VAT_RATE * 100) / 100;
}

export function orderTotal(order: Pick<Order, 'items'>): number {
  return Math.round((orderSubtotal(order) + orderVat(order)) * 100) / 100;
}

export function orderItemCount(order: Pick<Order, 'items'>): number {
  return order.items.reduce((sum, item) => sum + item.quantity, 0);
}

export function stockStatus(product: Pick<Product, 'stock' | 'reorderLevel'>): StockStatus {
  if (product.stock <= 0) return 'outOfStock';
  if (product.stock <= product.reorderLevel) return 'lowStock';
  return 'inStock';
}

/** Next sequential id such as EMP-1025, based on the highest existing numeric suffix. */
export function nextId(prefix: string, existing: string[], start = 1000): string {
  const highest = existing.reduce((max, id) => {
    const value = Number(id.replace(/\D/g, ''));
    return Number.isFinite(value) && value > max ? value : max;
  }, start);
  return `${prefix}-${highest + 1}`;
}

export function randomId(prefix: string): string {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}
