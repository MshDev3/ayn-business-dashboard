import type { ElementType, HTMLAttributes, ReactNode } from 'react';
import { cx } from '../../utils/classNames';

interface CardProps extends HTMLAttributes<HTMLElement> {
  as?: ElementType;
  /** Removes inner padding, e.g. for tables that run edge to edge. */
  flush?: boolean;
  interactive?: boolean;
}

export function Card({ as: Tag = 'section', flush, interactive, className, children, ...rest }: CardProps) {
  return (
    <Tag className={cx('card', flush && 'card--flush', interactive && 'card--interactive', className)} {...rest}>
      {children}
    </Tag>
  );
}

interface CardHeaderProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  /** Heading level used for the title; keeps the document outline sensible. */
  level?: 2 | 3;
  id?: string;
}

export function CardHeader({ title, subtitle, actions, level = 2, id }: CardHeaderProps) {
  const Heading = level === 2 ? 'h2' : 'h3';
  return (
    <div className="card__header">
      <div className="card__heading">
        <Heading className="card__title" id={id}>
          {title}
        </Heading>
        {subtitle && <p className="card__subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="card__actions">{actions}</div>}
    </div>
  );
}
