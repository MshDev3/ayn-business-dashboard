import { useMemo } from 'react';
import { useData } from '../context/DataContext';
import { useSettings } from '../context/SettingsContext';

/** Notifications filtered by the user's alert preferences, newest first, with an unread count. */
export function useVisibleNotifications() {
  const { notifications } = useData();
  const { notificationPrefs } = useSettings();

  return useMemo(() => {
    const visible = notifications
      .filter((notification) => notificationPrefs[notification.type])
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    return { visible, unreadCount: visible.filter((notification) => !notification.read).length };
  }, [notifications, notificationPrefs]);
}
