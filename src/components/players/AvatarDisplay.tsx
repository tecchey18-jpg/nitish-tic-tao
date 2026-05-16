import { motion } from 'framer-motion';
import type { AvatarMood } from '../../types/player.types';

interface AvatarDisplayProps {
  label: string;
  color: string;
  mood?: AvatarMood;
}

const moodScale: Record<AvatarMood, number> = {
  idle: 1,
  active: 1.08,
  winner: 1.16,
  lost: 0.96
};

export const AvatarDisplay = ({ label, color, mood = 'idle' }: AvatarDisplayProps) => (
  <motion.div
    className="relative grid h-14 w-14 shrink-0 place-items-center rounded-lg border bg-black/30 font-display text-sm font-black"
    style={{ borderColor: color, color, boxShadow: `0 0 22px ${color}55` }}
    animate={{ scale: moodScale[mood], rotate: mood === 'winner' ? [0, -4, 4, 0] : 0 }}
    transition={{ duration: 0.45 }}
  >
    <span className="absolute inset-1 rounded-md bg-gradient-to-br from-white/16 to-transparent" />
    <span className="relative">{label}</span>
  </motion.div>
);
