import { useData } from '../../context/DataContext';
import { useI18n } from '../../context/I18nContext';
import { useToast } from '../../context/ToastContext';
import type { Employee } from '../../types';
import { makeLocalized, setLocalized } from '../../utils/text';
import type { EmployeeFormValues } from './EmployeeFormModal';

/** Create / update / delete flows shared by the employee list and details pages. */
export function useEmployeeActions() {
  const { t, lang } = useI18n();
  const toast = useToast();
  const { addEmployee, updateEmployee, deleteEmployee } = useData();

  return {
    create(values: EmployeeFormValues) {
      addEmployee({
        name: makeLocalized(values.name),
        email: values.email.trim(),
        phone: values.phone.trim(),
        department: values.department,
        title: makeLocalized(values.title),
        status: values.status,
      });
      toast.success(t('employees.toast.added'));
    },
    update(employee: Employee, values: EmployeeFormValues) {
      updateEmployee(employee.id, {
        name: setLocalized(employee.name, lang, values.name),
        email: values.email.trim(),
        phone: values.phone.trim(),
        department: values.department,
        title: setLocalized(employee.title, lang, values.title),
        status: values.status,
      });
      toast.success(t('employees.toast.updated'));
    },
    remove(employee: Employee) {
      deleteEmployee(employee.id);
      toast.success(t('employees.toast.deleted'));
    },
  };
}
