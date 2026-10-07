import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router';
import { CalendarPlus, Pencil, Trash2 } from 'lucide-react';
import { Badge } from '../../components/ui/Badge';
import { Button, IconButton } from '../../components/ui/Button';
import { Card, CardHeader } from '../../components/ui/Card';
import { ConfirmDialog } from '../../components/ui/ConfirmDialog';
import { ChevronEnd, ChevronStart } from '../../components/ui/DirIcon';
import { PageHeader } from '../../components/ui/PageHeader';
import { useData } from '../../context/DataContext';
import { useI18n } from '../../context/I18nContext';
import { useToast } from '../../context/ToastContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { useFormat } from '../../hooks/useFormat';
import { useLocalized } from '../../hooks/useLocalized';
import type { CalendarEvent, EventCategory } from '../../types';
import { addDays, isSameDay, parseDate, toDateKey } from '../../utils/dates';
import { cx } from '../../utils/classNames';
import { weekdayName } from '../../utils/format';
import { makeLocalized, setLocalized } from '../../utils/text';
import { EventFormModal } from './EventFormModal';
import type { EventFormValues } from './EventFormModal';

const CATEGORY_TONE: Record<EventCategory, 'brand' | 'info' | 'success' | 'warning'> = {
  meeting: 'brand',
  task: 'info',
  event: 'success',
  reminder: 'warning',
};

const MAX_CHIPS = 3;

function monthGrid(cursor: Date): Date[] {
  const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
  const gridStart = addDays(first, -first.getDay());
  const daysInMonth = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
  const weeks = Math.ceil((first.getDay() + daysInMonth) / 7);
  return Array.from({ length: weeks * 7 }, (_, index) => addDays(gridStart, index));
}

