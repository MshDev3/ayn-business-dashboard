import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { AlertTriangle, Boxes, PackageCheck, PackageMinus, PackagePlus, Plus, Warehouse } from 'lucide-react';
import { EmptyState } from '../../components/feedback/States';
import { Select } from '../../components/forms/Fields';
import { SearchInput } from '../../components/forms/SearchInput';
import { DataTable } from '../../components/tables/DataTable';
import type { Column } from '../../components/tables/DataTable';
import { RowActions } from '../../components/tables/RowActions';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { KpiCard } from '../../components/ui/KpiCard';
import { PageHeader } from '../../components/ui/PageHeader';
import { ProgressBar } from '../../components/ui/ProgressBar';
import { ADD_STOCK_QUANTITY, PRODUCT_CATEGORIES, STOCK_STATUSES } from '../../constants';
import { useData } from '../../context/DataContext';
import { useI18n } from '../../context/I18nContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useFormat } from '../../hooks/useFormat';
import { useInitialLoading } from '../../hooks/useInitialLoading';
import { useLocalized } from '../../hooks/useLocalized';
import type { Product } from '../../types';
import { stockStatus } from '../../utils/domain';
import { makeLocalized, matchesQuery } from '../../utils/text';
import { ProductFormModal } from './ProductFormModal';

export default function InventoryPage() {
  const { t } = useI18n();
  useDocumentTitle(t('inventory.title'));
  const format = useFormat();
  const localize = useLocalized();
  const toast = useToast();
  const { products, restockProduct, addProduct } = useData();
  const [params, setParams] = useSearchParams();
  const addOpen = params.get('new') === '1';
  const openAdd = () => setParams({ new: '1' });
  const closeAdd = () => setParams({}, { replace: true });
  const loading = useInitialLoading('inventory');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [stock, setStock] = useState('all');

  const summary = useMemo(
    () => ({
      value: products.reduce((sum, p) => sum + p.price * p.stock, 0),
      low: products.filter((p) => stockStatus(p) === 'lowStock').length,
      out: products.filter((p) => stockStatus(p) === 'outOfStock').length,
    }),
    [products],
  );

  const filtered = useMemo(
    () =>
      products.filter(
        (p) =>
          (category === 'all' || p.category === category) &&
          (stock === 'all' || stockStatus(p) === stock) &&
          matchesQuery(search, p.name.ar, p.name.en, p.sku),
      ),
    [products, search, category, stock],
  );

  const columns = useMemo<Array<Column<Product>>>(
    () => [
      {
        key: 'sku',
        header: t('inventory.columns.sku'),
        sortValue: (p) => p.sku,
        cell: (p) => <span className="ltr num muted">{p.sku}</span>,
      },
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
        sortValue: (p) => p.stock,
        cell: (p) => {
          const status = stockStatus(p);
          const level = Math.min(100, (p.stock / Math.max(1, p.reorderLevel * 3)) * 100);
          return (
            <div className="stock-cell">
              <span className="num strong">{format.number(p.stock)}</span>
              <ProgressBar
                value={level}
                label={`${localize(p.name)}: ${t(`status.${status}`)}`}
                tone={status === 'inStock' ? 'success' : status === 'lowStock' ? 'warning' : 'danger'}
              />
              <span className="muted stock-cell__hint">{t('inventory.reorderAt', { count: format.number(p.reorderLevel) })}</span>
            </div>
          );
        },
      },
      {
        key: 'price',
        header: t('inventory.columns.price'),
        align: 'end',
        sortValue: (p) => p.price,
        cell: (p) => <span className="num">{format.currency(p.price)}</span>,
      },
      {
        key: 'status',
        header: t('inventory.columns.status'),
        sortValue: (p) => t(`status.${stockStatus(p)}`),
        cell: (p) => <StatusBadge status={stockStatus(p)} />,
      },
      {
        key: 'updated',
        header: t('inventory.columns.updated'),
        sortValue: (p) => p.updatedAt,
        cell: (p) => format.date(p.updatedAt),
      },
      {
        key: 'actions',
        header: t('common.actions'),
        actions: true,
        cell: (p) => (
          <RowActions>
            <Button
              size="sm"
              variant="secondary"
              icon={<PackagePlus size={16} />}
              onClick={() => {
                restockProduct(p.id, ADD_STOCK_QUANTITY);
                toast.success(t('inventory.restocked', { name: localize(p.name), count: ADD_STOCK_QUANTITY }));
              }}
            >
              {t('inventory.restock', { count: ADD_STOCK_QUANTITY })}
            </Button>
          </RowActions>
        ),
      },
    ],
    [t, localize, format, restockProduct, toast],
  );

  const filtersActive = search !== '' || category !== 'all' || stock !== 'all';

  return (
    <div className="page">
      <PageHeader
        title={t('inventory.title')}
        subtitle={t('inventory.subtitle', { count: format.number(products.length) })}
        actions={
          <Button variant="primary" icon={<Plus size={18} />} onClick={openAdd}>
            {t('inventory.add')}
          </Button>
        }
      />

      <div className="kpi-grid">
        <KpiCard label={t('inventory.kpi.products')} value={format.number(products.length)} icon={<Boxes />} />
        <KpiCard label={t('inventory.kpi.value')} value={format.currency(summary.value, 0)} icon={<Warehouse />} tone="success" />
        <KpiCard label={t('inventory.kpi.low')} value={format.number(summary.low)} icon={<AlertTriangle />} tone="warning" />
        <KpiCard label={t('inventory.kpi.out')} value={format.number(summary.out)} icon={<PackageMinus />} tone="danger" />
      </div>

      <Card flush>
        <div className="toolbar">
          <SearchInput
            className="toolbar__search"
            value={search}
            onChange={setSearch}
            placeholder={t('inventory.searchPlaceholder')}
            label={t('inventory.searchLabel')}
          />
          <div className="toolbar__filters">
            <Select
              aria-label={t('inventory.columns.category')}
              value={category}
              onChange={(event) => setCategory(event.target.value)}
              options={[
                { value: 'all', label: t('inventory.allCategories') },
                ...PRODUCT_CATEGORIES.map((value) => ({ value, label: t(`productCategories.${value}`) })),
              ]}
            />
            <Select
              aria-label={t('inventory.columns.status')}
              value={stock}
              onChange={(event) => setStock(event.target.value)}
              options={[
                { value: 'all', label: t('inventory.allStock') },
                ...STOCK_STATUSES.map((value) => ({ value, label: t(`status.${value}`) })),
              ]}
            />
          </div>
        </div>

        <DataTable
          caption={t('inventory.title')}
          columns={columns}
          rows={filtered}
          rowKey={(p) => p.id}
          defaultSort={{ key: 'stock', direction: 'asc' }}
          loading={loading}
          resetKey={`${search}|${category}|${stock}`}
          empty={
            <EmptyState
              icon={<PackageCheck size={26} />}
              title={t('inventory.empty.title')}
              description={t('inventory.empty.text')}
              action={
                filtersActive ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSearch('');
                      setCategory('all');
                      setStock('all');
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

      <ProductFormModal
        open={addOpen}
        onClose={closeAdd}
        onSubmit={(values) => {
          addProduct({
            name: makeLocalized(values.name),
            category: values.category,
            price: Number(values.price),
            stock: Number(values.stock),
            reorderLevel: Number(values.reorderLevel),
          });
          toast.success(t('inventory.toast.added'));
          closeAdd();
        }}
      />
    </div>
  );
}
