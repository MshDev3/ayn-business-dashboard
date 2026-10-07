import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Eye, Pencil, Plus, UserSquare2 } from 'lucide-react';
import { EmptyState } from '../../components/feedback/States';
import { Select } from '../../components/forms/Fields';
import { SearchInput } from '../../components/forms/SearchInput';
import { DataTable } from '../../components/tables/DataTable';
import type { Column } from '../../components/tables/DataTable';
import { RowActions } from '../../components/tables/RowActions';
import { StatusBadge } from '../../components/ui/Badge';
import { Button, IconButton, IconLink } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { PersonCell } from '../../components/ui/PersonCell';
import { CUSTOMER_STATUSES } from '../../constants';
import { useData } from '../../context/DataContext';
import { useI18n } from '../../context/I18nContext';
import { useCustomerStats } from '../../hooks/useCustomerStats';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useFormat } from '../../hooks/useFormat';
import { useInitialLoading } from '../../hooks/useInitialLoading';
import { useLocalized } from '../../hooks/useLocalized';
import type { Customer } from '../../types';
import { matchesQuery } from '../../utils/text';
import { CustomerFormModal } from './CustomerFormModal';
import { useCustomerActions } from './useCustomerActions';

export default function CustomersPage() {
  const { t } = useI18n();
  useDocumentTitle(t('customers.title'));
  const localize = useLocalized();
  const format = useFormat();
  const { customers } = useData();
  const stats = useCustomerStats();
  const actions = useCustomerActions();
  const loading = useInitialLoading('customers');

  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [editing, setEditing] = useState<Customer | null>(null);

  const addOpen = params.get('new') === '1';
  const openAdd = () => setParams({ new: '1' });
  const closeAdd = () => setParams({}, { replace: true });

  const filtered = useMemo(
    () =>
      customers.filter(
        (c) =>
          (status === 'all' || c.status === status) &&
          matchesQuery(search, c.name.ar, c.name.en, c.contact.ar, c.contact.en, c.email, c.id),
      ),
    [customers, search, status],
  );

  const columns = useMemo<Array<Column<Customer>>>(
    () => [
      {
        key: 'customer',
        header: t('customers.columns.customer'),
        primary: true,
        sortValue: (c) => localize(c.name),
        cell: (c) => <PersonCell name={localize(c.name)} subtitle={localize(c.contact)} to={`/customers/${c.id}`} />,
      },
      {
        key: 'email',
        header: t('customers.columns.email'),
        cell: (c) => <span className="ltr">{c.email}</span>,
      },
      {
        key: 'phone',
        header: t('customers.columns.phone'),
        cell: (c) => <span className="ltr num">{c.phone}</span>,
      },
      {
        key: 'orders',
        header: t('customers.columns.orders'),
        align: 'end',
        sortValue: (c) => stats.get(c.id).orderCount,
        cell: (c) => <span className="num">{format.number(stats.get(c.id).orderCount)}</span>,
      },
      {
        key: 'spending',
        header: t('customers.columns.spending'),
        align: 'end',
        sortValue: (c) => stats.get(c.id).spending,
        cell: (c) => <span className="num strong">{format.currency(stats.get(c.id).spending)}</span>,
      },
      {
        key: 'status',
        header: t('customers.columns.status'),
        sortValue: (c) => t(`status.${c.status}`),
        cell: (c) => <StatusBadge status={c.status} />,
      },
      {
        key: 'lastOrder',
        header: t('customers.columns.lastOrder'),
        sortValue: (c) => stats.get(c.id).lastOrderAt ?? '',
        cell: (c) => {
          const last = stats.get(c.id).lastOrderAt;
          return last ? format.date(last) : t('common.emptyValue');
        },
      },
      {
        key: 'actions',
        header: t('common.actions'),
        actions: true,
        cell: (c) => (
          <RowActions>
            <IconLink to={`/customers/${c.id}`} label={t('common.view')} icon={<Eye size={17} />} size="sm" />
            <IconButton label={t('common.edit')} icon={<Pencil size={17} />} size="sm" onClick={() => setEditing(c)} />
          </RowActions>
        ),
      },
    ],
    [t, localize, format, stats],
  );

  const filtersActive = search !== '' || status !== 'all';

  return (
    <div className="page">
      <PageHeader
        title={t('customers.title')}
        subtitle={t('customers.subtitle', { count: format.number(customers.length) })}
        actions={
          <Button variant="primary" icon={<Plus size={18} />} onClick={openAdd}>
            {t('customers.add')}
          </Button>
        }
      />

      <Card flush>
        <div className="toolbar">
          <SearchInput
            className="toolbar__search"
            value={search}
            onChange={setSearch}
            placeholder={t('customers.searchPlaceholder')}
            label={t('customers.searchLabel')}
          />
          <div className="toolbar__filters">
            <Select
              aria-label={t('customers.columns.status')}
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              options={[
                { value: 'all', label: t('customers.allStatuses') },
                ...CUSTOMER_STATUSES.map((value) => ({ value, label: t(`status.${value}`) })),
              ]}
            />
          </div>
        </div>

        <DataTable
          caption={t('customers.title')}
          columns={columns}
          rows={filtered}
          rowKey={(c) => c.id}
          defaultSort={{ key: 'spending', direction: 'desc' }}
          loading={loading}
          resetKey={`${search}|${status}`}
          empty={
            <EmptyState
              icon={<UserSquare2 size={26} />}
              title={t('customers.empty.title')}
              description={t('customers.empty.text')}
              action={
                filtersActive ? (
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setSearch('');
                      setStatus('all');
                    }}
                  >
                    {t('common.clearFilters')}
                  </Button>
                ) : (
                  <Button variant="primary" icon={<Plus size={18} />} onClick={openAdd}>
                    {t('customers.add')}
                  </Button>
                )
              }
            />
          }
        />
      </Card>

      <CustomerFormModal
        open={addOpen}
        onClose={closeAdd}
        onSubmit={(values) => {
          actions.create(values);
          closeAdd();
        }}
      />
      <CustomerFormModal
        key={editing?.id ?? 'none'}
        open={editing !== null}
        customer={editing}
        onClose={() => setEditing(null)}
        onSubmit={(values) => {
          if (editing) actions.update(editing, values);
          setEditing(null);
        }}
      />
    </div>
  );
}
