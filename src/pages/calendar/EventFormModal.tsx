import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { SelectField, TextAreaField, TextField } from '../../components/forms/Fields';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { EVENT_CATEGORIES } from '../../constants';
import { useI18n } from '../../context/I18nContext';
import { useLocalized } from '../../hooks/useLocalized';
import type { CalendarEvent, EventCategory } from '../../types';
import { isDateKey } from '../../utils/validation';

export interface EventFormValues {
  title: string;
  date: string;
  time: string;
  category: EventCategory;
  description: string;
}

type Errors = Partial<Record<keyof EventFormValues, string>>;

interface EventFormModalProps {
  open: boolean;
  /** Existing event to edit; omit to create. */
  event?: CalendarEvent | null;
  defaultDate: string;
  onClose: () => void;
  onSubmit: (values: EventFormValues) => void;
  onDelete?: () => void;
}

export function EventFormModal({ open, event, defaultDate, onClose, onSubmit, onDelete }: EventFormModalProps) {
  const { t } = useI18n();
  const formId = useId();
  const editing = Boolean(event);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editing ? t('calendar.form.editTitle') : t('calendar.form.addTitle')}
      footer={
        <>
          {editing && onDelete && (
            <Button variant="ghost" className="push-start danger-text" onClick={onDelete}>
              {t('common.delete')}
            </Button>
          )}
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" type="submit" form={formId}>
            {editing ? t('common.save') : t('calendar.form.addTitle')}
          </Button>
        </>
      }
    >
      <EventForm formId={formId} event={event ?? null} defaultDate={defaultDate} onSubmit={onSubmit} />
    </Modal>
  );
}

function EventForm({
  formId,
  event,
  defaultDate,
  onSubmit,
}: {
  formId: string;
  event: CalendarEvent | null;
  defaultDate: string;
  onSubmit: (values: EventFormValues) => void;
}) {
  const { t } = useI18n();
  const localize = useLocalized();

  const [values, setValues] = useState<EventFormValues>(() => ({
    title: event ? localize(event.title) : '',
    date: event?.date ?? defaultDate,
    time: event?.time ?? '09:00',
    category: event?.category ?? 'meeting',
    description: event ? localize(event.description) : '',
  }));
  const [errors, setErrors] = useState<Errors>({});

  const set = <K extends keyof EventFormValues>(key: K, value: EventFormValues[K]) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const handleSubmit = (submitEvent: FormEvent) => {
    submitEvent.preventDefault();
    const found: Errors = {};
    if (!values.title.trim()) found.title = t('validation.required');
    if (!values.date) found.date = t('validation.required');
    else if (!isDateKey(values.date)) found.date = t('validation.date');
    if (!values.time) found.time = t('validation.required');
    setErrors(found);
    if (Object.keys(found).length === 0) onSubmit(values);
  };

  return (
    <form id={formId} className="form-grid" onSubmit={handleSubmit} noValidate>
      <div className="span-2">
        <TextField
          label={t('calendar.form.title')}
          placeholder={t('calendar.form.titlePlaceholder')}
          value={values.title}
          onChange={(e) => set('title', e.target.value)}
          error={errors.title}
          required
          autoComplete="off"
        />
      </div>
      <TextField
        label={t('calendar.form.date')}
        type="date"
        value={values.date}
        onChange={(e) => set('date', e.target.value)}
        error={errors.date}
        required
      />
      <TextField
        label={t('calendar.form.time')}
        type="time"
        value={values.time}
        onChange={(e) => set('time', e.target.value)}
        error={errors.time}
        required
      />
      <div className="span-2">
        <SelectField
          label={t('calendar.form.category')}
          value={values.category}
          onChange={(e) => set('category', e.target.value as EventCategory)}
          options={EVENT_CATEGORIES.map((value) => ({ value, label: t(`eventCategories.${value}`) }))}
        />
      </div>
      <div className="span-2">
        <TextAreaField
          label={t('calendar.form.description')}
          optional
          rows={3}
          value={values.description}
          onChange={(e) => set('description', e.target.value)}
        />
      </div>
    </form>
  );
}
