import { AreaTrendChart, DonutChart, GroupedBarChart } from '../../components/charts/LazyCharts';
import { useMemo } from 'react';
import {
  AlertTriangle,
  Banknote,
  Boxes,
  CircleDollarSign,
  Crown,
  Download,
  Hourglass,
  PackageMinus,
  Repeat,
  ShoppingBag,
  Tag,
  UserPlus,
  Users,
  Warehouse,
  XCircle,
} from 'lucide-react';
import { BarList } from '../../components/charts/BarList';
import { EmptyState } from '../../components/feedback/States';
import { DataTable } from '../../components/tables/DataTable';
import type { Column } from '../../components/tables/DataTable';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { KpiCard } from '../../components/ui/KpiCard';
import { PRODUCT_CATEGORIES } from '../../constants';
import { useData } from '../../context/DataContext';
import { useI18n } from '../../context/I18nContext';
import { useToast } from '../../context/ToastContext';
import { useCustomerStats } from '../../hooks/useCustomerStats';
import { useFormat } from '../../hooks/useFormat';
import { useLocalized } from '../../hooks/useLocalized';
import type { Customer, Order, Product } from '../../types';
import { downloadCsv } from '../../utils/csv';
import { orderItemCount, orderTotal, stockStatus } from '../../utils/domain';
import { useOrderColumns } from '../orders/orderColumns';
import type { OrderColumnKey } from '../orders/orderColumns';
import { buildBuckets, sumByBucket } from './reportData';
import type { RangeBounds } from './reportData';

interface RangeViewProps {
  orders: Order[];
  bounds: RangeBounds | null;
}

const REPORT_ORDER_COLUMNS: OrderColumnKey[] = ['id', 'customer', 'date', 'amount', 'payment', 'status', 'actions'];

function NoData() {
  const { t } = useI18n();
  return <EmptyState title={t('reports.empty.title')} description={t('reports.empty.text')} />;
}

function ExportButton({ filename, headers, rows }: { filename: string; headers: string[]; rows: Array<Array<string | number>> }) {
  const { t } = useI18n();
  const toast = useToast();
  return (
    <Button
      size="sm"
      variant="secondary"
      icon={<Download size={16} />}
      disabled={rows.length === 0}
      onClick={() => {
        downloadCsv(filename, headers, rows);
        toast.success(t('reports.exported'));
      }}
    >
      {t('common.exportCsv')}
    </Button>
  );
}

/** Orders table + CSV export shared by the Sales and Revenue reports. */
function OrdersTableCard({ orders, title }: { orders: Order[]; title: string }) {
  const { t } = useI18n();
  const format = useFormat();
  const localize = useLocalized();
  const { customerById } = useData();
  const columns = useOrderColumns(REPORT_ORDER_COLUMNS);

  const rows = useMemo(
    () =>
      orders.map((o) => {
        const customer = customerById.get(o.customerId);
        return [
          o.id,
          customer ? localize(customer.name) : '',
          o.createdAt.slice(0, 10),
          orderItemCount(o),
          orderTotal(o),
          t(`status.${o.paymentStatus}`),
          t(`status.${o.status}`),
        ];
      }),
    [orders, customerById, localize, t],
  );

  return (
    <Card flush>
      <CardHeader
        title={title}
        subtitle={t('orders.subtitle', { count: format.number(orders.length) })}
        actions={
          <ExportButton
            filename="ayn-report-orders.csv"
            headers={[
              t('orders.columns.id'),
              t('orders.columns.customer'),
              t('orders.columns.date'),
              t('orders.columns.items'),
              t('orders.columns.amount'),
              t('orders.columns.payment'),
              t('orders.columns.status'),
            ]}
            rows={rows}
          />
        }
      />
      <DataTable
        caption={title}
        columns={columns}
        rows={orders}
        rowKey={(o) => o.id}
        defaultSort={{ key: 'date', direction: 'desc' }}
        resetKey={`${orders.length}-${orders[0]?.id ?? ''}`}
        empty={<NoData />}
      />
    </Card>
  );
}

