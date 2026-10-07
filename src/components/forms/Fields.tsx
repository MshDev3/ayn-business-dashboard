import { useId } from 'react';
import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from 'react';
import { ChevronDown } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { cx } from '../../utils/classNames';

interface FieldFrameProps {
  id: string;
  label: string;
  required?: boolean;
  optional?: boolean;
  hint?: string;
  error?: string;
  children: ReactNode;
}

function FieldFrame({ id, label, required, optional, hint, error, children }: FieldFrameProps) {
  const { t } = useI18n();
  return (
    <div className={cx('field', error && 'field--invalid')}>
      <label className="field__label" htmlFor={id}>
        {label}
        {required && (
          <span className="field__required" aria-hidden="true">
            *
          </span>
        )}
        {optional && <span className="field__optional">{t('common.optional')}</span>}
      </label>
      {children}
      {hint && !error && (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      )}
      {error && (
        <p className="field__error" id={`${id}-error`} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

function describedBy(id: string, hint?: string, error?: string): string | undefined {
  if (error) return `${id}-error`;
  if (hint) return `${id}-hint`;
  return undefined;
}

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'id'> {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  startIcon?: ReactNode;
  endSlot?: ReactNode;
  /** Forces left-to-right text, for emails, phone numbers and IDs typed inside an RTL layout. */
  ltr?: boolean;
}

export function TextField({
  label,
  error,
  hint,
  optional,
  required,
  startIcon,
  endSlot,
  ltr,
  className,
  ...rest
}: TextFieldProps) {
  const id = useId();
  return (
    <FieldFrame id={id} label={label} required={required} optional={optional} hint={hint} error={error}>
      <div
        className={cx(
          'input-wrap',
          Boolean(startIcon) && 'input-wrap--icon',
          Boolean(endSlot) && 'input-wrap--slot',
          ltr && 'input-wrap--ltr',
        )}
      >
        {startIcon && <span className="input-wrap__icon">{startIcon}</span>}
        <input
          id={id}
          className={cx('input', className)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
          aria-required={required || undefined}
          {...rest}
        />
        {endSlot && <span className="input-wrap__slot">{endSlot}</span>}
      </div>
    </FieldFrame>
  );
}

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  options: SelectOption[];
}

/** Styled native select (kept native for best mobile and accessibility behaviour). */
export function Select({ options, className, ...rest }: SelectProps) {
  return (
    <span className={cx('select', className)}>
      <select className="select__control" {...rest}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <ChevronDown className="select__icon" size={16} aria-hidden="true" />
    </span>
  );
}

interface SelectFieldProps extends Omit<SelectProps, 'id'> {
  label: string;
  error?: string;
  hint?: string;
}

export function SelectField({ label, error, hint, required, ...rest }: SelectFieldProps) {
  const id = useId();
  return (
    <FieldFrame id={id} label={label} required={required} hint={hint} error={error}>
      <Select
        id={id}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        required={required}
        {...rest}
      />
    </FieldFrame>
  );
}

interface TextAreaFieldProps extends Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id'> {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
}

export function TextAreaField({ label, error, hint, optional, required, className, ...rest }: TextAreaFieldProps) {
  const id = useId();
  return (
    <FieldFrame id={id} label={label} required={required} optional={optional} hint={hint} error={error}>
      <textarea
        id={id}
        className={cx('input', 'textarea', className)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        aria-required={required || undefined}
        {...rest}
      />
    </FieldFrame>
  );
}

interface CheckboxFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'id'> {
  label: string;
}

export function CheckboxField({ label, className, ...rest }: CheckboxFieldProps) {
  return (
    <label className={cx('check', className)}>
      <input type="checkbox" className="check__input" {...rest} />
      <span className="check__box" aria-hidden="true" />
      <span className="check__label">{label}</span>
    </label>
  );
}

interface SwitchFieldProps {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
}

export function SwitchField({ label, hint, checked, onChange, disabled }: SwitchFieldProps) {
  const id = useId();
  return (
    <div className="switch-row">
      <div className="switch-row__text">
        <label className="switch-row__label" htmlFor={id}>
          {label}
        </label>
        {hint && (
          <p className="switch-row__hint" id={`${id}-hint`}>
            {hint}
          </p>
        )}
      </div>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        aria-describedby={hint ? `${id}-hint` : undefined}
        className="switch"
        disabled={disabled}
        onClick={() => onChange(!checked)}
      >
        <span className="switch__thumb" />
      </button>
    </div>
  );
}
