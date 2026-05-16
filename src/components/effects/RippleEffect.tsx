import { motion } from 'framer-motion';

interface RippleEffectProps {
  color: string;
  active: boolean;
}

export const RippleEffect = ({ color, active }: RippleEffectProps) =>
  active ? (
    <motion.span
      className="pointer-events-none absolute inset-2 rounded-md border"
      style={{ borderColor: color }}
      initial={{ opacity: 0.75, scale: 0.4 }}
      animate={{ opacity: 0, scale: 1.7 }}
      transition={{ duration: 0.45, ease: 'easeOut' }}
    />
  ) : null;
