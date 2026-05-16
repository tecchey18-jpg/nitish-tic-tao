import { motion } from 'framer-motion';
import type { WithChildren } from '../../types/ui.types';
import { useBoardEffects } from '../../hooks/useBoardEffects';
import { useSettingsStore } from '../../store/settingsStore';

export const CameraShake = ({ children }: WithChildren) => {
  const { isCelebrating } = useBoardEffects();
  const reducedMotion = useSettingsStore((state) => state.reducedMotion);

  return (
    <motion.div
      animate={isCelebrating && !reducedMotion ? { x: [0, -4, 5, -3, 0], y: [0, 2, -2, 1, 0] } : {}}
      transition={{ duration: 0.42 }}
    >
      {children}
    </motion.div>
  );
};
