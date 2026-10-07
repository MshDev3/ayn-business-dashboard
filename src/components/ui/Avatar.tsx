import type { CSSProperties } from 'react';
import { cx } from '../../utils/classNames';
import { initials } from '../../utils/text';

interface AvatarProps {
  name: string;
  hue?: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export function Avatar({ name, hue = 255, size = 'md', className }: AvatarProps) {
  const style = {
    '--avatar-from': `hsl(${hue} 72% 58%)`,
    '--avatar-to': `hsl(${(hue + 42) % 360} 72% 46%)`,
  } as CSSProperties;
  return (
    <span className={cx('avatar', `avatar--${size}`, className)} style={style} aria-hidden="true">
      {initials(name)}
    </span>
  );
}
