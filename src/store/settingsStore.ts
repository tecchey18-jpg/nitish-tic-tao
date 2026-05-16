import { create } from 'zustand';
import { gameConfig } from '../config/gameConfig';
import type { AiDifficulty, GameSettings } from '../types/game.types';

interface SettingsState extends GameSettings {
  setPlayerCount: (playerCount: number) => void;
  setBoardSize: (boardSize: number) => void;
  setWinCondition: (winCondition: number) => void;
  setTargetScore: (targetScore: number) => void;
  setAiMode: (aiMode: boolean) => void;
  setAiDifficulty: (aiDifficulty: AiDifficulty) => void;
  setReducedMotion: (reducedMotion: boolean) => void;
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export const useSettingsStore = create<SettingsState>((set) => ({
  playerCount: 2,
  boardSize: 3,
  winCondition: 3,
  targetScore: 5,
  aiMode: false,
  aiDifficulty: 'normal',
  reducedMotion: false,
  setPlayerCount: (playerCount) =>
    set((state) => {
      const nextCount = clamp(playerCount, gameConfig.minPlayers, gameConfig.maxPlayers);
      const suggestedSize = gameConfig.defaultBoardSizeByPlayers[
        nextCount as keyof typeof gameConfig.defaultBoardSizeByPlayers
      ];
      const boardSize = Math.max(state.boardSize, suggestedSize);

      return {
        playerCount: nextCount,
        boardSize,
        winCondition: clamp(state.winCondition, 3, boardSize)
      };
    }),
  setBoardSize: (boardSize) =>
    set((state) => {
      const nextSize = clamp(boardSize, gameConfig.minBoardSize, gameConfig.maxBoardSize);
      return { boardSize: nextSize, winCondition: clamp(state.winCondition, 3, nextSize) };
    }),
  setWinCondition: (winCondition) =>
    set((state) => ({ winCondition: clamp(winCondition, 3, state.boardSize) })),
  setTargetScore: (targetScore) => set({ targetScore: clamp(targetScore, 1, 20) }),
  setAiMode: (aiMode) => set({ aiMode }),
  setAiDifficulty: (aiDifficulty) => set({ aiDifficulty }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion })
}));