export default function CalendarPage() {
  const { t, lang } = useI18n();
  useDocumentTitle(t('calendar.title'));
  const format = useFormat();
  const localize = useLocalized();
  const toast = useToast();
  const { events, addEvent, updateEvent, deleteEvent } = useData();

  const today = useMemo(() => new Date(), []);
  const [cursor, setCursor] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selected, setSelected] = useState(() => toDateKey(today));
  const [editing, setEditing] = useState<CalendarEvent | null>(null);
  const [deleting, setDeleting] = useState<CalendarEvent | null>(null);

  const [params, setParams] = useSearchParams();
  const addOpen = params.get('new') === '1';
  const openAdd = () => setParams({ new: '1' });
  const closeAdd = () => setParams({}, { replace: true });

  const days = useMemo(() => monthGrid(cursor), [cursor]);

  const eventsByDate = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    for (const event of events) {
      const list = map.get(event.date) ?? [];
      list.push(event);
      map.set(event.date, list);
    }
    for (const list of map.values()) list.sort((a, b) => a.time.localeCompare(b.time));
    return map;
  }, [events]);

  const monthEventCount = useMemo(() => {
    const prefix = `${cursor.getFullYear()}-${String(cursor.getMonth() + 1).padStart(2, '0')}`;
    return events.filter((event) => event.date.startsWith(prefix)).length;
  }, [events, cursor]);

  const selectedEvents = eventsByDate.get(selected) ?? [];
  const todayKey = toDateKey(today);
  const upcoming = useMemo(
    () =>
      events
        .filter((e) => `${e.date}T${e.time}` >= `${todayKey}T00:00`)
        .sort((a, b) => `${a.date}T${a.time}`.localeCompare(`${b.date}T${b.time}`))
        .slice(0, 5),
    [events, todayKey],
  );

  const goToMonth = (offset: number) =>
    setCursor((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));

  const goToToday = () => {
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1));
    setSelected(todayKey);
  };

  const showDate = (dateKey: string) => {
    const date = parseDate(dateKey);
    setCursor(new Date(date.getFullYear(), date.getMonth(), 1));
    setSelected(dateKey);
  };

  const create = (values: EventFormValues) => {
    addEvent({
      title: makeLocalized(values.title),
      date: values.date,
      time: values.time,
      category: values.category,
      description: makeLocalized(values.description),
    });
    toast.success(t('calendar.toast.created'));
    showDate(values.date);
    closeAdd();
  };

  const update = (values: EventFormValues) => {
    if (!editing) return;
    updateEvent(editing.id, {
      title: setLocalized(editing.title, lang, values.title),
      date: values.date,
      time: values.time,
      category: values.category,
      description: setLocalized(editing.description, lang, values.description),
    });
    toast.success(t('calendar.toast.updated'));
    showDate(values.date);
    setEditing(null);
  };

  const monthLabel = format.date(cursor, 'monthYear');

  return (
    <div className="page">
      <PageHeader
        title={t('calendar.title')}
        subtitle={`${t('calendar.subtitle')} · ${t('calendar.monthSummary', { count: format.number(monthEventCount) })}`}
        actions={
          <Button variant="primary" icon={<CalendarPlus size={18} />} onClick={openAdd}>
            {t('calendar.addEvent')}
          </Button>
        }
      />

      <div className="calendar-layout">
        <Card className="calendar">
          <div className="calendar__toolbar">
            <h2 className="calendar__month" aria-live="polite">
              {monthLabel}
            </h2>
            <div className="calendar__nav">
              <Button size="sm" variant="secondary" onClick={goToToday}>
                {t('calendar.today')}
              </Button>
              <IconButton
                variant="outline"
                size="sm"
                label={t('calendar.previousMonth')}
                icon={<ChevronStart size={18} />}
                onClick={() => goToMonth(-1)}
              />
              <IconButton
                variant="outline"
                size="sm"
                label={t('calendar.nextMonth')}
                icon={<ChevronEnd size={18} />}
                onClick={() => goToMonth(1)}
              />
            </div>
          </div>

          <div className="calendar__weekdays" aria-hidden="true">
            {Array.from({ length: 7 }, (_, index) => (
              <span key={index}>{weekdayName(index, lang, 'short')}</span>
            ))}
          </div>

          <div className="calendar__grid" role="group" aria-label={t('calendar.gridLabel', { month: monthLabel })}>
            {days.map((date) => {
              const key = toDateKey(date);
              const dayEvents = eventsByDate.get(key) ?? [];
              const inMonth = date.getMonth() === cursor.getMonth();
              const isToday = isSameDay(date, today);
              return (
                <button
                  key={key}
                  type="button"
                  className={cx(
                    'cal-day',
                    !inMonth && 'is-outside',
                    isToday && 'is-today',
                    key === selected && 'is-selected',
                  )}
                  aria-pressed={key === selected}
                  aria-current={isToday ? 'date' : undefined}
                  aria-label={`${format.date(date, 'long')}${dayEvents.length ? `, ${t('calendar.eventCount', { count: dayEvents.length })}` : ''}`}
                  onClick={() => setSelected(key)}
                >
                  <span className="cal-day__number num">{format.number(date.getDate())}</span>
                  <span className="cal-day__events">
                    {dayEvents.slice(0, MAX_CHIPS).map((event) => (
                      <span
                        key={event.id}
                        className={`cal-chip cal-chip--${event.category}`}
                        title={`${format.clock(event.time)} · ${localize(event.title)}`}
                      >
                        <span className="cal-chip__title">{localize(event.title)}</span>
                      </span>
                    ))}
                    {dayEvents.length > MAX_CHIPS && (
                      <span className="cal-more">{t('calendar.moreEvents', { count: dayEvents.length - MAX_CHIPS })}</span>
                    )}
                  </span>
                  {dayEvents.length > 0 && (
                    <span className="cal-dots" aria-hidden="true">
                      {dayEvents.slice(0, 3).map((event) => (
                        <span key={event.id} className={`cal-dot cal-dot--${event.category}`} />
                      ))}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </Card>

        <div className="stack">
          <Card>
            <CardHeader
              title={format.date(selected, 'long')}
              subtitle={t('calendar.selectedDay')}
              actions={
                <IconButton
                  variant="outline"
                  size="sm"
                  label={t('calendar.addEvent')}
                  icon={<CalendarPlus size={17} />}
                  onClick={openAdd}
                />
              }
            />
            {selectedEvents.length === 0 ? (
              <p className="muted">{t('calendar.noEvents')}</p>
            ) : (
              <ul className="event-list">
                {selectedEvents.map((event) => (
                  <li className="event-item" key={event.id}>
                    <div className="event-item__main">
                      <p className="event-item__time num">{format.clock(event.time)}</p>
                      <p className="event-item__title">{localize(event.title)}</p>
                      {localize(event.description) && <p className="muted event-item__desc">{localize(event.description)}</p>}
                      <Badge tone={CATEGORY_TONE[event.category]} dot={false}>
                        {t(`eventCategories.${event.category}`)}
                      </Badge>
                    </div>
                    <div className="event-item__actions">
                      <IconButton label={t('common.edit')} icon={<Pencil size={16} />} size="sm" onClick={() => setEditing(event)} />
                      <IconButton
                        label={t('common.delete')}
                        icon={<Trash2 size={16} />}
                        size="sm"
                        variant="danger"
                        onClick={() => setDeleting(event)}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card>
            <CardHeader title={t('calendar.upcoming.title')} />
            {upcoming.length === 0 ? (
              <p className="muted">{t('calendar.upcoming.empty')}</p>
            ) : (
              <ul className="upcoming">
                {upcoming.map((event) => (
                  <li key={event.id}>
                    <button type="button" className="upcoming__item" onClick={() => showDate(event.date)}>
                      <span className={`cal-dot cal-dot--${event.category}`} aria-hidden="true" />
                      <span className="upcoming__text">
                        <span className="upcoming__title">{localize(event.title)}</span>
                        <span className="muted num">
                          {format.date(event.date, 'dayMonth')} · {format.clock(event.time)}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      </div>

      <EventFormModal open={addOpen} defaultDate={selected} onClose={closeAdd} onSubmit={create} />
      <EventFormModal
        key={editing?.id ?? 'none'}
        open={editing !== null}
        event={editing}
        defaultDate={selected}
        onClose={() => setEditing(null)}
        onSubmit={update}
        onDelete={() => {
          if (editing) setDeleting(editing);
        }}
      />
      <ConfirmDialog
        open={deleting !== null}
        title={t('calendar.delete.title')}
        message={t('calendar.delete.message', { title: deleting ? localize(deleting.title) : '' })}
        confirmLabel={t('common.delete')}
        onCancel={() => setDeleting(null)}
        onConfirm={() => {
          if (deleting) {
            deleteEvent(deleting.id);
            toast.success(t('calendar.toast.deleted'));
          }
          setDeleting(null);
          setEditing(null);
        }}
      />
    </div>
  );
}
