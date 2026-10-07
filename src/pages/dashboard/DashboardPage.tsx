import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import { Link } from 'react-router';
import { Package, PackagePlus, ReceiptText, ShoppingBag, UserPlus, Users, WalletCards } from 'lucide-react';
import { AreaTrendChart } from '../../components/charts/LazyCharts';
import { BarList } from '../../components/charts/BarList';
import { ProgressRing } from '../../components/charts/ProgressRing';
import { DashboardSkeleton } from '../../components/feedback/Skeleton';
import { EmptyState } from '../../components/feedback/States';
import { DataTable } from '../../components/tables/DataTable';
import { LinkButton } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { ArrowEnd } from '../../components/ui/DirIcon';
import { KpiCard } from '../../components/ui/KpiCard';
import { NotificationIcon } from '../../components/ui/NotificationIcon';
import { PageHeader } from '../../components/ui/PageHeader';
import { Segmented } from '../../components/ui/Segmented';
import { useData } from '../../context/DataContext';
import { useI18n } from '../../context/I18nContext';
import { useSettings } from '../../context/SettingsContext';
import { KPI_TREND_MOCK, MONTHLY_FINANCE, MONTHLY_TARGET, WEEKLY_SALES } from '../../data/finance';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useFormat } from '../../hooks/useFormat';
import { useInitialLoading } from '../../hooks/useInitialLoading';
import { useLocalized } from '../../hooks/useLocalized';
import { addDays, monthsAgoDate } from '../../utils/dates';
import { monthName, weekdayName } from '../../utils/format';
import { useOrderColumns } from '../orders/orderColumns';
import type { OrderColumnKey } from '../orders/orderColumns';

type ChartRange = 'weekly' | 'monthly';

const RECENT_COLUMNS: OrderColumnKey[] = ['id', 'customer', 'amount', 'status', 'date', 'actions'];

function percentChange(current: number, previous: number): number {
  return previous === 0 ? 0 : ((current - previous) / previous) * 100;
}

