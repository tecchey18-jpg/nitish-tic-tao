import { motion } from 'framer-motion';

interface FireworksEffectProps {
  colors: string[];
}

export const FireworksEffect = ({ colors }: FireworksEffectProps) => (
  <div className="pointer-events-none absolute inset-0">
    {Array.from({ length: 4 }, (_, burst) => (
      <div
        key={burst}
        className="absolute"
        style={{ left: `${18 + burst * 21}%`, top: `${20 + (burst % 2) * 18}%` }}
      >
        {Array.from({ length: 14 }, (_, spark) => (
          <motion.span
            key={spark}
            className="absolute h-1.5 w-1.5 rounded-full"
            style={{ backgroundColor: colors[(spark + burst) % colors.length] }}
            animate={{
              x: [0, Math.cos((spark / 14) * Math.PI * 2) * 90],
              y: [0, Math.sin((spark / 14) * Math.PI * 2) * 90],
              opacity: [0, 1, 0],
              scale: [0, 1, 0.25]
            }}
            transition={{ duration: 1.35, repeat: Infinity, delay: burst * 0.3 }}
          />
        ))}
      </div>
    ))}
  </div>
);