export function SalesReport({ orders, bounds }: RangeViewProps) {
  const { t, lang } = useI18n();
  const format = useFormat();

  const live = useMemo(() => orders.filter((o) => o.status !== 'cancelled'), [orders]);
  const revenue = live.reduce((sum, o) => sum + orderTotal(o), 0);
  const units = live.reduce((sum, o) => sum + orderItemCount(o), 0);

  const series = useMemo(() => {
    if (!bounds) return [];
    const buckets = buildBuckets(bounds, lang);
    const counts = sumByBucket(buckets, live, () => 1);
    return buckets.map((bucket, index) => ({ label: bucket.label, orders: counts[index] ?? 0 }));
  }, [bounds, live, lang]);

  return (
    <>
      <div className="kpi-grid">
        <KpiCard label={t('reports.kpi.orders')} value={format.number(live.length)} icon={<ShoppingBag />} />
        <KpiCard label={t('reports.kpi.revenue')} value={format.currency(revenue, 0)} icon={<Banknote />} tone="success" />
        <KpiCard
          label={t('reports.kpi.average')}
          value={format.currency(live.length ? revenue / live.length : 0, 0)}
          icon={<CircleDollarSign />}
          tone="info"
        />
        <KpiCard label={t('reports.kpi.units')} value={format.number(units)} icon={<Tag />} tone="warning" />
      </div>
      <Card>
        <CardHeader title={t('reports.charts.ordersOverTime')} subtitle={t('reports.charts.ordersOverTimeSub')} />
        {live.length === 0 ? (
          <NoData />
        ) : (
          <GroupedBarChart
            data={series}
            xKey="label"
            ariaLabel={t('reports.charts.ordersOverTime')}
            formatValue={(value) => format.number(value)}
            formatTick={(value) => format.number(value)}
            series={[{ key: 'orders', label: t('reports.charts.orders'), color: 'var(--chart-2)' }]}
          />
        )}
      </Card>
      <OrdersTableCard orders={orders} title={t('reports.tables.orders')} />
    </>
  );
}

export function RevenueReport({ orders, bounds }: RangeViewProps) {
  const { t, lang } = useI18n();
  const format = useFormat();

  const live = useMemo(() => orders.filter((o) => o.status !== 'cancelled'), [orders]);
  const totals = useMemo(() => {
    let collected = 0;
    let outstanding = 0;
    for (const order of live) {
      const total = orderTotal(order);
      if (order.paymentStatus === 'paid') collected += total;
      else if (order.paymentStatus === 'partial') {
        collected += total / 2;
        outstanding += total / 2;
      } else if (order.paymentStatus === 'unpaid') outstanding += total;
    }
    return { revenue: live.reduce((sum, o) => sum + orderTotal(o), 0), collected, outstanding };
  }, [live]);

  const series = useMemo(() => {
    if (!bounds) return [];
    const buckets = buildBuckets(bounds, lang);
    const sums = sumByBucket(buckets, live, orderTotal);
    return buckets.map((bucket, index) => ({ label: bucket.label, revenue: Math.round(sums[index] ?? 0) }));
  }, [bounds, live, lang]);

  const byPayment = useMemo(() => {
    const map = new Map<string, number>();
    for (const order of live) map.set(order.paymentStatus, (map.get(order.paymentStatus) ?? 0) + orderTotal(order));
    return [...map.entries()].map(([status, value]) => ({ name: t(`status.${status as Order['paymentStatus']}`), value }));
  }, [live, t]);

  return (
    <>
      <div className="kpi-grid">
        <KpiCard label={t('reports.kpi.revenue')} value={format.currency(totals.revenue, 0)} icon={<Banknote />} tone="success" />
        <KpiCard label={t('reports.kpi.paid')} value={format.currency(totals.collected, 0)} icon={<CircleDollarSign />} />
        <KpiCard label={t('reports.kpi.outstanding')} value={format.currency(totals.outstanding, 0)} icon={<Hourglass />} tone="warning" />
        <KpiCard
          label={t('reports.kpi.cancelled')}
          value={format.number(orders.length - live.length)}
          icon={<XCircle />}
          tone="danger"
        />
      </div>
      <div className="grid-2-1">
        <Card>
          <CardHeader title={t('reports.charts.revenueOverTime')} subtitle={t('reports.charts.revenueOverTimeSub')} />
          {live.length === 0 ? (
            <NoData />
          ) : (
            <AreaTrendChart
              data={series}
              xKey="label"
              yKey="revenue"
              seriesLabel={t('reports.charts.revenue')}
              ariaLabel={t('reports.charts.revenueOverTime')}
              formatValue={(value) => format.currency(value, 0)}
              formatTick={(value) => format.compact(value)}
            />
          )}
        </Card>
        <Card>
          <CardHeader title={t('reports.charts.revenueByPayment')} subtitle={t('reports.charts.revenueByPaymentSub')} />
          {byPayment.length === 0 ? (
            <NoData />
          ) : (
            <DonutChart
              data={byPayment}
              ariaLabel={t('reports.charts.revenueByPayment')}
              formatValue={(value) => format.currency(value, 0)}
              formatPercent={(value) => format.percent(value, 0)}
              centerValue={format.compact(totals.revenue)}
              centerLabel={t('reports.kpi.revenue')}
            />
          )}
        </Card>
      </div>
      <OrdersTableCard orders={orders} title={t('reports.tables.orders')} />
    </>
  );
}

