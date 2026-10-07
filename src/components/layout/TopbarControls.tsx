import { Link, useNavigate } from 'react-router';
import { Bell, ChevronDown, Globe, LogOut, Moon, Settings, Sun, User } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
import { useI18n } from '../../context/I18nContext';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { LANGUAGE_META } from '../../i18n';
import { useFormat } from '../../hooks/useFormat';
import { useLocalized } from '../../hooks/useLocalized';
import { useVisibleNotifications } from '../../hooks/useNotifications';
import { cx } from '../../utils/classNames';
import { Avatar } from '../ui/Avatar';
import { IconButton } from '../ui/Button';
import { Popover } from '../ui/Popover';
import { NotificationIcon } from '../ui/NotificationIcon';

export function ThemeToggle() {
  const { t } = useI18n();
  const { theme, toggleTheme } = useTheme();
  const label = theme === 'dark' ? t('topbar.toLight') : t('topbar.toDark');
  return (
    <IconButton
      variant="outline"
      label={label}
      icon={theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
      onClick={toggleTheme}
    />
  );
}

export function LanguageToggle() {
  const { lang, toggleLang, t } = useI18n();
  const target = lang === 'ar' ? 'en' : 'ar';
  const targetLabel = LANGUAGE_META[target].label;
  return (
    <button
      type="button"
      className="lang-toggle"
      onClick={toggleLang}
      aria-label={t('topbar.switchLanguage', { language: targetLabel })}
      title={t('topbar.switchLanguage', { language: targetLabel })}
    >
      <Globe size={18} aria-hidden="true" />
      <span className="lang-toggle__text" lang={target}>
        {targetLabel}
      </span>
    </button>
  );
}

export function NotificationBell() {
  const { t } = useI18n();
  const format = useFormat();
  const localize = useLocalized();
  const { markAllNotificationsRead, markNotificationRead } = useData();
  const { visible, unreadCount } = useVisibleNotifications();
  const latest = visible.slice(0, 5);

  return (
    <Popover
      role="dialog"
      label={t('topbar.notifications')}
      panelClassName="notif-panel"
      trigger={({ toggle, props }) => (
        <button
          type="button"
          className="icon-btn icon-btn--outline bell"
          onClick={toggle}
          aria-label={
            unreadCount > 0
              ? `${t('topbar.notifications')} (${t('topbar.unreadCount', { count: unreadCount })})`
              : t('topbar.notifications')
          }
          title={t('topbar.notifications')}
          {...props}
        >
          <Bell size={18} aria-hidden="true" />
          {unreadCount > 0 && (
            <span className="bell__badge" aria-hidden="true">
              {unreadCount > 9 ? '9+' : format.number(unreadCount)}
            </span>
          )}
        </button>
      )}
    >
      {({ close }) => (
        <div className="notif">
          <div className="notif__head">
            <h2 className="notif__title">{t('topbar.notifications')}</h2>
            {unreadCount > 0 && (
              <button type="button" className="notif__mark" onClick={markAllNotificationsRead}>
                {t('topbar.markAllRead')}
              </button>
            )}
          </div>
          {latest.length === 0 ? (
            <p className="notif__empty">{t('topbar.notificationsEmpty')}</p>
          ) : (
            <ul className="notif__list">
              {latest.map((item) => (
                <li key={item.id}>
                  <Link
                    to={item.link ?? '/notifications'}
                    className={cx('notif__item', !item.read && 'is-unread')}
                    onClick={() => {
                      markNotificationRead(item.id, true);
                      close();
                    }}
                  >
                    <NotificationIcon type={item.type} />
                    <span className="notif__text">
                      <span className="notif__item-title">{localize(item.title)}</span>
                      <span className="notif__time">{format.relative(item.createdAt)}</span>
                    </span>
                    {!item.read && <span className="notif__dot" aria-label={t('notifications.unread')} />}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <Link to="/notifications" className="notif__all" onClick={close}>
            {t('topbar.viewAllNotifications')}
          </Link>
        </div>
      )}
    </Popover>
  );
}

export function UserMenu() {
  const { t } = useI18n();
  const localize = useLocalized();
  const navigate = useNavigate();
  const toast = useToast();
  const { logout } = useAuth();
  const { profile } = useSettings();
  const name = localize(profile.name);

  const handleLogout = () => {
    logout();
    toast.info(t('topbar.loggedOut'));
    navigate('/login', { replace: true });
  };

  return (
    <Popover
      label={t('topbar.userMenu')}
      className="user-menu"
      trigger={({ toggle, props }) => (
        <button type="button" className="user-menu__trigger" onClick={toggle} aria-label={`${t('topbar.userMenu')}: ${name}`} {...props}>
          <Avatar name={name} size="sm" />
          <span className="user-menu__name">{name}</span>
          <ChevronDown size={16} aria-hidden="true" className="user-menu__chevron" />
        </button>
      )}
    >
      {({ close }) => (
        <>
          <div className="user-menu__header">
            <p className="user-menu__caption">{t('topbar.signedInAs')}</p>
            <p className="user-menu__email ltr">{profile.email}</p>
          </div>
          <div className="menu-divider" role="separator" />
          <Link to="/profile" role="menuitem" className="menu-item" onClick={close}>
            <User size={16} aria-hidden="true" />
            {t('nav.profile')}
          </Link>
          <Link to="/settings" role="menuitem" className="menu-item" onClick={close}>
            <Settings size={16} aria-hidden="true" />
            {t('nav.settings')}
          </Link>
          <div className="menu-divider" role="separator" />
          <button type="button" role="menuitem" className="menu-item menu-item--danger" onClick={handleLogout}>
            <LogOut size={16} aria-hidden="true" />
            {t('topbar.logout')}
          </button>
        </>
      )}
    </Popover>
  );
}
