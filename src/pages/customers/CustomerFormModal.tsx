import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { SelectField, TextField } from '../../components/forms/Fields';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { CUSTOMER_STATUSES } from '../../constants';
import { useData } from '../../context/DataContext';
import { useI18n } from '../../context/I18nContext';
import { useLocalized } from '../../hooks/useLocalized';
import type { Customer, CustomerStatus } from '../../types';
import { isEmail, isPhone } from '../../utils/validation';

export interface CustomerFormValues {
  company: string;
  contact: string;
  email: string;
  phone: string;
  city: string;
  status: CustomerStatus;
}

type Errors = Partial<Record<keyof CustomerFormValues, string>>;

interface CustomerFormModalProps {
  open: boolean;
  customer?: Customer | null;
  onClose: () => void;
  onSubmit: (values: CustomerFormValues) => void;
}

export function CustomerFormModal({ open, customer, onClose, onSubmit }: CustomerFormModalProps) {
  const { t } = useI18n();
  const formId = useId();
  const editing = Boolean(customer);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? t('customers.form.editTitle') : t('customers.form.addTitle')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" type="submit" form={formId}>
            {editing ? t('common.save') : t('customers.form.addTitle')}
          </Button>
        </>
      }
    >
      <CustomerForm formId={formId} customer={customer ?? null} onSubmit={onSubmit} />
    </Modal>
  );
}

function CustomerForm({
  formId,
  customer,
  onSubmit,
}: {
  formId: string;
  customer: Customer | null;
  onSubmit: (values: CustomerFormValues) => void;
}) {
  const { t } = useI18n();
  const localize = useLocalized();
  const { customers } = useData();

  const [values, setValues] = useState<CustomerFormValues>(() => ({
    company: customer ? localize(customer.name) : '',
    contact: customer ? localize(customer.contact) : '',
    email: customer?.email ?? '',
    phone: customer?.phone ?? '',
    city: customer ? localize(customer.city) : '',
    status: customer?.status ?? 'new',
  }));
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof CustomerFormValues>(key: K, value: CustomerFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = (): Errors => {
    const next: Errors = {};
    if (!values.company.trim()) next.company = t('validation.required');
    if (!values.contact.trim()) next.contact = t('validation.required');
    if (!values.city.trim()) next.city = t('validation.required');
    if (!values.email.trim()) next.email = t('validation.required');
    else if (!isEmail(values.email)) next.email = t('validation.email');
    else if (
      customers.some((c) => c.id !== customer?.id && c.email.toLowerCase() === values.email.trim().toLowerCase())
    ) {
      next.email = t('validation.emailTaken');
    }
    if (!values.phone.trim()) next.phone = t('validation.required');
    else if (!isPhone(values.phone)) next.phone = t('validation.phoneAny');
    return next;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(values);
  };

  return (
    <form id={formId} className="form-grid" onSubmit={handleSubmit} noValidate>
      <div className="span-2">
        <TextField
          label={t('customers.form.company')}
          value={values.company}
          onChange={(event) => set('company', event.target.value)}
          error={errors.company}
          required
          autoComplete="off"
        />
      </div>
      <TextField
        label={t('customers.form.contact')}
        value={values.contact}
        onChange={(event) => set('contact', event.target.value)}
        error={errors.contact}
        required
        autoComplete="off"
      />
      <TextField
        label={t('customers.form.city')}
        value={values.city}
        onChange={(event) => set('city', event.target.value)}
        error={errors.city}
        required
        autoComplete="off"
      />
      <div className="span-2">
        <TextField
          label={t('customers.form.email')}
          type="email"
          ltr
          value={values.email}
          onChange={(event) => set('email', event.target.value)}
          error={errors.email}
          required
          autoComplete="off"
        />
      </div>
      <TextField
        label={t('customers.form.phone')}
        type="tel"
        ltr
        value={values.phone}
        onChange={(event) => set('phone', event.target.value)}
        error={errors.phone}
        required
        autoComplete="off"
      />
      <SelectField
        label={t('customers.form.status')}
        value={values.status}
        onChange={(event) => set('status', event.target.value as CustomerStatus)}
        options={CUSTOMER_STATUSES.map((value) => ({ value, label: t(`status.${value}`) }))}
      />
    </form>
  );
}
