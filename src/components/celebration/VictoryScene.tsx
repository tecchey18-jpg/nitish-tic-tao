import { AnimatePresence, motion } from 'framer-motion';
import { Crown, RotateCcw, StepForward } from 'lucide-react';
import { useGameActions } from '../../hooks/useGameLogic';
import { useGameStore } from '../../store/gameStore';
import { usePlayerStore } from '../../store/playerStore';
import { ConfettiBlast } from './ConfettiBlast';
import { FireworksEffect } from './FireworksEffect';
import { WinnerAvatar } from './WinnerAvatar';
import { NeonButton } from '../ui/NeonButton';
import { useRoomStore } from '../../store/roomStore';

export const VictoryScene = () => {
  const status = useGameStore((state) => state.status);
  const winnerId = useGameStore((state) => state.winnerId);
  const players = usePlayerStore((state) => state.players);
  const roomMode = useRoomStore((state) => state.mode);
  const roomRole = useRoomStore((state) => state.role);
  const { nextRound, resetMatch } = useGameActions();
  const winner = players.find((player) => player.id === winnerId);
  const open = status === 'won' || status === 'matchComplete' || status === 'draw';
  const colors = players.map((player) => player.color);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 grid place-items-center bg-void/78 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <ConfettiBlast colors={colors} />
          <FireworksEffect colors={colors} />
          <motion.div
            className="relative z-10 w-full max-w-xl rounded-xl border border-cyan/30 bg-panel/82 p-7 text-center shadow-neon"
            initial={{ scale: 0.86, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0 }}
          >
            <Crown className="mx-auto mb-4 text-solar" size={36} />
            {winner ? (
              <WinnerAvatar winner={winner} />
            ) : (
              <h2 className="font-display text-4xl font-black text-white">Draw Round</h2>
            )}
            <p className="mx-auto mt-4 max-w-sm text-sm font-semibold text-slate-300">
              {status === 'matchComplete' ? 'Target score reached. The nexus crowns a champion.' : 'Round complete. Charge the grid again.'}
            </p>
            <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
              {status !== 'matchComplete' && (
                <NeonButton onClick={nextRound}>
                  <StepForward size={16} />
                  Next Round
                </NeonButton>
              )}
              <NeonButton variant="secondary" onClick={resetMatch}>
                <RotateCcw size={16} />
                Reset
              </NeonButton>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
