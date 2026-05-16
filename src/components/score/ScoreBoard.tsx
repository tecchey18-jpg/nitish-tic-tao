import { Trophy } from 'lucide-react';
import { motion } from 'framer-motion';
import { usePlayerTurns } from '../../hooks/usePlayerTurns';
import { useSettingsStore } from '../../store/settingsStore';
import { GlassPanel } from '../ui/GlassPanel';

export const ScoreBoard = () => {
  const { activePlayers } = usePlayerTurns();
  const targetScore = useSettingsStore((state) => state.targetScore);

  return (
    <GlassPanel className="p-4">
      <div className="relative z-10 mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Trophy size={18} className="text-solar" />
          <h2 className="font-display text-lg font-black text-white">Scoreboard</h2>
        </div>
        <span className="text-xs font-bold uppercase text-slate-400">Target {targetScore}</span>
      </div>
      <div className="relative z-10 space-y-3">
        {activePlayers.map((player) => (
          <div key={player.id}>
            <div className="mb-1 flex justify-between text-xs font-bold uppercase text-slate-300">
              <span>{player.name}</span>
              <span>{player.score}</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-white/8">
              <motion.div
                className="h-full rounded-full"
                style={{ backgroundColor: player.color }}
                animate={{ width: `${Math.min((player.score / targetScore) * 100, 100)}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </GlassPanel>
  );
};
