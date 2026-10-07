import { useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { Banknote, Download, Plus, ShoppingBag, Timer, XCircle } from 'lucide-react';
import { EmptyState } from '../../components/feedback/States';
import { Select } from '../../components/forms/Fields';
import { SearchInput } from '../../components/forms/SearchInput';
import { DataTable } from '../../components/tables/DataTable';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { KpiCard } from '../../components/ui/KpiCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { ORDER_STATUSES, PAYMENT_STATUSES } from '../../constants';
import { useData } from '../../context/DataContext';
import { useI18n } from '../../context/I18nContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useFormat } from '../../hooks/useFormat';
import { useInitialLoading } from '../../hooks/useInitialLoading';
import { useLocalized } from '../../hooks/useLocalized';
import { addDays, startOfDay } from '../../utils/dates';
import { downloadCsv } from '../../utils/csv';
import { orderItemCount, orderTotal } from '../../utils/domain';
import { matchesQuery } from '../../utils/text';
import { OrderFormModal } from './OrderFormModal';
import { useOrderColumns } from './orderColumns';
import type { OrderColumnKey } from './orderColumns';

const COLUMNS: OrderColumnKey[] = ['id', 'customer', 'date', 'items', 'amount', 'payment', 'status', 'actions'];
const DATE_RANGES = ['all', 'days7', 'days30', 'days90'] as const;
type DateRange = (typeof DATE_RANGES)[number];
const RANGE_DAYS: Record<Exclude<DateRange, 'all'>, number> = { days7: 7, days30: 30, days90: 90 };

export default function OrdersPage() {
  const { t } = useI18n();
  useDocumentTitle(t('orders.title'));
  const format = useFormat();
  const localize = useLocalized();
  const toast = useToast();
  const { orders, customerById, addOrder } = useData();
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const addOpen = params.get('new') === '1';
  const openAdd = () => setParams({ new: '1' });
  const closeAdd = () => setParams({}, { replace: true });
  const columns = useOrderColumns(COLUMNS);
  const loading = useInitialLoading('orders');

  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [payment, setPayment] = useState('all');
  const [range, setRange] = useState<DateRange>('all');

  const filtered = useMemo(() => {
    const since = range === 'all' ? null : startOfDay(addDays(new Date(), -RANGE_DAYS[range])).toISOString();
    return orders.filter((order) => {
      const customer = customerById.get(order.customerId);
      return (
        (status === 'all' || order.status === status) &&
        (payment === 'all' || order.paymentStatus === payment) &&
        (since === null || order.createdAt >= since) &&
        matchesQuery(search, order.id, customer?.name.ar, customer?.name.en)
      );
    });
  }, [orders, customerById, search, status, payment, range]);

  const summary = useMemo(() => {
    const live = orders.filter((o) => o.status !== 'cancelled');
    return {
      revenue: live.reduce((sum, o) => sum + orderTotal(o), 0),
      open: orders.filter((o) => o.status === 'pending' || o.status === 'processing').length,
      cancelled: orders.filter((o) => o.status === 'cancelled').length,
    };
  }, [orders]);

  const exportCsv = () => {
    downloadCsv(
      'ayn-orders.csv',
      [
        t('orders.columns.id'),
        t('orders.columns.customer'),
        t('orders.columns.date'),
        t('orders.columns.items'),
        t('orders.columns.amount'),
        t('orders.columns.payment'),
        t('orders.columns.status'),
      ],
      filtered.map((o) => {
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
    );
    toast.success(t('reports.exported'));
  };

  const filtersActive = search !== '' || status !== 'all' || payment !== 'all' || range !== 'all';

  return (
    <div className="page">
      <PageHeader
        title={t('orders.title')}
        subtitle={t('orders.subtitle', { count: format.number(orders.length) })}
        actions={
          <>
            <Button variant="secondary" icon={<Download size={18} />} onClick={exportCsv} disabled={filtered.length === 0}>
              {t('common.exportCsv')}
            </Button>
            <Button variant="primary" icon={<Plus size={18} />} onClick={openAdd}>
              {t('orders.add')}
            </Button>
          </>
        }
      />

      <div className="kpi-grid">
        <KpiCard label={t('orders.kpi.total')} value={format.number(orders.length)} icon={<ShoppingBag />} />
        <KpiCard
          label={t('orders.kpi.revenue')}
          value={format.currency(summary.revenue, 0)}
          icon={<Banknote />}
          tone="success"
          hint={t('orders.kpi.revenueHint')}
        />
        <KpiCard label={t('orders.kpi.open')} value={format.number(summary.open)} icon={<Timer />} tone="info" />
        <KpiCard label={t('orders.kpi.cancelled')} value={format.number(summary.cancelled)} icon={<XCircle />} tone="danger" />
      </div>

      <Card flush>
        <div className="toolbar">
          <SearchInput
            className="toolbar__search"
            value={search}
            onChange={setSearch}
            placeholder={t('orders.searchPlaceholder')}
            label={t('orders.searchLabel')}
          />
          <div className="toolbar__filters">
            <Select
              aria-label={t('orders.columns.status')}
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              options={[
                { value: 'all', label: t('orders.allStatuses') },
                ...ORDER_STATUSES.map((value) => ({ value, label: t(`status.${value}`) })),
              ]}
            />
            <Select
              aria-label={t('orders.columns.payment')}
              value={payment}
              onChange={(event) => setPayment(event.target.value)}
              options={[
                { value: 'all', label: t('orders.allPayments') },
                ...PAYMENT_STATUSES.map((value) => ({ value, label: t(`status.${value}`) })),
              ]}
            />
            <Select
              aria-label={t('orders.dateRange.label')}
              value={range}
              onChange={(event) => setRange(event.target.value as DateRange)}
              options={DATE_RANGES.map((value) => ({ value, label: t(`orders.dateRange.${value}`) }))}
            />
          </div>
        </div>

        <DataTable
          caption={t('orders.title')}
          columns={columns}
          rows={filtered}
          rowKey={(o) => o.id}
          defaultSort={{ key: 'date', direction: 'desc' }}
          loading={loading}
          resetKey={`${search}|${status}|${payment}|${range}`}
          empty={
            <EmptyState
              icon={<ShoppingBag size={26} />}
              title={t('orders.empty.title')}
              description={t('orders.empty.text')}
              action={
                filtersActive ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSearch('');
                      setStatus('all');
                      setPayment('all');
                      setRange('all');
                    }}
                  >
                    {t('common.clearFilters')}
                  </Button>
                ) : undefined
              }
            />
          }
        />
      </Card>

      <OrderFormModal
        open={addOpen}
        onClose={closeAdd}
        onSubmit={(values) => {
          const id = addOrder(values);
          toast.success(t('orders.toast.created', { id }));
          closeAdd();
          navigate(`/orders/${id}`);
        }}
      />
    </div>
  );
}
