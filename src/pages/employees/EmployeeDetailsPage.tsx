import { useMemo, useState } from 'react';
import type { CSSProperties, ReactNode } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Calendar, Mail, Pencil, Phone, Trash2 } from 'lucide-react';
import { EntityNotFound } from '../../components/feedback/EntityNotFound';
import { Badge, StatusBadge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Avatar } from '../../components/ui/Avatar';
import { Card, CardHeader } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { Breadcrumbs, PageHeader } from '../../components/ui/PageHeader';
import { TabPanel, Tabs } from '../../components/ui/Tabs';
import { useData } from '../../context/DataContext';
import { useI18n } from '../../context/I18nContext';
import { getEmployeeExtras } from '../../data/employeeExtras';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useFormat } from '../../hooks/useFormat';
import { useLocalized } from '../../hooks/useLocalized';
import { parseDate } from '../../utils/dates';
import { EmployeeFormModal } from './EmployeeFormModal';
import { useEmployeeActions } from './useEmployeeActions';

type TabId = 'overview' | 'attendance' | 'tasks' | 'activity';

function InfoItem({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="info-list__item">
      <dt>{label}</dt>
      <dd>{children}</dd>
    </div>
  );
}

export default function EmployeeDetailsPage() {
  const { id } = useParams();
  const { t } = useI18n();
  const localize = useLocalized();
  const format = useFormat();
  const navigate = useNavigate();
  const { employees } = useData();
  const actions = useEmployeeActions();

  const employee = employees.find((e) => e.id === id);
  useDocumentTitle(employee ? localize(employee.name) : t('employeeDetails.pageTitle'));

  const [tab, setTab] = useState<TabId>('overview');
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const extras = useMemo(() => (employee ? getEmployeeExtras(employee) : null), [employee]);

  if (!employee || !extras) {
    return (
      <div className="page">
        <EntityNotFound
          title={t('employeeDetails.notFoundTitle')}
          text={t('employeeDetails.notFoundText')}
          backTo="/employees"
          backLabel={t('employeeDetails.backToList')}
        />
      </div>
    );
  }

  const name = localize(employee.name);
  const joined = parseDate(employee.joinedAt);
  const totalMonths = Math.max(
    0,
    (new Date().getFullYear() - joined.getFullYear()) * 12 + (new Date().getMonth() - joined.getMonth()),
  );
  const tenure = t('employeeDetails.info.tenureValue', {
    years: Math.floor(totalMonths / 12),
    months: totalMonths % 12,
  });

  const counts = extras.attendance.reduce<Record<string, number>>((acc, record) => {
    acc[record.status] = (acc[record.status] ?? 0) + 1;
    return acc;
  }, {});

  const worked = extras.attendance.filter((record) => record.status !== 'leave');
  const attendanceRate =
    worked.length === 0 ? 0 : (worked.filter((record) => record.status !== 'absent').length / worked.length) * 100;
  const tasksDone = extras.tasks.filter((task) => task.status === 'done').length;

  return (
    <div className="page">
      <PageHeader
        breadcrumbs={
          <Breadcrumbs
            label={t('common.breadcrumb')}
            items={[{ label: t('employees.title'), to: '/employees' }, { label: name }]}
          />
        }
        title={name}
        subtitle={`${localize(employee.title)} · ${t(`departments.${employee.department}`)}`}
        actions={
          <>
            <Button variant="secondary" icon={<Pencil size={18} />} onClick={() => setEditing(true)}>
              {t('common.edit')}
            </Button>
            <Button variant="secondary" icon={<Trash2 size={18} />} onClick={() => setDeleting(true)}>
              {t('common.delete')}
            </Button>
          </>
        }
      />

      <Card flush className="hero">
        <div className="hero__banner" style={{ '--hero-hue': employee.avatarHue } as CSSProperties} aria-hidden="true" />
        <div className="hero__body">
          <Avatar name={name} hue={employee.avatarHue} size="xl" className="hero__avatar" />
          <div className="hero__identity">
            <h2 className="hero__name">{name}</h2>
            <p className="muted hero__role">{localize(employee.title)}</p>
            <div className="row row--wrap">
              <StatusBadge status={employee.status} />
              <Badge tone="brand" dot={false}>
                {t(`departments.${employee.department}`)}
              </Badge>
              <span className="muted ltr num">{employee.id}</span>
            </div>
          </div>
          <ul className="hero__contact">
            <li>
              <Mail size={16} aria-hidden="true" />
              <a href={`mailto:${employee.email}`} className="ltr">
                {employee.email}
              </a>
            </li>
            <li>
              <Phone size={16} aria-hidden="true" />
              <a href={`tel:${employee.phone.replace(/\s/g, '')}`} className="ltr num">
                {employee.phone}
              </a>
            </li>
            <li>
              <Calendar size={16} aria-hidden="true" />
              {format.date(employee.joinedAt)}
            </li>
          </ul>
        </div>
      </Card>

      <div className="stat-tiles">
        <div className="stat-tile">
          <span className="stat-tile__value num">{format.percent(attendanceRate, 0)}</span>
          <span className="stat-tile__label">{t('employeeDetails.stats.attendanceRate')}</span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile__value num">{format.number(tasksDone)}</span>
          <span className="stat-tile__label">{t('employeeDetails.stats.tasksDone')}</span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile__value num">{format.number(extras.tasks.length - tasksDone)}</span>
          <span className="stat-tile__label">{t('employeeDetails.stats.tasksOpen')}</span>
        </div>
        <div className="stat-tile">
          <span className="stat-tile__value">{tenure}</span>
          <span className="stat-tile__label">{t('employeeDetails.stats.tenure')}</span>
        </div>
      </div>

      <div>
        <Tabs
          idPrefix="employee"
          label={t('employeeDetails.tabs.label')}
          value={tab}
          onChange={(value) => setTab(value as TabId)}
          items={[
            { id: 'overview', label: t('employeeDetails.tabs.overview') },
            { id: 'attendance', label: t('employeeDetails.tabs.attendance') },
            { id: 'tasks', label: t('employeeDetails.tabs.tasks'), count: extras.tasks.length },
            { id: 'activity', label: t('employeeDetails.tabs.activity') },
          ]}
        />

        <TabPanel idPrefix="employee" id="overview" value={tab}>
          <div className="grid-2">
            <Card>
              <CardHeader title={t('employeeDetails.info.contact')} />
              <dl className="info-list">
                <InfoItem label={t('employeeDetails.info.email')}>
                  <span className="ltr">{employee.email}</span>
                </InfoItem>
                <InfoItem label={t('employeeDetails.info.phone')}>
                  <span className="ltr num">{employee.phone}</span>
                </InfoItem>
              </dl>
            </Card>
            <Card>
              <CardHeader title={t('employeeDetails.info.employment')} />
              <dl className="info-list">
                <InfoItem label={t('employeeDetails.info.id')}>
                  <span className="ltr num">{employee.id}</span>
                </InfoItem>
                <InfoItem label={t('employeeDetails.info.department')}>{t(`departments.${employee.department}`)}</InfoItem>
                <InfoItem label={t('employeeDetails.info.jobTitle')}>{localize(employee.title)}</InfoItem>
                <InfoItem label={t('employeeDetails.info.status')}>
                  <StatusBadge status={employee.status} />
                </InfoItem>
                <InfoItem label={t('employeeDetails.info.joined')}>{format.date(employee.joinedAt, 'long')}</InfoItem>
                <InfoItem label={t('employeeDetails.info.tenure')}>{tenure}</InfoItem>
              </dl>
            </Card>
          </div>
        </TabPanel>

        <TabPanel idPrefix="employee" id="attendance" value={tab}>
          <div className="stack">
            <div className="stat-tiles">
              {(['present', 'late', 'absent', 'leave'] as const).map((key) => (
                <div className="stat-tile" key={key}>
                  <span className="stat-tile__value num">{format.number(counts[key] ?? 0)}</span>
                  <span className="stat-tile__label">{t(`employeeDetails.attendance.${key}`)}</span>
                </div>
              ))}
            </div>
            <Card flush>
              <CardHeader title={t('employeeDetails.attendance.title')} />
              <ul className="list">
                {extras.attendance.map((record) => (
                  <li className="list__item" key={record.date}>
                    <span className="list__main">{format.date(record.date, 'long')}</span>
                    {record.checkIn && (
                      <span className="muted num list__meta">
                        {t('employeeDetails.attendance.checkIn')} {record.checkIn} · {t('employeeDetails.attendance.checkOut')}{' '}
                        {record.checkOut}
                      </span>
                    )}
                    <StatusBadge status={record.status} />
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </TabPanel>

        <TabPanel idPrefix="employee" id="tasks" value={tab}>
          <Card flush>
            <CardHeader title={t('employeeDetails.tasks.title')} />
            <ul className="list">
              {extras.tasks.map((task) => (
                <li className="list__item" key={task.id}>
                  <div className="list__stack">
                    <span className="list__main">{localize(task.title)}</span>
                    <span className="muted list__meta">
                      {t('employeeDetails.tasks.due', { date: format.date(task.dueDate) })}
                    </span>
                  </div>
                  <StatusBadge status={task.status} />
                </li>
              ))}
            </ul>
          </Card>
        </TabPanel>

        <TabPanel idPrefix="employee" id="activity" value={tab}>
          <Card>
            <CardHeader title={t('employeeDetails.activity.title')} />
            <ol className="timeline">
              {extras.activity.map((entry) => (
                <li className="timeline__item" key={entry.id}>
                  <span className="timeline__dot" aria-hidden="true" />
                  <div>
                    <p>{localize(entry.text)}</p>
                    <p className="muted timeline__time">{format.relative(entry.at)}</p>
                  </div>
                </li>
              ))}
            </ol>
          </Card>
        </TabPanel>
      </div>

      <EmployeeFormModal
        open={editing}
        employee={employee}
        onClose={() => setEditing(false)}
        onSubmit={(values) => {
          actions.update(employee, values);
          setEditing(false);
        }}
      />
      <ConfirmDialog
        open={deleting}
        title={t('employees.delete.title')}
        message={t('employees.delete.message', { name })}
        confirmLabel={t('common.delete')}
        onCancel={() => setDeleting(false)}
        onConfirm={() => {
          actions.remove(employee);
          setDeleting(false);
          navigate('/employees', { replace: true });
        }}
      />
    </div>
  );
}
