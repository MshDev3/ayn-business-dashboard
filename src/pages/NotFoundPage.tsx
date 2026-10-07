import { Brand } from '../components/ui/Brand';
import { LinkButton } from '../components/ui/Button';
import { ArrowStart } from '../components/ui/DirIcon';
import { LanguageToggle, ThemeToggle } from '../components/layout/TopbarControls';
import { useI18n } from '../context/I18nContext';
import { useDocumentTitle } from '../hooks/useDocumentTitle';

/** Full-page, branded 404 that works for signed-in and signed-out visitors alike. */
export default function NotFoundPage() {
  const { t } = useI18n();
  useDocumentTitle('404');

  return (
    <div className="not-found">
      <header className="not-found__top">
        <Brand />
        <div className="auth__tools">
          <LanguageToggle />
          <ThemeToggle />
        </div>
      </header>
      <main className="not-found__main" id="main">
        <p className="not-found__code" aria-hidden="true">
          404
        </p>
        <h1 className="not-found__title">{t('notFound.title')}</h1>
        <p className="muted not-found__text">{t('notFound.text')}</p>
        <LinkButton to="/" variant="primary" size="lg" icon={<ArrowStart size={18} />}>
          {t('notFound.back')}
        </LinkButton>
      </main>
    </div>
  );
}
