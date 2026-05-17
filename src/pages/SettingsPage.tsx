import { Grid3X3, Users } from 'lucide-react';
import { PlayerCustomizer } from '../components/players/PlayerCustomizer';
import { NeonButton } from '../components/ui/NeonButton';
import { ArenaControls } from '../features/game/ArenaControls';
import { useGameActions } from '../hooks/useGameLogic';
import { useUiStore } from '../store/uiStore';

export const SettingsPage = () => {
  const setPage = useUiStore((state) => state.setPage);
  const { startMatch } = useGameActions();

  const launch = () => {
    startMatch();
    setPage('game');
  };

  return (
    <div className="mx-auto grid max-w-6xl gap-5 px-4 py-8 lg:grid-cols-[1fr_1fr]">
      <section className="grid content-start gap-5">
        <div className="flex items-center gap-2">
          <Grid3X3 className="text-cyan" />
          <h1 className="font-display text-2xl font-black text-white">Arena Settings</h1>
        </div>
        <ArenaControls />
        <NeonButton onClick={launch}>
          <Users size={16} />
          Start
        </NeonButton>
      </section>
      <PlayerCustomizer />
    </div>
  );
};
