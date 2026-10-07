import { createContext, useCallback, useContext, useMemo } from 'react';
import type { ReactNode } from 'react';
import { STORAGE_KEYS } from '../constants';
import { DEFAULT_BUSINESS, DEFAULT_NOTIFICATION_PREFS, DEFAULT_PROFILE } from '../data';
import { usePersistentState } from '../hooks/usePersistentState';
import type { AppPreferences, BusinessInfo, NotificationPrefs, UserProfile } from '../types';

const DEFAULT_PREFERENCES: AppPreferences = {
  rowsPerPage: 8,
  sidebarCollapsed: false,
};

interface SettingsValue {
  profile: UserProfile;
  business: BusinessInfo;
  notificationPrefs: NotificationPrefs;
  preferences: AppPreferences;
  updateProfile: (patch: Partial<UserProfile>) => void;
  updateBusiness: (patch: Partial<BusinessInfo>) => void;
  updateNotificationPrefs: (patch: Partial<NotificationPrefs>) => void;
  updatePreferences: (patch: Partial<AppPreferences>) => void;
}

const SettingsContext = createContext<SettingsValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = usePersistentState<UserProfile>(STORAGE_KEYS.profile, DEFAULT_PROFILE);
  const [business, setBusiness] = usePersistentState<BusinessInfo>(STORAGE_KEYS.business, DEFAULT_BUSINESS);
  const [notificationPrefs, setNotificationPrefs] = usePersistentState<NotificationPrefs>(
    STORAGE_KEYS.notificationPrefs,
    DEFAULT_NOTIFICATION_PREFS,
  );
  const [preferences, setPreferences] = usePersistentState<AppPreferences>(
    STORAGE_KEYS.preferences,
    DEFAULT_PREFERENCES,
  );

  const updateProfile = useCallback(
    (patch: Partial<UserProfile>) => setProfile((current) => ({ ...current, ...patch })),
    [setProfile],
  );
  const updateBusiness = useCallback(
    (patch: Partial<BusinessInfo>) => setBusiness((current) => ({ ...current, ...patch })),
    [setBusiness],
  );
  const updateNotificationPrefs = useCallback(
    (patch: Partial<NotificationPrefs>) => setNotificationPrefs((current) => ({ ...current, ...patch })),
    [setNotificationPrefs],
  );
  const updatePreferences = useCallback(
    (patch: Partial<AppPreferences>) => setPreferences((current) => ({ ...current, ...patch })),
    [setPreferences],
  );

  const value = useMemo<SettingsValue>(
    () => ({
      profile,
      business,
      notificationPrefs,
      preferences,
      updateProfile,
      updateBusiness,
      updateNotificationPrefs,
      updatePreferences,
    }),
    [
      profile,
      business,
      notificationPrefs,
      preferences,
      updateProfile,
      updateBusiness,
      updateNotificationPrefs,
      updatePreferences,
    ],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings(): SettingsValue {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used inside <SettingsProvider>');
  return context;
}
