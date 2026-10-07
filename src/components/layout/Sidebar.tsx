import { NavLink, Link } from 'react-router';
import {
  Bell,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Settings,
  X,
} from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { useSettings } from '../../context/SettingsContext';
import { useLocalized } from '../../hooks/useLocalized';
import { useVisibleNotifications } from '../../hooks/useNotifications';
import { cx } from '../../utils/classNames';
import { Avatar } from '../ui/Avatar';
import { Brand } from '../ui/Brand';
import { IconButton } from '../ui/Button';
import { NAV_GROUPS } from './navigation';

interface SidebarProps {
  collapsed: boolean;
  isMobile: boolean;
  mobileOpen: boolean;
  /** Collapse toggling is only offered where the sidebar is not forced to a rail. */
  canToggle: boolean;
  onToggleCollapse: () => void;
  onNavigate: () => void;
}

export function Sidebar({ collapsed, isMobile, mobileOpen, canToggle, onToggleCollapse, onNavigate }: SidebarProps) {
  const { t, isRtl } = useI18n();
  const { profile, business } = useSettings();
  const localize = useLocalized();
  const { unreadCount } = useVisibleNotifications();
  const hidden = isMobile && !mobileOpen;

  // The panel icon points toward the edge the sidebar sits on, which flips in RTL.
  const CollapseIcon = isRtl
    ? collapsed
      ? PanelRightOpen
      : PanelRightClose
    : collapsed
      ? PanelLeftOpen
      : PanelLeftClose;

  const linkClass = ({ isActive }: { isActive: boolean }) => cx('nav-link', isActive && 'is-active');

  return (
    <aside
      id="app-sidebar"
      className={cx('sidebar', collapsed && 'is-collapsed', mobileOpen && 'is-open')}
      aria-label={t('nav.primary')}
      inert={hidden}
    >
      <div className="sidebar__head">
        <Link to="/" className="sidebar__brand" onClick={onNavigate} aria-label={t('nav.dashboard')}>
          <Brand compact={collapsed} />
        </Link>
        {isMobile && (
          <IconButton
            label={t('nav.closeMenu')}
            icon={<X size={20} />}
            onClick={onNavigate}
            className="sidebar__close"
          />
        )}
      </div>

      <nav className="sidebar__nav" aria-label={t('nav.primary')}>
        {NAV_GROUPS.map((group) => (
          <div className="nav-group" key={group.label}>
            <p className="nav-group__label">{t(group.label)}</p>
            <ul>
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={linkClass}
                    onClick={onNavigate}
                    title={collapsed ? t(item.label) : undefined}
                  >
                    <item.icon size={20} aria-hidden="true" />
                    <span className="nav-link__label">{t(item.label)}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="sidebar__foot">
        <ul>
          <li>
            <NavLink to="/notifications" className={linkClass} onClick={onNavigate} title={collapsed ? t('nav.notifications') : undefined}>
              <Bell size={20} aria-hidden="true" />
              <span className="nav-link__label">{t('nav.notifications')}</span>
              {unreadCount > 0 && <span className="nav-link__count">{unreadCount}</span>}
            </NavLink>
          </li>
          <li>
            <NavLink to="/settings" className={linkClass} onClick={onNavigate} title={collapsed ? t('nav.settings') : undefined}>
              <Settings size={20} aria-hidden="true" />
              <span className="nav-link__label">{t('nav.settings')}</span>
            </NavLink>
          </li>
        </ul>

        <Link
          to="/profile"
          className="sidebar__profile"
          onClick={onNavigate}
          title={collapsed ? localize(profile.name) : undefined}
          aria-label={`${t('common.openProfile')}: ${localize(profile.name)}`}
        >
          <Avatar name={localize(profile.name)} size="md" />
          <span className="sidebar__profile-text">
            <span className="sidebar__profile-name">{localize(profile.name)}</span>
            <span className="sidebar__profile-role">{localize(business.name)}</span>
          </span>
        </Link>

        {canToggle && (
          <button
            type="button"
            className="sidebar__toggle"
            onClick={onToggleCollapse}
            aria-pressed={collapsed}
            title={collapsed ? t('nav.expand') : t('nav.collapse')}
            aria-label={collapsed ? t('nav.expand') : t('nav.collapse')}
          >
            <CollapseIcon size={18} aria-hidden="true" />
            <span className="nav-link__label">{collapsed ? t('nav.expand') : t('nav.collapse')}</span>
          </button>
        )}
      </div>
    </aside>
  );
}
