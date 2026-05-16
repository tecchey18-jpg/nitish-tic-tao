import { Activity } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { usePlayerTurns } from '../../hooks/usePlayerTurns';
import { GlassPanel } from '../ui/GlassPanel';

export const MatchProgress = () => {
  const round = useGameStore((state) => state.round);
  const status = useGameStore((state) => state.status);
  const { currentPlayer } = usePlayerTurns();

  return (
    <GlassPanel className="p-4">
      <div className="relative z-10 flex items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold uppercase text-cyan">
            <Activity size={15} />
            Round {round}
          </div>
          <h2 className="mt-2 font-display text-xl font-black text-white">
            {status === 'playing' ? `${currentPlayer?.name}'s turn` : status === 'idle' ? 'Arena idle' : 'Round locked'}
          </h2>
        </div>
        <div className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase text-slate-300">
          {status}
        </div>
      </div>
    </GlassPanel>
  );
};
