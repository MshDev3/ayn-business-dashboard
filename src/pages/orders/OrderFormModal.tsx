import { useId, useMemo, useState } from 'react';
import type { FormEvent } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { SelectField, TextField } from '../../components/forms/Fields';
import { Button, IconButton } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { ORDER_STATUSES, PAYMENT_STATUSES, VAT_RATE } from '../../constants';
import { useData } from '../../context/DataContext';
import { useI18n } from '../../context/I18nContext';
import { useFormat } from '../../hooks/useFormat';
import { useLocalized } from '../../hooks/useLocalized';
import type { OrderItem, OrderStatus, PaymentStatus } from '../../types';

export interface OrderFormValues {
  customerId: string;
  items: OrderItem[];
  status: OrderStatus;
  paymentStatus: PaymentStatus;
}

interface Line {
  key: number;
  productId: string;
  quantity: string;
}

interface OrderFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: OrderFormValues) => void;
}

export function OrderFormModal({ open, onClose, onSubmit }: OrderFormModalProps) {
  const { t } = useI18n();
  const formId = useId();

  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="drawer"
      title={t('orders.form.title')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" type="submit" form={formId}>
            {t('orders.form.title')}
          </Button>
        </>
      }
    >
      <OrderForm formId={formId} onSubmit={onSubmit} />
    </Modal>
  );
}

function OrderForm({ formId, onSubmit }: { formId: string; onSubmit: (values: OrderFormValues) => void }) {
  const { t } = useI18n();
  const format = useFormat();
  const localize = useLocalized();
  const { customers, products, productById } = useData();

  const [customerId, setCustomerId] = useState('');
  const [status, setStatus] = useState<OrderStatus>('pending');
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>('unpaid');
  const [lines, setLines] = useState<Line[]>([{ key: 1, productId: '', quantity: '1' }]);
  const [nextKey, setNextKey] = useState(2);
  const [errors, setErrors] = useState<{ customer?: string; lines?: string; perLine: Record<number, string> }>({
    perLine: {},
  });

  const available = useMemo(() => products.filter((p) => p.stock > 0), [products]);

  const total = useMemo(() => {
    const subtotal = lines.reduce((sum, line) => {
      const product = productById.get(line.productId);
      return product ? sum + product.price * (Number(line.quantity) || 0) : sum;
    }, 0);
    return Math.round(subtotal * (1 + VAT_RATE) * 100) / 100;
  }, [lines, productById]);

  const updateLine = (key: number, patch: Partial<Line>) => {
    setLines((current) => current.map((line) => (line.key === key ? { ...line, ...patch } : line)));
    setErrors((current) => ({ ...current, lines: undefined, perLine: { ...current.perLine, [key]: '' } }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found: typeof errors = { perLine: {} };
    if (!customerId) found.customer = t('validation.required');

    const filled = lines.filter((line) => line.productId);
    if (filled.length === 0) found.lines = t('orders.form.itemsRequired');
    for (const line of filled) {
      const product = productById.get(line.productId);
      const quantity = Number(line.quantity);
      if (!Number.isInteger(quantity) || quantity < 1) found.perLine[line.key] = t('validation.wholeNumber');
      else if (product && quantity > product.stock) {
        found.perLine[line.key] = t('orders.form.noStock', { count: format.number(product.stock) });
      }
    }
    setErrors(found);
    const lineErrors = Object.values(found.perLine).some(Boolean);
    if (found.customer || found.lines || lineErrors) return;

    onSubmit({
      customerId,
      status,
      paymentStatus,
      items: filled.map((line) => {
        const product = productById.get(line.productId);
        return { productId: line.productId, quantity: Number(line.quantity), unitPrice: product?.price ?? 0 };
      }),
    });
  };

  const chosen = new Set(lines.map((line) => line.productId).filter(Boolean));

  return (
    <form id={formId} className="stack" onSubmit={handleSubmit} noValidate>
      <SelectField
        label={t('orders.form.customer')}
        value={customerId}
        onChange={(e) => {
          setCustomerId(e.target.value);
          setErrors((current) => ({ ...current, customer: undefined }));
        }}
        error={errors.customer}
        required
        options={[
          { value: '', label: t('orders.form.selectCustomer') },
          ...customers.map((c) => ({ value: c.id, label: localize(c.name) })),
        ]}
      />

      <fieldset className="order-lines">
        <legend className="field__label">{t('orders.form.items')}</legend>
        {lines.map((line) => {
          const lineError = errors.perLine[line.key];
          return (
            <div className="order-line" key={line.key}>
              <SelectField
                label={t('orders.form.product')}
                value={line.productId}
                onChange={(e) => updateLine(line.key, { productId: e.target.value })}
                options={[
                  { value: '', label: t('orders.form.selectProduct') },
                  ...available
                    .filter((p) => p.id === line.productId || !chosen.has(p.id))
                    .map((p) => ({
                      value: p.id,
                      label: `${localize(p.name)} · ${format.currency(p.price, 0)}`,
                    })),
                ]}
              />
              <TextField
                label={t('orders.form.quantity')}
                type="number"
                inputMode="numeric"
                min="1"
                step="1"
                ltr
                value={line.quantity}
                onChange={(e) => updateLine(line.key, { quantity: e.target.value })}
                error={lineError || undefined}
              />
              <IconButton
                variant="danger"
                label={t('orders.form.removeItem')}
                icon={<Trash2 size={17} />}
                disabled={lines.length === 1}
                onClick={() => setLines((current) => current.filter((l) => l.key !== line.key))}
                className="order-line__remove"
              />
            </div>
          );
        })}
        {errors.lines && (
          <p className="field__error" role="alert">
            {errors.lines}
          </p>
        )}
        <div>
          <Button
            size="sm"
            variant="secondary"
            icon={<Plus size={16} />}
            onClick={() => {
              setLines((current) => [...current, { key: nextKey, productId: '', quantity: '1' }]);
              setNextKey((k) => k + 1);
            }}
          >
            {t('orders.form.addItem')}
          </Button>
        </div>
      </fieldset>

      <div className="form-grid">
        <SelectField
          label={t('orders.form.status')}
          value={status}
          onChange={(e) => setStatus(e.target.value as OrderStatus)}
          options={ORDER_STATUSES.map((value) => ({ value, label: t(`status.${value}`) }))}
        />
        <SelectField
          label={t('orders.form.payment')}
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}
          options={PAYMENT_STATUSES.map((value) => ({ value, label: t(`status.${value}`) }))}
        />
      </div>

      <div className="order-total">
        <div>
          <p className="order-total__label">{t('orders.form.total')}</p>
          <p className="muted order-total__note">{t('orders.form.stockNote')}</p>
        </div>
        <p className="order-total__value num">{format.currency(total, 2)}</p>
      </div>
    </form>
  );
}
