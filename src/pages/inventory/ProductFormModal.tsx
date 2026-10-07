import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { SelectField, TextField } from '../../components/forms/Fields';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { PRODUCT_CATEGORIES } from '../../constants';
import { useI18n } from '../../context/I18nContext';
import type { ProductCategory } from '../../types';

export interface ProductFormValues {
  name: string;
  category: ProductCategory;
  price: string;
  stock: string;
  reorderLevel: string;
}

type Errors = Partial<Record<keyof ProductFormValues, string>>;

interface ProductFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: ProductFormValues) => void;
}

export function ProductFormModal({ open, onClose, onSubmit }: ProductFormModalProps) {
  const { t } = useI18n();
  const formId = useId();

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('inventory.form.addTitle')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" type="submit" form={formId}>
            {t('inventory.form.addTitle')}
          </Button>
        </>
      }
    >
      <ProductForm formId={formId} onSubmit={onSubmit} />
    </Modal>
  );
}

function ProductForm({ formId, onSubmit }: { formId: string; onSubmit: (values: ProductFormValues) => void }) {
  const { t } = useI18n();
  const [values, setValues] = useState<ProductFormValues>({
    name: '',
    category: 'electronics',
    price: '',
    stock: '0',
    reorderLevel: '10',
  });
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found: Errors = {};
    if (!values.name.trim()) found.name = t('validation.required');
    if (values.price === '') found.price = t('validation.required');
    else if (!(Number(values.price) > 0)) found.price = t('validation.positive');
    if (values.stock === '') found.stock = t('validation.required');
    else if (!Number.isInteger(Number(values.stock)) || Number(values.stock) < 0) found.stock = t('validation.wholeNumber');
    if (values.reorderLevel === '') found.reorderLevel = t('validation.required');
    else if (!Number.isInteger(Number(values.reorderLevel)) || Number(values.reorderLevel) < 0) {
      found.reorderLevel = t('validation.wholeNumber');
    }
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(values);
  };

  return (
    <form id={formId} className="form-grid" onSubmit={handleSubmit} noValidate>
      <div className="span-2">
        <TextField
          label={t('inventory.form.name')}
          value={values.name}
          onChange={(e) => set('name', e.target.value)}
          error={errors.name}
          required
          autoComplete="off"
        />
      </div>
      <SelectField
        label={t('inventory.form.category')}
        value={values.category}
        onChange={(e) => set('category', e.target.value as ProductCategory)}
        options={PRODUCT_CATEGORIES.map((value) => ({ value, label: t(`productCategories.${value}`) }))}
      />
      <TextField
        label={t('inventory.form.price')}
        type="number"
        inputMode="decimal"
        min="0"
        step="0.01"
        ltr
        value={values.price}
        onChange={(e) => set('price', e.target.value)}
        error={errors.price}
        required
      />
      <TextField
        label={t('inventory.form.stock')}
        type="number"
        inputMode="numeric"
        min="0"
        step="1"
        ltr
        value={values.stock}
        onChange={(e) => set('stock', e.target.value)}
        error={errors.stock}
        required
      />
      <TextField
        label={t('inventory.form.reorderLevel')}
        hint={t('inventory.form.reorderHint')}
        type="number"
        inputMode="numeric"
        min="0"
        step="1"
        ltr
        value={values.reorderLevel}
        onChange={(e) => set('reorderLevel', e.target.value)}
        error={errors.reorderLevel}
        required
      />
    </form>
  );
}
