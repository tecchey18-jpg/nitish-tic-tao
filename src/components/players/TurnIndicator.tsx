import { motion } from 'framer-motion';

interface TurnIndicatorProps {
  active: boolean;
  color: string;
}

export const TurnIndicator = ({ active, color }: TurnIndicatorProps) => (
  <div className="flex items-center gap-2 text-xs font-bold uppercase text-slate-300">
    <motion.span
      className="h-2.5 w-2.5 rounded-full"
      style={{ backgroundColor: active ? color : '#64748b' }}
      animate={active ? { scale: [1, 1.45, 1], opacity: [0.75, 1, 0.75] } : { scale: 1 }}
      transition={{ duration: 1.1, repeat: active ? Infinity : 0 }}
    />
    {active ? 'Active' : 'Standby'}
  </div>
);
