import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { SelectField, TextField } from '../../components/forms/Fields';
import type { SelectOption } from '../../components/forms/Fields';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { DEPARTMENTS, EMPLOYEE_STATUSES } from '../../constants';
import { useData } from '../../context/DataContext';
import { useI18n } from '../../context/I18nContext';
import { useLocalized } from '../../hooks/useLocalized';
import type { Department, Employee, EmployeeStatus } from '../../types';
import { isEmail, isSaudiMobile } from '../../utils/validation';

export interface EmployeeFormValues {
  name: string;
  email: string;
  phone: string;
  department: Department;
  title: string;
  status: EmployeeStatus;
}

type Errors = Partial<Record<keyof EmployeeFormValues, string>>;

interface EmployeeFormModalProps {
  open: boolean;
  /** When provided the form edits this employee; otherwise it creates a new one. */
  employee?: Employee | null;
  onClose: () => void;
  onSubmit: (values: EmployeeFormValues) => void;
}

export function EmployeeFormModal({ open, employee, onClose, onSubmit }: EmployeeFormModalProps) {
  const { t } = useI18n();
  const formId = useId();
  const editing = Boolean(employee);

  return (
    <Modal
      open={open}
      onClose={onClose}
      variant="drawer"
      size="md"
      title={editing ? t('employees.form.editTitle') : t('employees.form.addTitle')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" type="submit" form={formId}>
            {editing ? t('common.save') : t('employees.form.addTitle')}
          </Button>
        </>
      }
    >
      <EmployeeForm formId={formId} employee={employee ?? null} onSubmit={onSubmit} />
    </Modal>
  );
}

function EmployeeForm({
  formId,
  employee,
  onSubmit,
}: {
  formId: string;
  employee: Employee | null;
  onSubmit: (values: EmployeeFormValues) => void;
}) {
  const { t } = useI18n();
  const localize = useLocalized();
  const { employees } = useData();

  const [values, setValues] = useState<EmployeeFormValues>(() => ({
    name: employee ? localize(employee.name) : '',
    email: employee?.email ?? '',
    phone: employee?.phone ?? '',
    department: employee?.department ?? 'sales',
    title: employee ? localize(employee.title) : '',
    status: employee?.status ?? 'active',
  }));
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof EmployeeFormValues>(key: K, value: EmployeeFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const validate = (): Errors => {
    const next: Errors = {};
    if (!values.name.trim()) next.name = t('validation.required');
    if (!values.title.trim()) next.title = t('validation.required');
    if (!values.email.trim()) next.email = t('validation.required');
    else if (!isEmail(values.email)) next.email = t('validation.email');
    else if (
      employees.some((e) => e.id !== employee?.id && e.email.toLowerCase() === values.email.trim().toLowerCase())
    ) {
      next.email = t('validation.emailTaken');
    }
    if (!values.phone.trim()) next.phone = t('validation.required');
    else if (!isSaudiMobile(values.phone)) next.phone = t('validation.phone');
    return next;
  };

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(values);
  };

  const departmentOptions: SelectOption[] = DEPARTMENTS.map((value) => ({
    value,
    label: t(`departments.${value}`),
  }));
  const statusOptions: SelectOption[] = EMPLOYEE_STATUSES.map((value) => ({
    value,
    label: t(`status.${value}`),
  }));

  return (
    <form id={formId} className="form-grid" onSubmit={handleSubmit} noValidate>
      <div className="span-2">
        <TextField
          label={t('employees.form.name')}
          value={values.name}
          onChange={(event) => set('name', event.target.value)}
          error={errors.name}
          required
          autoComplete="off"
        />
      </div>
      <div className="span-2">
        <TextField
          label={t('employees.form.email')}
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
        label={t('employees.form.phone')}
        type="tel"
        ltr
        value={values.phone}
        onChange={(event) => set('phone', event.target.value)}
        error={errors.phone}
        hint={t('employees.form.phoneHint')}
        required
        autoComplete="off"
      />
      <SelectField
        label={t('employees.form.department')}
        value={values.department}
        onChange={(event) => set('department', event.target.value as Department)}
        options={departmentOptions}
      />
      <TextField
        label={t('employees.form.title')}
        value={values.title}
        onChange={(event) => set('title', event.target.value)}
        error={errors.title}
        required
        autoComplete="off"
      />
      <SelectField
        label={t('employees.form.status')}
        value={values.status}
        onChange={(event) => set('status', event.target.value as EmployeeStatus)}
        options={statusOptions}
      />
    </form>
  );
}
