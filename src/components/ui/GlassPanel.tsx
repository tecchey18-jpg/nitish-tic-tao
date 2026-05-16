import type { HTMLAttributes } from 'react';
import { cx } from '../../utils/animationHelpers';

interface GlassPanelProps extends HTMLAttributes<HTMLDivElement> {
  intense?: boolean;
}

export const GlassPanel = ({ className, intense = false, ...props }: GlassPanelProps) => (
  <div
    className={cx(
      'relative overflow-hidden rounded-lg border border-white/10 bg-panel/60 shadow-neon backdrop-blur-md',
      'before:pointer-events-none before:absolute before:inset-0 before:bg-gradient-to-br before:from-white/12 before:via-transparent before:to-cyan/5',
      intense && 'border-cyan/35 bg-panel/78 shadow-magenta',
      className
    )}
    {...props}
  />
);
