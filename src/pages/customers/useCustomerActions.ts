import { useData } from '../../context/DataContext';
import { useI18n } from '../../context/I18nContext';
import { useToast } from '../../context/ToastContext';
import type { Customer } from '../../types';
import { makeLocalized, setLocalized } from '../../utils/text';
import type { CustomerFormValues } from './CustomerFormModal';

export function useCustomerActions() {
  const { t, lang } = useI18n();
  const toast = useToast();
  const { addCustomer, updateCustomer } = useData();

  return {
    create(values: CustomerFormValues) {
      addCustomer({
        name: makeLocalized(values.company),
        contact: makeLocalized(values.contact),
        email: values.email.trim(),
        phone: values.phone.trim(),
        city: makeLocalized(values.city),
        status: values.status,
      });
      toast.success(t('customers.toast.added'));
    },
    update(customer: Customer, values: CustomerFormValues) {
      updateCustomer(customer.id, {
        name: setLocalized(customer.name, lang, values.company),
        contact: setLocalized(customer.contact, lang, values.contact),
        email: values.email.trim(),
        phone: values.phone.trim(),
        city: setLocalized(customer.city, lang, values.city),
        status: values.status,
      });
      toast.success(t('customers.toast.updated'));
    },
  };
}
