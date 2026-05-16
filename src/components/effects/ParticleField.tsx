import { memo, useMemo } from 'react';
import { motion } from 'framer-motion';
import { particleSeed } from '../../utils/animationHelpers';
import { useSettingsStore } from '../../store/settingsStore';

export const ParticleField = memo(() => {
  const reducedMotion = useSettingsStore((state) => state.reducedMotion);
  const particles = useMemo(() => particleSeed(reducedMotion ? 14 : 38), [reducedMotion]);

  return (
    <div className="absolute inset-0">
      {particles.map((particle) => (
        <motion.span
          key={particle.id}
          className="absolute rounded-full bg-cyan/80 will-change-transform"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: particle.size,
            height: particle.size
          }}
          animate={
            reducedMotion
              ? { opacity: 0.35 }
              : { y: [-12, 18, -12], opacity: [0.2, 0.85, 0.2], scale: [1, 1.8, 1] }
          }
          transition={{ duration: 4 + (particle.id % 5), repeat: Infinity, delay: particle.delay }}
        />
      ))}
    </div>
  );
});

ParticleField.displayName = 'ParticleField';