export default function DashboardPage() {
  const { t, lang } = useI18n();
  useDocumentTitle(t('dashboard.title'));
  const format = useFormat();
  const localize = useLocalized();
  const { profile } = useSettings();
  const { orders, customers, products, productById, notifications } = useData();
  const orderColumns = useOrderColumns(RECENT_COLUMNS);
  const loading = useInitialLoading('dashboard');
  const [range, setRange] = useState<ChartRange>('weekly');

  const now = useMemo(() => new Date(), []);

  const kpis = useMemo(() => {
    const current = MONTHLY_FINANCE[MONTHLY_FINANCE.length - 1];
    const previous = MONTHLY_FINANCE[MONTHLY_FINANCE.length - 2];
    const day = 86_400_000;
    const last30 = orders.filter((o) => now.getTime() - new Date(o.createdAt).getTime() < 30 * day).length;
    const prior30 = orders.filter((o) => {
      const age = now.getTime() - new Date(o.createdAt).getTime();
      return age >= 30 * day && age < 60 * day;
    }).length;
    return {
      revenue: current?.revenue ?? 0,
      revenueDelta: percentChange(current?.revenue ?? 0, previous?.revenue ?? 0),
      ordersDelta: percentChange(last30, prior30),
    };
  }, [orders, now]);

  const chartData = useMemo(() => {
    if (range === 'weekly') {
      return WEEKLY_SALES.map((value, index) => {
        const date = addDays(now, index - (WEEKLY_SALES.length - 1));
        return { label: weekdayName(date.getDay(), lang, 'short'), value };
      });
    }
    return MONTHLY_FINANCE.map((point) => ({
      label: monthName(monthsAgoDate(point.monthsAgo).getMonth(), lang),
      value: point.revenue,
    }));
  }, [range, lang, now]);

  const topProducts = useMemo(() => {
    const sold = new Map<string, { units: number; revenue: number }>();
    for (const order of orders) {
      if (order.status === 'cancelled') continue;
      for (const item of order.items) {
        const entry = sold.get(item.productId) ?? { units: 0, revenue: 0 };
        entry.units += item.quantity;
        entry.revenue += item.quantity * item.unitPrice;
        sold.set(item.productId, entry);
      }
    }
    return [...sold.entries()]
      .sort((a, b) => b[1].units - a[1].units)
      .slice(0, 5)
      .flatMap(([productId, entry]) => {
        const product = productById.get(productId);
        return product ? [{ product, ...entry }] : [];
      });
  }, [orders, productById]);

  const recentOrders = useMemo(() => [...orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt)), [orders]);
  const recentActivity = useMemo(
    () => [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).slice(0, 4),
    [notifications],
  );

  if (loading) return <DashboardSkeleton />;

  const hour = now.getHours();
  const greetingKey =
    hour < 12 ? 'dashboard.greetingMorning' : hour < 18 ? 'dashboard.greetingAfternoon' : 'dashboard.greetingEvening';

  const achieved = kpis.revenue;
  const percentAchieved = Math.min(100, (achieved / MONTHLY_TARGET) * 100);

  return (
    <div className="page">
      <PageHeader
        eyebrow={format.date(now, 'long')}
        title={t(greetingKey, { name: localize(profile.name) })}
        subtitle={t('dashboard.subtitle')}
        actions={
          <LinkButton to="/reports" variant="primary" iconEnd={<ArrowEnd size={18} />}>
            {t('dashboard.newReport')}
          </LinkButton>
        }
      />

      <div className="kpi-grid">
        <KpiCard
          label={t('dashboard.kpi.revenue')}
          value={format.currency(kpis.revenue)}
          icon={<WalletCards />}
          delta={kpis.revenueDelta}
          hint={t('dashboard.kpi.vsLastMonth')}
        />
        <KpiCard
          label={t('dashboard.kpi.orders')}
          value={format.number(orders.length)}
          icon={<ShoppingBag />}
          tone="info"
          delta={kpis.ordersDelta}
          hint={t('dashboard.kpi.vsLastMonth')}
        />
        <KpiCard
          label={t('dashboard.kpi.customers')}
          value={format.number(customers.length)}
          icon={<Users />}
          tone="success"
          delta={KPI_TREND_MOCK.customers}
          hint={t('dashboard.kpi.vsLastMonth')}
        />
        <KpiCard
          label={t('dashboard.kpi.products')}
          value={format.number(products.length)}
          icon={<Package />}
          tone="warning"
          delta={KPI_TREND_MOCK.products}
          hint={t('dashboard.kpi.vsLastMonth')}
        />
      </div>

      <div className="grid-2-1">
        <Card>
          <CardHeader
            title={t('dashboard.sales.title')}
            subtitle={range === 'weekly' ? t('dashboard.sales.weeklySubtitle') : t('dashboard.sales.monthlySubtitle')}
            actions={
              <Segmented<ChartRange>
                label={t('dashboard.sales.title')}
                value={range}
                onChange={setRange}
                options={[
                  { value: 'weekly', label: t('dashboard.sales.weekly') },
                  { value: 'monthly', label: t('dashboard.sales.monthly') },
                ]}
              />
            }
          />
          <AreaTrendChart
            data={chartData}
            xKey="label"
            yKey="value"
            seriesLabel={t('dashboard.sales.series')}
            ariaLabel={t('dashboard.sales.title')}
            formatValue={(value) => format.currency(value, 0)}
            formatTick={(value) => format.compact(value)}
          />
        </Card>

        <Card>
          <CardHeader title={t('dashboard.target.title')} subtitle={t('dashboard.target.subtitle')} />
          <ProgressRing
            value={percentAchieved}
            label={t('dashboard.target.title')}
            valueLabel={format.percent(percentAchieved, 0)}
            caption={t('dashboard.target.completed')}
          />
          <dl className="goal-list">
            <div className="goal-list__row">
              <dt>{t('dashboard.target.target')}</dt>
              <dd className="num">{format.currency(MONTHLY_TARGET, 0)}</dd>
            </div>
            <div className="goal-list__row">
              <dt>{t('dashboard.target.achieved')}</dt>
              <dd className="num">{format.currency(achieved, 0)}</dd>
            </div>
            <div className="goal-list__row">
              <dt>{t('dashboard.target.remaining')}</dt>
              <dd className="num">{format.currency(Math.max(0, MONTHLY_TARGET - achieved), 0)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <div className="grid-2-1">
        <Card flush>
          <CardHeader
            title={t('dashboard.recentOrders.title')}
            subtitle={t('dashboard.recentOrders.subtitle')}
            actions={
              <LinkButton to="/orders" size="sm" variant="secondary">
                {t('common.viewAll')}
              </LinkButton>
            }
          />
          <DataTable
            caption={t('dashboard.recentOrders.title')}
            columns={orderColumns}
            rows={recentOrders}
            rowKey={(o) => o.id}
            defaultSort={{ key: 'date', direction: 'desc' }}
            pageSize={6}
            paginate={false}
            empty={<EmptyState compact title={t('orders.empty.title')} />}
          />
        </Card>

        <Card>
          <CardHeader title={t('dashboard.topProducts.title')} subtitle={t('dashboard.topProducts.subtitle')} />
          {topProducts.length === 0 ? (
            <EmptyState compact title={t('inventory.empty.title')} />
          ) : (
            <BarList
              items={topProducts.map(({ product, units, revenue }) => ({
                id: product.id,
                label: localize(product.name),
                hint: t('dashboard.topProducts.revenue', { amount: format.currency(revenue, 0) }),
                value: units,
                display: t('dashboard.topProducts.units', { count: format.number(units) }),
              }))}
            />
          )}
        </Card>
      </div>

      <div className="grid-2-1">
        <Card>
          <CardHeader
            title={t('dashboard.activity.title')}
            subtitle={t('dashboard.activity.subtitle')}
            actions={
              <LinkButton to="/notifications" size="sm" variant="secondary">
                {t('common.viewAll')}
              </LinkButton>
            }
          />
          {recentActivity.length === 0 ? (
            <EmptyState compact title={t('dashboard.activity.empty')} />
          ) : (
            <ul className="activity">
              {recentActivity.map((item) => (
                <li className="activity__item" key={item.id}>
                  <NotificationIcon type={item.type} />
                  <div className="activity__text">
                    <p className="activity__title">{localize(item.title)}</p>
                    <p className="muted activity__body">{localize(item.body)}</p>
                  </div>
                  <time className="muted activity__time" dateTime={item.createdAt}>
                    {format.relative(item.createdAt)}
                  </time>
                </li>
              ))}
            </ul>
          )}
        </Card>

        <Card>
          <CardHeader title={t('dashboard.quickActions.title')} />
          <div className="quick-actions">
            <QuickAction to="/orders?new=1" icon={<ReceiptText size={20} />} label={t('dashboard.quickActions.addOrder')} />
            <QuickAction to="/employees?new=1" icon={<UserPlus size={20} />} label={t('dashboard.quickActions.addEmployee')} />
            <QuickAction to="/customers?new=1" icon={<Users size={20} />} label={t('dashboard.quickActions.addCustomer')} />
            <QuickAction to="/inventory?new=1" icon={<PackagePlus size={20} />} label={t('dashboard.quickActions.addProduct')} />
          </div>
        </Card>
      </div>
    </div>
  );
}

function QuickAction({ to, icon, label }: { to: string; icon: ReactNode; label: string }) {
  return (
    <Link to={to} className="quick-action">
      <span className="quick-action__icon" aria-hidden="true">
        {icon}
      </span>
      <span>{label}</span>
    </Link>
  );
}
