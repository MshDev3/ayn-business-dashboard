import { cx } from '../../utils/classNames';

export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonStyleProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
}

export function buttonClasses({ variant = 'secondary', size = 'md', fullWidth }: ButtonStyleProps, extra?: string) {
  return cx('btn', `btn--${variant}`, `btn--${size}`, fullWidth && 'btn--full', extra);
}
