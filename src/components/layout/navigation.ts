import {
  BarChart3,
  CalendarDays,
  LayoutDashboard,
  Package,
  ShoppingBag,
  Users,
  UserSquare2,
  WalletCards,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { TranslationKey } from '../../i18n';

export interface NavItem {
  to: string;
  label: TranslationKey;
  icon: LucideIcon;
  end?: boolean;
}

export interface NavGroup {
  label: TranslationKey;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'nav.groupOverview',
    items: [{ to: '/', label: 'nav.dashboard', icon: LayoutDashboard, end: true }],
  },
  {
    label: 'nav.groupBusiness',
    items: [
      { to: '/employees', label: 'nav.employees', icon: Users },
      { to: '/customers', label: 'nav.customers', icon: UserSquare2 },
      { to: '/orders', label: 'nav.orders', icon: ShoppingBag },
      { to: '/inventory', label: 'nav.inventory', icon: Package },
    ],
  },
  {
    label: 'nav.groupInsights',
    items: [
      { to: '/finance', label: 'nav.finance', icon: WalletCards },
      { to: '/reports', label: 'nav.reports', icon: BarChart3 },
      { to: '/calendar', label: 'nav.calendar', icon: CalendarDays },
    ],
  },
];
