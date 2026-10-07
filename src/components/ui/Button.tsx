import { Link } from 'react-router';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { LinkProps } from 'react-router';
import { Spinner } from '../feedback/Spinner';
import { buttonClasses } from './buttonClasses';
import type { ButtonStyleProps } from './buttonClasses';

interface ContentProps {
  icon?: ReactNode;
  iconEnd?: ReactNode;
  children: ReactNode;
}

function ButtonContent({ icon, iconEnd, children }: ContentProps) {
  return (
    <>
      {icon && <span className="btn__icon">{icon}</span>}
      <span className="btn__label">{children}</span>
      {iconEnd && <span className="btn__icon">{iconEnd}</span>}
    </>
  );
}

interface ButtonProps extends ButtonStyleProps, Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children'>, ContentProps {
  loading?: boolean;
}

export function Button({
  variant,
  size,
  fullWidth,
  loading = false,
  icon,
  iconEnd,
  children,
  className,
  disabled,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonClasses({ variant, size, fullWidth }, className)}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      {...rest}
    >
      {loading ? <Spinner size={16} /> : icon && <span className="btn__icon">{icon}</span>}
      <span className="btn__label">{children}</span>
      {iconEnd && <span className="btn__icon">{iconEnd}</span>}
    </button>
  );
}

interface LinkButtonProps extends ButtonStyleProps, Omit<LinkProps, 'children'>, ContentProps {}

export function LinkButton({ variant, size, fullWidth, icon, iconEnd, children, className, ...rest }: LinkButtonProps) {
  return (
    <Link className={buttonClasses({ variant, size, fullWidth }, className)} {...rest}>
      <ButtonContent icon={icon} iconEnd={iconEnd}>
        {children}
      </ButtonContent>
    </Link>
  );
}

type IconButtonVariant = 'ghost' | 'outline' | 'danger';

interface IconButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'children' | 'aria-label'> {
  label: string;
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: 'sm' | 'md';
}

export function IconButton({ label, icon, variant = 'ghost', size = 'md', className, type = 'button', ...rest }: IconButtonProps) {
  return (
    <button
      type={type}
      className={['icon-btn', `icon-btn--${variant}`, `icon-btn--${size}`, className].filter(Boolean).join(' ')}
      aria-label={label}
      title={label}
      {...rest}
    >
      {icon}
    </button>
  );
}

interface IconLinkProps extends Omit<LinkProps, 'children' | 'aria-label'> {
  label: string;
  icon: ReactNode;
  variant?: IconButtonVariant;
  size?: 'sm' | 'md';
}

export function IconLink({ label, icon, variant = 'ghost', size = 'md', className, ...rest }: IconLinkProps) {
  return (
    <Link
      className={['icon-btn', `icon-btn--${variant}`, `icon-btn--${size}`, className].filter(Boolean).join(' ')}
      aria-label={label}
      title={label}
      {...rest}
    >
      {icon}
    </Link>
  );
}
