import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router';
import { useI18n } from '../../context/I18nContext';
import { useSettings } from '../../context/SettingsContext';
import { useEscapeKey } from '../../hooks/useEscapeKey';
import { useMediaQuery } from '../../hooks/useMediaQuery';
import { cx } from '../../utils/classNames';
import { ErrorBoundary } from '../feedback/ErrorBoundary';
import { PageSkeleton } from '../feedback/Skeleton';
import { PortfolioNote } from './PortfolioNote';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';

export function AppShell() {
  const { t } = useI18n();
  const { preferences, updatePreferences } = useSettings();
  const location = useLocation();
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(max-width: 1099px)');
  const [menuRequested, setMenuRequested] = useState(false);

  // The drawer can only be open on mobile, so resizing to desktop closes it without extra state juggling.
  const drawerOpen = isMobile && menuRequested;
  // Tablets always get the icon rail; on desktop it follows the user's preference.
  const collapsed = !isMobile && (isTablet || preferences.sidebarCollapsed);

  useEscapeKey(drawerOpen, () => setMenuRequested(false));

  useEffect(() => {
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  return (
    <div className={cx('shell', collapsed && 'shell--collapsed')}>
      <a href="#main" className="skip-link">
        {t('app.skipToContent')}
      </a>

      <Sidebar
        collapsed={collapsed}
        isMobile={isMobile}
        mobileOpen={drawerOpen}
        canToggle={!isMobile && !isTablet}
        onToggleCollapse={() => updatePreferences({ sidebarCollapsed: !preferences.sidebarCollapsed })}
        onNavigate={() => setMenuRequested(false)}
      />
      {drawerOpen && <div className="sidebar-backdrop" onClick={() => setMenuRequested(false)} aria-hidden="true" />}

      <div className="shell__main">
        <Topbar showMenuButton={isMobile} menuOpen={drawerOpen} onOpenMenu={() => setMenuRequested(true)} />
        <main id="main" className="content" tabIndex={-1}>
          <ErrorBoundary key={location.pathname}>
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
          </ErrorBoundary>
        </main>
        <PortfolioNote />
      </div>
    </div>
  );
}
