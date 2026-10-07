import { Link } from 'react-router';
import { Avatar } from './Avatar';

interface PersonCellProps {
  name: string;
  subtitle?: string;
  to?: string;
  hue?: number;
  /** Render the subtitle left-to-right (emails, IDs). */
  ltrSubtitle?: boolean;
}

/** Avatar + name (+ secondary line), the standard first cell in people and company tables. */
export function PersonCell({ name, subtitle, to, hue, ltrSubtitle }: PersonCellProps) {
  return (
    <div className="person">
      <Avatar name={name} hue={hue} />
      <div className="person__text">
        {to ? (
          <Link to={to} className="person__name">
            {name}
          </Link>
        ) : (
          <span className="person__name">{name}</span>
        )}
        {subtitle && <span className={ltrSubtitle ? 'person__sub ltr' : 'person__sub'}>{subtitle}</span>}
      </div>
    </div>
  );
}
