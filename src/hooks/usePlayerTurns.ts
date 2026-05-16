import { useMemo } from 'react';
import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { useSettingsStore } from '../store/settingsStore';

export const usePlayerTurns = () => {
  const playerCount = useSettingsStore((state) => state.playerCount);
  const activePlayerIndex = useGameStore((state) => state.activePlayerIndex);
  const players = usePlayerStore((state) => state.players);

  const activePlayers = useMemo(() => players.slice(0, playerCount), [players, playerCount]);
  const currentPlayer = activePlayers[activePlayerIndex] ?? activePlayers[0];

  return { activePlayers, currentPlayer, activePlayerIndex };
};
