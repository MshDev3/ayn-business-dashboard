import type { ReactNode } from 'react';

/** Wrapper for the action buttons in a table row's last cell. */
export function RowActions({ children }: { children: ReactNode }) {
  return <div className="row-actions">{children}</div>;
}
