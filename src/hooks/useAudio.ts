import { useCallback } from 'react';
import { useSettingsStore } from '../store/settingsStore';
import { playTone } from '../utils/soundHelpers';

export const useAudio = () => {
  const reducedMotion = useSettingsStore((state) => state.reducedMotion);

  const click = useCallback(() => {
    if (!reducedMotion) playTone(520);
  }, [reducedMotion]);

  const win = useCallback(() => {
    if (!reducedMotion) playTone(760, 0.16);
  }, [reducedMotion]);

  return { click, win };
};
