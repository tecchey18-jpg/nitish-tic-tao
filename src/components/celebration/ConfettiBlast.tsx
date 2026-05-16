import { motion } from 'framer-motion';

interface ConfettiBlastProps {
  colors: string[];
}

export const ConfettiBlast = ({ colors }: ConfettiBlastProps) => (
  <div className="pointer-events-none absolute inset-0 overflow-hidden">
    {Array.from({ length: 34 }, (_, index) => (
      <motion.span
        key={index}
        className="absolute h-2 w-1 rounded-sm"
        style={{
          left: `${(index * 31) % 100}%`,
          top: '-6%',
          backgroundColor: colors[index % colors.length]
        }}
        animate={{ y: ['0vh', '105vh'], rotate: [0, 220, 480], opacity: [0, 1, 0] }}
        transition={{ duration: 2.4 + (index % 5) * 0.16, delay: (index % 8) * 0.06, repeat: Infinity }}
      />
    ))}
  </div>
);
