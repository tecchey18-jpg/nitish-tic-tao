import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { particleSeed } from '../../utils/animationHelpers';
import { useSettingsStore } from '../../store/settingsStore';

export const ParticleField = memo(() => {
  const reducedMotion = useSettingsStore((state) => state.reducedMotion);
  const particles = useMemo(() => particleSeed(reducedMotion ? 8 : 24), [reducedMotion]);

  return (
    <div className="absolute inset-0">
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full bg-cyan/70 will-change-transform motion-reduce:hidden"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size
          }}
          animate={
            reducedMotion
              ? { opacity: 0.28 }
              : { y: [-10, 14, -10], opacity: [0.16, 0.72, 0.16], scale: [1, 1.45, 1] }
          }
          transition={{ duration: 5 + (particle.id % 5), repeat: Infinity, delay: particle.delay }}
        />
      ))}
    </div>
  );
});

ParticleField.displayName = 'ParticleField';
