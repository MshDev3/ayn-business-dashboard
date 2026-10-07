import { useMemo, useState } from 'react';
import { Link } from 'react-router';
import { BellOff, CheckCheck, Circle, CircleCheck, Trash2 } from 'lucide-react';
import { EmptyState } from '../../components/feedback/States';
import { Button, IconButton } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { NotificationIcon } from '../../components/ui/NotificationIcon';
import { PageHeader } from '../../components/ui/PageHeader';
import { Segmented } from '../../components/ui/Segmented';
import { NOTIFICATION_TYPES } from '../../constants';
import { useData } from '../../context/DataContext';
import { useI18n } from '../../context/I18nContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useFormat } from '../../hooks/useFormat';
import { useLocalized } from '../../hooks/useLocalized';
import type { AppNotification, NotificationType } from '../../types';
import { cx } from '../../utils/classNames';
import { startOfDay } from '../../utils/dates';

type ReadFilter = 'all' | 'unread';
type TypeFilter = 'all' | NotificationType;

export default function NotificationsPage() {
  const { t } = useI18n();
  useDocumentTitle(t('notifications.title'));
  const format = useFormat();
  const localize = useLocalized();
  const toast = useToast();
  const { notifications, markNotificationRead, markAllNotificationsRead, deleteNotification, clearNotifications } = useData();

  const [readFilter, setReadFilter] = useState<ReadFilter>('all');
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all');
  const [confirmClear, setConfirmClear] = useState(false);

  const sorted = useMemo(
    () => [...notifications].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [notifications],
  );
  const unreadCount = notifications.filter((n) => !n.read).length;

  const visible = useMemo(
    () =>
      sorted.filter(
        (n) => (readFilter === 'all' || !n.read) && (typeFilter === 'all' || n.type === typeFilter),
      ),
    [sorted, readFilter, typeFilter],
  );

  const grouped = useMemo(() => {
    const startOfToday = startOfDay(new Date()).getTime();
    const groups: Array<{ key: 'today' | 'yesterday' | 'earlier'; items: AppNotification[] }> = [
      { key: 'today', items: [] },
      { key: 'yesterday', items: [] },
      { key: 'earlier', items: [] },
    ];
    for (const item of visible) {
      const time = new Date(item.createdAt).getTime();
      const index = time >= startOfToday ? 0 : time >= startOfToday - 86_400_000 ? 1 : 2;
      groups[index]?.items.push(item);
    }
    return groups.filter((group) => group.items.length > 0);
  }, [visible]);

  return (
    <div className="page">
      <PageHeader
        title={t('notifications.title')}
        subtitle={
          unreadCount > 0
            ? t('notifications.subtitle', { count: format.number(unreadCount) })
            : t('notifications.subtitleNone')
        }
        actions={
          <>
            <Button
              variant="secondary"
              icon={<CheckCheck size={18} />}
              disabled={unreadCount === 0}
              onClick={() => {
                markAllNotificationsRead();
                toast.success(t('notifications.toast.allRead'));
              }}
            >
              {t('notifications.markAllRead')}
            </Button>
            <Button
              variant="secondary"
              icon={<Trash2 size={18} />}
              disabled={notifications.length === 0}
              onClick={() => setConfirmClear(true)}
            >
              {t('notifications.clearAll')}
            </Button>
          </>
        }
      />

      <Card flush>
        <div className="toolbar">
          <Segmented<ReadFilter>
            label={t('notifications.filterLabel')}
            value={readFilter}
            onChange={setReadFilter}
            options={[
              { value: 'all', label: t('notifications.filterAll') },
              { value: 'unread', label: `${t('notifications.filterUnread')} (${format.number(unreadCount)})` },
            ]}
          />
          <Segmented<TypeFilter>
            className="segmented--scroll"
            label={t('notifications.typeFilterLabel')}
            value={typeFilter}
            onChange={setTypeFilter}
            options={[
              { value: 'all', label: t('common.all') },
              ...NOTIFICATION_TYPES.map((value) => ({ value, label: t(`notificationTypes.${value}`) })),
            ]}
          />
        </div>

        {visible.length === 0 ? (
          <EmptyState
            icon={<BellOff size={26} />}
            title={readFilter === 'unread' && notifications.length > 0 ? t('notifications.emptyUnread.title') : t('notifications.empty.title')}
            description={
              readFilter === 'unread' && notifications.length > 0 ? t('notifications.emptyUnread.text') : t('notifications.empty.text')
            }
          />
        ) : (
          grouped.map((group) => (
            <section key={group.key} aria-labelledby={`notif-group-${group.key}`}>
              <h2 className="notif-group__title" id={`notif-group-${group.key}`}>
                {t(`notifications.groups.${group.key}`)}
                <span className="notif-group__count">{format.number(group.items.length)}</span>
              </h2>
          <ul className="notif-page-list">
            {group.items.map((item) => (
              <li key={item.id} className={cx('notif-row', !item.read && 'is-unread')}>
                <NotificationIcon type={item.type} />
                <div className="notif-row__body">
                  <p className="notif-row__title">
                    {item.link ? (
                      <Link to={item.link} onClick={() => markNotificationRead(item.id, true)}>
                        {localize(item.title)}
                      </Link>
                    ) : (
                      localize(item.title)
                    )}
                    {!item.read && <span className="notif-row__unread">{t('notifications.unread')}</span>}
                  </p>
                  <p className="notif-row__text">{localize(item.body)}</p>
                  <p className="notif-row__meta">
                    {t(`notificationTypes.${item.type}`)} · <time dateTime={item.createdAt}>{format.relative(item.createdAt)}</time>
                  </p>
                </div>
                <div className="notif-row__actions">
                  <IconButton
                    size="sm"
                    label={item.read ? t('notifications.markUnread') : t('notifications.markRead')}
                    icon={item.read ? <Circle size={17} /> : <CircleCheck size={17} />}
                    onClick={() => markNotificationRead(item.id, !item.read)}
                  />
                  <IconButton
                    size="sm"
                    variant="danger"
                    label={t('notifications.delete')}
                    icon={<Trash2 size={17} />}
                    onClick={() => {
                      deleteNotification(item.id);
                      toast.success(t('notifications.toast.deleted'));
                    }}
                  />
                </div>
              </li>
            ))}
          </ul>
            </section>
          ))
        )}
      </Card>

      <ConfirmDialog
        open={confirmClear}
        title={t('notifications.clearConfirm.title')}
        message={t('notifications.clearConfirm.message')}
        confirmLabel={t('notifications.clearAll')}
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          clearNotifications();
          setConfirmClear(false);
          toast.success(t('notifications.toast.cleared'));
        }}
      />
    </div>
  );
}
