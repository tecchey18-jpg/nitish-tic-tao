import { motion, type HTMLMotionProps } from 'framer-motion';
import type { ButtonVariant } from '../../types/ui.types';
import { cx } from '../../utils/animationHelpers';

interface NeonButtonProps extends HTMLMotionProps<'button'> {
  variant?: ButtonVariant;
}

const variants: Record<ButtonVariant, string> = {
  primary: 'border-cyan/60 bg-cyan/16 text-cyan shadow-[0_0_22px_rgba(0,245,255,.28)]',
  secondary: 'border-fuchsia/50 bg-fuchsia/12 text-fuchsia shadow-[0_0_22px_rgba(255,43,214,.22)]',
  danger: 'border-red-400/50 bg-red-500/10 text-red-200 shadow-[0_0_18px_rgba(248,113,113,.22)]',
  ghost: 'border-white/12 bg-white/5 text-slate-100'
};

export const NeonButton = ({ className, variant = 'primary', children, ...props }: NeonButtonProps) => (
  <motion.button
    whileHover={{ y: -1, scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
    className={cx(
      'inline-flex min-h-10 items-center justify-center gap-2 rounded-md border px-4 py-2',
      'font-display text-xs font-bold uppercase tracking-normal transition-colors',
      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-cyan',
      'disabled:cursor-not-allowed disabled:opacity-45',
      variants[variant],
      className
    )}
    {...props}
  >
    {children}
  </motion.button>
);
