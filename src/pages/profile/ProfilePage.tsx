import { useMemo, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import {
  Activity,
  CalendarCheck,
  CheckCircle2,
  ClipboardList,
  Mail,
  MapPin,
  Phone,
  Save,
  Settings as SettingsIcon,
} from 'lucide-react';
import { Select, SelectField, TextField } from '../../components/forms/Fields';
import { Badge } from '../../components/ui/Badge';
import { Avatar } from '../../components/ui/Avatar';
import { Button, LinkButton } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { TabPanel, Tabs } from '../../components/ui/Tabs';
import { useData } from '../../context/DataContext';
import { useI18n } from '../../context/I18nContext';
import { useSettings } from '../../context/SettingsContext';
import { useTheme } from '../../context/ThemeContext';
import { useToast } from '../../context/ToastContext';
import { createProfileActivity, PROFILE_STATS } from '../../data/profileActivity';
import { LANGUAGE_META } from '../../i18n';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useFormat } from '../../hooks/useFormat';
import { useLocalized } from '../../hooks/useLocalized';
import type { Lang, ThemeMode } from '../../types';
import { isEmail, isSaudiMobile } from '../../utils/validation';

type TabId = 'overview' | 'personal' | 'activity' | 'preferences';

interface Values {
  nameAr: string;
  nameEn: string;
  email: string;
  phone: string;
}

type Errors = Partial<Record<keyof Values, string>>;

