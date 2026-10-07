import { useId, useState } from 'react';
import type { FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { AlertCircle, Check, Eye, EyeOff, Lock, LogIn, Mail, TrendingUp } from 'lucide-react';
import { CheckboxField, TextField } from '../../components/forms/Fields';
import { LanguageToggle, ThemeToggle } from '../../components/layout/TopbarControls';
import { Brand } from '../../components/ui/Brand';
import { Button, IconButton } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { DEMO_ACCOUNT } from '../../constants';
import { InvalidCredentialsError, useAuth } from '../../context/AuthContext';
import { useI18n } from '../../context/I18nContext';
import { useSettings } from '../../context/SettingsContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useFormat } from '../../hooks/useFormat';
import { useLocalized } from '../../hooks/useLocalized';
import { isEmail } from '../../utils/validation';

interface LocationState {
  from?: string;
}

export default function LoginPage() {
  const { t } = useI18n();
  useDocumentTitle(t('login.submit'));
  const { isAuthenticated, login } = useAuth();
  const { profile } = useSettings();
  const localize = useLocalized();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const destination = (location.state as LocationState | null)?.from ?? '/';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{ email?: string; password?: string }>({});
  const [failure, setFailure] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [forgotOpen, setForgotOpen] = useState(false);

  if (isAuthenticated && !submitting) {
    return <Navigate to={destination} replace />;
  }

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const found: typeof errors = {};
    if (!email.trim()) found.email = t('validation.required');
    else if (!isEmail(email)) found.email = t('validation.email');
    if (!password) found.password = t('validation.required');
    else if (password.length < 8) found.password = t('validation.minLength', { min: 8 });
    setErrors(found);
    setFailure(null);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    try {
      await login(email, password, remember);
      toast.success(t('login.welcome', { name: localize(profile.name) }));
      navigate(destination, { replace: true });
    } catch (error) {
      setSubmitting(false);
      setFailure(error instanceof InvalidCredentialsError ? t('login.invalidCredentials') : t('states.errorText'));
    }
  };

  const fillDemo = () => {
    setEmail(DEMO_ACCOUNT.email);
    setPassword(DEMO_ACCOUNT.password);
    setErrors({});
    setFailure(null);
  };

  return (
    <div className="auth">
      <main className="auth__panel" id="main">
        <div className="auth__top">
          <Brand />
          <div className="auth__tools">
            <LanguageToggle />
            <ThemeToggle />
          </div>
        </div>

        <div className="auth__card">
          <h1 className="auth__title">{t('login.title')}</h1>
          <p className="muted auth__subtitle">{t('login.subtitle')}</p>

          {failure && (
            <div className="alert alert--danger" role="alert">
              <AlertCircle size={18} aria-hidden="true" />
              <span>{failure}</span>
            </div>
          )}

          <form className="stack" onSubmit={submit} noValidate>
            <TextField
              label={t('login.email')}
              type="email"
              ltr
              autoComplete="username"
              placeholder={t('login.emailPlaceholder')}
              startIcon={<Mail />}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setErrors((current) => ({ ...current, email: undefined }));
              }}
              error={errors.email}
              required
            />
            <PasswordField
              value={password}
              onChange={(value) => {
                setPassword(value);
                setErrors((current) => ({ ...current, password: undefined }));
              }}
              error={errors.password}
              visible={showPassword}
              onToggleVisible={() => setShowPassword((current) => !current)}
            />
            <div className="row row--between row--wrap">
              <CheckboxField label={t('login.remember')} checked={remember} onChange={(e) => setRemember(e.target.checked)} />
              <button type="button" className="link-button" onClick={() => setForgotOpen(true)}>
                {t('login.forgot')}
              </button>
            </div>
            <Button type="submit" variant="primary" size="lg" fullWidth loading={submitting} icon={<LogIn size={18} />}>
              {submitting ? t('login.submitting') : t('login.submit')}
            </Button>
          </form>

          <div className="demo-box">
            <div>
              <p className="demo-box__title">{t('login.demoTitle')}</p>
              <p className="muted demo-box__text">{t('login.demoText')}</p>
              <dl className="demo-box__creds">
                <div>
                  <dt>{t('login.email')}</dt>
                  <dd><span className="ltr">{DEMO_ACCOUNT.email}</span></dd>
                </div>
                <div>
                  <dt>{t('login.password')}</dt>
                  <dd><span className="ltr">{DEMO_ACCOUNT.password}</span></dd>
                </div>
              </dl>
            </div>
            <Button variant="secondary" size="sm" onClick={fillDemo}>
              {t('login.useDemo')}
            </Button>
          </div>
        </div>

        <p className="auth__note">{t('app.disclosure')}</p>
      </main>

      <AuthHero />

      <ForgotPasswordModal open={forgotOpen} onClose={() => setForgotOpen(false)} />
    </div>
  );
}

