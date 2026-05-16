import { motion } from 'framer-motion';

interface ExplosionEffectProps {
  color: string;
  active: boolean;
}

export const ExplosionEffect = ({ color, active }: ExplosionEffectProps) => {
  if (!active) return null;

  return (
    <div className="pointer-events-none absolute inset-0">
      {Array.from({ length: 10 }, (_, index) => (
        <motion.span
          key={index}
          className="absolute left-1/2 top-1/2 h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
          initial={{ x: 0, y: 0, opacity: 0.9, scale: 1 }}
          animate={{
            x: Math.cos((index / 10) * Math.PI * 2) * 42,
            y: Math.sin((index / 10) * Math.PI * 2) * 42,
            opacity: 0,
            scale: 0.2
          }}
          transition={{ duration: 0.55, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
};