export default function ProfilePage() {
  const { t, lang, setLang } = useI18n();
  useDocumentTitle(t('profile.title'));
  const localize = useLocalized();
  const format = useFormat();
  const toast = useToast();
  const { orders } = useData();
  const { mode, setMode } = useTheme();
  const { profile, business, updateProfile } = useSettings();

  const [tab, setTab] = useState<TabId>('overview');
  const [values, setValues] = useState<Values>(() => ({
    nameAr: profile.name.ar,
    nameEn: profile.name.en,
    email: profile.email,
    phone: profile.phone,
  }));
  const [errors, setErrors] = useState<Errors>({});
  const activity = useMemo(() => createProfileActivity(), []);

  const set = (key: keyof Values, value: string) => {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const found: Errors = {};
    if (!values.nameAr.trim()) found.nameAr = t('validation.required');
    if (!values.nameEn.trim()) found.nameEn = t('validation.required');
    if (!values.email.trim()) found.email = t('validation.required');
    else if (!isEmail(values.email)) found.email = t('validation.email');
    if (!values.phone.trim()) found.phone = t('validation.required');
    else if (!isSaudiMobile(values.phone)) found.phone = t('validation.phone');
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    updateProfile({
      name: { ar: values.nameAr.trim(), en: values.nameEn.trim() },
      email: values.email.trim(),
      phone: values.phone.trim(),
    });
    toast.success(t('profile.saved'));
  };

  const displayName = localize(profile.name);

  return (
    <div className="page">
      <PageHeader title={t('profile.title')} subtitle={t('profile.subtitle')} />

      <Card flush className="hero">
        <div className="hero__banner" aria-hidden="true" />
        <div className="hero__body">
          <Avatar name={displayName} size="xl" className="hero__avatar" />
          <div className="hero__identity">
            <h2 className="hero__name">{displayName}</h2>
            <p className="muted hero__role">
              {localize(profile.role)} · {t('profile.department')}
            </p>
            <div className="row row--wrap">
              <Badge tone="success">{t('status.active')}</Badge>
              <Badge tone="brand" dot={false}>
                {localize(business.name)}
              </Badge>
            </div>
          </div>
          <ul className="hero__contact">
            <li>
              <Mail size={16} aria-hidden="true" />
              <span className="ltr">{profile.email}</span>
            </li>
            <li>
              <Phone size={16} aria-hidden="true" />
              <span className="ltr num">{profile.phone}</span>
            </li>
            <li>
              <MapPin size={16} aria-hidden="true" />
              {t(`countries.${business.country}`)}
            </li>
          </ul>
        </div>
      </Card>

      <div className="stat-tiles stat-tiles--icons">
        <StatTile icon={<CheckCircle2 size={20} />} value={format.number(PROFILE_STATS.tasksCompleted)} label={t('profile.stats.tasks')} tone="success" />
        <StatTile icon={<ClipboardList size={20} />} value={format.number(orders.length)} label={t('profile.stats.orders')} tone="brand" />
        <StatTile icon={<Activity size={20} />} value={format.number(PROFILE_STATS.actionsThisMonth)} label={t('profile.stats.activity')} tone="info" />
        <StatTile icon={<CalendarCheck size={20} />} value={format.number(PROFILE_STATS.daysActive)} label={t('profile.stats.days')} tone="warning" />
      </div>

      <div>
        <Tabs
          idPrefix="profile"
          label={t('profile.tabs.label')}
          value={tab}
          onChange={(value) => setTab(value as TabId)}
          items={[
            { id: 'overview', label: t('profile.tabs.overview') },
            { id: 'personal', label: t('profile.tabs.personal') },
            { id: 'activity', label: t('profile.tabs.activity') },
            { id: 'preferences', label: t('profile.tabs.preferences') },
          ]}
        />

        <TabPanel idPrefix="profile" id="overview" value={tab}>
          <div className="grid-2-1">
            <div className="stack">
              <Card>
                <CardHeader title={t('profile.about')} />
                <p className="prose">{t('profile.aboutText')}</p>
              </Card>
              <Card>
                <CardHeader title={t('profile.activityTitle')} />
                <ActivityTimeline entries={activity.slice(0, 4)} />
              </Card>
            </div>
            <Card>
              <CardHeader title={t('profile.contactTitle')} />
              <dl className="info-list info-list--stacked">
                <div className="info-list__item">
                  <dt>{t('profile.personal.email')}</dt>
                  <dd><span className="ltr">{profile.email}</span></dd>
                </div>
                <div className="info-list__item">
                  <dt>{t('profile.personal.phone')}</dt>
                  <dd><span className="ltr num">{profile.phone}</span></dd>
                </div>
                <div className="info-list__item">
                  <dt>{t('profile.personal.role')}</dt>
                  <dd>{localize(profile.role)}</dd>
                </div>
                <div className="info-list__item">
                  <dt>{t('settings.business.title')}</dt>
                  <dd>{localize(business.name)}</dd>
                </div>
              </dl>
            </Card>
          </div>
        </TabPanel>

        <TabPanel idPrefix="profile" id="personal" value={tab}>
          <Card>
            <CardHeader title={t('profile.personal.title')} />
            <form className="form-grid" onSubmit={submit} noValidate>
              <TextField
                label={t('profile.personal.nameAr')}
                value={values.nameAr}
                onChange={(e) => set('nameAr', e.target.value)}
                error={errors.nameAr}
                required
                lang="ar"
                autoComplete="off"
              />
              <TextField
                label={t('profile.personal.nameEn')}
                value={values.nameEn}
                onChange={(e) => set('nameEn', e.target.value)}
                error={errors.nameEn}
                required
                ltr
                lang="en"
                autoComplete="off"
              />
              <TextField
                label={t('profile.personal.email')}
                type="email"
                ltr
                value={values.email}
                onChange={(e) => set('email', e.target.value)}
                error={errors.email}
                required
                autoComplete="off"
              />
              <TextField
                label={t('profile.personal.phone')}
                type="tel"
                ltr
                value={values.phone}
                onChange={(e) => set('phone', e.target.value)}
                error={errors.phone}
                required
                autoComplete="off"
              />
              <div className="span-2">
                <Button type="submit" variant="primary" icon={<Save size={18} />}>
                  {t('common.save')}
                </Button>
              </div>
            </form>
          </Card>
        </TabPanel>

        <TabPanel idPrefix="profile" id="activity" value={tab}>
          <Card>
            <CardHeader title={t('profile.activityTitle')} />
            <ActivityTimeline entries={activity} />
          </Card>
        </TabPanel>

        <TabPanel idPrefix="profile" id="preferences" value={tab}>
          <div className="grid-2">
            <Card>
              <CardHeader title={t('profile.preferences.title')} />
              <div className="stack">
                <div className="field">
                  <label className="field__label" htmlFor="profile-language">
                    {t('profile.preferences.language')}
                  </label>
                  <Select
                    id="profile-language"
                    value={lang}
                    onChange={(event) => setLang(event.target.value as Lang)}
                    options={(Object.keys(LANGUAGE_META) as Lang[]).map((value) => ({
                      value,
                      label: LANGUAGE_META[value].label,
                    }))}
                  />
                </div>
                <SelectField
                  label={t('profile.preferences.theme')}
                  value={mode}
                  onChange={(event) => setMode(event.target.value as ThemeMode)}
                  options={[
                    { value: 'light', label: t('settings.appearance.light') },
                    { value: 'dark', label: t('settings.appearance.dark') },
                    { value: 'system', label: t('settings.appearance.system') },
                  ]}
                />
              </div>
            </Card>
            <Card className="prefs-link">
              <span className="prefs-link__icon" aria-hidden="true">
                <SettingsIcon size={22} />
              </span>
              <p className="prose">{t('profile.preferences.manage')}</p>
              <LinkButton to="/settings" variant="secondary">
                {t('profile.preferences.openSettings')}
              </LinkButton>
            </Card>
          </div>
        </TabPanel>
      </div>
    </div>
  );
}

interface StatTileProps {
  icon: ReactNode;
  value: string;
  label: string;
  tone: 'success' | 'brand' | 'info' | 'warning';
}

function StatTile({ icon, value, label, tone }: StatTileProps) {
  return (
    <div className="stat-tile stat-tile--icon">
      <span className={`kpi__icon kpi__icon--${tone}`} aria-hidden="true">
        {icon}
      </span>
      <div>
        <p className="stat-tile__value num">{value}</p>
        <p className="stat-tile__label">{label}</p>
      </div>
    </div>
  );
}

function ActivityTimeline({ entries }: { entries: ReturnType<typeof createProfileActivity> }) {
  const localize = useLocalized();
  const format = useFormat();
  return (
    <ol className="timeline">
      {entries.map((entry) => (
        <li className="timeline__item" key={entry.id}>
          <span className="timeline__dot" aria-hidden="true" />
          <div>
            <p>{localize(entry.text)}</p>
            <p className="muted timeline__time">{format.relative(entry.at)}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