interface CustomerRow {
  customer: Customer;
  orders: number;
  spending: number;
}

export function CustomersReport({ orders, bounds }: RangeViewProps) {
  const { t } = useI18n();
  const format = useFormat();
  const localize = useLocalized();
  const { customers, customerById } = useData();
  const stats = useCustomerStats();

  const rows = useMemo<CustomerRow[]>(() => {
    const map = new Map<string, CustomerRow>();
    for (const order of orders) {
      const customer = customerById.get(order.customerId);
      if (!customer) continue;
      const row = map.get(customer.id) ?? { customer, orders: 0, spending: 0 };
      row.orders += 1;
      if (order.status !== 'cancelled') row.spending += orderTotal(order);
      map.set(customer.id, row);
    }
    return [...map.values()].sort((a, b) => b.spending - a.spending);
  }, [orders, customerById]);

  const newCustomers = useMemo(() => {
    if (!bounds) return 0;
    return customers.filter((c) => {
      const joined = new Date(c.joinedAt);
      return joined >= bounds.start && joined < bounds.end;
    }).length;
  }, [customers, bounds]);

  const top = rows[0];
  const repeat = rows.filter((row) => row.orders > 1).length;

  const columns = useMemo<Array<Column<CustomerRow>>>(
    () => [
      {
        key: 'customer',
        header: t('customers.columns.customer'),
        primary: true,
        sortValue: (r) => localize(r.customer.name),
        cell: (r) => <span className="strong">{localize(r.customer.name)}</span>,
      },
      {
        key: 'orders',
        header: t('customers.columns.orders'),
        align: 'end',
        sortValue: (r) => r.orders,
        cell: (r) => <span className="num">{format.number(r.orders)}</span>,
      },
      {
        key: 'spending',
        header: t('customers.columns.spending'),
        align: 'end',
        sortValue: (r) => r.spending,
        cell: (r) => <span className="num strong">{format.currency(r.spending)}</span>,
      },
      {
        key: 'status',
        header: t('customers.columns.status'),
        sortValue: (r) => t(`status.${r.customer.status}`),
        cell: (r) => <StatusBadge status={r.customer.status} />,
      },
      {
        key: 'lastOrder',
        header: t('customers.columns.lastOrder'),
        sortValue: (r) => stats.get(r.customer.id).lastOrderAt ?? '',
        cell: (r) => {
          const last = stats.get(r.customer.id).lastOrderAt;
          return last ? format.date(last) : t('common.emptyValue');
        },
      },
    ],
    [t, localize, format, stats],
  );

  const csvRows = rows.map((r) => [localize(r.customer.name), r.orders, r.spending, t(`status.${r.customer.status}`)]);

  return (
    <>
      <div className="kpi-grid">
        <KpiCard label={t('reports.kpi.activeCustomers')} value={format.number(rows.length)} icon={<Users />} />
        <KpiCard label={t('reports.kpi.newCustomers')} value={format.number(newCustomers)} icon={<UserPlus />} tone="success" />
        <KpiCard
          label={t('reports.kpi.topSpender')}
          value={top ? localize(top.customer.name) : t('common.emptyValue')}
          icon={<Crown />}
          tone="warning"
          hint={top ? format.currency(top.spending, 0) : undefined}
        />
        <KpiCard label={t('reports.kpi.repeatRate')} value={format.number(repeat)} icon={<Repeat />} tone="info" />
      </div>
      <Card>
        <CardHeader title={t('reports.charts.customersBySpend')} subtitle={t('reports.charts.customersBySpendSub')} />
        {rows.length === 0 ? (
          <NoData />
        ) : (
          <BarList
            items={rows.slice(0, 6).map((r) => ({
              id: r.customer.id,
              label: localize(r.customer.name),
              value: r.spending,
              display: format.currency(r.spending, 0),
              hint: `${format.number(r.orders)} ${t('customers.columns.orders')}`,
            }))}
          />
        )}
      </Card>
      <Card flush>
        <CardHeader
          title={t('reports.tables.customers')}
          actions={
            <ExportButton
              filename="ayn-report-customers.csv"
              headers={[
                t('customers.columns.customer'),
                t('customers.columns.orders'),
                t('customers.columns.spending'),
                t('customers.columns.status'),
              ]}
              rows={csvRows}
            />
          }
        />
        <DataTable
          caption={t('reports.tables.customers')}
          columns={columns}
          rows={rows}
          rowKey={(r) => r.customer.id}
          defaultSort={{ key: 'spending', direction: 'desc' }}
          resetKey={String(rows.length)}
          empty={<NoData />}
        />
      </Card>
    </>
  );
}

