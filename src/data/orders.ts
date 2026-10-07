import type { Customer, Order, OrderStatus, PaymentStatus, Product } from '../types';
import { isoDaysAgo } from '../utils/dates';

/** Small deterministic PRNG so the demo data is identical on every load and reset. */
function mulberry32(seed: number) {
  let a = seed;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const ORDER_COUNT = 48;

export function createOrders(customers: Customer[], products: Product[]): Order[] {
  const rand = mulberry32(20261004);
  const orders: Order[] = [];

  for (let i = 0; i < ORDER_COUNT; i++) {
    // i = 0 is the oldest order; the newest orders are created within the last few days.
    const age = Math.round(((ORDER_COUNT - 1 - i) / (ORDER_COUNT - 1)) ** 1.15 * 118);
    const customer = customers[Math.floor(rand() * customers.length)] ?? customers[0];
    if (!customer) continue;

    const lineCount = 1 + Math.floor(rand() * 3);
    const chosen = new Set<number>();
    while (chosen.size < lineCount) chosen.add(Math.floor(rand() * products.length));
    const items = [...chosen].flatMap((productIndex) => {
      const product = products[productIndex];
      if (!product) return [];
      const heavy = product.price < 150;
      const quantity = heavy ? 2 + Math.floor(rand() * 14) : 1 + Math.floor(rand() * 4);
      return [{ productId: product.id, quantity, unitPrice: product.price }];
    });

    let status: OrderStatus;
    let paymentStatus: PaymentStatus;
    const roll = rand();
    if (age > 14) {
      status = roll < 0.88 ? 'completed' : 'cancelled';
    } else if (age > 5) {
      status = roll < 0.55 ? 'completed' : roll < 0.8 ? 'processing' : roll < 0.92 ? 'pending' : 'cancelled';
    } else {
      status = roll < 0.25 ? 'completed' : roll < 0.6 ? 'processing' : roll < 0.95 ? 'pending' : 'cancelled';
    }

    if (status === 'completed') paymentStatus = rand() < 0.9 ? 'paid' : 'partial';
    else if (status === 'processing') paymentStatus = rand() < 0.5 ? 'paid' : rand() < 0.5 ? 'partial' : 'unpaid';
    else if (status === 'pending') paymentStatus = 'unpaid';
    else paymentStatus = rand() < 0.5 ? 'refunded' : 'unpaid';

    orders.push({
      id: `AY-${1001 + i}`,
      customerId: customer.id,
      createdAt: isoDaysAgo(age, 8 + Math.floor(rand() * 9), Math.floor(rand() * 60)),
      items,
      status,
      paymentStatus,
    });
  }

  return orders;
}
