import { useState } from 'react';
import { Menu, Search } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';
import { IconButton } from '../ui/Button';
import { SearchCommand } from './SearchCommand';
import { LanguageToggle, NotificationBell, ThemeToggle, UserMenu } from './TopbarControls';

interface TopbarProps {
  showMenuButton: boolean;
  menuOpen: boolean;
  onOpenMenu: () => void;
}

/** Three-zone topbar: menu button (mobile) · centred search · utility controls. */
export function Topbar({ showMenuButton, menuOpen, onOpenMenu }: TopbarProps) {
  const { t } = useI18n();
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

  return (
    <header className="topbar">
      <div className="topbar__start">
        {showMenuButton && (
          <IconButton
            variant="outline"
            label={t('nav.openMenu')}
            icon={<Menu size={20} />}
            onClick={onOpenMenu}
            aria-expanded={menuOpen}
            aria-controls="app-sidebar"
          />
        )}
      </div>

      <SearchCommand mobileOpen={mobileSearchOpen} onMobileClose={() => setMobileSearchOpen(false)} />

      <div className="topbar__actions">
        <IconButton
          variant="outline"
          label={t('topbar.searchLabel')}
          icon={<Search size={18} />}
          onClick={() => setMobileSearchOpen(true)}
          className="topbar__search-btn"
        />
        <LanguageToggle />
        <ThemeToggle />
        <NotificationBell />
        <UserMenu />
      </div>
    </header>
  );
}
