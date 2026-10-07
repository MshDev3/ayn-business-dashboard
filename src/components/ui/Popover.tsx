import { useCallback, useEffect, useId, useRef, useState } from 'react';
import type { KeyboardEvent, ReactNode } from 'react';
import { cx } from '../../utils/classNames';

interface TriggerApi {
  open: boolean;
  toggle: () => void;
  props: {
    'aria-haspopup': 'menu' | 'dialog';
    'aria-expanded': boolean;
    'aria-controls': string;
  };
}

interface PopoverProps {
  trigger: (api: TriggerApi) => ReactNode;
  children: (api: { close: () => void }) => ReactNode;
  /** Which edge of the trigger the panel lines up with, in reading direction. */
  align?: 'start' | 'end';
  role?: 'menu' | 'dialog';
  className?: string;
  panelClassName?: string;
  label: string;
}

/** Lightweight popover: closes on outside click or Escape, returns focus to the trigger, arrow keys move through menu items. */
export function Popover({
  trigger,
  children,
  align = 'end',
  role = 'menu',
  className,
  panelClassName,
  label,
}: PopoverProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const panelId = useId();

  const close = useCallback(() => setOpen(false), []);
  const toggle = useCallback(() => setOpen((current) => !current), []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) setOpen(false);
    };
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpen(false);
        rootRef.current?.querySelector<HTMLElement>('[aria-expanded]')?.focus();
      }
    };
    document.addEventListener('mousedown', onPointerDown);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('mousedown', onPointerDown);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  const onPanelKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (role !== 'menu' || (event.key !== 'ArrowDown' && event.key !== 'ArrowUp')) return;
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('[role="menuitem"]'));
    if (items.length === 0) return;
    event.preventDefault();
    const index = items.indexOf(document.activeElement as HTMLElement);
    const next = event.key === 'ArrowDown' ? (index + 1) % items.length : (index - 1 + items.length) % items.length;
    items[next]?.focus();
  };

  return (
    <div className={cx('popover', className)} ref={rootRef}>
      {trigger({
        open,
        toggle,
        props: { 'aria-haspopup': role, 'aria-expanded': open, 'aria-controls': panelId },
      })}
      {open && (
        <div
          id={panelId}
          className={cx('popover__panel', `popover__panel--${align}`, panelClassName)}
          role={role}
          aria-label={label}
          onKeyDown={onPanelKeyDown}
        >
          {children({ close })}
        </div>
      )}
    </div>
  );
}
