import { useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { useParams } from 'react-router';
import { Mail, MapPin, MessageSquarePlus, Pencil, Phone } from 'lucide-react';
import { EntityNotFound } from '../../components/feedback/EntityNotFound';
import { EmptyState } from '../../components/feedback/States';
import { TextAreaField } from '../../components/forms/Fields';
import { DataTable } from '../../components/tables/DataTable';
import { StatusBadge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { Breadcrumbs, PageHeader } from '../../components/ui/PageHeader';
import { useData } from '../../context/DataContext';
import { useI18n } from '../../context/I18nContext';
import { useToast } from '../../context/ToastContext';
import { useCustomerStats } from '../../hooks/useCustomerStats';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useFormat } from '../../hooks/useFormat';
import { useLocalized } from '../../hooks/useLocalized';
import { makeLocalized } from '../../utils/text';
import { CustomerFormModal } from './CustomerFormModal';
import { useCustomerActions } from './useCustomerActions';
import { useOrderColumns } from '../orders/orderColumns';
import type { OrderColumnKey } from '../orders/orderColumns';

const ORDER_COLUMNS: OrderColumnKey[] = ['id', 'date', 'amount', 'payment', 'status', 'actions'];

export default function CustomerDetailsPage() {
  const { id } = useParams();
  const { t } = useI18n();
  const localize = useLocalized();
  const format = useFormat();
  const toast = useToast();
  const { customers, orders, addCustomerNote } = useData();
  const stats = useCustomerStats();
  const actions = useCustomerActions();
  const orderColumns = useOrderColumns(ORDER_COLUMNS);

  const customer = customers.find((c) => c.id === id);
  useDocumentTitle(customer ? localize(customer.name) : t('nav.customers'));

  const [editing, setEditing] = useState(false);
  const [note, setNote] = useState('');

  const customerOrders = useMemo(
    () => orders.filter((o) => o.customerId === id).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [orders, id],
  );

  if (!customer) {
    return (
      <div className="page">
        <EntityNotFound
          title={t('customerDetails.notFoundTitle')}
          text={t('customerDetails.notFoundText')}
          backTo="/customers"
          backLabel={t('customerDetails.backToList')}
        />
      </div>
    );
  }

  const name = localize(customer.name);
  const customerStats = stats.get(customer.id);
  const activeOrders = customerOrders.filter((o) => o.status !== 'cancelled').length;
  const average = activeOrders > 0 ? customerStats.spending / activeOrders : 0;

  const submitNote = (event: FormEvent) => {
    event.preventDefault();
    const text = note.trim();
    if (!text) return;
    addCustomerNote(customer.id, makeLocalized(text));
    setNote('');
    toast.success(t('customerDetails.notes.added'));
  };

  return (
    <div className="page">
      <PageHeader
        breadcrumbs={
          <Breadcrumbs
            label={t('common.breadcrumb')}
            items={[{ label: t('customers.title'), to: '/customers' }, { label: name }]}
          />
        }
        title={name}
        subtitle={`${localize(customer.contact)} · ${localize(customer.city)}`}
        actions={
          <Button variant="secondary" icon={<Pencil size={18} />} onClick={() => setEditing(true)}>
            {t('common.edit')}
          </Button>
        }
      />

      <Card flush className="hero">
        <div className="hero__banner" aria-hidden="true" />
        <div className="hero__body">
          <Avatar name={name} size="xl" className="hero__avatar" />
          <div className="hero__identity">
            <h2 className="hero__name">{name}</h2>
            <p className="muted hero__role">
              {localize(customer.contact)} · {localize(customer.city)}
            </p>
            <div className="row row--wrap">
              <StatusBadge status={customer.status} />
              <span className="muted ltr num">{customer.id}</span>
            </div>
          </div>
          <ul className="hero__contact">
            <li>
              <Mail size={16} aria-hidden="true" />
              <span className="ltr">{customer.email}</span>
            </li>
            <li>
              <Phone size={16} aria-hidden="true" />
              <span className="ltr num">{customer.phone}</span>
            </li>
            <li>
              <MapPin size={16} aria-hidden="true" />
              {localize(customer.city)}
            </li>
          </ul>
        </div>
      </Card>

      <div className="stat-tiles">
        <div className="stat-tile">
          <span className="stat-tile__value num">{format.number(customerOrders.length)}</span>
          <span className="stat-tile__label">{t('customerDetails.stats.orders')}</span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile__value num">{format.currency(customerStats.spending)}</span>
          <span className="stat-tile__label">{t('customerDetails.stats.spending')}</span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile__value num">{format.currency(average, 0)}</span>
          <span className="stat-tile__label">{t('customerDetails.stats.average')}</span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile__value">
            {customerStats.lastOrderAt ? format.date(customerStats.lastOrderAt) : t('common.emptyValue')}
          </span>
          <span className="stat-tile__label">{t('customerDetails.stats.lastOrder')}</span>
        </div>
      </div>

      <div className="grid-2-1">
        <div className="stack">
          <Card flush>
            <CardHeader title={t('customerDetails.recentOrders.title')} />
            <DataTable
              caption={t('customerDetails.recentOrders.title')}
              columns={orderColumns}
              rows={customerOrders}
              rowKey={(o) => o.id}
              defaultSort={{ key: 'date', direction: 'desc' }}
              pageSize={5}
              empty={<EmptyState compact title={t('customerDetails.recentOrders.empty')} />}
            />
          </Card>

          <Card>
            <CardHeader title={t('customerDetails.notes.title')} />
            <form className="note-form" onSubmit={submitNote}>
              <TextAreaField
                label={t('customerDetails.notes.label')}
                placeholder={t('customerDetails.notes.placeholder')}
                value={note}
                onChange={(event) => setNote(event.target.value)}
                rows={3}
              />
              <div>
                <Button type="submit" variant="primary" icon={<MessageSquarePlus size={18} />} disabled={!note.trim()}>
                  {t('customerDetails.notes.add')}
                </Button>
              </div>
            </form>
            {customer.notes.length === 0 ? (
              <p className="muted note-empty">{t('customerDetails.notes.empty')}</p>
            ) : (
              <ol className="timeline">
                {customer.notes.map((entry) => (
                  <li className="timeline__item" key={entry.id}>
                    <span className="timeline__dot" aria-hidden="true" />
                    <div>
                      <p>{localize(entry.text)}</p>
                      <p className="muted timeline__time">{format.relative(entry.createdAt)}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <Card>
          <CardHeader title={t('customerDetails.contact.title')} />
          <dl className="info-list info-list--stacked">
            <div className="info-list__item">
              <dt>{t('customerDetails.contact.person')}</dt>
              <dd>{localize(customer.contact)}</dd>
            </div>
            <div className="info-list__item">
              <dt>{t('customerDetails.contact.email')}</dt>
              <dd>
                <Mail size={15} aria-hidden="true" />
                <a href={`mailto:${customer.email}`} className="ltr">
                  {customer.email}
                </a>
              </dd>
            </div>
            <div className="info-list__item">
              <dt>{t('customerDetails.contact.phone')}</dt>
              <dd>
                <Phone size={15} aria-hidden="true" />
                <a href={`tel:${customer.phone.replace(/\s/g, '')}`} className="ltr num">
                  {customer.phone}
                </a>
              </dd>
            </div>
            <div className="info-list__item">
              <dt>{t('customerDetails.contact.city')}</dt>
              <dd>
                <MapPin size={15} aria-hidden="true" />
                {localize(customer.city)}
              </dd>
            </div>
            <div className="info-list__item">
              <dt>{t('customerDetails.contact.since')}</dt>
              <dd>{format.date(customer.joinedAt, 'long')}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <CustomerFormModal
        open={editing}
        customer={customer}
        onClose={() => setEditing(false)}
        onSubmit={(values) => {
          actions.update(customer, values);
          setEditing(false);
        }}
      />
    </div>
  );
}
