import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  Bell,
  Building2,
  Check,
  Database,
  Download,
  Languages,
  Monitor,
  Moon,
  Palette,
  RotateCcw,
  Save,
  SlidersHorizontal,
  Sun,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { SelectField, SwitchField, TextField } from '../../components/forms/Fields';
import { Button } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { PageHeader } from '../../components/ui/PageHeader';
import { COUNTRIES, CURRENCIES, NOTIFICATION_TYPES, ROWS_PER_PAGE_OPTIONS } from '../../constants';
import { useData } from '../../context/DataContext';
import { useI18n } from '../../context/I18nContext';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { LANGUAGE_META } from '../../i18n';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useLocalized } from '../../hooks/useLocalized';
import type { CountryCode, CurrencyCode, Lang, ThemeMode } from '../../types';
import { cx } from '../../utils/classNames';
import { downloadFile } from '../../utils/csv';
import { setLocalized } from '../../utils/text';
import { isEmail, isPhone } from '../../utils/validation';

type TabId = 'general' | 'appearance' | 'language' | 'notifications' | 'business' | 'data';

const THEME_OPTIONS: Array<{ value: ThemeMode; icon: typeof Sun }> = [
  { value: 'light', icon: Sun },
  { value: 'dark', icon: Moon },
  { value: 'system', icon: Monitor },
];

const SECTIONS: Array<{ id: TabId; icon: LucideIcon }> = [
  { id: 'general', icon: SlidersHorizontal },
  { id: 'appearance', icon: Palette },
  { id: 'language', icon: Languages },
  { id: 'notifications', icon: Bell },
  { id: 'business', icon: Building2 },
  { id: 'data', icon: Database },
];

export default function SettingsPage() {
  const { t } = useI18n();
  useDocumentTitle(t('settings.title'));
  const [section, setSection] = useState<TabId>('general');

  return (
    <div className="page">
      <PageHeader title={t('settings.title')} subtitle={t('settings.subtitle')} />

      <div className="settings-layout">
        <nav className="settings-nav" aria-label={t('settings.tabs.label')}>
          {SECTIONS.map(({ id, icon: Icon }) => (
            <button
              key={id}
              type="button"
              className={cx('settings-nav__item', section === id && 'is-active')}
              aria-current={section === id ? 'page' : undefined}
              onClick={() => setSection(id)}
            >
              <span className="settings-nav__icon" aria-hidden="true">
                <Icon size={18} />
              </span>
              <span className="settings-nav__text">
                <span className="settings-nav__label">{t(`settings.tabs.${id}`)}</span>
                <span className="settings-nav__desc">{t(`settings.descriptions.${id}`)}</span>
              </span>
            </button>
          ))}
        </nav>

        <div className="settings-panel" key={section}>
          {section === 'general' && <GeneralSettings />}
          {section === 'appearance' && <AppearanceSettings />}
          {section === 'language' && <LanguageSettings />}
          {section === 'notifications' && <NotificationSettings />}
          {section === 'business' && <BusinessSettings />}
          {section === 'data' && <DataSettings />}
        </div>
      </div>
    </div>
  );
}

function SettingsCard({ title, text, children }: { title: string; text: string; children: ReactNode }) {
  return (
    <Card className="settings-card">
      <CardHeader title={title} subtitle={text} />
      {children}
    </Card>
  );
}

function GeneralSettings() {
  const { t } = useI18n();
  const toast = useToast();
  const { preferences, updatePreferences } = useSettings();

  return (
    <div className="grid-2">
      <SettingsCard title={t('settings.general.tablesTitle')} text={t('settings.general.rowsPerPageHint')}>
        <SelectField
          label={t('settings.general.rowsPerPage')}
          value={String(preferences.rowsPerPage)}
          onChange={(event) => {
            updatePreferences({ rowsPerPage: Number(event.target.value) });
            toast.success(t('settings.general.saved'));
          }}
          options={ROWS_PER_PAGE_OPTIONS.map((value) => ({ value: String(value), label: String(value) }))}
        />
      </SettingsCard>
      <SettingsCard title={t('settings.general.navigationTitle')} text={t('settings.general.sidebarCollapsedHint')}>
        <SwitchField
          label={t('settings.general.sidebarCollapsed')}
          checked={preferences.sidebarCollapsed}
          onChange={(checked) => {
            updatePreferences({ sidebarCollapsed: checked });
            toast.success(t('settings.general.saved'));
          }}
        />
      </SettingsCard>
    </div>
  );
}

