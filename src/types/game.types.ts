import type { PlayerId } from './player.types';

export type CellValue = PlayerId | null;
export type Board = CellValue[];
export type GameStatus = 'idle' | 'playing' | 'won' | 'draw' | 'matchComplete';
export type AiDifficulty = 'easy' | 'normal' | 'hard' | 'nexus';

export interface GameSettings {
  playerCount: number;
  boardSize: number;
  winCondition: number;
  targetScore: number;
  aiMode: boolean;
  aiDifficulty: AiDifficulty;
  reducedMotion: boolean;
}

export interface WinResult {
  winnerId: PlayerId;
  line: number[];
}

export interface RoundRecord {
  round: number;
  winnerId: PlayerId | null;
  label: string;
}

export interface BoardPosition {
  row: number;
  col: number;
}
