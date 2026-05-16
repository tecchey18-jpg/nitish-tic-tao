import { useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { usePlayerTurns } from './usePlayerTurns';

export const useBoardEffects = () => {
  const lastMove = useGameStore((state) => state.lastMove);
  const winningLine = useGameStore((state) => state.winningLine);
  const status = useGameStore((state) => state.status);
  const { currentPlayer, activePlayers } = usePlayerTurns();

  const winningSet = useMemo(() => new Set(winningLine), [winningLine]);

  return {
    lastMove,
    winningSet,
    activeColor: currentPlayer?.color ?? '#00f5ff',
    winnerColor: activePlayers.find((player) => player.id === useGameStore.getState().winnerId)?.color,
    isCelebrating: status === 'won' || status === 'matchComplete'
  };
};
