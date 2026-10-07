import { useMemo } from 'react';
import { Link } from 'react-router';
import { Eye } from 'lucide-react';
import { RowActions } from '../../components/tables/RowActions';
import type { Column } from '../../components/tables/DataTable';
import { StatusBadge } from '../../components/ui/Badge';
import { IconLink } from '../../components/ui/Button';
import { useData } from '../../context/DataContext';
import { useI18n } from '../../context/I18nContext';
import { useFormat } from '../../hooks/useFormat';
import { useLocalized } from '../../hooks/useLocalized';
import type { Order } from '../../types';
import { orderItemCount, orderTotal } from '../../utils/domain';

export type OrderColumnKey = 'id' | 'customer' | 'date' | 'items' | 'amount' | 'payment' | 'status' | 'actions';

/** Shared order table columns so Orders, Dashboard, Customer details and Reports all look the same. */
export function useOrderColumns(keys: OrderColumnKey[]): Array<Column<Order>> {
  const { t } = useI18n();
  const format = useFormat();
  const localize = useLocalized();
  const { customerById } = useData();

  return useMemo(() => {
    const customerName = (order: Order) => {
      const customer = customerById.get(order.customerId);
      return customer ? localize(customer.name) : t('common.unknown');
    };

    const all: Record<OrderColumnKey, Column<Order>> = {
      id: {
        key: 'id',
        header: t('orders.columns.id'),
        primary: true,
        sortValue: (o) => o.id,
        cell: (o) => (
          <Link to={`/orders/${o.id}`} className="link-strong ltr num">
            #{o.id}
          </Link>
        ),
      },
      customer: {
        key: 'customer',
        header: t('orders.columns.customer'),
        sortValue: customerName,
        cell: (o) =>
          customerById.has(o.customerId) ? (
            <Link to={`/customers/${o.customerId}`} className="link-plain">
              {customerName(o)}
            </Link>
          ) : (
            customerName(o)
          ),
      },
      date: {
        key: 'date',
        header: t('orders.columns.date'),
        sortValue: (o) => o.createdAt,
        cell: (o) => format.date(o.createdAt),
      },
      items: {
        key: 'items',
        header: t('orders.columns.items'),
        align: 'end',
        sortValue: orderItemCount,
        cell: (o) => <span className="num">{format.number(orderItemCount(o))}</span>,
      },
      amount: {
        key: 'amount',
        header: t('orders.columns.amount'),
        align: 'end',
        sortValue: orderTotal,
        cell: (o) => <span className="num strong">{format.currency(orderTotal(o))}</span>,
      },
      payment: {
        key: 'payment',
        header: t('orders.columns.payment'),
        sortValue: (o) => t(`status.${o.paymentStatus}`),
        cell: (o) => <StatusBadge status={o.paymentStatus} />,
      },
      status: {
        key: 'status',
        header: t('orders.columns.status'),
        sortValue: (o) => t(`status.${o.status}`),
        cell: (o) => <StatusBadge status={o.status} />,
      },
      actions: {
        key: 'actions',
        header: t('common.actions'),
        actions: true,
        cell: (o) => (
          <RowActions>
            <IconLink to={`/orders/${o.id}`} label={t('common.view')} icon={<Eye size={17} />} size="sm" />
          </RowActions>
        ),
      },
    };

    return keys.map((key) => all[key]);
  }, [keys, t, format, localize, customerById]);
}
