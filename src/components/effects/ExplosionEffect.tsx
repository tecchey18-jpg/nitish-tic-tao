import { motion } from 'framer-motion';

interface ExplosionEffectProps {
  color: string;
  active: boolean;
}

const burstOffsets = Array.from({ length: 8 }, (_, index) => ({
  x: Math.cos((index / 8) * Math.PI * 2) * 38,
  y: Math.sin((index / 8) * Math.PI * 2) * 38
}));

export const ExplosionEffect = ({ color, active }: ExplosionEffectProps) => {
  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0">
      {burstOffsets.map((offset, index) => (
        <motion.span
          key={index}
          className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ x: 0, y: 0, opacity: 0.9, scale: 1 }}
          animate={{
            x: offset.x,
            y: offset.y,
            opacity: 0,
            scale: 0.2
          }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
};
