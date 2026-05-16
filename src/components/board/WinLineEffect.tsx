import { motion } from 'framer-motion';

interface WinLineEffectProps {
  active: boolean;
  color: string;
}

export const WinLineEffect = ({ active, color }: WinLineEffectProps) =>
  active ? (
    <motion.div
      className="pointer-events-none absolute inset-3 rounded-lg border-2"
      style={{ borderColor: color, boxShadow: `0 0 28px ${color}` }}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.22 }}
    />
  ) : null;
