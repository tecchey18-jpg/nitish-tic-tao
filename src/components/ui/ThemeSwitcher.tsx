import { Eye, Zap } from 'lucide-react';
import { useSettingsStore } from '../../store/settingsStore';
import { NeonButton } from './NeonButton';

export const ThemeSwitcher = () => {
  const reducedMotion = useSettingsStore((state) => state.reducedMotion);
  const setReducedMotion = useSettingsStore((state) => state.setReducedMotion);

  return (
    <NeonButton variant="ghost" onClick={() => setReducedMotion(!reducedMotion)}>
      {reducedMotion ? <Eye size={16} /> : <Zap size={16} />}
      {reducedMotion ? 'Calm' : 'Live'}
    </NeonButton>
  );
};
