import { create } from 'zustand';
import { generateBoard } from '../utils/generateBoard';
import type { Board, GameStatus, RoundRecord } from '../types/game.types';
import type { PlayerId } from '../types/player.types';

interface GameState {
  board: Board;
  activePlayerIndex: number;
  round: number;
  status: GameStatus;
  winnerId: PlayerId | null;
  winningLine: number[];
  roundHistory: RoundRecord[];
  lastMove: number | null;
  startRound: (boardSize: number, keepRound?: boolean) => void;
  setBoard: (board: Board) => void;
  setLastMove: (lastMove: number | null) => void;
  setActivePlayerIndex: (index: number) => void;
  finishRound: (status: GameStatus, winnerId: PlayerId | null, line?: number[]) => void;
  completeMatch: () => void;
  resetMatch: (boardSize: number) => void;
  hydrateGame: (game: Pick<GameState, 'board' | 'activePlayerIndex' | 'round' | 'status' | 'winnerId' | 'winningLine' | 'roundHistory' | 'lastMove'>) => void;
}

export const useGameStore = create<GameState>((set) => ({
  board: generateBoard(3),
  activePlayerIndex: 0,
  round: 1,
  status: 'idle',
  winnerId: null,
  winningLine: [],
  roundHistory: [],
  lastMove: null,
  startRound: (boardSize, keepRound = false) =>
    set((state) => ({
      board: generateBoard(boardSize),
      activePlayerIndex: 0,
      status: 'playing',
      winnerId: null,
      winningLine: [],
      lastMove: null,
      round: keepRound ? state.round + 1 : state.round
    })),
  setBoard: (board) => set({ board }),
  setLastMove: (lastMove) => set({ lastMove }),
  setActivePlayerIndex: (activePlayerIndex) => set({ activePlayerIndex }),
  finishRound: (status, winnerId, line = []) =>
    set((state) => ({
      status,
      winnerId,
      winningLine: line,
      roundHistory: [
        ...state.roundHistory,
        {
          round: state.round,
          winnerId,
          label: winnerId ? `Round ${state.round}` : `Round ${state.round}: Draw`
        }
      ].slice(-8)
    })),
  completeMatch: () => set({ status: 'matchComplete' }),
  resetMatch: (boardSize) =>
    set({
      board: generateBoard(boardSize),
      activePlayerIndex: 0,
      round: 1,
      status: 'idle',
      winnerId: null,
      winningLine: [],
      roundHistory: [],
      lastMove: null
    }),
  hydrateGame: (game) => set(game)
}));
