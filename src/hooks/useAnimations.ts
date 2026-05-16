import { useMemo } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { durations, spring } from '../config/animationConfig';

export const useAnimations = () => {
  const reducedMotion = useSettingsStore((state) => state.reducedMotion);

  return useMemo(
    () => ({
      reducedMotion,
      spring: reducedMotion ? { duration: 0.01 } : spring,
      duration: reducedMotion ? 0.01 : durations
    }),
    [reducedMotion]
  );
};
