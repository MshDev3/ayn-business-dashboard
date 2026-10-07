import { useState } from 'react';
import { Link, useParams } from 'react-router';
import { Check, Printer, Save, XCircle } from 'lucide-react';
import { EntityNotFound } from '../../components/feedback/EntityNotFound';
import { SelectField } from '../../components/forms/Fields';
import { StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { Breadcrumbs, PageHeader } from '../../components/ui/PageHeader';
import { ORDER_STATUSES, PAYMENT_STATUSES, VAT_RATE } from '../../constants';
import { useData } from '../../context/DataContext';
import { useI18n } from '../../context/I18nContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useFormat } from '../../hooks/useFormat';
import { useLocalized } from '../../hooks/useLocalized';
import type { Order, OrderStatus, PaymentStatus } from '../../types';
import { cx } from '../../utils/classNames';
import { orderSubtotal, orderTotal, orderVat } from '../../utils/domain';

export default function OrderDetailsPage() {
  const { id } = useParams();
  const { t } = useI18n();
  const localize = useLocalized();
  const format = useFormat();
  const { orders, customerById, productById } = useData();

  const order = orders.find((o) => o.id === id);
  useDocumentTitle(order ? `${t('orderDetails.pageTitle')} #${order.id}` : t('orderDetails.pageTitle'));

  if (!order) {
    return (
      <div className="page">
        <EntityNotFound
          title={t('orderDetails.notFoundTitle')}
          text={t('orderDetails.notFoundText')}
          backTo="/orders"
          backLabel={t('orderDetails.backToList')}
        />
      </div>
    );
  }

  const customer = customerById.get(order.customerId);

  return (
    <div className="page">
      <PageHeader
        breadcrumbs={
          <Breadcrumbs
            label={t('common.breadcrumb')}
            items={[{ label: t('orders.title'), to: '/orders' }, { label: `#${order.id}` }]}
          />
        }
        title={t('orderDetails.heading', { id: order.id })}
        subtitle={format.date(order.createdAt, 'long')}
        actions={
          <Button variant="secondary" icon={<Printer size={18} />} onClick={() => window.print()}>
            {t('orderDetails.print')}
          </Button>
        }
      />

      <Card className="order-summary">
        <dl className="order-summary__meta">
          <div>
            <dt>{t('orderDetails.customer')}</dt>
            <dd>
              {customer ? (
                <Link to={`/customers/${customer.id}`} className="link-strong">
                  {localize(customer.name)}
                </Link>
              ) : (
                t('common.unknown')
              )}
            </dd>
          </div>
          <div>
            <dt>{t('orderDetails.placedOn')}</dt>
            <dd>{format.date(order.createdAt, 'medium')}</dd>
          </div>
          <div>
            <dt>{t('orderDetails.orderStatus')}</dt>
            <dd>
              <StatusBadge status={order.status} />
            </dd>
          </div>
          <div>
            <dt>{t('orderDetails.paymentStatus')}</dt>
            <dd>
              <StatusBadge status={order.paymentStatus} />
            </dd>
          </div>
          <div className="order-summary__total">
            <dt>{t('orderDetails.summary.total')}</dt>
            <dd className="num">{format.currency(orderTotal(order), 2)}</dd>
          </div>
        </dl>
        <OrderSteps status={order.status} />
      </Card>

      <div className="grid-2-1 grid-2-1--start">
        <Card flush>
          <CardHeader title={t('orderDetails.items.title')} />
          <div className="dt-scroll">
            <table className="dt dt--static">
              <caption className="sr-only">{t('orderDetails.items.title')}</caption>
              <thead>
                <tr>
                  <th scope="col">{t('orderDetails.items.product')}</th>
                  <th scope="col">{t('orderDetails.items.sku')}</th>
                  <th scope="col" className="is-end">
                    {t('orderDetails.items.quantity')}
                  </th>
                  <th scope="col" className="is-end">
                    {t('orderDetails.items.unitPrice')}
                  </th>
                  <th scope="col" className="is-end">
                    {t('orderDetails.items.lineTotal')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item) => {
                  const product = productById.get(item.productId);
                  return (
                    <tr key={item.productId}>
                      <td data-label={t('orderDetails.items.product')} className="strong">
                        {product ? localize(product.name) : t('common.unknown')}
                      </td>
                      <td data-label={t('orderDetails.items.sku')}>
                        <span className="ltr num">{product?.sku ?? t('common.emptyValue')}</span>
                      </td>
                      <td data-label={t('orderDetails.items.quantity')} className="is-end num">
                        {format.number(item.quantity)}
                      </td>
                      <td data-label={t('orderDetails.items.unitPrice')} className="is-end num">
                        {format.currency(item.unitPrice, 2)}
                      </td>
                      <td data-label={t('orderDetails.items.lineTotal')} className="is-end num strong">
                        {format.currency(item.quantity * item.unitPrice, 2)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="summary">
            <dl className="summary__list">
              <div className="summary__row">
                <dt>{t('orderDetails.summary.subtotal')}</dt>
                <dd className="num">{format.currency(orderSubtotal(order), 2)}</dd>
              </div>
              <div className="summary__row">
                <dt>{t('orderDetails.summary.vat', { rate: VAT_RATE * 100 })}</dt>
                <dd className="num">{format.currency(orderVat(order), 2)}</dd>
              </div>
              <div className="summary__row summary__row--total">
                <dt>{t('orderDetails.summary.total')}</dt>
                <dd className="num">{format.currency(orderTotal(order), 2)}</dd>
              </div>
            </dl>
            <p className="muted summary__note">{t('orderDetails.summary.note')}</p>
          </div>
        </Card>

        <div className="stack">
          <Card>
            <CardHeader title={t('orderDetails.customer')} />
            {customer ? (
              <dl className="info-list info-list--stacked">
                <div className="info-list__item">
                  <dt>{t('customers.columns.customer')}</dt>
                  <dd>
                    <Link to={`/customers/${customer.id}`} className="link-strong">
                      {localize(customer.name)}
                    </Link>
                  </dd>
                </div>
                <div className="info-list__item">
                  <dt>{t('customerDetails.contact.person')}</dt>
                  <dd>{localize(customer.contact)}</dd>
                </div>
                <div className="info-list__item">
                  <dt>{t('customerDetails.contact.email')}</dt>
                  <dd><span className="ltr">{customer.email}</span></dd>
                </div>
                <div className="info-list__item">
                  <dt>{t('customerDetails.contact.phone')}</dt>
                  <dd><span className="ltr num">{customer.phone}</span></dd>
                </div>
              </dl>
            ) : (
              <p className="muted">{t('common.unknown')}</p>
            )}
          </Card>

          <UpdateOrderCard key={`${order.id}-${order.status}-${order.paymentStatus}`} order={order} />
        </div>
      </div>
    </div>
  );
}

const STEPS: OrderStatus[] = ['pending', 'processing', 'completed'];

/** Pending → Processing → Completed progress; cancelled orders show a notice instead. */
function OrderSteps({ status }: { status: OrderStatus }) {
  const { t } = useI18n();
  if (status === 'cancelled') {
    return (
      <p className="alert alert--danger order-steps__cancelled" role="status">
        <XCircle size={18} aria-hidden="true" />
        <span>{t('orderDetails.cancelledNote')}</span>
      </p>
    );
  }
  const current = STEPS.indexOf(status);
  return (
    <ol className="order-steps" aria-label={t('orderDetails.progress')}>
      {STEPS.map((step, index) => (
        <li
          key={step}
          className={cx('order-steps__item', index < current && 'is-done', index === current && 'is-current')}
          aria-current={index === current ? 'step' : undefined}
        >
          <span className="order-steps__dot" aria-hidden="true">
            {index <= current ? <Check size={14} /> : index + 1}
          </span>
          <span className="order-steps__label">{t(`status.${step}`)}</span>
        </li>
      ))}
    </ol>
  );
}

function UpdateOrderCard({ order }: { order: Order }) {
  const { t } = useI18n();
  const toast = useToast();
  const { updateOrder } = useData();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [payment, setPayment] = useState<PaymentStatus>(order.paymentStatus);
  const changed = status !== order.status || payment !== order.paymentStatus;

  return (
    <Card className="no-print">
      <CardHeader title={t('orderDetails.update.title')} />
      <div className="stack">
        <SelectField
          label={t('orderDetails.orderStatus')}
          value={status}
          onChange={(event) => setStatus(event.target.value as OrderStatus)}
          options={ORDER_STATUSES.map((value) => ({ value, label: t(`status.${value}`) }))}
        />
        <SelectField
          label={t('orderDetails.paymentStatus')}
          value={payment}
          onChange={(event) => setPayment(event.target.value as PaymentStatus)}
          options={PAYMENT_STATUSES.map((value) => ({ value, label: t(`status.${value}`) }))}
        />
        <Button
          variant="primary"
          icon={<Save size={18} />}
          disabled={!changed}
          onClick={() => {
            updateOrder(order.id, { status, paymentStatus: payment });
            toast.success(t('orderDetails.update.saved'));
          }}
        >
          {t('orderDetails.update.save')}
        </Button>
      </div>
    </Card>
  );
}