export function InventoryReport() {
  const { t } = useI18n();
  const format = useFormat();
  const localize = useLocalized();
  const { products } = useData();

  const summary = useMemo(
    () => ({
      value: products.reduce((sum, p) => sum + p.price * p.stock, 0),
      low: products.filter((p) => stockStatus(p) === 'lowStock').length,
      out: products.filter((p) => stockStatus(p) === 'outOfStock').length,
    }),
    [products],
  );

  const byCategory = useMemo(
    () =>
      PRODUCT_CATEGORIES.map((category) => ({
        category,
        value: products.filter((p) => p.category === category).reduce((sum, p) => sum + p.price * p.stock, 0),
      })).sort((a, b) => b.value - a.value),
    [products],
  );

  const attention = useMemo(() => products.filter((p) => stockStatus(p) !== 'inStock'), [products]);

  const columns = useMemo<Array<Column<Product>>>(
    () => [
      { key: 'sku', header: t('inventory.columns.sku'), sortValue: (p) => p.sku, cell: (p) => <span className="ltr num muted">{p.sku}</span> },
      {
        key: 'product',
        header: t('inventory.columns.product'),
        primary: true,
        sortValue: (p) => localize(p.name),
        cell: (p) => <span className="strong">{localize(p.name)}</span>,
      },
      {
        key: 'category',
        header: t('inventory.columns.category'),
        sortValue: (p) => t(`productCategories.${p.category}`),
        cell: (p) => t(`productCategories.${p.category}`),
      },
      {
        key: 'stock',
        header: t('inventory.columns.stock'),
        align: 'end',
        sortValue: (p) => p.stock,
        cell: (p) => <span className="num">{format.number(p.stock)}</span>,
      },
      {
        key: 'status',
        header: t('inventory.columns.status'),
        sortValue: (p) => t(`status.${stockStatus(p)}`),
        cell: (p) => <StatusBadge status={stockStatus(p)} />,
      },
    ],
    [t, localize, format],
  );

  return (
    <>
      <div className="kpi-grid">
        <KpiCard label={t('reports.kpi.products')} value={format.number(products.length)} icon={<Boxes />} />
        <KpiCard label={t('reports.kpi.stockValue')} value={format.currency(summary.value, 0)} icon={<Warehouse />} tone="success" />
        <KpiCard label={t('reports.kpi.lowStock')} value={format.number(summary.low)} icon={<AlertTriangle />} tone="warning" />
        <KpiCard label={t('reports.kpi.outOfStock')} value={format.number(summary.out)} icon={<PackageMinus />} tone="danger" />
      </div>
      <Card>
        <CardHeader title={t('reports.charts.stockByCategory')} subtitle={t('reports.charts.stockByCategorySub')} />
        <BarList
          items={byCategory.map((entry) => ({
            id: entry.category,
            label: t(`productCategories.${entry.category}`),
            value: entry.value,
            display: format.currency(entry.value, 0),
          }))}
        />
      </Card>
      <Card flush>
        <CardHeader
          title={t('reports.tables.products')}
          subtitle={t('reports.tables.productsSub')}
          actions={
            <ExportButton
              filename="ayn-report-inventory.csv"
              headers={[
                t('inventory.columns.sku'),
                t('inventory.columns.product'),
                t('inventory.columns.category'),
                t('inventory.columns.stock'),
                t('inventory.columns.status'),
              ]}
              rows={attention.map((p) => [
                p.sku,
                localize(p.name),
                t(`productCategories.${p.category}`),
                p.stock,
                t(`status.${stockStatus(p)}`),
              ])}
            />
          }
        />
        <DataTable
          caption={t('reports.tables.products')}
          columns={columns}
          rows={attention}
          rowKey={(p) => p.id}
          defaultSort={{ key: 'stock', direction: 'asc' }}
          empty={<NoData />}
        />
      </Card>
    </>
  );
}
