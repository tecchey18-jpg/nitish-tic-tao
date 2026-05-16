import { History } from 'lucide-react';
import { useGameStore } from '../../store/gameStore';
import { usePlayerStore } from '../../store/playerStore';
import { GlassPanel } from '../ui/GlassPanel';

export const RoundHistory = () => {
  const history = useGameStore((state) => state.roundHistory);
  const players = usePlayerStore((state) => state.players);

  return (
    <GlassPanel className="p-4">
      <div className="relative z-10 mb-3 flex items-center gap-2">
        <History size={17} className="text-limepulse" />
        <h2 className="font-display text-base font-black text-white">Round History</h2>
      </div>
      <div className="relative z-10 flex gap-2 overflow-x-auto pb-1">
        {(history.length ? history : [{ round: 0, winnerId: null, label: 'No rounds yet' }]).map((item) => {
          const winner = players.find((player) => player.id === item.winnerId);
          return (
            <div
              key={`${item.round}-${item.label}`}
              className="min-w-28 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs font-bold uppercase text-slate-300"
            >
              <span className="block text-slate-500">{item.round ? `Round ${item.round}` : 'Ready'}</span>
              <span style={{ color: winner?.color ?? '#cbd5e1' }}>{winner?.name ?? (item.round ? 'Draw' : 'Start')}</span>
            </div>
          );
        })}
      </div>
    </GlassPanel>
  );
};
