import { Info, Package, ShoppingBag, UserCheck, WalletCards } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { NotificationType } from '../../types';

const ICONS: Record<NotificationType, LucideIcon> = {
  order: ShoppingBag,
  inventory: Package,
  employee: UserCheck,
  finance: WalletCards,
  system: Info,
};

export function NotificationIcon({ type }: { type: NotificationType }) {
  const Icon = ICONS[type];
  return (
    <span className={`notif-icon notif-icon--${type}`} aria-hidden="true">
      <Icon size={16} />
    </span>
  );
}
