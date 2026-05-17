import type { Board, GameSettings, GameStatus, RoundRecord } from './game.types';
import type { Player, PlayerId } from './player.types';

export type RoomMode = 'local' | 'online';
export type RoomConnectionState = 'idle' | 'connecting' | 'connected' | 'error';
export type RoomRole = 'host' | 'guest';

export interface RoomGameSnapshot {
  board: Board;
  activePlayerIndex: number;
  round: number;
  status: GameStatus;
  winnerId: PlayerId | null;
  winningLine: number[];
  roundHistory: RoundRecord[];
  lastMove: number | null;
  settings: GameSettings;
  players: Player[];
}

export interface RoomServerState {
  roomId: string;
  playerId: PlayerId;
  version: number;
  players: PlayerId[];
  snapshot: RoomGameSnapshot;
}