function AppearanceSettings() {
  const { t } = useI18n();
  const { mode, setMode } = useTheme();
  return (
    <SettingsCard title={t('settings.appearance.title')} text={t('settings.appearance.text')}>
      <div className="choice-grid" role="group" aria-label={t('settings.appearance.title')}>
        {THEME_OPTIONS.map(({ value, icon: Icon }) => (
          <button
            key={value}
            type="button"
            className={cx('choice', mode === value && 'is-active')}
            aria-pressed={mode === value}
            onClick={() => setMode(value)}
          >
            <span className={`choice__preview choice__preview--${value}`} aria-hidden="true">
              <span />
              <span />
            </span>
            <span className="choice__label">
              <Icon size={16} aria-hidden="true" />
              {t(`settings.appearance.${value}`)}
              {mode === value && <Check size={16} aria-hidden="true" className="choice__check" />}
            </span>
          </button>
        ))}
      </div>
    </SettingsCard>
  );
}

function LanguageSettings() {
  const { t, lang, setLang } = useI18n();
  const options: Array<{ value: Lang; hint: string }> = [
    { value: 'ar', hint: t('settings.language.arabicHint') },
    { value: 'en', hint: t('settings.language.englishHint') },
  ];
  return (
    <SettingsCard title={t('settings.language.title')} text={t('settings.language.text')}>
      <div className="choice-grid choice-grid--two" role="group" aria-label={t('settings.language.title')}>
        {options.map(({ value, hint }) => (
          <button
            key={value}
            type="button"
            className={cx('choice', 'choice--language', lang === value && 'is-active')}
            aria-pressed={lang === value}
            onClick={() => setLang(value)}
            lang={value}
          >
            <span className="choice__native">{LANGUAGE_META[value].label}</span>
            <span className="choice__hint">{hint}</span>
            {lang === value && <Check size={18} aria-hidden="true" className="choice__check" />}
          </button>
        ))}
      </div>
    </SettingsCard>
  );
}

function NotificationSettings() {
  const { t } = useI18n();
  const { notificationPrefs, updateNotificationPrefs } = useSettings();
  return (
    <SettingsCard title={t('settings.notifications.title')} text={t('settings.notifications.text')}>
      <div>
        {NOTIFICATION_TYPES.map((type) => (
          <SwitchField
            key={type}
            label={t(`notificationTypes.${type}`)}
            hint={t('settings.notifications.hint')}
            checked={notificationPrefs[type]}
            onChange={(checked) => updateNotificationPrefs({ [type]: checked })}
          />
        ))}
      </div>
    </SettingsCard>
  );
}

