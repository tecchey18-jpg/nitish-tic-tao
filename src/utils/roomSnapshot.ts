import { useGameStore } from '../store/gameStore';
import { usePlayerStore } from '../store/playerStore';
import { useSettingsStore } from '../store/settingsStore';
import type { RoomGameSnapshot } from '../types/room.types';

export const buildRoomSnapshot = (): RoomGameSnapshot => {
  const game = useGameStore.getState();
  const settings = useSettingsStore.getState();

  return {
    board: game.board,
    activePlayerIndex: game.activePlayerIndex,
    round: game.round,
    status: game.status,
    winnerId: game.winnerId,
    winningLine: game.winningLine,
    roundHistory: game.roundHistory,
    lastMove: game.lastMove,
    settings: {
      playerCount: settings.playerCount,
      boardSize: settings.boardSize,
      winCondition: settings.winCondition,
      targetScore: settings.targetScore,
      aiMode: settings.aiMode,
      aiDifficulty: settings.aiDifficulty,
      reducedMotion: settings.reducedMotion
    },
    players: usePlayerStore.getState().players
  };
};

export const applyRoomSnapshot = (snapshot: RoomGameSnapshot) => {
  useSettingsStore.getState().applySettings(snapshot.settings);
  usePlayerStore.getState().setPlayers(snapshot.players);
  useGameStore.getState().hydrateGame({
    board: snapshot.board,
    activePlayerIndex: snapshot.activePlayerIndex,
    round: snapshot.round,
    status: snapshot.status,
    winnerId: snapshot.winnerId,
    winningLine: snapshot.winningLine,
    roundHistory: snapshot.roundHistory,
    lastMove: snapshot.lastMove
  });
};
