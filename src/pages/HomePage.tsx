import { Play, SlidersHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { useGameLogic } from '../hooks/useGameLogic';
import { useUiStore } from '../store/uiStore';
import { GlassPanel } from '../components/ui/GlassPanel';
import { NeonButton } from '../components/ui/NeonButton';
import { PlayerCustomizer } from '../components/players/PlayerCustomizer';
import { ScoreBoard } from '../components/score/ScoreBoard';

export const HomePage = () => {
  const setPage = useUiStore((state) => state.setPage);
  const { startMatch } = useGameLogic();

  const launch = () => {
    startMatch();
    setPage('game');
  };

  return (
    <div className="mx-auto grid min-h-[calc(100vh-76px)] max-w-7xl items-center gap-6 px-4 py-8 lg:grid-cols-[1.05fr_.95fr]">
      <section>
        <motion.h1
          className="font-display text-5xl font-black uppercase leading-none text-white sm:text-7xl"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Neon Nexus
        </motion.h1>
        <p className="mt-5 max-w-2xl text-lg font-semibold leading-8 text-slate-300">
          A holographic Tic Tac Toe arena for 2-4 players, adaptive grids, custom symbols, AI rivals, and
          high-impact victory sequences.
        </p>
        <div className="mt-7 flex flex-col gap-3 sm:flex-row">
          <NeonButton onClick={launch}>
            <Play size={17} />
            Start
          </NeonButton>
          <NeonButton variant="secondary" onClick={() => setPage('settings')}>
            <SlidersHorizontal size={17} />
            Settings
          </NeonButton>
        </div>
      </section>

      <section className="grid gap-4">
        <GlassPanel intense className="p-5">
          <div className="relative z-10 grid grid-cols-3 gap-2">
            {Array.from({ length: 9 }, (_, index) => (
              <div key={index} className="aspect-square rounded-md border border-cyan/25 bg-cyan/10" />
            ))}
          </div>
        </GlassPanel>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-1">
          <PlayerCustomizer />
          <ScoreBoard />
        </div>
      </section>
    </div>
  );
};
