import type { Board, WinResult } from '../types/game.types';

const directions = [
  [0, 1],
  [1, 0],
  [1, 1],
  [1, -1]
] as const;

export const calculateWinner = (board: Board, size: number, winLength: number): WinResult | null => {
  for (let index = 0; index < board.length; index += 1) {
    const playerId = board[index];
    if (!playerId) continue;

    const row = Math.floor(index / size);
    const col = index % size;

    for (const [rowStep, colStep] of directions) {
      const line = [index];

      for (let step = 1; step < winLength; step += 1) {
        const nextRow = row + rowStep * step;
        const nextCol = col + colStep * step;

        if (nextRow < 0 || nextCol < 0 || nextRow >= size || nextCol >= size) break;

        const nextIndex = nextRow * size + nextCol;
        if (board[nextIndex] !== playerId) break;
        line.push(nextIndex);
      }

      if (line.length === winLength) {
        return { winnerId: playerId, line };
      }
    }
  }

  return null;
};

export const isDraw = (board: Board) => board.every(Boolean);