interface PasswordFieldProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
  visible: boolean;
  onToggleVisible: () => void;
}

function PasswordField({ value, onChange, error, visible, onToggleVisible }: PasswordFieldProps) {
  const { t } = useI18n();
  return (
    <TextField
      label={t('login.password')}
      type={visible ? 'text' : 'password'}
      ltr
      autoComplete="current-password"
      placeholder={t('login.passwordPlaceholder')}
      startIcon={<Lock />}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      error={error}
      required
      endSlot={
        <IconButton
          size="sm"
          label={visible ? t('login.hidePassword') : t('login.showPassword')}
          icon={visible ? <EyeOff size={18} /> : <Eye size={18} />}
          onClick={onToggleVisible}
          aria-pressed={visible}
        />
      }
    />
  );
}

function AuthHero() {
  const { t } = useI18n();
  const format = useFormat();
  return (
    <aside className="auth__hero" aria-label={t('app.tagline')}>
      <div className="auth__hero-inner">
        <Brand size="lg" className="auth__hero-brand" />
        <h2 className="auth__hero-title">{t('login.heroTitle')}</h2>
        <p className="auth__hero-text">{t('login.heroText')}</p>
        <ul className="auth__features">
          {(['login.feature1', 'login.feature2', 'login.feature3'] as const).map((key) => (
            <li key={key}>
              <span className="auth__feature-icon" aria-hidden="true">
                <Check size={14} />
              </span>
              {t(key)}
            </li>
          ))}
        </ul>

        <div className="auth__preview" aria-hidden="true">
          <div className="auth__preview-card">
            <span className="auth__preview-label">{t('dashboard.kpi.revenue')}</span>
            <strong className="auth__preview-value">{format.currency(128450)}</strong>
            <span className="auth__preview-delta">
              <TrendingUp size={14} /> +12.5%
            </span>
          </div>
          <div className="auth__preview-bars">
            {[38, 56, 44, 72, 60, 88, 76].map((height, index) => (
              <span key={index} style={{ blockSize: `${height}%` }} />
            ))}
          </div>
        </div>
      </div>
    </aside>
  );
}

function ForgotPasswordModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const toast = useToast();
  const formId = useId();
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | undefined>();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (!email.trim()) return setError(t('validation.required'));
    if (!isEmail(email)) return setError(t('validation.email'));
    toast.info(t('login.forgotSent'));
    setEmail('');
    setError(undefined);
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      size="sm"
      title={t('login.forgotTitle')}
      description={t('login.forgotText')}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button variant="primary" type="submit" form={formId}>
            {t('login.forgotSend')}
          </Button>
        </>
      }
    >
      <form id={formId} onSubmit={submit} noValidate>
        <TextField
          label={t('login.email')}
          type="email"
          ltr
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError(undefined);
          }}
          error={error}
          required
          autoComplete="email"
        />
      </form>
    </Modal>
  );
}
