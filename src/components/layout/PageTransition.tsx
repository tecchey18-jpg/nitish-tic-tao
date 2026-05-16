import { motion } from 'framer-motion';
import type { WithChildren } from '../../types/ui.types';

export const PageTransition = ({ children }: WithChildren) => (
  <motion.main
    className="relative z-10"
    initial={{ opacity: 0, y: 14 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -10 }}
    transition={{ duration: 0.28, ease: 'easeOut' }}
  >
    {children}
  </motion.main>
);
