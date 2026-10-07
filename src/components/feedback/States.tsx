import { AlertOctagon, Inbox } from 'lucide-react';
import type { ReactNode } from 'react';
import { useI18n } from '../../context/I18nContext';
import { Button } from '../ui/Button';

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  compact?: boolean;
}

export function EmptyState({ title, description, icon, action, compact }: EmptyStateProps) {
  return (
    <div className={compact ? 'state state--compact' : 'state'}>
      <span className="state__icon" aria-hidden="true">
        {icon ?? <Inbox size={26} />}
      </span>
      <h3 className="state__title">{title}</h3>
      {description && <p className="state__text">{description}</p>}
      {action && <div className="state__action">{action}</div>}
    </div>
  );
}

interface ErrorStateProps {
  title?: string;
  description?: string;
  onRetry?: () => void;
  action?: ReactNode;
}

export function ErrorState({ title, description, onRetry, action }: ErrorStateProps) {
  const { t } = useI18n();
  return (
    <div className="state state--error" role="alert">
      <span className="state__icon state__icon--error" aria-hidden="true">
        <AlertOctagon size={26} />
      </span>
      <h3 className="state__title">{title ?? t('states.errorTitle')}</h3>
      <p className="state__text">{description ?? t('states.errorText')}</p>
      {(onRetry || action) && (
        <div className="state__action">
          {onRetry && <Button onClick={onRetry}>{t('common.retry')}</Button>}
          {action}
        </div>
      )}
    </div>
  );
}
