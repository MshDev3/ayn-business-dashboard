import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { Eye, Pencil, Plus, Trash2, Users } from 'lucide-react';
import { EmptyState } from '../../components/feedback/States';
import { Select } from '../../components/forms/Fields';
import { SearchInput } from '../../components/forms/SearchInput';
import { RowActions } from '../../components/tables/RowActions';
import { DataTable } from '../../components/tables/DataTable';
import type { Column } from '../../components/tables/DataTable';
import { StatusBadge } from '../../components/ui/Badge';
import { Button, IconButton, IconLink } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PageHeader } from '../../components/ui/PageHeader';
import { PersonCell } from '../../components/ui/PersonCell';
import { DEPARTMENTS, EMPLOYEE_STATUSES } from '../../constants';
import { useData } from '../../context/DataContext';
import { useI18n } from '../../context/I18nContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useFormat } from '../../hooks/useFormat';
import { useInitialLoading } from '../../hooks/useInitialLoading';
import { useLocalized } from '../../hooks/useLocalized';
import type { Employee } from '../../types';
import { matchesQuery } from '../../utils/text';
import { EmployeeFormModal } from './EmployeeFormModal';
import { useEmployeeActions } from './useEmployeeActions';

export default function EmployeesPage() {
  const { t } = useI18n();
  useDocumentTitle(t('employees.title'));
  const localize = useLocalized();
  const format = useFormat();
  const { employees } = useData();
  const actions = useEmployeeActions();
  const loading = useInitialLoading('employees');

  const [params, setParams] = useSearchParams();
  const [search, setSearch] = useState('');
  const [department, setDepartment] = useState('all');
  const [status, setStatus] = useState('all');
  const [editing, setEditing] = useState<Employee | null>(null);
  const [deleting, setDeleting] = useState<Employee | null>(null);

  // The "add" drawer is driven by the URL so quick actions can deep-link to it and Back closes it.
  const addOpen = params.get('new') === '1';
  const openAdd = () => setParams({ new: '1' });
  const closeAdd = () => setParams({}, { replace: true });

  const filtered = useMemo(
    () =>
      employees.filter(
        (e) =>
          (department === 'all' || e.department === department) &&
          (status === 'all' || e.status === status) &&
          matchesQuery(search, e.name.ar, e.name.en, e.email, e.title.ar, e.title.en, e.id),
      ),
    [employees, search, department, status],
  );

  const columns = useMemo<Array<Column<Employee>>>(
    () => [
      {
        key: 'employee',
        header: t('employees.columns.employee'),
        primary: true,
        sortValue: (e) => localize(e.name),
        cell: (e) => (
          <PersonCell name={localize(e.name)} subtitle={e.email} ltrSubtitle to={`/employees/${e.id}`} hue={e.avatarHue} />
        ),
      },
      {
        key: 'department',
        header: t('employees.columns.department'),
        sortValue: (e) => t(`departments.${e.department}`),
        cell: (e) => t(`departments.${e.department}`),
      },
      {
        key: 'title',
        header: t('employees.columns.title'),
        sortValue: (e) => localize(e.title),
        cell: (e) => localize(e.title),
      },
      {
        key: 'phone',
        header: t('employees.columns.phone'),
        cell: (e) => <span className="ltr num">{e.phone}</span>,
      },
      {
        key: 'status',
        header: t('employees.columns.status'),
        sortValue: (e) => t(`status.${e.status}`),
        cell: (e) => <StatusBadge status={e.status} />,
      },
      {
        key: 'joined',
        header: t('employees.columns.joined'),
        sortValue: (e) => e.joinedAt,
        cell: (e) => format.date(e.joinedAt),
      },
      {
        key: 'actions',
        header: t('common.actions'),
        actions: true,
        cell: (e) => (
          <RowActions>
            <IconLink to={`/employees/${e.id}`} label={t('common.view')} icon={<Eye size={17} />} size="sm" />
            <IconButton label={t('common.edit')} icon={<Pencil size={17} />} size="sm" onClick={() => setEditing(e)} />
            <IconButton
              label={t('common.delete')}
              icon={<Trash2 size={17} />}
              size="sm"
              variant="danger"
              onClick={() => setDeleting(e)}
            />
          </RowActions>
        ),
      },
    ],
    [t, localize, format],
  );

  const filtersActive = search !== '' || department !== 'all' || status !== 'all';
  const clearFilters = () => {
    setSearch('');
    setDepartment('all');
    setStatus('all');
  };

  return (
    <div className="page">
      <PageHeader
        title={t('employees.title')}
        subtitle={t('employees.subtitle', { count: format.number(employees.length) })}
        actions={
          <Button variant="primary" icon={<Plus size={18} />} onClick={openAdd}>
            {t('employees.add')}
          </Button>
        }
      />

      <Card flush>
        <div className="toolbar">
          <SearchInput
            className="toolbar__search"
            value={search}
            onChange={setSearch}
            placeholder={t('employees.searchPlaceholder')}
            label={t('employees.searchLabel')}
          />
          <div className="toolbar__filters">
            <Select
              aria-label={t('employees.columns.department')}
              value={department}
              onChange={(event) => setDepartment(event.target.value)}
              options={[
                { value: 'all', label: t('employees.allDepartments') },
                ...DEPARTMENTS.map((value) => ({ value, label: t(`departments.${value}`) })),
              ]}
            />
            <Select
              aria-label={t('employees.columns.status')}
              value={status}
              onChange={(event) => setStatus(event.target.value)}
              options={[
                { value: 'all', label: t('employees.allStatuses') },
                ...EMPLOYEE_STATUSES.map((value) => ({ value, label: t(`status.${value}`) })),
              ]}
            />
          </div>
        </div>

        <DataTable
          caption={t('employees.title')}
          columns={columns}
          rows={filtered}
          rowKey={(e) => e.id}
          defaultSort={{ key: 'joined', direction: 'desc' }}
          loading={loading}
          resetKey={`${search}|${department}|${status}`}
          empty={
            <EmptyState
              icon={<Users size={26} />}
              title={t('employees.empty.title')}
              description={t('employees.empty.text')}
              action={
                filtersActive ? (
                  <Button variant="secondary" onClick={clearFilters}>
                    {t('common.clearFilters')}
                  </Button>
                ) : (
                  <Button variant="primary" icon={<Plus size={18} />} onClick={openAdd}>
                    {t('employees.add')}
                  </Button>
                )
              }
            />
          }
        />
      </Card>

      <EmployeeFormModal
        open={addOpen}
        onClose={closeAdd}
        onSubmit={(values) => {
          actions.create(values);
          closeAdd();
        }}
      />
      <EmployeeFormModal
        key={editing?.id ?? 'none'}
        open={editing !== null}
        employee={editing}
        onClose={() => setEditing(null)}
        onSubmit={(values) => {
          if (editing) actions.update(editing, values);
          setEditing(null);
        }}
      />
      <ConfirmDialog
        open={deleting !== null}
        title={t('employees.delete.title')}
        message={t('employees.delete.message', { name: deleting ? localize(deleting.name) : '' })}
        confirmLabel={t('common.delete')}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) actions.remove(deleting);
          setDeleting(null);
        }}
      />
    </div>
  );
}
