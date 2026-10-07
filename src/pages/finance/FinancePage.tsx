import { DonutChart, GroupedBarChart } from '../../components/charts/LazyCharts';
import { useMemo, useState } from 'react';
import { Banknote, Receipt, TrendingUp, Wallet } from 'lucide-react';
import { EmptyState } from '../../components/feedback/States';
import { Select } from '../../components/forms/Fields';
import { SearchInput } from '../../components/forms/SearchInput';
import { DataTable } from '../../components/tables/DataTable';
import type { Column } from '../../components/tables/DataTable';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { KpiCard } from '../../components/ui/KpiCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { Segmented } from '../../components/ui/Segmented';
import { useData } from '../../context/DataContext';
import { useI18n } from '../../context/I18nContext';
import { MONTHLY_FINANCE } from '../../data/finance';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useFormat } from '../../hooks/useFormat';
import { useInitialLoading } from '../../hooks/useInitialLoading';
import { useLocalized } from '../../hooks/useLocalized';
import type { Transaction } from '../../types';
import { monthsAgoDate } from '../../utils/dates';
import { orderTotal } from '../../utils/domain';
import { monthName } from '../../utils/format';
import { matchesQuery } from '../../utils/text';

type Span = '6' | '12';

export default function FinancePage() {
  const { t, lang } = useI18n();
  useDocumentTitle(t('finance.title'));
  const format = useFormat();
  const localize = useLocalized();
  const { orders, transactions } = useData();
  const loading = useInitialLoading('finance');

  const [span, setSpan] = useState<Span>('12');
  const [search, setSearch] = useState('');
  const [type, setType] = useState('all');
  const [status, setStatus] = useState('all');

  const totals = useMemo(() => {
    const revenue = MONTHLY_FINANCE.reduce((sum, m) => sum + m.revenue, 0);
    const expenses = MONTHLY_FINANCE.reduce((sum, m) => sum + m.expenses, 0);
    // Outstanding = unpaid orders in full plus half of partially paid ones (demo approximation).
    const outstanding = orders.reduce((sum, order) => {
      if (order.status === 'cancelled') return sum;
      if (order.paymentStatus === 'unpaid') return sum + orderTotal(order);
      if (order.paymentStatus === 'partial') return sum + orderTotal(order) / 2;
      return sum;
    }, 0);
    return { revenue, expenses, profit: revenue - expenses, outstanding };
  }, [orders]);

  const trendData = useMemo(
    () =>
      MONTHLY_FINANCE.slice(-Number(span)).map((point) => ({
        month: monthName(monthsAgoDate(point.monthsAgo).getMonth(), lang),
        revenue: point.revenue,
        expenses: point.expenses,
      })),
    [span, lang],
  );

  const expenseBreakdown = useMemo(() => {
    const byCategory = new Map<string, number>();
    for (const tx of transactions) {
      if (tx.type === 'expense') byCategory.set(tx.category, (byCategory.get(tx.category) ?? 0) + tx.amount);
    }
    return [...byCategory.entries()]
      .sort((a, b) => b[1] - a[1])
      .map(([category, value]) => ({ name: t(`transactionCategories.${category as Transaction['category']}`), value }));
  }, [transactions, t]);
  const expenseTotal = expenseBreakdown.reduce((sum, slice) => sum + slice.value, 0);

  const filtered = useMemo(
    () =>
      transactions.filter(
        (tx) =>
          (type === 'all' || tx.type === type) &&
          (status === 'all' || tx.status === status) &&
          matchesQuery(search, tx.description.ar, tx.description.en, tx.id),
      ),
    [transactions, search, type, status],
  );

  const columns = useMemo<Array<Column<Transaction>>>(
    () => [
      {
        key: 'id',
        header: t('finance.transactions.columns.id'),
        sortValue: (tx) => tx.id,
        cell: (tx) => <span className="ltr num muted">{tx.id}</span>,
      },
      {
        key: 'description',
        header: t('finance.transactions.columns.description'),
        primary: true,
        sortValue: (tx) => localize(tx.description),
        cell: (tx) => <span className="strong">{localize(tx.description)}</span>,
      },
      {
        key: 'category',
        header: t('finance.transactions.columns.category'),
        sortValue: (tx) => t(`transactionCategories.${tx.category}`),
        cell: (tx) => t(`transactionCategories.${tx.category}`),
      },
      {
        key: 'date',
        header: t('finance.transactions.columns.date'),
        sortValue: (tx) => tx.date,
        cell: (tx) => format.date(tx.date),
      },
      {
        key: 'amount',
        header: t('finance.transactions.columns.amount'),
        align: 'end',
        sortValue: (tx) => (tx.type === 'income' ? tx.amount : -tx.amount),
        cell: (tx) => (
          // dir="ltr" keeps the sign, number and currency in one predictable left-to-right run.
          <span dir="ltr" className={tx.type === 'income' ? 'amount amount--in num' : 'amount amount--out num'}>
            {tx.type === 'income' ? '+' : '−'}
            {format.currency(tx.amount)}
          </span>
        ),
      },
      {
        key: 'type',
        header: t('finance.transactions.columns.type'),
        sortValue: (tx) => tx.type,
        cell: (tx) => <StatusBadge status={tx.type} />,
      },
      {
        key: 'status',
        header: t('finance.transactions.columns.status'),
        sortValue: (tx) => t(`status.${tx.status}`),
        cell: (tx) => <StatusBadge status={tx.status} />,
      },
    ],
    [t, localize, format],
  );

  const filtersActive = search !== '' || type !== 'all' || status !== 'all';
  const margin = totals.revenue === 0 ? 0 : (totals.profit / totals.revenue) * 100;

  return (
    <div className="page">
      <PageHeader title={t('finance.title')} subtitle={t('finance.subtitle')} />

      <div className="kpi-grid">
        <KpiCard
          label={t('finance.kpi.revenue')}
          value={format.currency(totals.revenue, 0)}
          icon={<Banknote />}
          tone="success"
          hint={t('finance.kpi.revenueHint')}
        />
        <KpiCard
          label={t('finance.kpi.expenses')}
          value={format.currency(totals.expenses, 0)}
          icon={<Receipt />}
          tone="danger"
          hint={t('finance.kpi.expensesHint')}
        />
        <KpiCard
          label={t('finance.kpi.profit')}
          value={format.currency(totals.profit, 0)}
          icon={<TrendingUp />}
          hint={t('finance.kpi.profitHint', { percent: format.percent(margin) })}
        />
        <KpiCard
          label={t('finance.kpi.outstanding')}
          value={format.currency(totals.outstanding, 0)}
          icon={<Wallet />}
          tone="warning"
          hint={t('finance.kpi.outstandingHint')}
        />
      </div>

      <div className="grid-2-1">
        <Card>
          <CardHeader
            title={t('finance.charts.trendTitle')}
            subtitle={t('finance.charts.trendSubtitle', { currency: format.currencySymbol })}
            actions={
              <Segmented<Span>
                label={t('finance.charts.trendTitle')}
                value={span}
                onChange={setSpan}
                options={[
                  { value: '6', label: t('finance.charts.months6') },
                  { value: '12', label: t('finance.charts.months12') },
                ]}
              />
            }
          />
          <GroupedBarChart
            data={trendData}
            xKey="month"
            ariaLabel={t('finance.charts.trendTitle')}
            formatValue={(value) => format.currency(value, 0)}
            formatTick={(value) => format.compact(value)}
            series={[
              { key: 'revenue', label: t('finance.charts.revenue'), color: 'var(--chart-1)' },
              { key: 'expenses', label: t('finance.charts.expenses'), color: 'var(--chart-4)' },
            ]}
          />
        </Card>

        <Card>
          <CardHeader title={t('finance.charts.breakdownTitle')} subtitle={t('finance.charts.breakdownSubtitle')} />
          <DonutChart
            data={expenseBreakdown}
            ariaLabel={t('finance.charts.breakdownTitle')}
            formatValue={(value) => format.currency(value, 0)}
            formatPercent={(value) => format.percent(value, 0)}
            centerValue={format.compact(expenseTotal)}
            centerLabel={t('finance.charts.totalExpenses')}
          />
        </Card>
      </div>

      <Card flush>
        <CardHeader title={t('finance.transactions.title')} />
        <div className="toolbar">
          <SearchInput
            className="toolbar__search"
            value={search}
            onChange={setSearch}
            placeholder={t('finance.transactions.searchPlaceholder')}
            label={t('finance.transactions.searchLabel')}
          />
          <div className="toolbar__filters">
            <Select
              aria-label={t('finance.transactions.columns.type')}
              value={type}
              onChange={(event) => setType(event.target.value)}
              options={[
                { value: 'all', label: t('finance.transactions.allTypes') },
                { value: 'income', label: t('status.income') },
                { value: 'expense', label: t('status.expense') },
              ]}
            />
            <Select
              aria-label={t('finance.transactions.columns.status')}
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              options={[
                { value: 'all', label: t('finance.transactions.allStatuses') },
                { value: 'completed', label: t('status.completed') },
                { value: 'pending', label: t('status.pending') },
                { value: 'overdue', label: t('status.overdue') },
              ]}
            />
          </div>
        </div>
        <DataTable
          caption={t('finance.transactions.title')}
          columns={columns}
          rows={filtered}
          rowKey={(tx) => tx.id}
          defaultSort={{ key: 'date', direction: 'desc' }}
          loading={loading}
          resetKey={`${search}|${type}|${status}`}
          empty={
            <EmptyState
              icon={<Receipt size={26} />}
              title={t('finance.transactions.empty.title')}
              description={t('finance.transactions.empty.text')}
              action={
                filtersActive ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSearch('');
                      setType('all');
                      setStatus('all');
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
    </div>
  );
}