function BusinessSettings() {
  const { t, lang } = useI18n();
  const localize = useLocalized();
  const toast = useToast();
  const { business, updateBusiness } = useSettings();

  const [values, setValues] = useState({
    name: localize(business.name),
    email: business.email,
    phone: business.phone,
    currency: business.currency,
    country: business.country,
  });
  const [errors, setErrors] = useState<Partial<Record<'name' | 'email' | 'phone', string>>>({});

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found: typeof errors = {};
    if (!values.name.trim()) found.name = t('validation.required');
    if (!values.email.trim()) found.email = t('validation.required');
    else if (!isEmail(values.email)) found.email = t('validation.email');
    if (!values.phone.trim()) found.phone = t('validation.required');
    else if (!isPhone(values.phone)) found.phone = t('validation.phoneAny');
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    updateBusiness({
      name: setLocalized(business.name, lang, values.name),
      email: values.email.trim(),
      phone: values.phone.trim(),
      currency: values.currency,
      country: values.country,
    });
    toast.success(t('settings.business.saved'));
  };

  return (
    <SettingsCard title={t('settings.business.title')} text={t('settings.business.text')}>
      <form className="form-grid" onSubmit={submit} noValidate>
        <div className="span-2">
          <TextField
            label={t('settings.business.name')}
            value={values.name}
            onChange={(e) => {
              setValues({ ...values, name: e.target.value });
              setErrors({ ...errors, name: undefined });
            }}
            error={errors.name}
            required
            autoComplete="off"
          />
        </div>
        <TextField
          label={t('settings.business.email')}
          type="email"
          ltr
          value={values.email}
          onChange={(e) => {
            setValues({ ...values, email: e.target.value });
            setErrors({ ...errors, email: undefined });
          }}
          error={errors.email}
          required
          autoComplete="off"
        />
        <TextField
          label={t('settings.business.phone')}
          type="tel"
          ltr
          value={values.phone}
          onChange={(e) => {
            setValues({ ...values, phone: e.target.value });
            setErrors({ ...errors, phone: undefined });
          }}
          error={errors.phone}
          required
          autoComplete="off"
        />
        <SelectField
          label={t('settings.business.currency')}
          hint={t('settings.business.currencyHint')}
          value={values.currency}
          onChange={(e) => setValues({ ...values, currency: e.target.value as CurrencyCode })}
          options={CURRENCIES.map((value) => ({ value, label: t(`currencies.${value}`) }))}
        />
        <SelectField
          label={t('settings.business.country')}
          value={values.country}
          onChange={(e) => setValues({ ...values, country: e.target.value as CountryCode })}
          options={COUNTRIES.map((value) => ({ value, label: t(`countries.${value}`) }))}
        />
        <div className="span-2">
          <Button type="submit" variant="primary" icon={<Save size={18} />}>
            {t('common.save')}
          </Button>
        </div>
      </form>
    </SettingsCard>
  );
}

function DataSettings() {
  const { t } = useI18n();
  const toast = useToast();
  const data = useData();
  const [confirming, setConfirming] = useState(false);

  const exportJson = () => {
    const { employees, customers, products, orders, transactions, events, notifications } = data;
    downloadFile(
      'ayn-demo-data.json',
      JSON.stringify({ employees, customers, products, orders, transactions, events, notifications }, null, 2),
      'application/json',
    );
    toast.success(t('settings.data.exported'));
  };

  return (
    <SettingsCard title={t('settings.data.title')} text={t('settings.data.text')}>
      <div className="data-grid">
        <div className="data-action">
          <div>
            <h3 className="data-action__title">{t('settings.data.exportTitle')}</h3>
            <p className="muted">{t('settings.data.exportText')}</p>
          </div>
          <Button variant="secondary" icon={<Download size={18} />} onClick={exportJson}>
            {t('settings.data.export')}
          </Button>
        </div>
        <div className="data-action">
          <div>
            <h3 className="data-action__title">{t('settings.data.resetTitle')}</h3>
            <p className="muted">{t('settings.data.resetText')}</p>
          </div>
          <Button variant="secondary" icon={<RotateCcw size={18} />} onClick={() => setConfirming(true)}>
            {t('settings.data.reset')}
          </Button>
        </div>
      </div>
      <ConfirmDialog
        open={confirming}
        title={t('settings.data.resetConfirmTitle')}
        message={t('settings.data.resetConfirmMessage')}
        confirmLabel={t('settings.data.reset')}
        onCancel={() => setConfirming(false)}
        onConfirm={() => {
          data.resetData();
          setConfirming(false);
          toast.success(t('settings.data.resetDone'));
        }}
      />
    </SettingsCard>
  );
}
