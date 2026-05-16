import { motion } from 'framer-motion';

export const LoadingScreen = () => (
  <div className="grid min-h-screen place-items-center bg-void text-cyan">
    <motion.div
      className="h-20 w-20 rounded-full border border-cyan/30 border-t-cyan"
      animate={{ rotate: 360 }}
      transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
    />
  </div>
);
